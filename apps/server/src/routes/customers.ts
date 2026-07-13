import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth.js';
import { Role } from '../constants/enums.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const { storeId, ownerSalesId, riskLevel, page = '1', pageSize = '20' } = req.query as any;

    const where: any = { tenantId: req.user!.tenantId };

    if (storeId) {
      where.storeId = storeId;
    }

    if (ownerSalesId) {
      where.ownerSalesId = ownerSalesId;
    }

    if (riskLevel) {
      where.riskLevel = riskLevel;
    }

    if (req.user!.role === Role.SALES) {
      where.ownerSalesId = req.user!.userId;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(pageSize),
        take: parseInt(pageSize),
        include: {
          store: true,
          customerPets: {
            include: { pet: { include: { photos: { take: 1 } } } },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return successResponse(res, {
      items: customers,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('Get customers error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '获取客户列表失败', 500);
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findFirst({
      where: { id, tenantId: req.user!.tenantId },
      include: {
        store: true,
        customerPets: {
          include: {
            pet: {
              include: {
                photos: true,
                logs: { orderBy: { occurredAt: 'desc' }, take: 20 },
              },
            },
          },
        },
        salesOrders: {
          orderBy: { createdAt: 'desc' },
          include: { pet: true },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!customer) {
      return errorResponse(res, 'CUSTOMER_NOT_FOUND', '客户不存在', 404);
    }

    return successResponse(res, customer);
  } catch (error) {
    console.error('Get customer error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '获取客户详情失败', 500);
  }
});

const updateCustomerSchema = z.object({
  name: z.string().optional(),
  wechatId: z.string().optional(),
  birthday: z.string().optional().nullable(),
  address: z.string().optional(),
  source: z.string().optional(),
  ownerSalesId: z.string().optional().nullable(),
  lifecycleStage: z.string().optional(),
  riskLevel: z.string().optional(),
  notes: z.string().optional(),
});

router.put('/:id', requireRole(Role.TENANT_OWNER, Role.STORE_MANAGER, Role.SALES), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = updateCustomerSchema.parse(req.body);

    const customer = await prisma.customer.findFirst({
      where: { id, tenantId: req.user!.tenantId },
    });

    if (!customer) {
      return errorResponse(res, 'CUSTOMER_NOT_FOUND', '客户不存在', 404);
    }

    const updateData: any = { ...data };
    if (data.birthday !== undefined) {
      updateData.birthday = data.birthday ? new Date(data.birthday) : null;
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: updateData,
    });

    return successResponse(res, updatedCustomer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Update customer error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '更新客户失败', 500);
  }
});

export default router;
