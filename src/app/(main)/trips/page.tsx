'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/auth/AuthContext'
import { supabase } from '@/lib/supabase'
import { Trip } from '@/types'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDate, calculateDday, getTripStatus, getTripDuration } from '@/lib/utils'
import { 
  Calendar, 
  MapPin, 
  Plus, 
  ChevronRight,
  Search,
  Clock,
  ArrowRight
} from 'lucide-react'

export default function TripsPage() {
  const { couple, isGuest } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  const fetchTrips = useCallback(async () => {
    // 게스트 모드에서는 API 호출하지 않음
    if (!couple || isGuest) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('couple_id', couple.id)
        .order('start_date', { ascending: true })

      if (error) throw error
      setTrips(data || [])
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }, [couple, isGuest])

  useEffect(() => {
    if (couple) {
      fetchTrips()
    }
  }, [couple, fetchTrips])

  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true
    const status = getTripStatus(trip.start_date, trip.end_date)
    return filter === 'upcoming' ? status !== 'past' : status === 'past'
  })

  const upcomingCount = trips.filter(t => getTripStatus(t.start_date, t.end_date) !== 'past').length
  const pastCount = trips.filter(t => getTripStatus(t.start_date, t.end_date) === 'past').length

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <div className="w-10 h-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-gray-400 font-medium">여행 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 게스트 또는 커플 미연결 사용자 안내
  if (!couple || isGuest) {
    return (
      <div className="min-h-screen pb-20">
        <div className="bg-white border-b border-gray-100 px-4 py-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900">내 여행</h1>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-triple p-12 text-center"
          >
            <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-violet-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isGuest ? '게스트 모드로 이용 중이에요' : '커플 연결이 필요해요'}
            </h3>
            <p className="text-gray-500 mb-6">
              {isGuest 
                ? '회원가입하고 파트너와 함께 여행을 계획해보세요'
                : '파트너와 연결하면 함께 여행을 계획할 수 있어요'}
            </p>
            <Link href={isGuest ? '/register' : '/'}>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-8 h-12">
                {isGuest ? '회원가입하기' : '커플 연결하러 가기'}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">내 여행</h1>
              <p className="text-gray-500 mt-1">총 {trips.length}개의 여행</p>
            </div>
            <Link href="/trips/new">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 px-5">
                <Plus className="w-4 h-4 mr-2" />
                새 여행 만들기
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {trips.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-triple p-12 text-center"
          >
            <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-violet-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">아직 여행이 없어요</h3>
            <p className="text-gray-500 mb-6">첫 번째 특별한 여행을 계획해보세요</p>
            <Link href="/trips/new">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-8 h-12">
                <Plus className="w-5 h-5 mr-2" />
                여행 만들기
              </Button>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6" role="tablist" aria-label="여행 필터">
              <button
                role="tab"
                aria-selected={filter === 'all'}
                onClick={() => setFilter('all')}
                className={`tab-triple ${filter === 'all' ? 'tab-triple-active' : 'tab-triple-inactive'}`}
              >
                전체
              </button>
              <button
                role="tab"
                aria-selected={filter === 'upcoming'}
                onClick={() => setFilter('upcoming')}
                className={`tab-triple ${filter === 'upcoming' ? 'tab-triple-active' : 'tab-triple-inactive'}`}
              >
                다가오는 여행
                <span className="ml-1.5 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                  {upcomingCount}
                </span>
              </button>
              <button
                role="tab"
                aria-selected={filter === 'past'}
                onClick={() => setFilter('past')}
                className={`tab-triple ${filter === 'past' ? 'tab-triple-active' : 'tab-triple-inactive'}`}
              >
                지난 여행
                <span className="ml-1.5 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {pastCount}
                </span>
              </button>
            </div>

            {/* Trip List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredTrips.map((trip, idx) => {
                  const status = getTripStatus(trip.start_date, trip.end_date)
                  const dday = calculateDday(trip.start_date)
                  
                  return (
                    <motion.div
                      key={trip.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link href={`/trips/${trip.id}`}>
                        <div className="card-triple card-triple-hover overflow-hidden group">
                          {/* Card Header */}
                          <div className="relative h-40 bg-gradient-to-br from-violet-400 to-purple-500">
                            {/* Status Badge */}
                            <div className="absolute top-4 left-4">
                              {status === 'ongoing' && (
                                <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                  여행 중
                                </span>
                              )}
                              {status === 'upcoming' && (
                                <span className="px-3 py-1 bg-white/90 text-violet-600 text-xs font-bold rounded-full">
                                  {dday}
                                </span>
                              )}
                              {status === 'past' && (
                                <span className="px-3 py-1 bg-gray-800/70 text-white text-xs font-bold rounded-full">
                                  완료
                                </span>
                              )}
                            </div>
                            
                            {/* Arrow Icon */}
                            <div className="absolute bottom-4 right-4 w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight className="w-5 h-5 text-white" />
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="p-5">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-violet-600 text-sm font-medium mb-1">
                                  <MapPin className="w-4 h-4" />
                                  {trip.destination}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 truncate">
                                  {trip.title}
                                </h3>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                              </span>
                            </div>

                            {/* Trip Duration */}
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {getTripDuration(trip.start_date, trip.end_date)}일 일정
                                </span>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-violet-600 transition-colors" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {filteredTrips.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12"
              >
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {filter === 'upcoming' ? '다가오는 여행이 없습니다' : 
                   filter === 'past' ? '지난 여행이 없습니다' : 
                   '여행이 없습니다'}
                </p>
                {filter !== 'all' && (
                  <button 
                    onClick={() => setFilter('all')}
                    className="text-sm text-violet-600 hover:underline"
                  >
                    전체 여행 보기
                  </button>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
