'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/auth/AuthContext'
import { supabase } from '@/lib/supabase'
import { Trip } from '@/types'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  MapPin, 
  Plus, 
  PlaneTakeoff, 
  ChevronRight,
  Search,
  MoreHorizontal
} from 'lucide-react'

export default function TripsPage() {
  const { couple } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTrips = useCallback(async () => {
    if (!couple) return

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
  }, [couple])

  useEffect(() => {
    if (couple) {
      fetchTrips()
    }
  }, [couple, fetchTrips])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium">추억들을 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
            <span className="text-gradient">우리의 여행</span>
            <PlaneTakeoff className="w-8 h-8 text-rose-500" />
          </h1>
          <p className="text-muted-foreground font-medium">함께한, 그리고 함께할 모든 소중한 순간들</p>
        </div>
        <Link href="/trips/new">
          <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white h-14 px-8 rounded-2xl font-bold text-lg shadow-lg shadow-rose-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
            <Plus className="w-6 h-6" />
            새 여행 계획하기
          </Button>
        </Link>
      </div>

      {trips.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-glass rounded-[3rem] p-20 text-center border-2 border-dashed border-rose-200"
        >
          <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Search className="w-12 h-12 text-rose-300" />
          </div>
          <h3 className="text-2xl font-black mb-4">아직 계획된 여행이 없어요</h3>
          <p className="text-muted-foreground text-lg mb-8 max-w-sm mx-auto">
            우리의 첫 번째 특별한 여행을<br />지금 바로 계획해 볼까요?
          </p>
          <Link href="/trips/new">
            <Button className="bg-rose-500 hover:bg-rose-600 text-white rounded-2xl px-10 h-14 font-bold">
              첫 여행 시작하기
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {trips.map((trip, idx) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Link href={`/trips/${trip.id}`} className="group block h-full">
                  <div className="bg-glass rounded-[2.5rem] overflow-hidden border border-white shadow-xl shadow-rose-100/50 h-full flex flex-col group-hover:shadow-2xl transition-all duration-300">
                    {/* Card Header (Image Placeholder or Color) */}
                    <div className="h-48 bg-gradient-to-br from-rose-100 to-pink-200 relative">
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/50 backdrop-blur-md p-2 rounded-xl border border-white/40">
                          <MoreHorizontal className="w-5 h-5 text-rose-500" />
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                        <MapPin className="w-20 h-20 text-rose-500" />
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 text-rose-500 font-bold text-sm uppercase tracking-wider mb-3">
                        <MapPin className="w-4 h-4" />
                        {trip.destination}
                      </div>
                      <h3 className="text-2xl font-black text-foreground mb-4 group-hover:text-rose-600 transition-colors">
                        {trip.title}
                      </h3>
                      
                      <div className="mt-auto space-y-3 pt-6 border-t border-rose-100/50">
                        <div className="flex items-center gap-3 text-muted-foreground font-semibold">
                          <Calendar className="w-5 h-5 text-rose-400" />
                          <span>
                            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs font-bold text-rose-300 uppercase tracking-widest">View Details</span>
                          <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
