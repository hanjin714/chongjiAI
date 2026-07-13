import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth.js';
import { Role, StoreStatus } from '../constants/enums.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const stores = await prisma.store.findMany({
      where: { tenantId: req.user!.tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true, pets: true },
        },
      },
    });

    return successResponse(res, stores);
  } catch (error) {
    console.error('Get stores error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '获取门店列表失败', 500);
  }
});

const createStoreSchema = z.object({
  name: z.string().min(1, '门店名称不能为空'),
  city: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

router.post('/', requireRole(Role.TENANT_OWNER), async (req: AuthRequest, res) => {
  try {
    const data = createStoreSchema.parse(req.body);

    const existingStore = await prisma.store.findFirst({
      where: {
        tenantId: req.user!.tenantId,
        name: data.name,
      },
    });

    if (existingStore) {
      return errorResponse(res, 'STORE_EXISTS', '门店名称已存在', 409);
    }

    const store = await prisma.store.create({
      data: {
        ...data,
        tenantId: req.user!.tenantId,
      },
    });

    return successResponse(res, store, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Create store error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '创建门店失败', 500);
  }
});

const updateStoreSchema = z.object({
  name: z.string().min(1).optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  status: z.nativeEnum(StoreStatus).optional(),
});

router.put('/:id', requireRole(Role.TENANT_OWNER), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = updateStoreSchema.parse(req.body);

    const store = await prisma.store.findFirst({
      where: { id, tenantId: req.user!.tenantId },
    });

    if (!store) {
      return errorResponse(res, 'STORE_NOT_FOUND', '门店不存在', 404);
    }

    const updatedStore = await prisma.store.update({
      where: { id },
      data,
    });

    return successResponse(res, updatedStore);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Update store error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '更新门店失败', 500);
  }
});

export default router;
