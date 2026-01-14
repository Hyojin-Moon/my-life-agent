// 사용자 프로필
export interface UserProfile {
  id: string
  name: string
  location?: string
  preferences: UserPreferences
  routines: UserRoutines
  createdAt: string
  updatedAt: string
}

export interface UserPreferences {
  food: string[]
  travel: string[]
  exercise: string[]
  allergies: string[]
  dislikes: string[]
}

export interface UserRoutines {
  wakeUpTime?: string
  sleepTime?: string
  workSchedule?: string
  exerciseTime?: string
}

// 추천
export type RecommendationType = 'travel' | 'food' | 'exercise'

export interface Recommendation {
  id: string
  name: string
  reason: string
  score: number
  metadata?: Record<string, any>
}

export interface RecommendationRequest {
  type: RecommendationType
  context?: string
  location?: string
  limit?: number
}

export interface RecommendationResponse {
  type: RecommendationType
  recommendations: Recommendation[]
  generatedAt: string
  context?: string
}

// 기록
export type RecordType = 'travel' | 'food' | 'exercise' | 'other'

export interface LifeRecord {
  id: string
  type: RecordType
  title: string
  description?: string
  rating?: number
  tags: string[]
  location?: string
  date: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface CreateRecordRequest {
  type: RecordType
  title: string
  description?: string
  rating?: number
  tags?: string[]
  location?: string
  date?: string
  metadata?: Record<string, any>
}

// 피드백
export interface Feedback {
  id: string
  recommendationId: string
  liked: boolean
  reason?: string
  createdAt: string
}

// 통계
export interface RecordStats {
  totalRecords: number
  byType: Record<RecordType, number>
  topTags: Array<{ tag: string; count: number }>
  averageRating: number
}

// API 응답
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    limit: number
    offset: number
  }
}
