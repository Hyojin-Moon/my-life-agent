import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const recommendationRoutes = new Hono()

// 추천 요청 스키마
const recommendationRequestSchema = z.object({
  type: z.enum(['travel', 'food', 'exercise']),
  context: z.string().optional(), // 추가 컨텍스트 (날씨, 기분 등)
  location: z.string().optional(),
  limit: z.number().min(1).max(10).default(5),
})

// 추천 받기
recommendationRoutes.post('/', zValidator('json', recommendationRequestSchema), async (c) => {
  const { type, context, limit } = c.req.valid('json')

  // TODO: AI Agent를 통한 추천 생성
  // const agent = new LifeAgent()
  // const recommendations = await agent.getRecommendations(type, userProfile, context)

  // 목업 응답
  const mockRecommendations = {
    travel: [
      { id: '1', name: '제주도 올레길', reason: '자연을 좋아하시고 러닝을 즐기시니 추천드려요', score: 0.95 },
      { id: '2', name: '부산 해운대', reason: '바다 근처 조깅 코스가 좋아요', score: 0.88 },
    ],
    food: [
      { id: '1', name: '된장찌개', reason: '한식을 선호하시고 건강한 식사를 원하시니까요', score: 0.92 },
      { id: '2', name: '파스타', reason: '이탈리안도 좋아하시잖아요', score: 0.85 },
    ],
    exercise: [
      { id: '1', name: '한강 러닝 코스 (10km)', reason: '평소 러닝을 즐기시고 아침 시간대에 맞춰요', score: 0.94 },
      { id: '2', name: '홈트레이닝 루틴', reason: '비오는 날 실내 운동 추천이요', score: 0.80 },
    ],
  }

  return c.json({
    type,
    recommendations: mockRecommendations[type]?.slice(0, limit) || [],
    generatedAt: new Date().toISOString(),
    context,
  })
})

// 추천 히스토리 조회
recommendationRoutes.get('/history', async (c) => {
  const type = c.req.query('type')

  // TODO: DB에서 히스토리 조회
  return c.json({
    history: [
      {
        id: '1',
        type: 'food',
        recommendation: '김치찌개',
        accepted: true,
        createdAt: '2024-01-15T12:00:00Z',
      },
    ],
  })
})

// 추천 피드백 (좋아요/싫어요)
recommendationRoutes.post('/:id/feedback', async (c) => {
  const id = c.req.param('id')
  const { liked, reason } = await c.req.json()

  // TODO: 피드백 저장 및 프로필 업데이트
  return c.json({
    success: true,
    message: '피드백이 반영되었습니다. 다음 추천에 참고할게요!',
  })
})

export { recommendationRoutes }
