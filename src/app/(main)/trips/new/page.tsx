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
  Navigation,
  Compass
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
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/trips" className="inline-flex items-center text-gray-500 hover:text-violet-600 font-medium transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="ml-1">목록으로</span>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4"
          >
            <div className="w-12 h-12 gradient-violet rounded-2xl flex items-center justify-center"
            >
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">새 여행 만들기</h1>
              <p className="text-gray-500">특별한 여행을 계획해보세요</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card-triple p-6 space-y-6">
              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100"
                >
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4 text-violet-500" />
                  여행 제목
                </label>
                <Input
                  id="title"
                  placeholder="예: 우리의 1000일 기념 제주도 여행"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="h-12 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="destination" className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-violet-500" />
                  여행지
                </label>
                <Input
                  id="destination"
                  placeholder="예: 제주도 서귀포시"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  className="h-12 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="startDate" className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-violet-500" />
                    출발일
                  </label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="h-12 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="endDate" className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-violet-500" />
                    도착일
                  </label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="h-12 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/trips" className="flex-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-12 rounded-xl font-medium border-gray-200 hover:bg-gray-50"
                >
                  취소
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1 h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2"
                  >
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    생성 중...
                  </div>
                ) : '여행 만들기'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
