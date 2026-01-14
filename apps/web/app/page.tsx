import Link from 'next/link'
import { Utensils, MapPin, Dumbbell, User, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          My Life Agent
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          당신의 취향과 루틴을 학습하여 맞춤형 추천을 제공하는 AI 에이전트
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/recommendations"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            추천 받기
          </Link>
          <Link
            href="/profile"
            className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            프로필 설정
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 py-8">
        <FeatureCard
          icon={<Utensils className="w-8 h-8" />}
          title="식사 추천"
          description="취향과 건강 상태를 고려한 메뉴 추천"
          href="/recommendations?type=food"
        />
        <FeatureCard
          icon={<MapPin className="w-8 h-8" />}
          title="여행지 추천"
          description="선호하는 스타일의 여행 장소 추천"
          href="/recommendations?type=travel"
        />
        <FeatureCard
          icon={<Dumbbell className="w-8 h-8" />}
          title="운동 코스"
          description="시간과 컨디션에 맞는 운동 추천"
          href="/recommendations?type=exercise"
        />
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          어떻게 작동하나요?
        </h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          <Step number={1} title="프로필 설정">
            취향, 알레르기, 선호하는 활동 등 개인 정보를 입력하세요.
          </Step>
          <Step number={2} title="기록하기">
            일상의 식사, 운동, 여행을 기록하면 AI가 패턴을 학습합니다.
          </Step>
          <Step number={3} title="맞춤 추천">
            학습된 정보를 바탕으로 당신에게 딱 맞는 추천을 받으세요.
          </Step>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition"
    >
      <div className="text-primary-600 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  )
}

function Step({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 text-primary-600 rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p>{children}</p>
      </div>
    </div>
  )
}
