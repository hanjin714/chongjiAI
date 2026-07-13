import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();

router.get('/pets/:petId/profile', async (req, res) => {
  try {
    const { petId } = req.params;

    const pet = await prisma.pet.findFirst({
      where: { id: petId, status: 'SOLD', deletedAt: null },
      include: {
        photos: { where: { type: 'PROFILE' } },
        store: { select: { name: true, phone: true, address: true } },
        logs: {
          where: {
            type: { in: ['VACCINE', 'HEALTH', 'SALE', 'ARRIVAL'] },
          },
          orderBy: { occurredAt: 'asc' },
        },
        customerPets: {
          where: { relationType: 'OWNER' },
          include: { customer: { select: { name: true } } },
          take: 1,
        },
      },
    });

    if (!pet) {
      return errorResponse(res, 'PET_NOT_FOUND', '宠物档案不存在', 404);
    }

    const customer = pet.customerPets[0]?.customer;

    const profile = {
      pet: {
        id: pet.id,
        publicId: pet.publicId,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        gender: pet.gender,
        birthday: pet.birthday,
        color: pet.color,
        photoUrl: pet.photos[0]?.url,
        healthStatus: pet.healthStatus,
        vaccineStatus: pet.vaccineStatus,
      },
      customer: customer ? { name: customer.name } : null,
      store: pet.store,
      timeline: pet.logs.map(log => ({
        date: log.occurredAt,
        type: log.type,
        title: getLogTitle(log.type, log.content),
        content: log.content,
      })),
      nextReminders: generateReminders(pet),
    };

    return successResponse(res, profile);
  } catch (error) {
    console.error('Get pet profile error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '获取宠物档案失败', 500);
  }
});

function getLogTitle(type: string, content: string): string {
  const titles: Record<string, string> = {
    SALE: '🎉 回家啦',
    ARRIVAL: '🏠 到店了',
    VACCINE: '💉 疫苗接种',
    HEALTH: '🏥 健康记录',
    CREATE: '📝 档案建立',
    FOLLOW_UP: '💬 回访记录',
  };
  return titles[type] || type;
}

function generateReminders(pet: any) {
  const reminders = [];
  const today = new Date();

  if (pet.lastVaccineDate) {
    const nextVaccine = new Date(pet.lastVaccineDate);
    nextVaccine.setMonth(nextVaccine.getMonth() + 12);
    
    if (nextVaccine > today) {
      reminders.push({
        type: 'VACCINE',
        title: '下次疫苗',
        date: nextVaccine,
        description: '记得按时带宠物接种疫苗哦',
      });
    }
  }

  return reminders;
}

router.post('/appointments', async (req, res) => {
  try {
    const { petId, customerName, customerPhone, serviceType, expectedDate, note } = req.body;

    const pet = await prisma.pet.findFirst({
      where: { id: petId, status: 'SOLD', deletedAt: null },
    });

    if (!pet) {
      return errorResponse(res, 'PET_NOT_FOUND', '宠物不存在', 404);
    }

    let customer = await prisma.customer.findFirst({
      where: {
        tenantId: pet.tenantId,
        phone: customerPhone,
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          tenantId: pet.tenantId,
          storeId: pet.storeId,
          name: customerName,
          phone: customerPhone,
          source: '客户H5预约',
          lifecycleStage: 'NEW',
        },
      });
    }

    await prisma.task.create({
      data: {
        tenantId: pet.tenantId,
        storeId: pet.storeId,
        assigneeUserId: pet.createdByUserId,
        relatedPetId: petId,
        relatedCustomerId: customer.id,
        type: 'OTHER',
        priority: 'MEDIUM',
        title: `客户预约：${serviceType}`,
        reason: `客户 ${customerName} 通过成长档案预约 ${serviceType} 服务`,
        suggestedContent: `您好${customerName}，收到您的${serviceType}预约，我们会尽快与您联系确认时间。`,
        dueDate: expectedDate ? new Date(expectedDate) : new Date(),
        source: 'SYSTEM',
      },
    });

    return successResponse(res, { message: '预约成功，我们会尽快联系您' }, 201);
  } catch (error) {
    console.error('Create appointment error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '预约失败', 500);
  }
});

export default router;
