'use client'

import { useState } from 'react'
import { Plus, Star, Utensils, MapPin, Dumbbell, Calendar } from 'lucide-react'

type RecordType = 'food' | 'travel' | 'exercise' | 'other'

interface Record {
  id: string
  type: RecordType
  title: string
  description?: string
  rating?: number
  tags: string[]
  date: string
}

const mockRecords: Record[] = [
  {
    id: '1',
    type: 'food',
    title: '강남 이탈리안 레스토랑',
    description: '파스타가 정말 맛있었다. 트러플 크림 파스타 강추!',
    rating: 5,
    tags: ['이탈리안', '파스타', '강남', '데이트'],
    date: '2024-01-15',
  },
  {
    id: '2',
    type: 'exercise',
    title: '한강 러닝 10km',
    description: '날씨가 좋아서 기분 좋게 뛰었다. 페이스 5:30',
    rating: 4,
    tags: ['러닝', '한강', '10km'],
    date: '2024-01-14',
  },
  {
    id: '3',
    type: 'travel',
    title: '제주도 여행',
    description: '올레길 걷기 최고! 다음엔 우도도 가보고 싶다',
    rating: 5,
    tags: ['제주도', '올레길', '자연'],
    date: '2024-01-10',
  },
]

export default function RecordsPage() {
  const [records] = useState<Record[]>(mockRecords)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<RecordType | 'all'>('all')

  const filteredRecords = filter === 'all'
    ? records
    : records.filter((r) => r.type === filter)

  const typeConfig = {
    food: { icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900' },
    travel: { icon: MapPin, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900' },
    exercise: { icon: Dumbbell, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900' },
    other: { icon: Calendar, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-900' },
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          나의 기록
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          기록 추가
        </button>
      </div>

      {showForm && <RecordForm onClose={() => setShowForm(false)} />}

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          전체
        </FilterButton>
        <FilterButton
          active={filter === 'food'}
          onClick={() => setFilter('food')}
        >
          <Utensils className="w-4 h-4" /> 식사
        </FilterButton>
        <FilterButton
          active={filter === 'exercise'}
          onClick={() => setFilter('exercise')}
        >
          <Dumbbell className="w-4 h-4" /> 운동
        </FilterButton>
        <FilterButton
          active={filter === 'travel'}
          onClick={() => setFilter('travel')}
        >
          <MapPin className="w-4 h-4" /> 여행
        </FilterButton>
      </div>

      <div className="space-y-4">
        {filteredRecords.map((record) => {
          const { icon: Icon, color, bg } = typeConfig[record.type]
          return (
            <div
              key={record.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${bg}`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {record.title}
                    </h3>
                    <span className="text-sm text-gray-500">{record.date}</span>
                  </div>
                  {record.rating && (
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < record.rating!
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  {record.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {record.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {record.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-4 py-2 rounded-lg transition whitespace-nowrap ${
        active
          ? 'bg-primary-600 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  )
}

function RecordForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    type: 'food' as RecordType,
    title: '',
    description: '',
    rating: 0,
    tags: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: API 호출
    console.log('Submitting:', form)
    alert('기록이 저장되었습니다!')
    onClose()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        새 기록 추가
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            종류
          </label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as RecordType })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="food">식사</option>
            <option value="exercise">운동</option>
            <option value="travel">여행</option>
            <option value="other">기타</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            제목
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            placeholder="무엇을 하셨나요?"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            설명
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            rows={3}
            placeholder="어떠셨나요?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            평점
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setForm({ ...form, rating: star })}
                className="p-1"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= form.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            태그 (쉼표로 구분)
          </label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            placeholder="한식, 점심, 강남"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            저장
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}
