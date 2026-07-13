import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth.js';
import { PetStatus, Role, Species, Gender, HealthStatus } from '../constants/enums.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const { status, species, breed, storeId, page = '1', pageSize = '20' } = req.query as any;

    const where: any = { tenantId: req.user!.tenantId, deletedAt: null };

    if (status) {
      where.status = status;
    }

    if (species) {
      where.species = species;
    }

    if (breed) {
      where.breed = { contains: breed };
    }

    if (storeId) {
      where.storeId = storeId;
    } else if (req.user!.role === Role.SALES || req.user!.role === Role.KEEPER) {
      if (req.user!.storeId) {
        where.storeId = req.user!.storeId;
      }
    }

    const [pets, total] = await Promise.all([
      prisma.pet.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(pageSize),
        take: parseInt(pageSize),
        include: {
          photos: { where: { type: 'PROFILE' }, take: 1 },
          store: true,
        },
      }),
      prisma.pet.count({ where }),
    ]);

    const result = pets.map(pet => ({
      ...pet,
      purchasePrice: req.user!.role === Role.SALES || req.user!.role === Role.KEEPER
        ? undefined
        : pet.purchasePrice,
      photoUrl: pet.photos[0]?.url,
    }));

    return successResponse(res, {
      items: result,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('Get pets error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '获取宠物列表失败', 500);
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const pet = await prisma.pet.findFirst({
      where: { id, tenantId: req.user!.tenantId, deletedAt: null },
      include: {
        photos: true,
        store: true,
        createdBy: { select: { id: true, name: true } },
        logs: {
          orderBy: { occurredAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!pet) {
      return errorResponse(res, 'PET_NOT_FOUND', '宠物不存在', 404);
    }

    const result = {
      ...pet,
      purchasePrice: req.user!.role === Role.SALES || req.user!.role === Role.KEEPER
        ? undefined
        : pet.purchasePrice,
    };

    return successResponse(res, result);
  } catch (error) {
    console.error('Get pet error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '获取宠物详情失败', 500);
  }
});

const createPetSchema = z.object({
  publicId: z.string().min(1, '编号不能为空'),
  name: z.string().optional(),
  species: z.nativeEnum(Species),
  breed: z.string().min(1, '品种不能为空'),
  gender: z.nativeEnum(Gender),
  birthday: z.string().optional(),
  color: z.string().optional(),
  source: z.string().optional(),
  purchasePrice: z.number().optional(),
  purchaseDate: z.string().optional(),
  salePrice: z.number().optional(),
  storeId: z.string().min(1, '请选择门店'),
  healthStatus: z.nativeEnum(HealthStatus).optional(),
  vaccineStatus: z.string().optional(),
  lastVaccineDate: z.string().optional(),
  photoUrl: z.string().optional(),
});

router.post('/', requireRole(Role.TENANT_OWNER, Role.STORE_MANAGER), async (req: AuthRequest, res) => {
  try {
    const data = createPetSchema.parse(req.body);

    const existingPet = await prisma.pet.findFirst({
      where: {
        tenantId: req.user!.tenantId,
        publicId: data.publicId,
      },
    });

    if (existingPet) {
      return errorResponse(res, 'PET_EXISTS', '该编号已存在', 409);
    }

    const pet = await prisma.pet.create({
      data: {
        publicId: data.publicId,
        name: data.name,
        species: data.species,
        breed: data.breed,
        gender: data.gender,
        birthday: data.birthday ? new Date(data.birthday) : null,
        color: data.color,
        source: data.source,
        purchasePrice: data.purchasePrice,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        salePrice: data.salePrice,
        storeId: data.storeId,
        tenantId: req.user!.tenantId,
        createdByUserId: req.user!.userId,
        healthStatus: data.healthStatus || HealthStatus.HEALTHY,
        vaccineStatus: data.vaccineStatus,
        lastVaccineDate: data.lastVaccineDate ? new Date(data.lastVaccineDate) : null,
        photos: data.photoUrl ? {
          create: {
            url: data.photoUrl,
            storageKey: data.publicId,
            type: 'PROFILE',
            uploadedByUserId: req.user!.userId,
            tenantId: req.user!.tenantId,
          },
        } : undefined,
      },
      include: { photos: true, store: true },
    });

    await prisma.petLog.create({
      data: {
        petId: pet.id,
        tenantId: pet.tenantId,
        storeId: pet.storeId,
        operatorUserId: req.user!.userId,
        operatorName: req.user!.name,
        type: 'CREATE',
        content: '新建宠物档案',
        healthStatusSnapshot: pet.healthStatus,
      },
    });

    return successResponse(res, pet, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Create pet error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '创建宠物失败', 500);
  }
});

const updatePetSchema = z.object({
  name: z.string().optional(),
  breed: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  birthday: z.string().optional().nullable(),
  color: z.string().optional(),
  healthStatus: z.nativeEnum(HealthStatus).optional(),
  vaccineStatus: z.string().optional(),
  lastVaccineDate: z.string().optional().nullable(),
  salePrice: z.number().optional(),
  photoUrl: z.string().optional(),
});

router.put('/:id', requireRole(Role.TENANT_OWNER, Role.STORE_MANAGER), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = updatePetSchema.parse(req.body);

    const pet = await prisma.pet.findFirst({
      where: { id, tenantId: req.user!.tenantId, deletedAt: null },
    });

    if (!pet) {
      return errorResponse(res, 'PET_NOT_FOUND', '宠物不存在', 404);
    }

    const updateData: any = { ...data };
    if (data.birthday !== undefined) {
      updateData.birthday = data.birthday ? new Date(data.birthday) : null;
    }
    if (data.lastVaccineDate !== undefined) {
      updateData.lastVaccineDate = data.lastVaccineDate ? new Date(data.lastVaccineDate) : null;
    }

    const updatedPet = await prisma.pet.update({
      where: { id },
      data: updateData,
      include: { photos: true, store: true },
    });

    if (data.photoUrl) {
      const existingPhoto = await prisma.petPhoto.findFirst({
        where: { petId: id, type: 'PROFILE' },
      });

      if (existingPhoto) {
        await prisma.petPhoto.update({
          where: { id: existingPhoto.id },
          data: { url: data.photoUrl },
        });
      } else {
        await prisma.petPhoto.create({
          data: {
            petId: id,
            url: data.photoUrl,
            storageKey: id,
            type: 'PROFILE',
            tenantId: req.user!.tenantId,
            uploadedByUserId: req.user!.userId,
          },
        });
      }
    }

    return successResponse(res, updatedPet);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Update pet error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '更新宠物失败', 500);
  }
});

router.post('/:id/confirm-arrival', requireRole(Role.TENANT_OWNER, Role.STORE_MANAGER), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const pet = await prisma.pet.findFirst({
      where: { id, tenantId: req.user!.tenantId, deletedAt: null },
    });

    if (!pet) {
      return errorResponse(res, 'PET_NOT_FOUND', '宠物不存在', 404);
    }

    if (pet.status !== PetStatus.TRANSIT) {
      return errorResponse(res, 'INVALID_STATUS', '只有在途宠物可以确认到店', 400);
    }

    const updatedPet = await prisma.pet.update({
      where: { id },
      data: { status: PetStatus.IN_STOCK },
    });

    await prisma.petLog.create({
      data: {
        petId: id,
        tenantId: pet.tenantId,
        storeId: pet.storeId,
        operatorUserId: req.user!.userId,
        operatorName: req.user!.name,
        type: 'ARRIVAL',
        content: '确认到店，状态更新为在售',
        healthStatusSnapshot: updatedPet.healthStatus,
      },
    });

    return successResponse(res, { message: '已确认到店', status: updatedPet.status });
  } catch (error) {
    console.error('Confirm arrival error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '确认到店失败', 500);
  }
});

const reserveSchema = z.object({
  customerName: z.string().min(1, '客户姓名不能为空'),
  customerContact: z.string().min(1, '联系方式不能为空'),
  depositAmount: z.number().optional(),
});

router.post('/:id/reserve', requireRole(Role.TENANT_OWNER, Role.STORE_MANAGER, Role.SALES), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { customerName, customerContact, depositAmount } = reserveSchema.parse(req.body);

    const pet = await prisma.pet.findFirst({
      where: { id, tenantId: req.user!.tenantId, deletedAt: null },
    });

    if (!pet) {
      return errorResponse(res, 'PET_NOT_FOUND', '宠物不存在', 404);
    }

    if (pet.status !== PetStatus.IN_STOCK) {
      return errorResponse(res, 'PET_NOT_AVAILABLE', '该宠物不可预定', 400);
    }

    const updatedPet = await prisma.pet.update({
      where: { id },
      data: {
        status: PetStatus.RESERVED,
        reservedByUserId: req.user!.userId,
        reservedAt: new Date(),
      },
    });

    await prisma.petLog.create({
      data: {
        petId: id,
        tenantId: pet.tenantId,
        storeId: pet.storeId,
        operatorUserId: req.user!.userId,
        operatorName: req.user!.name,
        type: 'RESERVATION',
        content: `预定给 ${customerName} (${customerContact})${depositAmount ? `，定金 ${depositAmount}元` : ''}`,
        healthStatusSnapshot: updatedPet.healthStatus,
      },
    });

    return successResponse(res, { message: '预定成功', status: updatedPet.status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('Reserve pet error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '预定失败', 500);
  }
});

router.delete('/:id', requireRole(Role.TENANT_OWNER), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const pet = await prisma.pet.findFirst({
      where: { id, tenantId: req.user!.tenantId, deletedAt: null },
    });

    if (!pet) {
      return errorResponse(res, 'PET_NOT_FOUND', '宠物不存在', 404);
    }

    await prisma.pet.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: req.user!.tenantId,
        storeId: pet.storeId,
        actorUserId: req.user!.userId,
        actorRole: req.user!.role,
        action: 'DELETE_PET',
        objectType: 'Pet',
        objectId: id,
        beforeData: pet as any,
      },
    });

    return successResponse(res, { message: '删除成功' });
  } catch (error) {
    console.error('Delete pet error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '删除失败', 500);
  }
});

export default router;
