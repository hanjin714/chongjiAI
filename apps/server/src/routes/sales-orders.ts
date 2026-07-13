import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth.js';
import { PetStatus, Role, SalesOrderStatus, TaskType, TaskPriority, TaskSource } from '../constants/enums.js';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRole(Role.TENANT_OWNER, Role.STORE_MANAGER, Role.SALES), async (req: AuthRequest, res) => {
  try {
    const { storeId, page = '1', pageSize = '20' } = req.query as any;

    const where: any = { tenantId: req.user!.tenantId };

    if (storeId) {
      where.storeId = storeId;
    }

    if (req.user!.role === Role.SALES) {
      where.soldByUserId = req.user!.userId;
    }

    const [orders, total] = await Promise.all([
      prisma.salesOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(pageSize),
        take: parseInt(pageSize),
        include: {
          pet: true,
          customer: true,
          soldBy: { select: { id: true, name: true } },
        },
      }),
      prisma.salesOrder.count({ where }),
    ]);

    return successResponse(res, {
      items: orders,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('Get sales orders error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '获取销售订单失败', 500);
  }
});

const createSalesOrderSchema = z.object({
  petId: z.string().min(1, '请选择宠物'),
  customerName: z.string().min(1, '客户姓名不能为空'),
  customerPhone: z.string().min(11, '客户手机号格式不正确'),
  customerWechat: z.string().optional(),
  customerSource: z.string().optional(),
  soldPrice: z.number().min(0, '售价不能为负'),
  suppliesPrice: z.number().optional(),
  warrantyDays: z.number().optional(),
  soldDate: z.string().optional(),
  contractUrl: z.string().optional(),
});

router.post('/', requireRole(Role.TENANT_OWNER, Role.STORE_MANAGER, Role.SALES), async (req: AuthRequest, res) => {
  try {
    const data = createSalesOrderSchema.parse(req.body);

    const pet = await prisma.pet.findFirst({
      where: { id: data.petId, tenantId: req.user!.tenantId, deletedAt: null },
    });

    if (!pet) {
      return errorResponse(res, 'PET_NOT_FOUND', '宠物不存在', 404);
    }

    if (pet.status !== PetStatus.IN_STOCK && pet.status !== PetStatus.RESERVED) {
      return errorResponse(res, 'PET_NOT_SELLABLE', '该宠物不可销售', 400);
    }

    if (pet.status === PetStatus.RESERVED && pet.reservedByUserId !== req.user!.userId && req.user!.role !== Role.TENANT_OWNER) {
      return errorResponse(res, 'PET_RESERVED_BY_OTHER', '该宠物已被其他销售预定', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      let customer = await tx.customer.findFirst({
        where: {
          tenantId: req.user!.tenantId,
          phone: data.customerPhone,
        },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            tenantId: req.user!.tenantId,
            storeId: pet.storeId,
            name: data.customerName,
            phone: data.customerPhone,
            wechatId: data.customerWechat,
            source: data.customerSource,
            ownerSalesId: req.user!.role === Role.SALES ? req.user!.userId : undefined,
            lifecycleStage: 'NEW',
          },
        });
      }

      const salesOrder = await tx.salesOrder.create({
        data: {
          tenantId: req.user!.tenantId,
          storeId: pet.storeId,
          petId: pet.id,
          customerId: customer.id,
          soldByUserId: req.user!.userId,
          soldByUserName: req.user!.name,
          soldPrice: data.soldPrice,
          suppliesPrice: data.suppliesPrice || 0,
          warrantyDays: data.warrantyDays || 30,
          soldDate: data.soldDate ? new Date(data.soldDate) : new Date(),
        },
      });

      if (data.contractUrl) {
        await tx.contractFile.create({
          data: {
            tenantId: req.user!.tenantId,
            salesOrderId: salesOrder.id,
            petId: pet.id,
            customerId: customer.id,
            url: data.contractUrl,
            storageKey: salesOrder.id,
            uploadedByUserId: req.user!.userId,
          },
        });
      }

      await tx.pet.update({
        where: { id: pet.id },
        data: {
          status: PetStatus.SOLD,
          currentCustomerId: customer.id,
          soldOrderId: salesOrder.id,
        },
      });

      await tx.customerPet.create({
        data: {
          tenantId: req.user!.tenantId,
          customerId: customer.id,
          petId: pet.id,
          relationType: 'OWNER',
        },
      });

      await tx.petLog.create({
        data: {
          petId: pet.id,
          tenantId: pet.tenantId,
          storeId: pet.storeId,
          operatorUserId: req.user!.userId,
          operatorName: req.user!.name,
          type: 'SALE',
          content: `销售出库，售价 ${data.soldPrice} 元，客户：${data.customerName}`,
        },
      });

      const followUpTasks = [
        { days: 1, title: '到家第1天回访', reason: '新宠到家适应期回访，询问吃喝拉撒情况' },
        { days: 3, title: '到家第3天回访', reason: '适应期跟进，确认状态稳定' },
        { days: 7, title: '到家第7天回访', reason: '深度回访，推荐基础用品和护理服务' },
        { days: 30, title: '到家第30天回访', reason: '满月回访，疫苗/驱虫/洗护提醒' },
      ];

      for (const task of followUpTasks) {
        const dueDate = new Date(salesOrder.soldDate);
        dueDate.setDate(dueDate.getDate() + task.days);

        await tx.task.create({
          data: {
            tenantId: req.user!.tenantId,
            storeId: pet.storeId,
            assigneeUserId: req.user!.userId,
            relatedPetId: pet.id,
            relatedCustomerId: customer.id,
            type: TaskType.FOLLOW_UP,
            priority: task.days <= 7 ? TaskPriority.HIGH : TaskPriority.MEDIUM,
            title: task.title,
            reason: task.reason,
            suggestedContent: `您好，${data.customerName}，${pet.name || pet.breed}到家第${task.days}天了，想问问它的情况怎么样？吃喝拉撒都正常吗？`,
            dueDate,
            source: TaskSource.AI,
          },
        });
      }

      return { salesOrder, customer };
    });

    return successResponse(res, result, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Create sales order error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '销售出库失败', 500);
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.salesOrder.findFirst({
      where: { id, tenantId: req.user!.tenantId },
      include: {
        pet: true,
        customer: true,
        soldBy: { select: { id: true, name: true } },
        contractFiles: true,
      },
    });

    if (!order) {
      return errorResponse(res, 'ORDER_NOT_FOUND', '订单不存在', 404);
    }

    return successResponse(res, order);
  } catch (error) {
    console.error('Get sales order error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '获取订单详情失败', 500);
  }
});

export default router;
