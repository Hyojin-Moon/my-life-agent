import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { ProfileRepository, RecordRepository, RecommendationRepository } from '@my-life-agent/database'
import type { LifeAgent } from '@my-life-agent/ai-agent'
import type { RecommendationType } from '@my-life-agent/shared'

// 추천 요청 스키마
const recommendationRequestSchema = z.object({
  type: z.enum(['travel', 'food', 'exercise']),
  context: z.string().optional(),
  location: z.string().optional(),
  limit: z.number().min(1).max(10).default(5),
})

export function createRecommendationRoutes(
  profileRepo: ProfileRepository,
  recordRepo: RecordRepository,
  recommendationRepo: RecommendationRepository,
  createAgent: () => LifeAgent
) {
  const recommendationRoutes = new Hono()

  // 추천 받기
  recommendationRoutes.post('/', zValidator('json', recommendationRequestSchema), async (c) => {
    try {
      const { type, context, limit } = c.req.valid('json')

      // 사용자 프로필 조회
      const profile = await profileRepo.findFirst()
      if (!profile) {
        return c.json({ error: '프로필을 먼저 생성해주세요.' }, 404)
      }

      // 최근 기록 조회 (AI 컨텍스트용)
      const { records } = await recordRepo.findByProfileId(profile.id, {
        type: type as any,
        limit: 10,
      })

      // AI 에이전트 초기화 및 추천 생성
      const agent = createAgent()
      agent.setProfile(profile)
      agent.setRecentRecords(records)

      let recommendations
      try {
        recommendations = await agent.getRecommendations(type, context)
      } catch (aiError) {
        console.error('AI 추천 생성 오류:', aiError)
        // AI 실패 시 에러 반환
        return c.json({
          error: 'AI 서비스를 사용할 수 없습니다. GEMINI_API_KEY를 확인해주세요.'
        }, 503)
      }

      // 추천 히스토리 저장
      const savedRecs = await recommendationRepo.saveMany(
        profile.id,
        type,
        recommendations.slice(0, limit),
        context
      )

      return c.json({
        type,
        recommendations: savedRecs.map((r) => ({
          id: r.id,
          name: r.name,
          reason: r.reason,
          score: r.score,
        })),
        generatedAt: new Date().toISOString(),
        context,
      })
    } catch (error) {
      console.error('추천 생성 오류:', error)
      return c.json({ error: '추천 생성에 실패했습니다.' }, 500)
    }
  })

  // 추천 히스토리 조회
  recommendationRoutes.get('/history', async (c) => {
    try {
      const profile = await profileRepo.findFirst()
      if (!profile) {
        return c.json({ error: '프로필을 찾을 수 없습니다.' }, 404)
      }

      const type = c.req.query('type') as RecommendationType | undefined
      const history = await recommendationRepo.findByProfileId(profile.id, {
        type,
        limit: 50,
      })

      return c.json({
        history: history.map((h) => ({
          id: h.id,
          type: h.type,
          recommendation: h.name,
          reason: h.reason,
          accepted: h.feedback?.liked,
          createdAt: h.createdAt,
        })),
      })
    } catch (error) {
      console.error('히스토리 조회 오류:', error)
      return c.json({ error: '히스토리 조회에 실패했습니다.' }, 500)
    }
  })

  // 추천 피드백 (좋아요/싫어요)
  recommendationRoutes.post('/:id/feedback', async (c) => {
    try {
      const id = c.req.param('id')
      const { liked, reason } = await c.req.json()

      const profile = await profileRepo.findFirst()
      if (!profile) {
        return c.json({ error: '프로필을 찾을 수 없습니다.' }, 404)
      }

      await recommendationRepo.addFeedback(profile.id, id, liked, reason)

      return c.json({
        success: true,
        message: liked
          ? '피드백 감사합니다! 비슷한 추천을 더 드릴게요.'
          : '피드백 감사합니다! 다음엔 다른 옵션을 추천할게요.',
      })
    } catch (error) {
      console.error('피드백 저장 오류:', error)
      return c.json({ error: '피드백 저장에 실패했습니다.' }, 500)
    }
  })

  return recommendationRoutes
}

// 하위 호환성을 위한 export
const { ProfileRepository: PR, RecordRepository: RR, RecommendationRepository: RecR } = require('@my-life-agent/database')
const { LifeAgent } = require('@my-life-agent/ai-agent')
export const recommendationRoutes = createRecommendationRoutes(
  new PR(),
  new RR(),
  new RecR(),
  () => new LifeAgent({ apiKey: process.env.GEMINI_API_KEY || '' })
)
