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
import { ArrowLeft, Calendar, MapPin, Plus } from 'lucide-react'
import { KakaoMapProvider } from '@/components/KakaoMapProvider'

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

  // 여행 정보 가져오기
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

  // 일정 아이템 가져오기
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

  // 날짜별로 일정 그룹화
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

  // 장소 추가
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

  // 일정 순서 변경
  const handleReorder = async (items: ScheduleItem[]) => {
    // UI 먼저 업데이트
    const otherItems = scheduleItems.filter(
      (item) => item.visit_date !== items[0]?.visit_date
    )
    setScheduleItems([...otherItems, ...items])

    // DB 업데이트
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

  // 일정 삭제
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
      <div className="text-center py-12">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">여행을 찾을 수 없습니다.</p>
        <Link href="/trips">
          <Button className="mt-4">여행 목록으로</Button>
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
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center gap-4">
          <Link href="/trips">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              뒤로
            </Button>
          </Link>
        </div>

        {/* 여행 정보 */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">{trip.title}</h1>
          <div className="flex items-center gap-4 mt-3 text-rose-100">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {trip.destination}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(trip.start_date).toLocaleDateString('ko-KR')} ~{' '}
              {new Date(trip.end_date).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>

        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timeline">일정</TabsTrigger>
            <TabsTrigger value="map">지도</TabsTrigger>
          </TabsList>

          {/* 일정 탭 */}
          <TabsContent value="timeline" className="space-y-4">
            {tripDates.map((date) => {
              const items = getItemsByDate(date)
              return (
                <div key={date}>
                  <DayTimeline
                    date={date}
                    items={items}
                    onReorder={handleReorder}
                    onDelete={handleDelete}
                  />
                  <Button
                    variant="outline"
                    className="w-full mt-2 border-dashed"
                    onClick={() => openSearch(date)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    장소 추가
                  </Button>
                </div>
              )
            })}
          </TabsContent>

          {/* 지도 탭 */}
          <TabsContent value="map">
            <KakaoMap
              places={mapPlaces}
              height="500px"
            />
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {mapPlaces.map((place, index) => (
                <div
                  key={place.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="bg-rose-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{place.place_name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(place.visit_date).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
