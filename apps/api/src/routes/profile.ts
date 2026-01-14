import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { ProfileRepository } from '@my-life-agent/database'

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

export function createProfileRoutes(profileRepo: ProfileRepository) {
  const profileRoutes = new Hono()

  // 프로필 조회
  profileRoutes.get('/', async (c) => {
    try {
      const profile = await profileRepo.findFirst()

      if (!profile) {
        return c.json({ error: '프로필을 찾을 수 없습니다.' }, 404)
      }

      return c.json(profile)
    } catch (error) {
      console.error('프로필 조회 오류:', error)
      return c.json({ error: '프로필 조회에 실패했습니다.' }, 500)
    }
  })

  // 프로필 생성/수정
  profileRoutes.post('/', zValidator('json', profileSchema), async (c) => {
    try {
      const data = c.req.valid('json')

      // 기존 프로필 확인
      const existingProfile = await profileRepo.findFirst()

      let profile
      if (existingProfile) {
        // 기존 프로필 업데이트
        profile = await profileRepo.update(existingProfile.id, {
          name: data.name,
          location: data.location,
        })

        // 취향 업데이트
        if (data.preferences) {
          await profileRepo.updatePreferences(existingProfile.id, {
            food: data.preferences.food || [],
            travel: data.preferences.travel || [],
            exercise: data.preferences.exercise || [],
            allergies: data.preferences.allergies || [],
            dislikes: data.preferences.dislikes || [],
          })
        }

        // 루틴 업데이트
        if (data.routines) {
          await profileRepo.updateRoutines(existingProfile.id, data.routines)
        }

        // 업데이트된 프로필 다시 조회
        profile = await profileRepo.findById(existingProfile.id)
      } else {
        // 새 프로필 생성
        profile = await profileRepo.create({
          name: data.name,
          location: data.location,
          preferences: data.preferences ? {
            food: data.preferences.food || [],
            travel: data.preferences.travel || [],
            exercise: data.preferences.exercise || [],
            allergies: data.preferences.allergies || [],
            dislikes: data.preferences.dislikes || [],
          } : undefined,
          routines: data.routines,
        })
      }

      return c.json({
        success: true,
        data: profile,
      })
    } catch (error) {
      console.error('프로필 저장 오류:', error)
      return c.json({ error: '프로필 저장에 실패했습니다.' }, 500)
    }
  })

  // 취향 업데이트
  profileRoutes.patch('/preferences', async (c) => {
    try {
      const body = await c.req.json()
      const profile = await profileRepo.findFirst()

      if (!profile) {
        return c.json({ error: '프로필을 찾을 수 없습니다.' }, 404)
      }

      await profileRepo.updatePreferences(profile.id, body)

      return c.json({
        success: true,
        message: '취향이 업데이트되었습니다.',
        data: body,
      })
    } catch (error) {
      console.error('취향 업데이트 오류:', error)
      return c.json({ error: '취향 업데이트에 실패했습니다.' }, 500)
    }
  })

  // 루틴 업데이트
  profileRoutes.patch('/routines', async (c) => {
    try {
      const body = await c.req.json()
      const profile = await profileRepo.findFirst()

      if (!profile) {
        return c.json({ error: '프로필을 찾을 수 없습니다.' }, 404)
      }

      await profileRepo.updateRoutines(profile.id, body)

      return c.json({
        success: true,
        message: '루틴이 업데이트되었습니다.',
        data: body,
      })
    } catch (error) {
      console.error('루틴 업데이트 오류:', error)
      return c.json({ error: '루틴 업데이트에 실패했습니다.' }, 500)
    }
  })

  return profileRoutes
}

// 하위 호환성을 위한 export (기존 코드와의 호환)
export const profileRoutes = createProfileRoutes(new (require('@my-life-agent/database').ProfileRepository)())
