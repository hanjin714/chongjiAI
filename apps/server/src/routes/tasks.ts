import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth.js';
import { TaskStatus, TaskResult, Role, RiskLevel } from '../constants/enums.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const { status, type, assigneeUserId, page = '1', pageSize = '50' } = req.query as any;

    const where: any = { tenantId: req.user!.tenantId };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (assigneeUserId) {
      where.assigneeUserId = assigneeUserId;
    }

    if (req.user!.role === Role.SALES || req.user!.role === Role.KEEPER) {
      where.assigneeUserId = req.user!.userId;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
        ],
        skip: (parseInt(page) - 1) * parseInt(pageSize),
        take: parseInt(pageSize),
        include: {
          relatedPet: { include: { photos: { take: 1 } } },
          relatedCustomer: true,
          assignee: { select: { id: true, name: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return successResponse(res, {
      items: tasks,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '获取任务列表失败', 500);
  }
});

const completeTaskSchema = z.object({
  result: z.nativeEnum(TaskResult),
  note: z.string().optional(),
});

router.post('/:id/complete', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { result, note } = completeTaskSchema.parse(req.body);

    const task = await prisma.task.findFirst({
      where: { id, tenantId: req.user!.tenantId },
    });

    if (!task) {
      return errorResponse(res, 'TASK_NOT_FOUND', '任务不存在', 404);
    }

    if (task.assigneeUserId !== req.user!.userId && 
        req.user!.role !== Role.TENANT_OWNER && 
        req.user!.role !== Role.STORE_MANAGER) {
      return errorResponse(res, 'FORBIDDEN', '无权完成此任务', 403);
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: TaskStatus.DONE,
        result,
        completedAt: new Date(),
      },
    });

    if (task.relatedCustomerId) {
      await prisma.customer.update({
        where: { id: task.relatedCustomerId },
        data: {
          lastInteractionAt: new Date(),
          riskLevel: result === TaskResult.NEED_MANAGER ? RiskLevel.HIGH : RiskLevel.NONE,
        },
      });
    }

    return successResponse(res, { message: '任务已完成', task: updatedTask });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Complete task error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '完成任务失败', 500);
  }
});

router.post('/:id/cancel', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: { id, tenantId: req.user!.tenantId },
    });

    if (!task) {
      return errorResponse(res, 'TASK_NOT_FOUND', '任务不存在', 404);
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: TaskStatus.CANCELED,
      },
    });

    return successResponse(res, { message: '任务已取消', task: updatedTask });
  } catch (error) {
    console.error('Cancel task error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '取消任务失败', 500);
  }
});

router.post('/generate', requireRole(Role.TENANT_OWNER, Role.STORE_MANAGER), async (req: AuthRequest, res) => {
  try {
    const { storeId } = req.body as { storeId?: string };

    const targetStoreId = storeId || req.user!.storeId;
    if (!targetStoreId) {
      return errorResponse(res, 'STORE_REQUIRED', '请指定门店', 400);
    }

    const salesReps = await prisma.user.findMany({
      where: {
        tenantId: req.user!.tenantId,
        storeId: targetStoreId,
        role: Role.SALES,
        active: true,
      },
    });

    let generatedCount = 0;

    for (const sales of salesReps) {
      const customers = await prisma.customer.findMany({
        where: {
          tenantId: req.user!.tenantId,
          storeId: targetStoreId,
          ownerSalesId: sales.id,
        },
        include: {
          customerPets: {
            include: { pet: true },
          },
        },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const customer of customers) {
        for (const cp of customer.customerPets) {
          if (cp.relationType !== 'OWNER') continue;

          const pet = cp.pet;
          const soldOrder = await prisma.salesOrder.findFirst({
            where: { petId: pet.id, status: 'COMPLETED' },
            orderBy: { soldDate: 'desc' },
          });

          if (!soldOrder) continue;

          const daysSinceSale = Math.floor(
            (today.getTime() - new Date(soldOrder.soldDate).getTime()) / (1000 * 60 * 60 * 24)
          );

          const milestones = [
            { day: 1, title: '到家第1天回访', priority: 'HIGH' },
            { day: 3, title: '到家第3天回访', priority: 'HIGH' },
            { day: 7, title: '到家第7天回访', priority: 'HIGH' },
            { day: 15, title: '到家第15天回访', priority: 'MEDIUM' },
            { day: 30, title: '到家第30天回访', priority: 'MEDIUM' },
          ];

          for (const milestone of milestones) {
            if (Math.abs(daysSinceSale - milestone.day) <= 1) {
              const existingTask = await prisma.task.findFirst({
                where: {
                  tenantId: req.user!.tenantId,
                  relatedCustomerId: customer.id,
                  relatedPetId: pet.id,
                  title: milestone.title,
                  dueDate: {
                    gte: new Date(today.getTime() - 86400000),
                    lte: new Date(today.getTime() + 86400000),
                  },
                },
              });

              if (!existingTask) {
                await prisma.task.create({
                  data: {
                    tenantId: req.user!.tenantId,
                    storeId: targetStoreId,
                    assigneeUserId: sales.id,
                    relatedPetId: pet.id,
                    relatedCustomerId: customer.id,
                    type: 'FOLLOW_UP',
                    priority: milestone.priority as any,
                    title: milestone.title,
                    reason: `宠物到家第${milestone.day}天，建议回访确认状态`,
                    suggestedContent: `您好${customer.name}，${pet.name || pet.breed}到家第${milestone.day}天了，想问问它最近的情况怎么样？吃喝拉撒都正常吗？`,
                    dueDate: today,
                    source: 'AI',
                  },
                });
                generatedCount++;
              }
            }
          }
        }
      }
    }

    return successResponse(res, { message: '任务生成完成', generatedCount });
  } catch (error) {
    console.error('Generate tasks error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '生成任务失败', 500);
  }
});

export default router;
