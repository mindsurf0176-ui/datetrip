'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, loginAsGuest } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message || '로그인에 실패했습니다.')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-pink-50 to-rose-50 p-4 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-rose-100/20 to-pink-100/20 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative z-10">
        {/* 로고 섹션 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-3xl mb-4 shadow-xl shadow-rose-200/50 rotate-3 hover:rotate-0 transition-transform">
            <span className="text-4xl">💕</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">
            DateTrip
          </h1>
          <p className="text-gray-500 mt-2">커플을 위한 여행 플래너</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-rose-100/50 p-8 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 text-sm text-rose-600 bg-rose-50 rounded-2xl border border-rose-100 flex items-center gap-3">
                <span className="text-lg">⚠️</span>
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 ml-1">
                이메일
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-gray-200 focus:border-rose-300 focus:ring-rose-200 bg-gray-50/50"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 ml-1">
                비밀번호
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl border-gray-200 focus:border-rose-300 focus:ring-rose-200 bg-gray-50/50"
              />
            </div>

            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-medium shadow-lg shadow-rose-200/50 transition-all hover:shadow-xl hover:shadow-rose-300/50 hover:-translate-y-0.5"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    로그인 중...
                  </div>
                ) : '로그인'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                onClick={() => {
                  loginAsGuest()
                  router.push('/')
                }}
              >
                <span className="mr-2">👀</span>
                게스트로 둘러보기
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              아직 계정이 없으신가요?{' '}
              <Link href="/register" className="text-rose-500 hover:text-rose-600 font-medium hover:underline">
                회원가입
              </Link>
            </p>
          </div>
        </div>

        {/* 하단 장식 */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Made with 💕 for couples
        </p>
      </div>
    </div>
  )
}
