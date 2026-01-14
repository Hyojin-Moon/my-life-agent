import type { UserProfile, RecommendationType, LifeRecord } from '@my-life-agent/shared'

export function buildSystemPrompt(profile: UserProfile): string {
  return `당신은 사용자의 개인 라이프 에이전트입니다. 사용자의 취향과 루틴을 기반으로 맞춤형 추천을 제공합니다.

## 사용자 정보
- 이름: ${profile.name}
- 위치: ${profile.location || '미설정'}

## 음식 취향
- 좋아하는 음식: ${profile.preferences.food.join(', ') || '미설정'}
- 알레르기/피해야 할 것: ${profile.preferences.allergies.join(', ') || '없음'}
- 싫어하는 것: ${profile.preferences.dislikes.join(', ') || '없음'}

## 여행 스타일
- 선호: ${profile.preferences.travel.join(', ') || '미설정'}

## 운동 선호
- 좋아하는 운동: ${profile.preferences.exercise.join(', ') || '미설정'}

## 일상 루틴
- 기상 시간: ${profile.routines.wakeUpTime || '미설정'}
- 취침 시간: ${profile.routines.sleepTime || '미설정'}
- 운동 시간: ${profile.routines.exerciseTime || '미설정'}

항상 친절하고 개인화된 추천을 제공하세요. 추천 이유를 사용자의 취향과 연결해서 설명하세요.`
}

export function buildRecommendationPrompt(
  type: RecommendationType,
  profile: UserProfile,
  context?: string,
  recentRecords?: LifeRecord[]
): string {
  const typeLabels = {
    food: '음식/메뉴',
    travel: '여행지',
    exercise: '운동/코스',
  }

  let prompt = `${buildSystemPrompt(profile)}

## 요청
사용자에게 ${typeLabels[type]}을 추천해주세요.`

  if (context) {
    prompt += `\n\n## 추가 컨텍스트\n${context}`
  }

  if (recentRecords && recentRecords.length > 0) {
    const recordSummary = recentRecords
      .slice(0, 5)
      .map((r) => `- ${r.title} (${r.rating ? r.rating + '점' : '평점 없음'}, ${r.date})`)
      .join('\n')
    prompt += `\n\n## 최근 ${typeLabels[type]} 기록\n${recordSummary}`
  }

  prompt += `

## 응답 형식
다음 JSON 형식으로 3-5개의 추천을 제공해주세요:
{
  "recommendations": [
    {
      "name": "추천 이름",
      "reason": "추천 이유 (사용자의 취향과 연결해서 설명)",
      "score": 0.95,
      "details": "상세 설명 (선택)"
    }
  ]
}`

  return prompt
}

export function buildAnalysisPrompt(
  profile: UserProfile,
  records: LifeRecord[]
): string {
  const recordSummary = records
    .map((r) => `- [${r.type}] ${r.title}: ${r.description || '설명 없음'} (${r.rating ? r.rating + '점' : '평점 없음'})`)
    .join('\n')

  return `${buildSystemPrompt(profile)}

## 분석 요청
사용자의 기록을 분석하여 취향 패턴을 파악해주세요.

## 기록 목록
${recordSummary}

## 응답 형식
{
  "patterns": {
    "food": ["발견된 음식 취향 패턴"],
    "travel": ["발견된 여행 스타일 패턴"],
    "exercise": ["발견된 운동 패턴"]
  },
  "suggestions": ["프로필에 추가하면 좋을 취향들"],
  "insights": "전체적인 인사이트 요약"
}`
}

export function buildFeedbackPrompt(
  recommendation: string,
  liked: boolean,
  reason?: string
): string {
  return `사용자가 "${recommendation}" 추천에 대해 ${liked ? '좋아요' : '별로예요'}를 선택했습니다.
${reason ? `이유: ${reason}` : ''}

이 피드백을 바탕으로 다음에 어떻게 추천을 개선할 수 있을지 분석해주세요.

## 응답 형식
{
  "adjustment": "조정해야 할 취향 요소",
  "avoid": ["앞으로 피해야 할 것들"],
  "prefer": ["앞으로 더 추천해야 할 것들"],
  "note": "기억해둘 사항"
}`
}
