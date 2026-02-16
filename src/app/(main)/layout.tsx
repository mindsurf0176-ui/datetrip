'use client'

import Link from 'next/link'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { KakaoMapProvider } from '@/components/KakaoMapProvider'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, signOut, isGuest } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 네비게이션 */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-md shadow-rose-100 group-hover:shadow-lg group-hover:shadow-rose-200 transition-all group-hover:-rotate-3">
                  <span className="text-lg">💕</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                  DateTrip
                </span>
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-full px-4 py-1.5">
                    {isGuest ? (
                      <span className="text-sm text-gray-500">👀 게스트</span>
                    ) : (
                      <>
                        <div className="w-6 h-6 bg-gradient-to-br from-rose-300 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {user.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {user.name}님
                        </span>
                      </>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full px-4"
                  >
                    로그아웃
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button size="sm" className="bg-rose-500 hover:bg-rose-600 rounded-full px-5">
                    로그인
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <KakaoMapProvider>{children}</KakaoMapProvider>
      </main>
    </div>
  )
}
