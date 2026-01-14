import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const recordRoutes = new Hono()

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

// 기록 목록 조회
recordRoutes.get('/', async (c) => {
  const type = c.req.query('type')
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = parseInt(c.req.query('offset') || '0')

  // TODO: DB에서 기록 조회
  return c.json({
    records: [
      {
        id: '1',
        type: 'food',
        title: '강남 맛집 방문',
        description: '파스타가 정말 맛있었다',
        rating: 5,
        tags: ['이탈리안', '파스타', '강남'],
        date: '2024-01-15',
        createdAt: '2024-01-15T19:00:00Z',
      },
      {
        id: '2',
        type: 'exercise',
        title: '한강 러닝 10km',
        description: '날씨가 좋아서 기분 좋게 뛰었다',
        rating: 4,
        tags: ['러닝', '한강', '10km'],
        date: '2024-01-14',
        createdAt: '2024-01-14T08:00:00Z',
      },
    ],
    pagination: {
      total: 2,
      limit,
      offset,
    },
  })
})

// 기록 상세 조회
recordRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')

  // TODO: DB에서 기록 조회
  return c.json({
    id,
    type: 'food',
    title: '강남 맛집 방문',
    description: '파스타가 정말 맛있었다. 다음에 또 가고 싶다.',
    rating: 5,
    tags: ['이탈리안', '파스타', '강남'],
    location: '서울 강남구',
    date: '2024-01-15',
    createdAt: '2024-01-15T19:00:00Z',
    updatedAt: '2024-01-15T19:00:00Z',
  })
})

// 기록 추가
recordRoutes.post('/', zValidator('json', recordSchema), async (c) => {
  const data = c.req.valid('json')

  // TODO: DB에 기록 저장 및 프로필 취향 자동 업데이트
  return c.json({
    success: true,
    message: '기록이 저장되었습니다. 취향 분석에 반영됩니다!',
    data: {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
    },
  })
})

// 기록 수정
recordRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()

  // TODO: DB에서 기록 수정
  return c.json({
    success: true,
    data: {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    },
  })
})

// 기록 삭제
recordRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')

  // TODO: DB에서 기록 삭제
  return c.json({
    success: true,
    message: '기록이 삭제되었습니다.',
  })
})

// 기록 통계
recordRoutes.get('/stats/summary', async (c) => {
  // TODO: DB에서 통계 계산
  return c.json({
    totalRecords: 150,
    byType: {
      food: 80,
      exercise: 50,
      travel: 15,
      other: 5,
    },
    topTags: [
      { tag: '한식', count: 30 },
      { tag: '러닝', count: 25 },
      { tag: '서울', count: 20 },
    ],
    averageRating: 4.2,
  })
})

export { recordRoutes }
