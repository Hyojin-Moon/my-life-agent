import type { RecordType, RecommendationType } from './types'

// 날짜 포맷
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`

  return formatDate(d)
}

// 타입 라벨
export const recordTypeLabels: Record<RecordType, string> = {
  food: '식사',
  travel: '여행',
  exercise: '운동',
  other: '기타',
}

export const recommendationTypeLabels: Record<RecommendationType, string> = {
  food: '식사',
  travel: '여행',
  exercise: '운동',
}

// 점수 계산
export function calculateMatchScore(score: number): string {
  return `${Math.round(score * 100)}%`
}

// 태그 파싱
export function parseTags(input: string): string[] {
  return input
    .split(/[,，、\s]+/)
    .map((tag) => tag.trim().replace(/^#/, ''))
    .filter((tag) => tag.length > 0)
}

// 랜덤 ID 생성
export function generateId(): string {
  return crypto.randomUUID()
}

// 배열 셔플
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
