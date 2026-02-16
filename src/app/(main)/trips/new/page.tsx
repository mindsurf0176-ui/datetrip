'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/auth/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  Sparkles,
  Plane,
  Gift
} from 'lucide-react'

export default function NewTripPage() {
  const { couple } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!couple) {
      setError('커플 연결이 필요합니다.')
      setLoading(false)
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('종료일은 시작일보다 늦어야 합니다.')
      setLoading(false)
      return
    }

    try {
      const { data, error: insertError } = await supabase
        .from('trips')
        .insert([
          {
            couple_id: couple.id,
            title,
            destination,
            start_date: startDate,
            end_date: endDate,
          },
        ])
        .select()
        .single()

      if (insertError) throw insertError

      router.push(`/trips/${data.id}`)
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : '여행 생성에 실패했습니다.'
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <Link href="/trips" className="inline-flex items-center text-muted-foreground hover:text-rose-500 font-bold mb-6 transition-colors group">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          목록으로 돌아가기
        </Link>
        <h1 className="text-4xl font-black flex items-center gap-3">
          <span className="text-gradient">설레는 새 여행 계획</span>
          <Sparkles className="w-8 h-8 text-amber-400 fill-amber-400" />
        </h1>
        <p className="text-muted-foreground font-medium text-lg mt-2">우리의 다음 목적지는 어디인가요?</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-glass rounded-[3rem] p-10 border border-white shadow-2xl shadow-rose-100/50 space-y-8">
            {error && (
              <div className="p-4 text-sm text-rose-600 bg-rose-50 rounded-2xl border border-rose-100 font-bold flex items-center gap-2">
                <Gift className="w-5 h-5" />
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label htmlFor="title" className="text-lg font-black text-foreground/80 flex items-center gap-2">
                <Plane className="w-5 h-5 text-rose-500" />
                여행 제목
              </label>
              <Input
                id="title"
                placeholder="예: 우리의 1000일 기념 제주도 여행 🌊"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-16 rounded-2xl border-rose-100 focus:border-rose-300 focus:ring-rose-200 bg-white/50 backdrop-blur-sm text-lg font-bold transition-all px-6"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="destination" className="text-lg font-black text-foreground/80 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" />
                여행지
              </label>
              <Input
                id="destination"
                placeholder="예: 제주도 서귀포시"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="h-16 rounded-2xl border-rose-100 focus:border-rose-300 focus:ring-rose-200 bg-white/50 backdrop-blur-sm text-lg font-bold transition-all px-6"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label htmlFor="startDate" className="text-lg font-black text-foreground/80 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-rose-500" />
                  출발일
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="h-16 rounded-2xl border-rose-100 focus:border-rose-300 focus:ring-rose-200 bg-white/50 backdrop-blur-sm text-lg font-bold transition-all px-6"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="endDate" className="text-lg font-black text-foreground/80 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-rose-500" />
                  도착일
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="h-16 rounded-2xl border-rose-100 focus:border-rose-300 focus:ring-rose-200 bg-white/50 backdrop-blur-sm text-lg font-bold transition-all px-6"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4">
            <Link href="/trips" className="w-full md:w-auto">
              <Button type="button" variant="ghost" className="w-full md:w-auto h-14 px-10 rounded-2xl font-bold text-muted-foreground hover:text-rose-500">
                취소하기
              </Button>
            </Link>
            <Button
              type="submit"
              className="w-full md:w-auto h-16 px-12 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-rose-200 transition-all hover:scale-105 active:scale-95"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  계획 세우는 중...
                </div>
              ) : '우리의 여행 만들기'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
