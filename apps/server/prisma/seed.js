import { PrismaClient, Role, PetStatus, Species, Gender, HealthStatus, TaskType, TaskPriority, TaskSource, TaskStatus } from '@prisma/client';
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
    const store = await prisma.store.upsert({
        where: { tenantId_name: { tenantId: tenant.id, name: '上海静安旗舰店' } },
        update: {},
        create: {
            tenantId: tenant.id,
            name: '上海静安旗舰店',
            city: '上海',
            address: '上海市静安区南京西路100号',
            phone: '021-12345678',
            status: 'ACTIVE',
        },
    });
    const passwordHash = await bcrypt.hash('123456', 10);
    const boss = await prisma.user.upsert({
        where: { tenantId_phone: { tenantId: tenant.id, phone: '13800000000' } },
        update: {},
        create: {
            tenantId: tenant.id,
            storeId: store.id,
            name: '李总',
            phone: '13800000000',
            role: Role.TENANT_OWNER,
            active: true,
            isDemo: true,
            passwordHash,
        },
    });
    const salesRep = await prisma.user.upsert({
        where: { tenantId_phone: { tenantId: tenant.id, phone: '13800000001' } },
        update: {},
        create: {
            tenantId: tenant.id,
            storeId: store.id,
            name: '王销售',
            phone: '13800000001',
            role: Role.SALES,
            active: true,
            isDemo: true,
            passwordHash,
        },
    });
    const keeper = await prisma.user.upsert({
        where: { tenantId_phone: { tenantId: tenant.id, phone: '13800000002' } },
        update: {},
        create: {
            tenantId: tenant.id,
            storeId: store.id,
            name: '张饲养员',
            phone: '13800000002',
            role: Role.KEEPER,
            active: true,
            isDemo: true,
            passwordHash,
        },
    });
    const demoPets = [
        {
            publicId: 'C-2402-001',
            name: '奶糖',
            species: Species.CAT,
            breed: '英短蓝白',
            gender: Gender.FEMALE,
            color: '蓝白',
            salePrice: 2800,
            purchasePrice: 1500,
            status: PetStatus.IN_STOCK,
            healthStatus: HealthStatus.HEALTHY,
            vaccineStatus: '3针',
            birthday: new Date('2024-10-15'),
        },
        {
            publicId: 'C-2402-002',
            name: '布丁',
            species: Species.CAT,
            breed: '布偶',
            gender: Gender.MALE,
            color: '海豹双色',
            salePrice: 5800,
            purchasePrice: 3500,
            status: PetStatus.IN_STOCK,
            healthStatus: HealthStatus.HEALTHY,
            vaccineStatus: '2针',
            birthday: new Date('2024-11-01'),
        },
        {
            publicId: 'C-2402-003',
            name: '煤球',
            species: Species.CAT,
            breed: '孟买猫',
            gender: Gender.MALE,
            color: '纯黑',
            salePrice: 4500,
            purchasePrice: 2800,
            status: PetStatus.IN_STOCK,
            healthStatus: HealthStatus.OBSERVATION,
            vaccineStatus: '2针',
            birthday: new Date('2024-10-20'),
        },
        {
            publicId: 'C-2402-004',
            name: '年糕',
            species: Species.CAT,
            breed: '金渐层',
            gender: Gender.FEMALE,
            color: '金色',
            salePrice: 8800,
            purchasePrice: 5500,
            status: PetStatus.RESERVED,
            healthStatus: HealthStatus.HEALTHY,
            vaccineStatus: '3针',
            birthday: new Date('2024-09-10'),
            reservedByUserId: salesRep.id,
            reservedAt: new Date(),
        },
        {
            publicId: 'D-2401-001',
            name: '豆豆',
            species: Species.DOG,
            breed: '柯基',
            gender: Gender.MALE,
            color: '三色',
            salePrice: 3500,
            purchasePrice: 2000,
            status: PetStatus.IN_STOCK,
            healthStatus: HealthStatus.HEALTHY,
            vaccineStatus: '3针',
            birthday: new Date('2024-10-01'),
        },
        {
            publicId: 'D-2401-002',
            name: '奶茶',
            species: Species.DOG,
            breed: '比熊',
            gender: Gender.FEMALE,
            color: '白色',
            salePrice: 4200,
            purchasePrice: 2500,
            status: PetStatus.TRANSIT,
            healthStatus: HealthStatus.HEALTHY,
            vaccineStatus: '1针',
            birthday: new Date('2024-12-01'),
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
            const pet = await prisma.pet.create({
                data: {
                    ...petData,
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
                    url: `https://images.unsplash.com/photo-${pet.species === Species.CAT ? '1514888286974-6c03e2ca1dba' : '1587301461726-4914e8b41456'}?w=400&h=400&fit=crop`,
                    storageKey: pet.publicId,
                    type: 'PROFILE',
                    uploadedByUserId: boss.id,
                },
            });
            if (pet.status === PetStatus.SOLD) {
                const customer = await prisma.customer.create({
                    data: {
                        tenantId: tenant.id,
                        storeId: store.id,
                        name: `${pet.name}妈妈`,
                        phone: `1390000${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                        ownerSalesId: salesRep.id,
                        lifecycleStage: 'FOLLOW_UP',
                        source: '到店咨询',
                    },
                });
                await prisma.salesOrder.create({
                    data: {
                        tenantId: tenant.id,
                        storeId: store.id,
                        petId: pet.id,
                        customerId: customer.id,
                        soldByUserId: salesRep.id,
                        soldByUserName: salesRep.name,
                        soldPrice: pet.salePrice || 0,
                        soldDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                });
                await prisma.customerPet.create({
                    data: {
                        tenantId: tenant.id,
                        customerId: customer.id,
                        petId: pet.id,
                        relationType: 'OWNER',
                        startedAt: new Date(),
                    },
                });
            }
        }
    }
    const soldPet = await prisma.pet.findFirst({
        where: { tenantId: tenant.id, status: PetStatus.SOLD },
    });
    if (!soldPet) {
        const inStockPet = await prisma.pet.findFirst({
            where: { tenantId: tenant.id, status: PetStatus.IN_STOCK },
        });
        if (inStockPet) {
            const customer = await prisma.customer.create({
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
            await prisma.$transaction([
                prisma.pet.update({
                    where: { id: inStockPet.id },
                    data: {
                        status: PetStatus.SOLD,
                        currentCustomerId: customer.id,
                    },
                }),
                prisma.salesOrder.create({
                    data: {
                        tenantId: tenant.id,
                        storeId: store.id,
                        petId: inStockPet.id,
                        customerId: customer.id,
                        soldByUserId: salesRep.id,
                        soldByUserName: salesRep.name,
                        soldPrice: inStockPet.salePrice || 2800,
                        soldDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    },
                }),
                prisma.customerPet.create({
                    data: {
                        tenantId: tenant.id,
                        customerId: customer.id,
                        petId: inStockPet.id,
                        relationType: 'OWNER',
                    },
                }),
                prisma.petLog.create({
                    data: {
                        petId: inStockPet.id,
                        tenantId: tenant.id,
                        storeId: store.id,
                        operatorUserId: salesRep.id,
                        operatorName: salesRep.name,
                        type: 'SALE',
                        content: `销售出库，客户：陈女士`,
                    },
                }),
            ]);
            const taskData = [
                {
                    title: '到家第3天回访',
                    reason: '宠物到家第3天，适应期跟进',
                    type: TaskType.FOLLOW_UP,
                    priority: TaskPriority.HIGH,
                    dueDate: new Date(),
                    suggestedContent: '您好陈女士，奶糖到家第3天了，想问问它的情况怎么样？吃喝拉撒都正常吗？',
                },
                {
                    title: '到家第7天回访',
                    reason: '深度回访，推荐基础用品',
                    type: TaskType.FOLLOW_UP,
                    priority: TaskPriority.MEDIUM,
                    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
                    suggestedContent: '您好陈女士，奶糖来家一周啦，现在是不是已经熟门熟路了？最近有没有什么好玩的事情可以跟我分享一下？',
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
                        relatedCustomerId: customer.id,
                        source: TaskSource.AI,
                        status: TaskStatus.TODO,
                    },
                });
            }
        }
    }
    const customer2 = await prisma.customer.findFirst({
        where: { phone: '13987654321' },
    });
    if (!customer2) {
        await prisma.customer.create({
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
    console.log('✅ 种子数据初始化完成！');
    console.log('');
    console.log('📱 演示账号：');
    console.log('   老板端：13800000000 / 123456');
    console.log('   销售端：13800000001 / 123456');
    console.log('   饲养员：13800000002 / 123456');
    console.log('');
    console.log('🏪 门店：上海静安旗舰店');
    console.log('🐱 演示宠物：6只');
}
main()
    .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map