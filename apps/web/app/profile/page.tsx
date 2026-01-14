'use client'

import { useState, useEffect } from 'react'
import { Save, Plus, X, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    preferences: {
      food: [] as string[],
      travel: [] as string[],
      exercise: [] as string[],
      allergies: [] as string[],
    },
    routines: {
      wakeUpTime: '07:00',
      sleepTime: '23:00',
      exerciseTime: '',
    },
    location: '',
  })

  const [newTag, setNewTag] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 페이지 로드 시 기존 프로필 조회
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data: any = await api.getProfile()
        setProfile({
          name: data.name || '',
          location: data.location || '',
          preferences: {
            food: data.preferences?.food || [],
            travel: data.preferences?.travel || [],
            exercise: data.preferences?.exercise || [],
            allergies: data.preferences?.allergies || [],
          },
          routines: {
            wakeUpTime: data.routines?.wakeUpTime || '07:00',
            sleepTime: data.routines?.sleepTime || '23:00',
            exerciseTime: data.routines?.exerciseTime || '',
          },
        })
      } catch (err) {
        // 프로필이 없는 경우 - 새로 생성 가능
        console.log('프로필이 없습니다. 새로 생성해주세요.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const addTag = (category: keyof typeof profile.preferences, value: string) => {
    if (value.trim()) {
      setProfile((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [category]: [...prev.preferences[category], value.trim()],
        },
      }))
      setNewTag((prev) => ({ ...prev, [category]: '' }))
    }
  }

  const removeTag = (category: keyof typeof profile.preferences, index: number) => {
    setProfile((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: prev.preferences[category].filter((_, i) => i !== index),
      },
    }))
  }

  const handleSave = async () => {
    if (!profile.name.trim()) {
      setError('이름을 입력해주세요.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await api.updateProfile({
        name: profile.name,
        location: profile.location || undefined,
        preferences: profile.preferences,
        routines: profile.routines,
      })
      alert('프로필이 저장되었습니다!')
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로필 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        프로필 설정
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-8">
        <Section title="기본 정보">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이름
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                placeholder="이름을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                위치
              </label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                placeholder="서울시 강남구"
              />
            </div>
          </div>
        </Section>

        <Section title="음식 취향">
          <TagInput
            tags={profile.preferences.food}
            value={newTag.food || ''}
            onChange={(v) => setNewTag({ ...newTag, food: v })}
            onAdd={() => addTag('food', newTag.food || '')}
            onRemove={(i) => removeTag('food', i)}
            placeholder="좋아하는 음식 (예: 한식, 매운음식)"
          />
        </Section>

        <Section title="여행 스타일">
          <TagInput
            tags={profile.preferences.travel}
            value={newTag.travel || ''}
            onChange={(v) => setNewTag({ ...newTag, travel: v })}
            onAdd={() => addTag('travel', newTag.travel || '')}
            onRemove={(i) => removeTag('travel', i)}
            placeholder="여행 선호도 (예: 자연, 도시, 휴양)"
          />
        </Section>

        <Section title="운동 선호">
          <TagInput
            tags={profile.preferences.exercise}
            value={newTag.exercise || ''}
            onChange={(v) => setNewTag({ ...newTag, exercise: v })}
            onAdd={() => addTag('exercise', newTag.exercise || '')}
            onRemove={(i) => removeTag('exercise', i)}
            placeholder="좋아하는 운동 (예: 러닝, 헬스, 수영)"
          />
        </Section>

        <Section title="알레르기 / 제한사항">
          <TagInput
            tags={profile.preferences.allergies}
            value={newTag.allergies || ''}
            onChange={(v) => setNewTag({ ...newTag, allergies: v })}
            onAdd={() => addTag('allergies', newTag.allergies || '')}
            onRemove={(i) => removeTag('allergies', i)}
            placeholder="알레르기나 피해야 할 것 (예: 땅콩, 유제품)"
          />
        </Section>

        <Section title="일상 루틴">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                기상 시간
              </label>
              <input
                type="time"
                value={profile.routines.wakeUpTime}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    routines: { ...profile.routines, wakeUpTime: e.target.value },
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                취침 시간
              </label>
              <input
                type="time"
                value={profile.routines.sleepTime}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    routines: { ...profile.routines, sleepTime: e.target.value },
                  })
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
          </div>
        </Section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? '저장 중...' : '프로필 저장'}
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
      {children}
    </div>
  )
}

function TagInput({
  tags,
  value,
  onChange,
  onAdd,
  onRemove,
  placeholder,
}: {
  tags: string[]
  value: string
  onChange: (value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
  placeholder: string
}) {
  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onAdd()}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          placeholder={placeholder}
        />
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm"
          >
            {tag}
            <button
              onClick={() => onRemove(index)}
              className="hover:text-primary-900 dark:hover:text-primary-100"
            >
              <X className="w-4 h-4" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
