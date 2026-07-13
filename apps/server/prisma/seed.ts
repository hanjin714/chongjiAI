import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始初始化种子数据...');

  const tenant = await prisma.tenant.upsert({
    where: { id: 'demo-tenant-001' },
    update: {},
    create: {
      id: 'demo-tenant-001',
      name: '宠迹AI演示品牌',
      ownerName: '李总',
      ownerPhone: '13800000000',
      plan: 'pro',
      status: 'ACTIVE',
    },
  });

  let store = await prisma.store.findFirst({
    where: { tenantId: tenant.id, name: '上海静安旗舰店' },
  });
  if (!store) {
    store = await prisma.store.create({
      data: {
        tenantId: tenant.id,
        name: '上海静安旗舰店',
        city: '上海',
        address: '上海市静安区南京西路100号',
        phone: '021-12345678',
        status: 'ACTIVE',
      },
    });
  }

  const passwordHash = await bcrypt.hash('123456', 10);

  let boss = await prisma.user.findFirst({
    where: { tenantId: tenant.id, phone: '13800000000' },
  });
  if (!boss) {
    boss = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        storeId: store.id,
        name: '李总',
        phone: '13800000000',
        role: 'TENANT_OWNER',
        active: true,
        isDemo: true,
        passwordHash,
      },
    });
  }

  let salesRep = await prisma.user.findFirst({
    where: { tenantId: tenant.id, phone: '13800000001' },
  });
  if (!salesRep) {
    salesRep = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        storeId: store.id,
        name: '王销售',
        phone: '13800000001',
        role: 'SALES',
        active: true,
        isDemo: true,
        passwordHash,
      },
    });
  }

  let keeper = await prisma.user.findFirst({
    where: { tenantId: tenant.id, phone: '13800000002' },
  });
  if (!keeper) {
    keeper = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        storeId: store.id,
        name: '张饲养员',
        phone: '13800000002',
        role: 'KEEPER',
        active: true,
        isDemo: true,
        passwordHash,
      },
    });
  }

  let manager = await prisma.user.findFirst({
    where: { tenantId: tenant.id, phone: '13800000003' },
  });
  if (!manager) {
    manager = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        storeId: store.id,
        name: '赵店长',
        phone: '13800000003',
        role: 'STORE_MANAGER',
        active: true,
        isDemo: true,
        passwordHash,
      },
    });
  }

  const demoPets = [
    {
      publicId: 'C-2402-001',
      name: '奶糖',
      species: 'CAT',
      breed: '英短蓝白',
      gender: 'FEMALE',
      color: '蓝白',
      salePrice: 2800,
      purchasePrice: 1500,
      status: 'IN_STOCK',
      healthStatus: 'HEALTHY',
      vaccineStatus: '3针',
      birthday: new Date('2024-10-15'),
      photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
    },
    {
      publicId: 'C-2402-002',
      name: '布丁',
      species: 'CAT',
      breed: '布偶',
      gender: 'MALE',
      color: '海豹双色',
      salePrice: 5800,
      purchasePrice: 3500,
      status: 'IN_STOCK',
      healthStatus: 'HEALTHY',
      vaccineStatus: '2针',
      birthday: new Date('2024-11-01'),
      photo: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=400&fit=crop',
    },
    {
      publicId: 'C-2402-003',
      name: '煤球',
      species: 'CAT',
      breed: '孟买猫',
      gender: 'MALE',
      color: '纯黑',
      salePrice: 4500,
      purchasePrice: 2800,
      status: 'IN_STOCK',
      healthStatus: 'OBSERVATION',
      vaccineStatus: '2针',
      birthday: new Date('2024-10-20'),
      photo: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop',
    },
    {
      publicId: 'C-2402-004',
      name: '年糕',
      species: 'CAT',
      breed: '金渐层',
      gender: 'FEMALE',
      color: '金色',
      salePrice: 8800,
      purchasePrice: 5500,
      status: 'RESERVED',
      healthStatus: 'HEALTHY',
      vaccineStatus: '3针',
      birthday: new Date('2024-09-10'),
      reservedByUserId: salesRep.id,
      reservedAt: new Date(),
      photo: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop',
    },
    {
      publicId: 'D-2401-001',
      name: '豆豆',
      species: 'DOG',
      breed: '柯基',
      gender: 'MALE',
      color: '三色',
      salePrice: 3500,
      purchasePrice: 2000,
      status: 'IN_STOCK',
      healthStatus: 'HEALTHY',
      vaccineStatus: '3针',
      birthday: new Date('2024-10-01'),
      photo: 'https://images.unsplash.com/photo-1587301461726-4914e8b41456?w=400&h=400&fit=crop',
    },
    {
      publicId: 'D-2401-002',
      name: '奶茶',
      species: 'DOG',
      breed: '比熊',
      gender: 'FEMALE',
      color: '白色',
      salePrice: 4200,
      purchasePrice: 2500,
      status: 'TRANSIT',
      healthStatus: 'HEALTHY',
      vaccineStatus: '1针',
      birthday: new Date('2024-12-01'),
      photo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop',
    },
    {
      publicId: 'C-2401-005',
      name: '糯米',
      species: 'CAT',
      breed: '银渐层',
      gender: 'MALE',
      color: '银灰色',
      salePrice: 3800,
      purchasePrice: 2200,
      status: 'IN_STOCK',
      healthStatus: 'HEALTHY',
      vaccineStatus: '3针',
      birthday: new Date('2024-09-15'),
      photo: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=400&fit=crop',
    },
    {
      publicId: 'C-2401-006',
      name: '汤圆',
      species: 'CAT',
      breed: '美短虎斑',
      gender: 'FEMALE',
      color: '虎斑',
      salePrice: 2500,
      purchasePrice: 1200,
      status: 'IN_STOCK',
      healthStatus: 'HEALTHY',
      vaccineStatus: '2针',
      birthday: new Date('2024-11-10'),
      photo: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop',
    },
  ];

  for (const petData of demoPets) {
    const existing = await prisma.pet.findFirst({
      where: {
        tenantId: tenant.id,
        publicId: petData.publicId,
      },
    });

    if (!existing) {
      const { photo, ...petInfo } = petData;
      const pet = await prisma.pet.create({
        data: {
          ...petInfo,
          tenantId: tenant.id,
          storeId: store.id,
          createdByUserId: boss.id,
          purchaseDate: new Date(),
        },
      });

      await prisma.petPhoto.create({
        data: {
          tenantId: tenant.id,
          petId: pet.id,
          url: photo,
          storageKey: pet.publicId,
          type: 'PROFILE',
          uploadedByUserId: boss.id,
        },
      });
    }
  }

  let customerChen = await prisma.customer.findFirst({
    where: { tenantId: tenant.id, phone: '13912345678' },
  });
  if (!customerChen) {
    customerChen = await prisma.customer.create({
      data: {
        tenantId: tenant.id,
        storeId: store.id,
        name: '陈女士',
        phone: '13912345678',
        wechatId: 'chen_lady',
        ownerSalesId: salesRep.id,
        lifecycleStage: 'FOLLOW_UP',
        source: '朋友推荐',
        riskLevel: 'NONE',
      },
    });

    const inStockPet = await prisma.pet.findFirst({
      where: { tenantId: tenant.id, status: 'IN_STOCK' },
      orderBy: { createdAt: 'asc' },
    });

    if (inStockPet) {
      await prisma.pet.update({
        where: { id: inStockPet.id },
        data: {
          status: 'SOLD',
          currentCustomerId: customerChen.id,
        },
      });

      await prisma.salesOrder.create({
        data: {
          tenantId: tenant.id,
          storeId: store.id,
          petId: inStockPet.id,
          customerId: customerChen.id,
          soldByUserId: salesRep.id,
          soldByUserName: salesRep.name,
          soldPrice: inStockPet.salePrice || 2800,
          soldDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.customerPet.create({
        data: {
          tenantId: tenant.id,
          customerId: customerChen.id,
          petId: inStockPet.id,
          relationType: 'OWNER',
        },
      });

      await prisma.petLog.create({
        data: {
          petId: inStockPet.id,
          tenantId: tenant.id,
          storeId: store.id,
          operatorUserId: salesRep.id,
          operatorName: salesRep.name,
          type: 'SALE',
          content: '销售出库，客户：陈女士',
        },
      });

      const taskData = [
        {
          title: '到家第3天回访',
          reason: '宠物到家第3天，适应期跟进',
          type: 'FOLLOW_UP',
          priority: 'HIGH',
          dueDate: new Date(),
          suggestedContent: '您好陈女士，奶糖到家第3天了，想问问它的情况怎么样？吃喝拉撒都正常吗？',
        },
        {
          title: '到家第7天回访',
          reason: '深度回访，推荐基础用品',
          type: 'FOLLOW_UP',
          priority: 'MEDIUM',
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          suggestedContent: '您好陈女士，奶糖来家一周啦，现在是不是已经熟门熟路了？最近有没有什么好玩的事情可以跟我分享一下？',
        },
        {
          title: '疫苗到期提醒',
          reason: '距离上次疫苗已3个月，建议加强',
          type: 'VACCINE',
          priority: 'MEDIUM',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          suggestedContent: '您好陈女士，提醒一下奶糖的疫苗快到时间了，要不要预约一下？',
        },
      ];

      for (const t of taskData) {
        await prisma.task.create({
          data: {
            ...t,
            tenantId: tenant.id,
            storeId: store.id,
            assigneeUserId: salesRep.id,
            relatedPetId: inStockPet.id,
            relatedCustomerId: customerChen.id,
            source: 'AI',
            status: 'TODO',
          },
        });
      }
    }
  }

  let customerLiu = await prisma.customer.findFirst({
    where: { tenantId: tenant.id, phone: '13987654321' },
  });
  if (!customerLiu) {
    customerLiu = await prisma.customer.create({
      data: {
        tenantId: tenant.id,
        storeId: store.id,
        name: '刘先生',
        phone: '13987654321',
        ownerSalesId: salesRep.id,
        lifecycleStage: 'INQUIRY',
        source: '小红书',
        riskLevel: 'MEDIUM',
        notes: '意向金渐层，预算8000左右',
      },
    });
  }

  let customerWang = await prisma.customer.findFirst({
    where: { tenantId: tenant.id, phone: '13900001111' },
  });
  if (!customerWang) {
    customerWang = await prisma.customer.create({
      data: {
        tenantId: tenant.id,
        storeId: store.id,
        name: '王女士',
        phone: '13900001111',
        ownerSalesId: salesRep.id,
        lifecycleStage: 'FOLLOW_UP',
        source: '到店咨询',
        riskLevel: 'HIGH',
        notes: '购买1个月，宠物出现软便，客户情绪比较焦虑',
      },
    });
  }

  const soldPet2 = await prisma.pet.findFirst({
    where: { tenantId: tenant.id, status: 'IN_STOCK', species: 'CAT' },
    orderBy: { createdAt: 'desc' },
  });
  if (soldPet2 && customerWang) {
    const hasOrder = await prisma.salesOrder.findFirst({
      where: { customerId: customerWang.id },
    });
    if (!hasOrder) {
      await prisma.pet.update({
        where: { id: soldPet2.id },
        data: {
          status: 'SOLD',
          currentCustomerId: customerWang.id,
        },
      });

      await prisma.salesOrder.create({
        data: {
          tenantId: tenant.id,
          storeId: store.id,
          petId: soldPet2.id,
          customerId: customerWang.id,
          soldByUserId: salesRep.id,
          soldByUserName: salesRep.name,
          soldPrice: soldPet2.salePrice || 3800,
          soldDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.customerPet.create({
        data: {
          tenantId: tenant.id,
          customerId: customerWang.id,
          petId: soldPet2.id,
          relationType: 'OWNER',
        },
      });
    }
  }

  const inStockPets = await prisma.pet.findMany({
    where: { tenantId: tenant.id, status: 'IN_STOCK' },
    take: 3,
  });

  for (const pet of inStockPets) {
    const logCount = await prisma.petLog.count({ where: { petId: pet.id } });
    if (logCount === 0) {
      await prisma.petLog.create({
        data: {
          petId: pet.id,
          tenantId: tenant.id,
          storeId: store.id,
          operatorUserId: keeper.id,
          operatorName: keeper.name,
          type: 'HEALTH_CHECK',
          content: '每日健康检查：精神状态良好，饮食正常，排便正常',
          healthStatusSnapshot: 'HEALTHY',
        },
      });
    }
  }

  const sickPet = await prisma.pet.findFirst({
    where: { tenantId: tenant.id, healthStatus: 'OBSERVATION' },
  });
  if (sickPet) {
    const logCount = await prisma.petLog.count({ where: { petId: sickPet.id } });
    if (logCount === 0) {
      await prisma.petLog.create({
        data: {
          petId: sickPet.id,
          tenantId: tenant.id,
          storeId: store.id,
          operatorUserId: keeper.id,
          operatorName: keeper.name,
          type: 'HEALTH_CHECK',
          content: '发现轻微软便，已安排观察，饮食正常，精神尚可',
          healthStatusSnapshot: 'OBSERVATION',
        },
      });

      await prisma.task.create({
        data: {
          title: '继续观察煤球健康状况',
          reason: '宠物出现软便，需要持续观察',
          type: 'HEALTH',
          priority: 'HIGH',
          dueDate: new Date(),
          tenantId: tenant.id,
          storeId: store.id,
          assigneeUserId: keeper.id,
          relatedPetId: sickPet.id,
          source: 'AI',
          status: 'TODO',
        },
      });
    }
  }

  console.log('✅ 种子数据初始化完成！');
  console.log('');
  console.log('📱 演示账号（密码均为 123456）：');
  console.log('   老板端：13800000000');
  console.log('   店长端：13800000003');
  console.log('   销售端：13800000001');
  console.log('   饲养员：13800000002');
  console.log('');
  console.log('🏪 门店：上海静安旗舰店');
  console.log('🐱 演示宠物：8只');
  console.log('👥 演示客户：3位');
  console.log('📋 演示任务：多个');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
