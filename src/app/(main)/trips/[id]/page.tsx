'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/auth/AuthContext'
import { supabase } from '@/lib/supabase'
import { Trip, ScheduleItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DayTimeline } from '@/components/DayTimeline'
import { KakaoMap } from '@/components/KakaoMap'
import { PlaceSearchDialog } from '@/components/PlaceSearchDialog'
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Plus, 
  Navigation, 
  CalendarDays, 
  Map as MapIcon,
  Sparkles,
  Heart
} from 'lucide-react'
import { KakaoMapProvider } from '@/components/KakaoMapProvider'
import { motion, AnimatePresence } from 'framer-motion'

export default function TripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const tripId = params.id as string

  const [trip, setTrip] = useState<Trip | null>(null)
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')

  const fetchTrip = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single()

      if (error) throw error
      setTrip(data)
    } catch (error) {
      console.error('Error fetching trip:', error)
      router.push('/trips')
    }
  }, [tripId, router])

  const fetchScheduleItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('schedule_items')
        .select('*')
        .eq('trip_id', tripId)
        .order('visit_date', { ascending: true })
        .order('order_index', { ascending: true })

      if (error) throw error
      setScheduleItems(data || [])
    } catch (error) {
      console.error('Error fetching schedule items:', error)
    }
  }, [tripId])

  useEffect(() => {
    if (tripId) {
      Promise.all([fetchTrip(), fetchScheduleItems()]).then(() => {
        setLoading(false)
      })
    }
  }, [tripId, fetchTrip, fetchScheduleItems])

  const getDatesBetween = (startDate: string, endDate: string): string[] => {
    const dates: string[] = []
    const current = new Date(startDate)
    const end = new Date(endDate)
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }

  const getItemsByDate = (date: string) => {
    return scheduleItems.filter((item) => item.visit_date === date)
  }

  const handleAddPlace = async (place: {
    place_name: string
    address: string
    phone?: string
    latitude: number
    longitude: number
  }) => {
    if (!user || !selectedDate) return

    const itemsForDate = getItemsByDate(selectedDate)
    const maxOrder = itemsForDate.length > 0 
      ? Math.max(...itemsForDate.map(i => i.order_index)) 
      : -1

    try {
      const { error } = await supabase
        .from('schedule_items')
        .insert({
          trip_id: tripId,
          place_name: place.place_name,
          place_address: place.address,
          place_phone: place.phone,
          latitude: place.latitude,
          longitude: place.longitude,
          visit_date: selectedDate,
          order_index: maxOrder + 1,
          created_by: user.id,
        })

      if (error) throw error
      await fetchScheduleItems()
    } catch (error) {
      console.error('Error adding place:', error)
      alert('장소 추가에 실패했습니다.')
    }
  }

  const handleReorder = async (items: ScheduleItem[]) => {
    const otherItems = scheduleItems.filter(
      (item) => item.visit_date !== items[0]?.visit_date
    )
    setScheduleItems([...otherItems, ...items])

    try {
      for (const item of items) {
        await supabase
          .from('schedule_items')
          .update({ order_index: item.order_index })
          .eq('id', item.id)
      }
    } catch (error) {
      console.error('Error reordering:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('schedule_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchScheduleItems()
    } catch (error) {
      console.error('Error deleting:', error)
      alert('삭제에 실패했습니다.')
    }
  }

  const openSearch = (date: string) => {
    setSelectedDate(date)
    setIsSearchOpen(true)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-rose-400"
        >
          <Heart className="w-16 h-16 fill-rose-400" />
        </motion.div>
        <p className="text-rose-400 font-bold">우리의 여행 지도를 그리는 중...</p>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="max-w-md mx-auto text-center py-20 bg-glass rounded-[2rem] border border-white">
        <Heart className="w-16 h-16 text-rose-300 mx-auto mb-6" />
        <h2 className="text-2xl font-black mb-4">여행을 찾을 수 없어요</h2>
        <Link href="/trips">
          <Button className="bg-rose-500 hover:bg-rose-600 rounded-2xl h-12 px-8 font-bold">
            목록으로 돌아가기
          </Button>
        </Link>
      </div>
    )
  }

  const tripDates = getDatesBetween(trip.start_date, trip.end_date)
  const mapPlaces = scheduleItems
    .filter((item) => item.latitude && item.longitude)
    .map((item) => ({
      id: item.id,
      place_name: item.place_name,
      latitude: item.latitude!,
      longitude: item.longitude!,
      visit_date: item.visit_date,
    }))

  return (
    <KakaoMapProvider>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Link href="/trips">
            <Button variant="ghost" className="text-muted-foreground hover:text-rose-500 font-bold group">
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              나의 여행 목록
            </Button>
          </Link>
        </motion.div>

        {/* Trip Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-rose-200"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-rose-100 font-bold text-sm uppercase tracking-widest mb-4">
              <Sparkles className="w-4 h-4 fill-rose-100" />
              Travel Itinerary
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">{trip.title}</h1>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
                <MapPin className="w-6 h-6 text-rose-100" />
                <span className="text-xl font-bold">{trip.destination}</span>
              </div>
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
                <CalendarDays className="w-6 h-6 text-rose-100" />
                <span className="text-xl font-bold">
                  {new Date(trip.start_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} - {new Date(trip.end_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="timeline" className="w-full space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-glass p-1.5 rounded-[1.5rem] border border-white shadow-lg h-16 flex w-full max-w-md">
              <TabsTrigger 
                value="timeline" 
                className="flex-1 rounded-[1.2rem] data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg font-black text-lg transition-all"
              >
                <Calendar className="w-5 h-5 mr-2" />
                일정 보기
              </TabsTrigger>
              <TabsTrigger 
                value="map" 
                className="flex-1 rounded-[1.2rem] data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg font-black text-lg transition-all"
              >
                <MapIcon className="w-5 h-5 mr-2" />
                지도 보기
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Timeline View */}
          <TabsContent value="timeline" className="space-y-12">
            <AnimatePresence mode="wait">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="space-y-12"
              >
                {tripDates.map((date, index) => {
                  const items = getItemsByDate(date)
                  return (
                    <motion.div 
                      key={date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-rose-500 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg shadow-rose-100">
                          <span className="text-xs uppercase leading-none mb-1">Day</span>
                          <span className="text-xl leading-none">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-foreground">
                            {new Date(date).toLocaleDateString('ko-KR', { weekday: 'long', month: 'long', day: 'numeric' })}
                          </h3>
                        </div>
                      </div>

                      <div className="ml-7 pl-10 border-l-2 border-dashed border-rose-200 space-y-4">
                        <DayTimeline
                          date={date}
                          items={items}
                          onReorder={handleReorder}
                          onDelete={handleDelete}
                        />
                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                          <Button
                            variant="outline"
                            className="w-full h-16 rounded-[2rem] border-2 border-dashed border-rose-200 hover:border-rose-400 hover:bg-rose-50 transition-all font-black text-rose-500 gap-2 text-lg"
                            onClick={() => openSearch(date)}
                          >
                            <Plus className="w-6 h-6" />
                            장소 추가하기
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Map View */}
          <TabsContent value="map">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="rounded-[3rem] overflow-hidden shadow-2xl shadow-rose-100 border-4 border-white relative">
                <KakaoMap
                  places={mapPlaces}
                  height="600px"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mapPlaces.map((place, index) => (
                  <motion.div
                    key={place.id}
                    whileHover={{ y: -5 }}
                    className="flex items-center gap-5 p-5 bg-glass rounded-[2rem] border border-white shadow-xl shadow-rose-100/50"
                  >
                    <div className="bg-rose-500 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shadow-lg shadow-rose-200 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-foreground truncate">{place.place_name}</p>
                      <p className="text-sm text-muted-foreground font-semibold flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        Day {tripDates.indexOf(place.visit_date) + 1}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        <PlaceSearchDialog
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelect={handleAddPlace}
        />
      </div>
    </KakaoMapProvider>
  )
}
