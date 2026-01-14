'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, Sparkles, BookOpen } from 'lucide-react'

const navItems = [
  { href: '/', label: '홈', icon: Home },
  { href: '/recommendations', label: '추천', icon: Sparkles },
  { href: '/records', label: '기록', icon: BookOpen },
  { href: '/profile', label: '프로필', icon: User },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-xl text-primary-600">
            My Life Agent
          </Link>
          <div className="flex gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-600'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
