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
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-rose-600">
                DateTrip 💕
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600 hidden sm:block">
                    {user.name}님
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={signOut}
                  >
                    로그아웃
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button size="sm">로그인</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <KakaoMapProvider>{children}</KakaoMapProvider>
      </main>
    </div>
  )
}
