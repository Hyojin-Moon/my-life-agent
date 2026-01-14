'use client'

import { useState } from 'react'
import { Sparkles, Utensils, MapPin, Dumbbell, ThumbsUp, ThumbsDown, RefreshCw, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'

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
  const [error, setError] = useState<string | null>(null)

  const getRecommendations = async () => {
    setLoading(true)
    setError(null)

    try {
      const data: any = await api.getRecommendations({
        type,
        context: context || undefined,
        limit: 5,
      })
      setRecommendations(data.recommendations || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : '추천을 가져오는데 실패했습니다.'
      setError(message)
      // API 에러 시 사용자에게 친절한 메시지 표시
      if (message.includes('404')) {
        setError('프로필을 먼저 설정해주세요. 프로필 페이지에서 정보를 입력하면 맞춤 추천을 받을 수 있어요!')
      } else if (message.includes('503') || message.includes('AI')) {
        setError('AI 서비스에 연결할 수 없습니다. GEMINI_API_KEY가 설정되어 있는지 확인해주세요.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (id: string, liked: boolean) => {
    try {
      const result: any = await api.sendFeedback(id, liked)
      alert(result.message || (liked ? '좋아요를 반영했어요!' : '피드백 감사해요!'))
    } catch (err) {
      alert('피드백 저장에 실패했습니다.')
    }
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

      {error && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <p className="text-yellow-700 dark:text-yellow-300">{error}</p>
          </div>
        </div>
      )}

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
