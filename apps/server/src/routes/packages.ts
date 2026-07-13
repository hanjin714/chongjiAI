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
    const { storeId, page = '1', pageSize = '20', keyword } = req.query as any;

    const where: any = { tenantId: req.user!.tenantId };

    if (storeId) {
      where.storeId = storeId;
    } else if (req.user!.role === Role.SALES || req.user!.role === Role.KEEPER) {
      if (req.user!.storeId) {
        where.storeId = req.user!.storeId;
      }
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } },
      ];
    }

    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(pageSize),
        take: parseInt(pageSize),
        include: { store: true },
      }),
      prisma.package.count({ where }),
    ]);

    return successResponse(res, {
      items: packages,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('Get packages error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '获取套餐列表失败', 500);
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const pkg = await prisma.package.findFirst({
      where: { id, tenantId: req.user!.tenantId },
      include: { store: true },
    });

    if (!pkg) {
      return errorResponse(res, 'NOT_FOUND', '套餐不存在', 404);
    }

    return successResponse(res, pkg);
  } catch (error) {
    console.error('Get package error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '获取套餐详情失败', 500);
  }
});

const createSchema = z.object({
  name: z.string().min(1, '套餐名称不能为空'),
  description: z.string().optional(),
  items: z.string().optional(),
  originalPrice: z.number().min(0, '原价不能小于0'),
  salePrice: z.number().min(0, '售价不能小于0'),
  stock: z.number().int().min(0, '库存不能小于0').optional(),
  expiryDate: z.string().optional(),
  imageUrl: z.string().optional(),
  isPromotional: z.boolean().optional(),
  storeId: z.string().optional(),
});

router.post('/', requireRole([Role.TENANT_OWNER, Role.STORE_MANAGER]), async (req: AuthRequest, res) => {
  try {
    const parseResult = createSchema.safeParse(req.body);
    if (!parseResult.success) {
      return errorResponse(res, 'VALIDATION_ERROR', parseResult.error.issues[0].message, 400);
    }

    const data = parseResult.data;
    const storeId = data.storeId || req.user!.storeId;

    const pkg = await prisma.package.create({
      data: {
        ...data,
        tenantId: req.user!.tenantId,
        storeId,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
    });

    return successResponse(res, pkg);
  } catch (error) {
    console.error('Create package error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '创建套餐失败', 500);
  }
});

router.put('/:id', requireRole([Role.TENANT_OWNER, Role.STORE_MANAGER]), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.package.findFirst({
      where: { id, tenantId: req.user!.tenantId },
    });

    if (!existing) {
      return errorResponse(res, 'NOT_FOUND', '套餐不存在', 404);
    }

    const parseResult = createSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return errorResponse(res, 'VALIDATION_ERROR', parseResult.error.issues[0].message, 400);
    }

    const data = parseResult.data as any;

    const pkg = await prisma.package.update({
      where: { id },
      data: {
        ...data,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      },
    });

    return successResponse(res, pkg);
  } catch (error) {
    console.error('Update package error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '更新套餐失败', 500);
  }
});

router.delete('/:id', requireRole([Role.TENANT_OWNER, Role.STORE_MANAGER]), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.package.findFirst({
      where: { id, tenantId: req.user!.tenantId },
    });

    if (!existing) {
      return errorResponse(res, 'NOT_FOUND', '套餐不存在', 404);
    }

    await prisma.package.delete({ where: { id } });

    return successResponse(res, null);
  } catch (error) {
    console.error('Delete package error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '删除套餐失败', 500);
  }
});

export default router;
