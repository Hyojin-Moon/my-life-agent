import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const profileRoutes = new Hono()

// 프로필 스키마
const profileSchema = z.object({
  name: z.string().min(1),
  preferences: z.object({
    food: z.array(z.string()).optional(),
    travel: z.array(z.string()).optional(),
    exercise: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    dislikes: z.array(z.string()).optional(),
  }).optional(),
  routines: z.object({
    wakeUpTime: z.string().optional(),
    sleepTime: z.string().optional(),
    workSchedule: z.string().optional(),
    exerciseTime: z.string().optional(),
  }).optional(),
  location: z.string().optional(),
})

// 프로필 조회
profileRoutes.get('/', async (c) => {
  // TODO: DB에서 프로필 조회
  return c.json({
    id: '1',
    name: '사용자',
    preferences: {
      food: ['한식', '이탈리안'],
      travel: ['자연', '도시'],
      exercise: ['러닝', '헬스'],
    },
    routines: {
      wakeUpTime: '07:00',
      sleepTime: '23:00',
    },
    createdAt: new Date().toISOString(),
  })
})

// 프로필 생성/수정
profileRoutes.post('/', zValidator('json', profileSchema), async (c) => {
  const data = c.req.valid('json')
  // TODO: DB에 프로필 저장
  return c.json({
    success: true,
    data: {
      id: '1',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })
})

// 취향 업데이트
profileRoutes.patch('/preferences', async (c) => {
  const body = await c.req.json()
  // TODO: DB에서 취향 업데이트
  return c.json({
    success: true,
    message: '취향이 업데이트되었습니다.',
    data: body,
  })
})

// 루틴 업데이트
profileRoutes.patch('/routines', async (c) => {
  const body = await c.req.json()
  // TODO: DB에서 루틴 업데이트
  return c.json({
    success: true,
    message: '루틴이 업데이트되었습니다.',
    data: body,
  })
})

export { profileRoutes }
