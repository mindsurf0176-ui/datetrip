'use client'

import { useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Heart, Loader2, Copy, Check, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CoupleConnect() {
  const { user, couple, refreshCouple } = useAuth()
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create')

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handleCreateCouple = async () => {
    if (!user) return
    
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const code = generateInviteCode()
      
      const { error: insertError } = await supabase
        .from('couples')
        .insert([
          {
            user1_id: user.id,
            invite_code: code,
          },
        ])

      if (insertError) throw insertError

      await refreshCouple()
      setSuccess('초대 코드가 생성되었습니다')
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : '커플 생성에 실패했습니다.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinCouple = async () => {
    if (!user || !inviteCode.trim()) return
    
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data: coupleData, error: findError } = await supabase
        .from('couples')
        .select('*')
        .eq('invite_code', inviteCode.trim().toUpperCase())
        .single()

      if (findError || !coupleData) {
        setError('유효하지 않은 초대 코드입니다.')
        setLoading(false)
        return
      }

      if (coupleData.user1_id === user.id) {
        setError('자신의 초대 코드입니다.')
        setLoading(false)
        return
      }

      if (coupleData.user2_id) {
        setError('이미 연결된 커플입니다.')
        setLoading(false)
        return
      }

      const { error: updateError } = await supabase
        .from('couples')
        .update({ user2_id: user.id })
        .eq('id', coupleData.id)

      if (updateError) throw updateError

      await refreshCouple()
      setSuccess('커플 연결이 완료되었습니다!')
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : '커플 연결에 실패했습니다.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    if (couple?.invite_code) {
      navigator.clipboard.writeText(couple.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (couple?.user2_id) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-triple p-6 text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <Users className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">커플 연결 완료</h3>
        <p className="text-gray-500">함께 여행을 계획핳세요</p>
      </motion.div>
    )
  }

  if (couple && !couple.user2_id) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-triple p-6"
      >
        <div className="text-center mb-6"
        >
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">연결 대기 중</h3>
          <p className="text-sm text-gray-500">파트너가 초대 코드를 입력할 때까지 기다려주세요</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-center"
        >
          <p className="text-xs text-gray-400 mb-2">초대 코드</p>
          <div className="flex items-center justify-center gap-3"
          >
            <p className="text-2xl font-black text-violet-600 tracking-[0.2em]"
            >
              {couple.invite_code}
            </p>
            <button
              onClick={copyCode}
              className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-100 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <p className="text-xs text-center text-gray-400 mt-4">
          파트너에게 이 코드를 공유하세요
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-triple overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100"
      >
        <div className="flex items-center gap-3"
        >
          <div className="w-10 h-10 gradient-violet rounded-xl flex items-center justify-center"
          >
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">커플 연결</h3>
            <p className="text-sm text-gray-500">함께 여행을 계획할 파트너를 연결하세요</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6"
        >
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'create'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            초대 코드 생성
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'join'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            초대 코드 입력
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'create' ? (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl"
                >{error}</div>
              )}
              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 rounded-xl"
                >{success}</div>
              )}
              
              <p className="text-sm text-gray-500"
              >
                초대 코드를 생성하여 파트너에게 공유하세요.
              </p>
              
              <Button
                onClick={handleCreateCouple}
                className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    생성 중...
                  </div>
                ) : '초대 코드 생성'}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="join"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl"
                >{error}</div>
              )}
              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 rounded-xl"
                >{success}</div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700"
                >
                  초대 코드
                </label>
                <Input
                  placeholder="예: ABCD1234"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="h-12 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500 text-center text-lg font-bold tracking-[0.2em]"
                />
              </div>
              
              <Button
                onClick={handleJoinCouple}
                className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium"
                disabled={loading || !inviteCode.trim()}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    연결 중...
                  </div>
                ) : '커플 연결하기'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
