'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-romantic">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-rose-400 to-pink-500 rounded-[2rem] mb-6 shadow-2xl shadow-rose-200/50 cursor-pointer"
          >
            <span className="text-5xl">💕</span>
          </motion.div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            <span className="text-gradient">DateTrip</span>
          </h1>
          <p className="text-muted-foreground font-medium">우리만의 특별한 여행을 계획해 보세요</p>
        </div>

        {/* Login Card */}
        <div className="bg-glass rounded-[2.5rem] shadow-2xl shadow-rose-100/50 p-10 border border-white/40">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 text-sm text-rose-600 bg-rose-50/50 backdrop-blur-sm rounded-2xl border border-rose-100 flex items-center gap-3"
              >
                <span className="text-lg">⚠️</span>
                <span className="font-medium">{error}</span>
              </motion.div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-foreground/80 ml-1">
                이메일 주소
              </label>
              <Input
                id="email"
                type="email"
                placeholder="love@datetrip.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 rounded-2xl border-rose-100 focus:border-rose-300 focus:ring-rose-200 bg-white/50 backdrop-blur-sm transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label htmlFor="password" className="text-sm font-semibold text-foreground/80">
                  비밀번호
                </label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-14 rounded-2xl border-rose-100 focus:border-rose-300 focus:ring-rose-200 bg-white/50 backdrop-blur-sm transition-all"
              />
            </div>

            <div className="pt-4 space-y-4">
              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-rose-200/50 transition-all hover:shadow-xl hover:shadow-rose-300/50 hover:-translate-y-1 active:translate-y-0"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    로그인 중...
                  </div>
                ) : '지금 시작하기'}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-rose-100"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-2 text-muted-foreground font-semibold">OR</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-14 rounded-2xl border-2 border-rose-100 hover:border-rose-200 hover:bg-rose-50/50 transition-all font-semibold text-rose-600"
                onClick={() => {
                  loginAsGuest()
                  router.push('/')
                }}
              >
                <span className="mr-2 text-xl">✨</span>
                게스트로 둘러보기
              </Button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-muted-foreground font-medium">
              처음이신가요?{' '}
              <Link href="/register" className="text-rose-500 hover:text-rose-600 font-bold hover:underline transition-all">
                회원가입 하기
              </Link>
            </p>
          </div>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm font-semibold text-rose-300 mt-10"
        >
          Made with 💕 for every couple
        </motion.p>
      </motion.div>
    </div>
  )
}
