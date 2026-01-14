'use client'

import { useState } from 'react'
import { Sparkles, Utensils, MapPin, Dumbbell, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react'

type RecommendationType = 'food' | 'travel' | 'exercise'

interface Recommendation {
  id: string
  name: string
  reason: string
  score: number
}

export default function RecommendationsPage() {
  const [type, setType] = useState<RecommendationType>('food')
  const [context, setContext] = useState('')
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)

  const getRecommendations = async () => {
    setLoading(true)
    // TODO: API 호출
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockData: Record<RecommendationType, Recommendation[]> = {
      food: [
        { id: '1', name: '된장찌개', reason: '한식을 선호하시고 건강한 식사를 원하시니까요', score: 0.92 },
        { id: '2', name: '연어 샐러드', reason: '오늘 가벼운 식사가 좋겠어요', score: 0.88 },
        { id: '3', name: '비빔밥', reason: '다양한 채소로 영양 균형을 맞춰요', score: 0.85 },
      ],
      travel: [
        { id: '1', name: '제주도 올레길', reason: '자연을 좋아하시고 러닝을 즐기시니 추천드려요', score: 0.95 },
        { id: '2', name: '부산 해운대', reason: '바다 근처 조깅 코스가 좋아요', score: 0.88 },
        { id: '3', name: '강원도 속초', reason: '설악산 트레킹과 바다 둘 다 즐길 수 있어요', score: 0.82 },
      ],
      exercise: [
        { id: '1', name: '한강 러닝 코스 (10km)', reason: '평소 러닝을 즐기시고 아침 시간대에 맞춰요', score: 0.94 },
        { id: '2', name: '30분 HIIT 홈트', reason: '시간이 없을 때 효율적인 운동이에요', score: 0.86 },
        { id: '3', name: '요가 스트레칭', reason: '어제 운동을 하셨으니 가볍게 회복하세요', score: 0.80 },
      ],
    }

    setRecommendations(mockData[type])
    setLoading(false)
  }

  const handleFeedback = async (id: string, liked: boolean) => {
    // TODO: 피드백 API 호출
    console.log(`Feedback for ${id}: ${liked ? 'liked' : 'disliked'}`)
    alert(liked ? '좋아요를 반영했어요! 비슷한 추천을 더 드릴게요.' : '피드백 감사해요! 다음엔 다른 걸 추천할게요.')
  }

  const typeConfig = {
    food: { icon: Utensils, label: '식사', color: 'bg-orange-100 text-orange-600' },
    travel: { icon: MapPin, label: '여행', color: 'bg-blue-100 text-blue-600' },
    exercise: { icon: Dumbbell, label: '운동', color: 'bg-green-100 text-green-600' },
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        AI 추천
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          무엇을 추천받고 싶으세요?
        </h2>

        <div className="flex gap-2 mb-4">
          {(Object.keys(typeConfig) as RecommendationType[]).map((t) => {
            const { icon: Icon, label, color } = typeConfig[t]
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  type === t
                    ? color
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            )
          })}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            추가 정보 (선택)
          </label>
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            placeholder="예: 오늘 비가 와요, 피곤해요, 가벼운 게 먹고 싶어요"
          />
        </div>

        <button
          onClick={getRecommendations}
          disabled={loading}
          className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          {loading ? '추천 생성 중...' : '추천 받기'}
        </button>
      </div>

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            추천 결과
          </h2>
          {recommendations.map((rec, index) => (
            <div
              key={rec.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary-600">
                    {index + 1}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {rec.name}
                  </h3>
                </div>
                <span className="text-sm text-gray-500">
                  매칭 {Math.round(rec.score * 100)}%
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{rec.reason}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFeedback(rec.id, true)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition"
                >
                  <ThumbsUp className="w-4 h-4" />
                  좋아요
                </button>
                <button
                  onClick={() => handleFeedback(rec.id, false)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition"
                >
                  <ThumbsDown className="w-4 h-4" />
                  별로예요
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
