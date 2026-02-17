'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { MapPin, AlertCircle, Eye } from 'lucide-react'

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
    
    // 클라이언트 사이드 검증
    if (!email.trim()) {
      setError('이메일을 입력해주세요.')
      return
    }
    if (!password) {
      setError('비밀번호를 입력해주세요.')
      return
    }
    
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        // 에러 메시지 한글화
        const errorMessage = error.message?.includes('Invalid login')
          ? '이메일 또는 비밀번호가 올바르지 않습니다.'
          : error.message?.includes('Email not confirmed')
          ? '이메일 인증이 필요합니다. 메일함을 확인해주세요.'
          : error.message || '로그인에 실패했습니다.'
        setError(errorMessage)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center justify-center w-16 h-16 gradient-violet rounded-2xl mb-4"
          >
            <MapPin className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">DateTrip</h1>
          <p className="text-gray-500 text-sm">특별한 여행을 계획해보세요</p>
        </div>

        {/* Login Card */}
        <div className="card-triple p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                role="alert"
                aria-live="polite"
                className="p-3 text-sm text-red-600 bg-red-50 rounded-xl flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </motion.div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                이메일
              </label>
              <Input
                id="email"
                type="email"
                placeholder="love@datetrip.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>

            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    로그인 중...
                  </div>
                ) : '로그인'}
              </Button>
              
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-100"></span>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-gray-400">또는</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-xl border-gray-200 hover:bg-gray-50 font-medium"
                onClick={() => {
                  loginAsGuest()
                  router.push('/')
                }}
              >
                <Eye className="mr-2 w-4 h-4" />
                게스트로 둘러보기
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              처음이신가요?{' '}
              <Link href="/register" className="text-violet-600 font-medium hover:underline">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
