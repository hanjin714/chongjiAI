import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth.js';
import { Role } from '../constants/enums.js';

const router = Router();

router.use(authMiddleware);

router.get('/', requireRole(Role.TENANT_OWNER, Role.STORE_MANAGER), async (req: AuthRequest, res) => {
  try {
    const { storeId, role } = req.query as { storeId?: string; role?: string };

    const where: any = { tenantId: req.user!.tenantId };

    if (storeId) {
      where.storeId = storeId;
    }

    if (role) {
      where.role = role;
    }

    if (req.user!.role === Role.STORE_MANAGER && req.user!.storeId) {
      where.storeId = req.user!.storeId;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { store: true },
    });

    return successResponse(res, users.map(u => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      role: u.role,
      active: u.active,
      storeId: u.storeId,
      storeName: u.store?.name,
      workWechatId: u.workWechatId,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    })));
  } catch (error) {
    console.error('Get users error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '获取员工列表失败', 500);
  }
});

const createUserSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  phone: z.string().min(11, '手机号格式不正确'),
  role: z.nativeEnum(Role),
  storeId: z.string().optional(),
  workWechatId: z.string().optional(),
  password: z.string().min(6).optional(),
});

router.post('/', requireRole(Role.TENANT_OWNER), async (req: AuthRequest, res) => {
  try {
    const data = createUserSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        tenantId: req.user!.tenantId,
        phone: data.phone,
      },
    });

    if (existingUser) {
      return errorResponse(res, 'USER_EXISTS', '该手机号已存在', 409);
    }

    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;

    const user = await prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        role: data.role,
        tenantId: req.user!.tenantId,
        storeId: data.storeId,
        workWechatId: data.workWechatId,
        passwordHash,
      },
      include: { store: true },
    });

    return successResponse(res, {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      storeId: user.storeId,
      storeName: user.store?.name,
      active: user.active,
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Create user error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '创建员工失败', 500);
  }
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.nativeEnum(Role).optional(),
  storeId: z.string().optional().nullable(),
  workWechatId: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

router.put('/:id', requireRole(Role.TENANT_OWNER), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { id, tenantId: req.user!.tenantId },
    });

    if (!user) {
      return errorResponse(res, 'USER_NOT_FOUND', '员工不存在', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      include: { store: true },
    });

    return successResponse(res, {
      id: updatedUser.id,
      name: updatedUser.name,
      phone: updatedUser.phone,
      role: updatedUser.role,
      storeId: updatedUser.storeId,
      storeName: updatedUser.store?.name,
      active: updatedUser.active,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Update user error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '更新员工失败', 500);
  }
});

router.post('/:id/deactivate', requireRole(Role.TENANT_OWNER), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findFirst({
      where: { id, tenantId: req.user!.tenantId },
    });

    if (!user) {
      return errorResponse(res, 'USER_NOT_FOUND', '员工不存在', 404);
    }

    if (user.role === Role.TENANT_OWNER) {
      return errorResponse(res, 'CANNOT_DEACTIVATE_OWNER', '不能停用店主账号', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { active: false },
    });

    return successResponse(res, { message: '员工已停用', active: updatedUser.active });
  } catch (error) {
    console.error('Deactivate user error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '停用员工失败', 500);
  }
});

router.post('/:id/activate', requireRole(Role.TENANT_OWNER), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findFirst({
      where: { id, tenantId: req.user!.tenantId },
    });

    if (!user) {
      return errorResponse(res, 'USER_NOT_FOUND', '员工不存在', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { active: true },
    });

    return successResponse(res, { message: '员工已启用', active: updatedUser.active });
  } catch (error) {
    console.error('Activate user error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '启用员工失败', 500);
  }
});

export default router;
