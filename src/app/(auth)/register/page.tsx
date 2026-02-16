'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { MapPin, AlertCircle } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/login" className="inline-block"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center justify-center w-16 h-16 gradient-violet rounded-2xl mb-4"
            >
              <MapPin className="w-8 h-8 text-white" />
            </motion.div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">회원가입</h1>
          <p className="text-gray-500 text-sm">DateTrip과 함께 여행을 계획핳세요</p>
        </div>

        <div className="card-triple p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 text-sm text-red-600 bg-red-50 rounded-xl flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                이름
              </label>
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>
            
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
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="6자 이상"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  비밀번호 확인
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="확인"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 mt-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  가입 중...
                </div>
              ) : '회원가입'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-violet-600 font-medium hover:underline">
                로그인하기
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
