'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/auth/AuthContext'
import CoupleConnect from '@/components/CoupleConnect'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatDate, calculateDday } from '@/lib/utils'
import { 
  Search, 
  MapPin, 
  Calendar, 
  ChevronRight,
  Star,
  Heart,
  Plus,
  TrendingUp,
  Compass
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Trip } from '@/types'

// Mock recommended destinations
const recommendedDestinations = [
  {
    id: '1',
    name: '제주도',
    description: '푸른 바다와 아름다운 오름',
    rating: 4.8,
    tags: ['핫플', '자연', '힐링']
  },
  {
    id: '2',
    name: '부산',
    description: '해운대와 감천문화마을',
    rating: 4.7,
    tags: ['도시', '맛집', '바다']
  },
  {
    id: '3',
    name: '강릉',
    description: '커피 거리와 아름다운 항구',
    rating: 4.6,
    tags: ['커피', '핫플', '로맨틱']
  },
  {
    id: '4',
    name: '전주',
    description: '한옥마을과 전통 음식',
    rating: 4.5,
    tags: ['전통', '맛집', '문화']
  }
]

// Mock recommended courses
const recommendedCourses = [
  {
    id: '1',
    title: '제주 3박 4일 커플 여행',
    author: 'Traveler Kim',
    days: 4,
    places: 12,
    likes: 2341
  },
  {
    id: '2',
    title: '부산 2박 3일 먹방 투어',
    author: 'Foodie Lee',
    days: 3,
    places: 15,
    likes: 1856
  },
  {
    id: '3',
    title: '강릉 1박 2일 힐링 여행',
    author: 'Relax Park',
    days: 2,
    places: 8,
    likes: 1234
  }
]

export default function HomePage() {
  const { user, couple, loading, isGuest } = useAuth()
  const router = useRouter()
  const [skipCoupleConnect, setSkipCoupleConnect] = useState(false)
  const [myTrips, setMyTrips] = useState<Trip[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchMyTrips = async () => {
      // 게스트 모드에서는 API 호출하지 않음
      if (isGuest) return

      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('couple_id', couple?.id)
          .order('start_date', { ascending: true })
          .limit(3)

        if (error) throw error
        setMyTrips(data || [])
      } catch (error) {
        console.error('Error fetching trips:', error)
      }
    }

    if (couple && !isGuest) {
      fetchMyTrips()
    }
  }, [couple, isGuest])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-12 h-12 gradient-violet rounded-2xl flex items-center justify-center"
          >
            <Compass className="w-6 h-6 text-white" />
          </motion.div>
          <p className="text-gray-400 font-medium">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const upcomingTrips = myTrips.filter(trip => new Date(trip.start_date) >= new Date())

  return (
    <div className="min-h-screen pb-20">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="여행지, 장소, 코스를 검색하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {/* Couple Connect */}
        {!couple?.user2_id && !skipCoupleConnect && !isGuest ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <CoupleConnect />
            <button
              className="w-full py-3 text-gray-400 hover:text-violet-600 transition-all text-sm font-medium mt-4"
              onClick={() => setSkipCoupleConnect(true)}
            >
              나중에 연결하기
            </button>
          </motion.div>
        ) : (
          <>
            {/* My Trips Section */}
            {upcomingTrips.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">내 여행</h2>
                  <Link href="/trips" className="text-sm text-violet-600 font-medium flex items-center hover:underline">
                    전체 보기
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {upcomingTrips.slice(0, 2).map((trip, idx) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Link href={`/trips/${trip.id}`}>
                        <div className="card-triple card-triple-hover p-4 flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-7 h-7 text-violet-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">{trip.title}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {trip.destination}
                            </p>
                            <p className="text-sm text-gray-400 mt-0.5">
                              {formatDate(trip.start_date, { month: 'short', day: 'numeric' })} - {formatDate(trip.end_date, { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {(() => {
                              const dday = calculateDday(trip.start_date)
                              const isToday = dday === 'D-Day'
                              const isPast = dday.startsWith('D+')
                              return (
                                <>
                                  <span className="text-2xl font-black text-violet-600">
                                    {isToday ? '🎉' : dday.replace('D-', '')}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {isToday ? 'D-Day!' : isPast ? '지남' : '일 남음'}
                                  </span>
                                </>
                              )
                            })()}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Create Trip CTA - if no trips */}
            {upcomingTrips.length === 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link href="/trips/new">
                  <div className="gradient-violet rounded-2xl p-6 text-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-violet-100 text-sm font-medium mb-1">새로운 여행을 시작하세요</p>
                        <h3 className="text-xl font-bold">여행 계획하러 가기</h3>
                      </div>
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Plus className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.section>
            )}

            {/* Recommended Destinations */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">추천 여행지</h2>
                <button className="text-sm text-gray-400 font-medium">더보기</button>
              </div>
              
              <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
                {recommendedDestinations.map((dest, idx) => (
                  <motion.div
                    key={dest.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex-shrink-0 w-40"
                  >
                    <div className="card-triple card-triple-hover overflow-hidden">
                      <div className="h-28 bg-gradient-to-br from-violet-200 to-purple-200 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="flex items-center gap-1 text-white">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold">{dest.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-gray-900 text-sm">{dest.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{dest.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {dest.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Recommended Courses */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">추천 코스</h2>
                  <TrendingUp className="w-5 h-5 text-violet-600" />
                </div>
                <button className="text-sm text-gray-400 font-medium">더보기</button>
              </div>
              
              <div className="space-y-3">
                {recommendedCourses.map((course, idx) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="card-triple card-triple-hover p-4 flex gap-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-violet-200 to-purple-200 rounded-xl flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{course.author}</p>
                        <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {course.days}일
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {course.places}곳
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" />
                            {course.likes.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: Compass, label: '주변 탐색' },
                  { icon: Heart, label: '위시리스트' },
                  { icon: Calendar, label: '일정 관리' },
                  { icon: MapPin, label: '장소 검색' },
                ].map((item, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className="flex flex-col items-center gap-2 p-4"
                  >
                    <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-violet-600" />
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Partner Notice */}
            {(isGuest || skipCoupleConnect) && !couple?.user2_id && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-triple p-6 border-l-4 border-l-violet-600"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-violet-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">파트너와 함께 연결하세요</h4>
                    <p className="text-sm text-gray-500 mt-0.5">실시간으로 여행 계획을 함께 짤 수 있어요</p>
                  </div>
                  {!isGuest && (
                    <Button 
                      onClick={() => setSkipCoupleConnect(false)}
                      className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-4"
                    >
                      연결하기
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
