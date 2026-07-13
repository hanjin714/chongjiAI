import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { PetStatus, Role, Species } from '../constants/enums.js';

const router = Router();

router.use(authMiddleware);

const chatSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1, '消息内容不能为空'),
  context: z.object({
    storeId: z.string().optional(),
    page: z.string().optional(),
  }).optional(),
});

router.post('/chat', async (req: AuthRequest, res) => {
  try {
    const { conversationId, message, context } = chatSchema.parse(req.body);
    const user = req.user!;

    let conversation = null;
    if (conversationId) {
      conversation = await prisma.aiConversation.findFirst({
        where: { id: conversationId, tenantId: user.tenantId },
      });
    }

    if (!conversation) {
      conversation = await prisma.aiConversation.create({
        data: {
          tenantId: user.tenantId,
          storeId: user.storeId,
          userId: user.userId,
          roleContext: user.role,
          title: message.slice(0, 50),
          dataScope: {
            storeId: user.storeId,
            role: user.role,
          },
        },
      });
    }

    await prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        tenantId: user.tenantId,
        sender: 'USER',
        content: message,
      },
    });

    const { answer, cards, actions, referencedObjects } = await generateAiResponse(message, user, context);

    const aiMessage = await prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        tenantId: user.tenantId,
        sender: 'AI',
        content: answer,
        referencedObjects: referencedObjects as any,
      },
    });

    return successResponse(res, {
      conversationId: conversation.id,
      messageId: aiMessage.id,
      answer,
      cards,
      actions,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 'VALIDATION_ERROR', error.errors[0].message, 400);
    }
    console.error('AI chat error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'AI对话失败', 500);
  }
});

