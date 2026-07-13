import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { Role } from '../constants/enums.js';

const router = Router();

const loginSchema = z.object({
  phone: z.string().min(1, '手机号不能为空'),
  password: z.string().optional(),
});

const registerBossSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  phone: z.string().min(11, '手机号格式不正确'),
  tenantName: z.string().min(1, '品牌名称不能为空'),
  storeName: z.string().min(1, '门店名称不能为空'),
  password: z.string().min(6, '密码至少6位').optional(),
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { phone },
      include: { tenant: true, store: true },
    });

    if (!user) {
      return errorResponse(res, 'USER_NOT_FOUND', '用户不存在', 404);
    }

    if (!user.active) {
      return errorResponse(res, 'USER_INACTIVE', '账号已被停用', 403);
    }

    if (user.passwordHash && password) {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return errorResponse(res, 'INVALID_PASSWORD', '密码错误', 401);
      }
    }

    const token = signToken({
      userId: user.id,
      tenantId: user.tenantId,
      storeId: user.storeId || undefined,
      role: user.role as Role,
      name: user.name,
    });

    return successResponse(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        tenantId: user.tenantId,
        storeId: user.storeId,
        tenantName: user.tenant?.name,
        storeName: user.store?.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Login error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '登录失败', 500);
  }
});

router.post('/register-boss', async (req, res) => {
  try {
    const { name, phone, tenantName, storeName, password } = registerBossSchema.parse(req.body);

    const existingTenant = await prisma.tenant.findFirst({
      where: { ownerPhone: phone },
    });

    if (existingTenant) {
      return errorResponse(res, 'TENANT_EXISTS', '该手机号已注册', 409);
    }

    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          ownerName: name,
          ownerPhone: phone,
        },
      });

      const store = await tx.store.create({
        data: {
          tenantId: tenant.id,
          name: storeName,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          storeId: store.id,
          name,
          phone,
          role: Role.TENANT_OWNER,
          passwordHash,
        },
      });

      return { tenant, store, user };
    });

    const token = signToken({
      userId: result.user.id,
      tenantId: result.tenant.id,
      storeId: result.store.id,
      role: Role.TENANT_OWNER,
      name: result.user.name,
    });

    return successResponse(res, {
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        phone: result.user.phone,
        role: result.user.role,
        tenantId: result.tenant.id,
        storeId: result.store.id,
        tenantName: result.tenant.name,
        storeName: result.store.name,
      },
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Register error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '注册失败', 500);
  }
});

router.post('/logout', authMiddleware, (req, res) => {
  return successResponse(res, { message: '登出成功' });
});

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { tenant: true, store: true },
    });

    if (!user) {
      return errorResponse(res, 'USER_NOT_FOUND', '用户不存在', 404);
    }

    return successResponse(res, {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      tenantId: user.tenantId,
      storeId: user.storeId,
      tenantName: user.tenant?.name,
      storeName: user.store?.name,
      lastLoginAt: user.lastLoginAt,
    });
  } catch (error) {
    console.error('Get me error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '获取用户信息失败', 500);
  }
});

export default router;
