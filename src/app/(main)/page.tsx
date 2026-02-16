'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/auth/AuthContext'
import CoupleConnect from '@/components/CoupleConnect'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HomePage() {
  const { user, couple, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* 환영 메시지 */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900">
          안녕하세요, {user.name}님! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          DateTrip에서 함께 특별한 여행을 계획필요
        </p>
      </div>

      {/* 커플 연결 상태 */}
      {!couple?.user2_id ? (
        <div className="max-w-md mx-auto">
          <CoupleConnect />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 여행 목록 카드 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-rose-600">✈️ 내 여행</CardTitle>
              <CardDescription>
                계획 중인 여행을 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/trips">
                <Button className="w-full bg-rose-600 hover:bg-rose-700">
                  여행 목록 보기
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 위시리스트 카드 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-rose-600">💝 위시리스트</CardTitle>
              <CardDescription>
                가고 싶은 곳을 저장하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/wishlist">
                <Button variant="outline" className="w-full">
                  위시리스트 보기
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 새 여행 만들기 카드 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-rose-600">📝 새 여행</CardTitle>
              <CardDescription>
                새로운 여행을 시작하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/trips/new">
                <Button variant="outline" className="w-full">
                  여행 만들기
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