async function generateAiResponse(
  message: string,
  user: { userId: string; tenantId: string; storeId?: string; role: Role; name: string },
  context?: { storeId?: string; page?: string }
) {
  const msg = message.toLowerCase();
  let answer = '';
  let cards: any[] = [];
  let actions: any[] = [];
  let referencedObjects: any[] = [];

  const storeWhere: any = { tenantId: user.tenantId };
  if (user.storeId) {
    storeWhere.storeId = user.storeId;
  } else if (context?.storeId) {
    storeWhere.storeId = context.storeId;
  }

  if (msg.includes('库存') || msg.includes('推荐') || msg.includes('适合') || msg.includes('新手') || msg.includes('猫') || msg.includes('狗') || /\d+元|\d+块|预算/.test(msg)) {
    const pets = await prisma.pet.findMany({
      where: {
        ...storeWhere,
        status: PetStatus.IN_STOCK,
        deletedAt: null,
      },
      take: 5,
      include: {
        photos: { take: 1, where: { type: 'PROFILE' } },
        store: true,
      },
    });

    if (pets.length === 0) {
      answer = '当前没有找到在售宠物。请先添加宠物库存。';
    } else {
      answer = `根据当前在售库存，为您推荐 ${Math.min(3, pets.length)} 只宠物：\n\n`;
      
      cards = pets.slice(0, 3).map((pet, index) => {
        answer += `${index + 1}. ${pet.publicId}｜${pet.breed}｜${pet.store?.name || ''}｜${pet.salePrice ? '¥' + pet.salePrice : '价格待议'}\n`;
        answer += `   推荐理由：${pet.healthStatus === 'HEALTHY' ? '健康状态良好' : '需关注健康状况'}，${pet.vaccineStatus || '疫苗状态待更新'}。\n`;
        answer += `   建议话术：这只${pet.breed}很适合您的需求，性格好，健康有保障。\n\n`;
        
        referencedObjects.push({ type: 'PET', id: pet.id, name: pet.name || pet.breed });
        
        return {
          type: 'PET',
          id: pet.id,
          title: pet.name || pet.breed,
          subtitle: `${pet.salePrice ? '¥' + pet.salePrice : '价格待议'}｜${pet.publicId}｜${pet.store?.name || ''}`,
          imageUrl: pet.photos[0]?.url,
          actions: ['VIEW', 'GENERATE_SCRIPT'],
        };
      });

      answer += '需要注意：\n- 价格和状态以当前库存为准。\n- 建议进一步确认客户需求和偏好。';
      
      actions = [
        { type: 'VIEW_INVENTORY', label: '查看全部库存' },
      ];
    }
  } else if (msg.includes('今天') && (msg.includes('任务') || msg.includes('跟进') || msg.includes('该跟谁'))) {
    const where: any = {
      tenantId: user.tenantId,
      status: 'TODO',
    };
    
    if (user.role === Role.SALES) {
      where.assigneeUserId = user.userId;
    }
    
    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
      take: 10,
      include: {
        relatedCustomer: true,
        relatedPet: true,
      },
    });

    if (tasks.length === 0) {
      answer = '今天没有待处理任务，太棒了！可以休息一下或主动开发新客户。';
    } else {
      answer = `今天有 ${tasks.length} 个待处理任务，按优先级排序：\n\n`;
      
      tasks.slice(0, 5).forEach((task, index) => {
        answer += `${index + 1}. ${task.title}\n`;
        answer += `   优先级：${task.priority === 'HIGH' ? '高' : task.priority === 'MEDIUM' ? '中' : '低'}\n`;
        answer += `   原因：${task.reason}\n`;
        if (task.suggestedContent) {
          answer += `   建议话术：${task.suggestedContent}\n`;
        }
        answer += '\n';
        
        referencedObjects.push({ type: 'TASK', id: task.id, name: task.title });
      });

      actions = [
        { type: 'VIEW_TASKS', label: '查看全部任务' },
      ];
    }
  } else if (msg.includes('风险') || msg.includes('异常') || (msg.includes('今天') && msg.includes('哪些'))) {
    const [highRiskCustomers, sickPets, failedSync] = await Promise.all([
      prisma.customer.count({
        where: { ...storeWhere, riskLevel: 'HIGH' },
      }),
      prisma.pet.count({
        where: { ...storeWhere, healthStatus: { in: ['SICK', 'OBSERVATION'] }, deletedAt: null },
      }),
      prisma.pet.count({
        where: { ...storeWhere, feishuSyncStatus: 'FAILED', deletedAt: null },
      }),
    ]);

    answer = `今日风险概览：\n\n`;
    answer += `🔴 高风险客户：${highRiskCustomers} 位\n`;
    answer += `🟡 健康异常宠物：${sickPets} 只\n`;
    answer += `🔵 飞书同步失败：${failedSync} 条\n\n`;
    answer += '建议优先处理高风险客户和健康异常宠物。';

    actions = [
      { type: 'VIEW_RISK', label: '查看风险详情' },
    ];
  } else if (msg.includes('店长') || msg.includes('日报') || msg.includes('经营')) {
    const [totalPets, soldPets, activeTasks, completedTasks] = await Promise.all([
      prisma.pet.count({ where: { ...storeWhere, status: PetStatus.IN_STOCK, deletedAt: null } }),
      prisma.salesOrder.count({ 
        where: { 
          ...storeWhere, 
          createdAt: { 
            gte: new Date(new Date().setDate(new Date().getDate() - 7)) 
          } 
        } 
      }),
      prisma.task.count({ where: { ...storeWhere, status: 'TODO' } }),
      prisma.task.count({ 
        where: { 
          ...storeWhere, 
          status: 'DONE',
          completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        } 
      }),
    ]);

    answer = `📊 AI 店长日报\n\n`;
    answer += `**今日概览**\n`;
    answer += `• 在售宠物：${totalPets} 只\n`;
    answer += `• 近7日出库：${soldPets} 单\n`;
    answer += `• 待处理任务：${activeTasks} 个\n`;
    answer += `• 今日已完成：${completedTasks} 个\n\n`;
    answer += `**今日建议**\n`;
    answer += `1. 优先处理高优先级客户回访任务\n`;
    answer += `2. 检查健康异常宠物的护理记录\n`;
    answer += `3. 确认飞书同步状态是否正常\n`;

    actions = [
      { type: 'VIEW_DASHBOARD', label: '查看完整日报' },
    ];
  } else if (msg.includes('话术') || msg.includes('怎么说') || msg.includes('回访')) {
    answer = `以下是通用的客户回访话术模板：\n\n`;
    answer += `**新客回访（到家1-3天）**\n`;
    answer += `您好XX家长～XX到家第X天了，想问问它适应得怎么样？吃喝拉撒都正常吗？有任何问题随时跟我说哦😊\n\n`;
    answer += `**深度回访（到家7天）**\n`;
    answer += `XX妈妈/爸爸好呀～XX来家一周啦，现在是不是已经熟门熟路了？最近有没有什么好玩的事情可以跟我分享一下？\n\n`;
    answer += `**疫苗提醒**\n`;
    answer += `您好，提醒一下XX的疫苗快到时间了，这周有空可以带它来接种哦～\n`;

    actions = [
      { type: 'COPY_SCRIPT', label: '复制话术' },
    ];
  } else {
    answer = `您好！我是宠迹AI助手，可以帮您：\n\n`;
    answer += `• 查询宠物库存和推荐\n`;
    answer += `• 查看今日任务和跟进\n`;
    answer += `• 了解经营数据和风险\n`;
    answer += `• 生成销售话术和回访建议\n\n`;
    answer += `您可以试试问：\n`;
    answer += `• "店里5000元以内适合新手养猫的有哪些？"\n`;
    answer += `• "我今天该跟进哪些客户？"\n`;
    answer += `• "今天有哪些风险需要处理？"\n`;
    answer += `• "帮我生成回访话术"`;
  }

  return { answer, cards, actions, referencedObjects };
}

router.get('/conversations', async (req: AuthRequest, res) => {
  try {
    const conversations = await prisma.aiConversation.findMany({
      where: {
        tenantId: req.user!.tenantId,
        userId: req.user!.userId,
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    return successResponse(res, conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '获取对话列表失败', 500);
  }
});

router.get('/conversations/:id/messages', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const messages = await prisma.aiMessage.findMany({
      where: {
        conversationId: id,
        tenantId: req.user!.tenantId,
      },
      orderBy: { createdAt: 'asc' },
    });

    return successResponse(res, messages);
  } catch (error) {
    console.error('Get messages error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '获取消息失败', 500);
  }
});

export default router;
