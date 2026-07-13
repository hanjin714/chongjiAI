import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth.js';
import { Role, HealthStatus, PetStatus } from '../constants/enums.js';

const router = Router();

router.use(authMiddleware);

router.get('/pet/:petId', async (req: AuthRequest, res) => {
  try {
    const { petId } = req.params;
    const { type, page = '1', pageSize = '20' } = req.query as any;

    const pet = await prisma.pet.findFirst({
      where: { id: petId, tenantId: req.user!.tenantId },
    });

    if (!pet) {
      return errorResponse(res, 'PET_NOT_FOUND', '宠物不存在', 404);
    }

    const where: any = { petId, tenantId: req.user!.tenantId };

    if (type) {
      where.type = type;
    }

    const [logs, total] = await Promise.all([
      prisma.petLog.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(pageSize),
        take: parseInt(pageSize),
      }),
      prisma.petLog.count({ where }),
    ]);

    return successResponse(res, {
      items: logs,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('Get pet logs error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '获取宠物日志失败', 500);
  }
});

const createPetLogSchema = z.object({
  type: z.string().min(1, '日志类型不能为空'),
  content: z.string().min(1, '日志内容不能为空'),
  healthStatus: z.nativeEnum(HealthStatus).optional(),
});

router.post('/pet/:petId', requireRole(Role.TENANT_OWNER, Role.STORE_MANAGER, Role.KEEPER), async (req: AuthRequest, res) => {
  try {
    const { petId } = req.params;
    const data = createPetLogSchema.parse(req.body);

    const pet = await prisma.pet.findFirst({
      where: { id: petId, tenantId: req.user!.tenantId, deletedAt: null },
    });

    if (!pet) {
      return errorResponse(res, 'PET_NOT_FOUND', '宠物不存在', 404);
    }

    const log = await prisma.petLog.create({
      data: {
        petId,
        tenantId: req.user!.tenantId,
        storeId: pet.storeId,
        operatorUserId: req.user!.userId,
        operatorName: req.user!.name,
        type: data.type,
        content: data.content,
        healthStatusSnapshot: data.healthStatus || pet.healthStatus,
      },
    });

    if (data.healthStatus && data.healthStatus !== pet.healthStatus) {
      await prisma.pet.update({
        where: { id: petId },
        data: { healthStatus: data.healthStatus },
      });

      if (data.healthStatus === HealthStatus.SICK || data.healthStatus === HealthStatus.OBSERVATION) {
        await prisma.task.create({
          data: {
            tenantId: req.user!.tenantId,
            storeId: pet.storeId,
            assigneeUserId: req.user!.userId,
            relatedPetId: petId,
            type: 'HEALTH',
            priority: 'HIGH',
            title: `宠物健康异常：${pet.name || pet.breed}`,
            reason: `健康状态更新为${data.healthStatus === 'SICK' ? '生病' : '观察中'}，需要持续关注`,
            suggestedContent: '请持续观察宠物状态，如有异常及时处理',
            dueDate: new Date(),
            source: 'SYSTEM',
          },
        });
      }
    }

    return successResponse(res, log, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Create pet log error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '添加日志失败', 500);
  }
});

router.get('/health/pets', requireRole(Role.TENANT_OWNER, Role.STORE_MANAGER, Role.KEEPER), async (req: AuthRequest, res) => {
  try {
    const { healthStatus } = req.query as { healthStatus?: string };

    const where: any = { 
      tenantId: req.user!.tenantId, 
      deletedAt: null,
      status: { in: [PetStatus.IN_STOCK, PetStatus.RESERVED] },
    };

    if (healthStatus) {
      where.healthStatus = healthStatus;
    }

    if (req.user!.role === Role.KEEPER && req.user!.storeId) {
      where.storeId = req.user!.storeId;
    }

    const pets = await prisma.pet.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        photos: { take: 1, where: { type: 'PROFILE' } },
        logs: { take: 5, orderBy: { occurredAt: 'desc' } },
        store: true,
      },
    });

    return successResponse(res, pets);
  } catch (error) {
    console.error('Get health pets error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '获取宠物健康列表失败', 500);
  }
});

export default router;
