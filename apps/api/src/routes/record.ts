import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { ProfileRepository, RecordRepository } from '@my-life-agent/database'
import type { RecordType } from '@my-life-agent/shared'

// 기록 스키마
const recordSchema = z.object({
  type: z.enum(['travel', 'food', 'exercise', 'other']),
  title: z.string().min(1),
  description: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  date: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export function createRecordRoutes(
  profileRepo: ProfileRepository,
  recordRepo: RecordRepository
) {
  const recordRoutes = new Hono()

  // 현재 프로필 ID 가져오기 헬퍼
  const getProfileId = async (): Promise<string | null> => {
    const profile = await profileRepo.findFirst()
    return profile?.id || null
  }

  // 기록 통계 (/:id 보다 먼저 정의해야 함)
  recordRoutes.get('/stats/summary', async (c) => {
    try {
      const profileId = await getProfileId()
      if (!profileId) {
        return c.json({ error: '프로필을 찾을 수 없습니다.' }, 404)
      }

      const stats = await recordRepo.getStats(profileId)
      return c.json(stats)
    } catch (error) {
      console.error('통계 조회 오류:', error)
      return c.json({ error: '통계 조회에 실패했습니다.' }, 500)
    }
  })

  // 기록 목록 조회
  recordRoutes.get('/', async (c) => {
    try {
      const profileId = await getProfileId()
      if (!profileId) {
        return c.json({ error: '프로필을 찾을 수 없습니다.' }, 404)
      }

      const type = c.req.query('type') as RecordType | undefined
      const limit = parseInt(c.req.query('limit') || '20')
      const offset = parseInt(c.req.query('offset') || '0')

      const { records, total } = await recordRepo.findByProfileId(profileId, {
        type,
        limit,
        offset,
      })

      return c.json({
        records,
        pagination: {
          total,
          limit,
          offset,
        },
      })
    } catch (error) {
      console.error('기록 조회 오류:', error)
      return c.json({ error: '기록 조회에 실패했습니다.' }, 500)
    }
  })

  // 기록 상세 조회
  recordRoutes.get('/:id', async (c) => {
    try {
      const id = c.req.param('id')
      const record = await recordRepo.findById(id)

      if (!record) {
        return c.json({ error: '기록을 찾을 수 없습니다.' }, 404)
      }

      return c.json(record)
    } catch (error) {
      console.error('기록 상세 조회 오류:', error)
      return c.json({ error: '기록 조회에 실패했습니다.' }, 500)
    }
  })

  // 기록 추가
  recordRoutes.post('/', zValidator('json', recordSchema), async (c) => {
    try {
      const profileId = await getProfileId()
      if (!profileId) {
        return c.json({ error: '프로필을 먼저 생성해주세요.' }, 404)
      }

      const data = c.req.valid('json')
      const record = await recordRepo.create(profileId, data)

      return c.json({
        success: true,
        message: '기록이 저장되었습니다. 취향 분석에 반영됩니다!',
        data: record,
      })
    } catch (error) {
      console.error('기록 생성 오류:', error)
      return c.json({ error: '기록 저장에 실패했습니다.' }, 500)
    }
  })

  // 기록 수정
  recordRoutes.patch('/:id', async (c) => {
    try {
      const id = c.req.param('id')
      const body = await c.req.json()

      const record = await recordRepo.update(id, body)

      if (!record) {
        return c.json({ error: '기록을 찾을 수 없습니다.' }, 404)
      }

      return c.json({
        success: true,
        data: record,
      })
    } catch (error) {
      console.error('기록 수정 오류:', error)
      return c.json({ error: '기록 수정에 실패했습니다.' }, 500)
    }
  })

  // 기록 삭제
  recordRoutes.delete('/:id', async (c) => {
    try {
      const id = c.req.param('id')
      const success = await recordRepo.delete(id)

      if (!success) {
        return c.json({ error: '기록을 찾을 수 없습니다.' }, 404)
      }

      return c.json({
        success: true,
        message: '기록이 삭제되었습니다.',
      })
    } catch (error) {
      console.error('기록 삭제 오류:', error)
      return c.json({ error: '기록 삭제에 실패했습니다.' }, 500)
    }
  })

  return recordRoutes
}

// 하위 호환성을 위한 export
const { ProfileRepository: PR, RecordRepository: RR } = require('@my-life-agent/database')
export const recordRoutes = createRecordRoutes(new PR(), new RR())
