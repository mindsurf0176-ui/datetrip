'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(email, password, name)
      if (error) {
        setError(error.message || '회원가입에 실패했습니다.')
      } else {
        router.push('/login?registered=true')
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
      <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-rose-200/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[45%] h-[45%] bg-pink-200/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/login" className="inline-block group">
             <motion.div 
              whileHover={{ scale: 1.1 }}
              className="mb-4 bg-rose-100 p-4 rounded-2xl inline-flex items-center justify-center shadow-inner shadow-rose-200"
            >
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
            </motion.div>
          </Link>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            새로운 <span className="text-gradient">시작</span>
          </h1>
          <p className="text-muted-foreground font-medium text-sm">함께하는 모든 순간을 기록하세요</p>
        </div>

        <div className="bg-glass rounded-[2.5rem] shadow-2xl shadow-rose-100/50 p-8 border border-white/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 text-sm text-rose-600 bg-rose-50/50 backdrop-blur-sm rounded-xl border border-rose-100 font-medium"
              >
                {error}
              </motion.div>
            )}
            
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-foreground/80 ml-1">
                이름
              </label>
              <Input
                id="name"
                type="text"
                placeholder="어떻게 불러드릴까요?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 rounded-xl border-rose-100 focus:border-rose-300 focus:ring-rose-200 bg-white/50 backdrop-blur-sm transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-foreground/80 ml-1">
                이메일
              </label>
              <Input
                id="email"
                type="email"
                placeholder="love@datetrip.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-rose-100 focus:border-rose-300 focus:ring-rose-200 bg-white/50 backdrop-blur-sm transition-all"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-foreground/80 ml-1">
                  비밀번호
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="6자 이상"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-rose-100 focus:border-rose-300 focus:ring-rose-200 bg-white/50 backdrop-blur-sm transition-all"
                />
              </div>
              
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground/80 ml-1">
                  확인
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="한 번 더"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-rose-100 focus:border-rose-300 focus:ring-rose-200 bg-white/50 backdrop-blur-sm transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 mt-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-rose-200/50 transition-all hover:shadow-xl hover:shadow-rose-300/50 hover:-translate-y-1 active:translate-y-0"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  가입 중...
                </div>
              ) : '계정 만들기'}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-muted-foreground font-medium text-sm">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-rose-500 hover:text-rose-600 font-bold hover:underline transition-all">
                로그인하기
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
