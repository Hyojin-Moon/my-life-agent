import { z } from 'zod'

// 사용자 프로필 스키마
export const userPreferencesSchema = z.object({
  food: z.array(z.string()).default([]),
  travel: z.array(z.string()).default([]),
  exercise: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  dislikes: z.array(z.string()).default([]),
})

export const userRoutinesSchema = z.object({
  wakeUpTime: z.string().optional(),
  sleepTime: z.string().optional(),
  workSchedule: z.string().optional(),
  exerciseTime: z.string().optional(),
})

export const userProfileSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  location: z.string().optional(),
  preferences: userPreferencesSchema.optional(),
  routines: userRoutinesSchema.optional(),
})

// 추천 요청 스키마
export const recommendationTypeSchema = z.enum(['travel', 'food', 'exercise'])

export const recommendationRequestSchema = z.object({
  type: recommendationTypeSchema,
  context: z.string().optional(),
  location: z.string().optional(),
  limit: z.number().min(1).max(10).default(5),
})

// 기록 스키마
export const recordTypeSchema = z.enum(['travel', 'food', 'exercise', 'other'])

export const createRecordSchema = z.object({
  type: recordTypeSchema,
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  date: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export const updateRecordSchema = createRecordSchema.partial()

// 피드백 스키마
export const feedbackSchema = z.object({
  liked: z.boolean(),
  reason: z.string().optional(),
})

// 타입 추론
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>
export type UserRoutinesInput = z.infer<typeof userRoutinesSchema>
export type UserProfileInput = z.infer<typeof userProfileSchema>
export type RecommendationRequestInput = z.infer<typeof recommendationRequestSchema>
export type CreateRecordInput = z.infer<typeof createRecordSchema>
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>
export type FeedbackInput = z.infer<typeof feedbackSchema>
