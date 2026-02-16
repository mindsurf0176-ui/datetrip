'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/auth/AuthContext'
import CoupleConnect from '@/components/CoupleConnect'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HomePage() {
  const { user, couple, loading, isGuest } = useAuth()
  const router = useRouter()
  const [skipCoupleConnect, setSkipCoupleConnect] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
          <p className="text-gray-400 animate-pulse">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-[80vh] px-4 py-8">
      {/* 환영 섹션 */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full mb-6 shadow-lg shadow-rose-200">
          <span className="text-4xl">💑</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-500 to-rose-400 bg-clip-text text-transparent mb-3">
          안녕하세요, {user.name}님!
        </h1>
        <p className="text-lg text-gray-500">
          함께 특별한 여행을 계획해보세요 ✨
        </p>
      </div>

      {/* 커플 연결 또는 메인 메뉴 */}
      {!couple?.user2_id && !skipCoupleConnect && !isGuest ? (
        <div className="max-w-md mx-auto space-y-4">
          <CoupleConnect />
          <button
            className="w-full py-3 text-gray-400 hover:text-gray-600 transition-colors text-sm"
            onClick={() => setSkipCoupleConnect(true)}
          >
            나중에 연결하기 →
          </button>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {/* 메인 액션 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 새 여행 만들기 - 강조 */}
            <Link href="/trips/new" className="group">
              <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-rose-400 rounded-3xl p-8 text-white shadow-xl shadow-rose-200/50 hover:shadow-2xl hover:shadow-rose-300/50 transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10">
                  <span className="text-5xl mb-4 block">✈️</span>
                  <h3 className="text-2xl font-bold mb-2">새 여행 만들기</h3>
                  <p className="text-rose-100 mb-4">둘만의 특별한 여행을 시작해보세요</p>
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium group-hover:bg-white/30 transition-colors">
                    시작하기
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* 내 여행 */}
            <Link href="/trips" className="group">
              <div className="relative overflow-hidden bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-100">
                    <span className="text-2xl">🗺️</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">내 여행</h3>
                  <p className="text-gray-500 mb-4">계획 중인 여행 확인하기</p>
                  <span className="text-blue-500 font-medium group-hover:text-blue-600 transition-colors inline-flex items-center gap-1">
                    보러가기
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* 서브 액션들 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/wishlist" className="group">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-amber-100/50">
                <span className="text-3xl mb-2 block">💝</span>
                <p className="font-medium text-gray-700">위시리스트</p>
              </div>
            </Link>
            
            <Link href="/memories" className="group">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-purple-100/50">
                <span className="text-3xl mb-2 block">📸</span>
                <p className="font-medium text-gray-700">추억 앨범</p>
              </div>
            </Link>
            
            <Link href="/budget" className="group">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-green-100/50">
                <span className="text-3xl mb-2 block">💰</span>
                <p className="font-medium text-gray-700">예산 관리</p>
              </div>
            </Link>
            
            <Link href="/settings" className="group">
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-5 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100/50">
                <span className="text-3xl mb-2 block">⚙️</span>
                <p className="font-medium text-gray-700">설정</p>
              </div>
            </Link>
          </div>

          {/* 커플 연결 안내 (게스트/스킵한 경우) */}
          {(isGuest || skipCoupleConnect) && !couple?.user2_id && (
            <div className="mt-8 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-2xl">💕</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">파트너와 함께하면 더 좋아요!</h4>
                  <p className="text-sm text-gray-500">커플 연결하고 함께 여행을 계획해보세요</p>
                </div>
                {!isGuest && (
                  <Button 
                    onClick={() => setSkipCoupleConnect(false)}
                    className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-6"
                  >
                    연결하기
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
