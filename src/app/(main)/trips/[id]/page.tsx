'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/auth/AuthContext'
import { supabase } from '@/lib/supabase'
import { Trip, ScheduleItem } from '@/types'
import { Button } from '@/components/ui/button'
import { DayTimeline } from '@/components/DayTimeline'
import { KakaoMap } from '@/components/KakaoMap'
import { PlaceSearchDialog } from '@/components/PlaceSearchDialog'
import { ScheduleEditDialog } from '@/components/ScheduleEditDialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { TripEditDialog } from '@/components/TripEditDialog'
import { getDatesBetween, formatDate } from '@/lib/utils'
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Plus, 
  Navigation,
  Map as MapIcon,
  RefreshCw,
  List,
  ChevronLeft,
  ChevronRight,
  Clock,
  MoreVertical,
  Edit2,
  Trash2
} from 'lucide-react'
// KakaoMapProvider는 부모 layout에서 이미 제공됨
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipe } from '@/hooks/useSwipe'

export default function TripDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, couple, loading: authLoading, isGuest } = useAuth()
  const tripId = params.id as string

  const [trip, setTrip] = useState<Trip | null>(null)
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'timeline' | 'map'>('timeline')
  const [activeDayIndex, setActiveDayIndex] = useState(0)
  const [showAllOnMap, setShowAllOnMap] = useState(false)
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing'>('synced')
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; itemId: string | null }>({
    open: false,
    itemId: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTripEditOpen, setIsTripEditOpen] = useState(false)
  const [tripDeleteConfirm, setTripDeleteConfirm] = useState(false)
  const [isDeletingTrip, setIsDeletingTrip] = useState(false)
  const [showTripMenu, setShowTripMenu] = useState(false)

  // 권한 체크: 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!authLoading && !user && !isGuest) {
      router.push('/login?redirect=' + encodeURIComponent(`/trips/${tripId}`))
    }
  }, [authLoading, user, isGuest, router, tripId])

  const fetchTrip = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single()

      if (error) throw error
      
      // 권한 체크: 게스트가 아닌 경우 자신의 커플 여행만 접근 가능
      if (!isGuest && couple && data.couple_id !== couple.id) {
        router.push('/trips')
        return
      }
      
      setTrip(data)
    } catch (error) {
      console.error('Error fetching trip:', error)
      router.push('/trips')
    }
  }, [tripId, router, isGuest, couple])

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
    // 인증 로딩 중이거나 비로그인 상태면 데이터 fetch 안함
    if (authLoading || (!user && !isGuest)) return
    
    if (tripId) {
      Promise.all([fetchTrip(), fetchScheduleItems()]).then(() => {
        setLoading(false)
      })
    }
  }, [tripId, fetchTrip, fetchScheduleItems, authLoading, user, isGuest])

  // 실시간 동기화 (게스트 모드에서는 스킵)
  useEffect(() => {
    if (!tripId || isGuest) return

    const channel = supabase
      .channel(`trip_${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedule_items',
          filter: `trip_id=eq.${tripId}`,
        },
        (payload: { eventType: string; new: Record<string, unknown>; old: { id: string } }) => {
          setSyncStatus('syncing')
          if (payload.eventType === 'INSERT') {
            setScheduleItems((prev) => [...prev, payload.new as unknown as ScheduleItem])
          } else if (payload.eventType === 'UPDATE') {
            setScheduleItems((prev) =>
              prev.map((item) =>
                item.id === (payload.new as unknown as ScheduleItem).id ? payload.new as unknown as ScheduleItem : item
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setScheduleItems((prev) =>
              prev.filter((item) => item.id !== payload.old.id)
            )
          }
          setTimeout(() => setSyncStatus('synced'), 500)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tripId, isGuest])

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
    if (!user || !trip) return

    const selectedDate = tripDates[activeDayIndex]
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
      setIsSearchOpen(false)
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

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ open: true, itemId: id })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.itemId) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('schedule_items')
        .delete()
        .eq('id', deleteConfirm.itemId)

      if (error) throw error
      setDeleteConfirm({ open: false, itemId: null })
    } catch (error) {
      console.error('Error deleting:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (item: ScheduleItem) => {
    setEditingItem(item)
    setIsEditOpen(true)
  }

  const handleSaveEdit = async (updatedItem: ScheduleItem) => {
    try {
      const { error } = await supabase
        .from('schedule_items')
        .update({
          place_name: updatedItem.place_name,
          visit_time: updatedItem.visit_time,
          memo: updatedItem.memo,
        })
        .eq('id', updatedItem.id)

      if (error) throw error
      setIsEditOpen(false)
      setEditingItem(null)
    } catch (error) {
      console.error('Error updating:', error)
      alert('수정에 실패했습니다.')
    }
  }

  const handleDayChange = useCallback((direction: 'prev' | 'next') => {
    if (!trip) return
    setActiveDayIndex(prev => {
      if (direction === 'prev' && prev > 0) return prev - 1
      if (direction === 'next' && prev < getDatesBetween(trip.start_date, trip.end_date).length - 1) return prev + 1
      return prev
    })
  }, [trip])

  const handleTripUpdate = async (updatedTrip: Trip) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update({
          title: updatedTrip.title,
          destination: updatedTrip.destination,
          start_date: updatedTrip.start_date,
          end_date: updatedTrip.end_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedTrip.id)

      if (error) throw error
      
      setTrip(updatedTrip)
      // 날짜가 변경되면 activeDayIndex 리셋
      setActiveDayIndex(0)
    } catch (error) {
      console.error('Error updating trip:', error)
      throw error
    }
  }

  const handleTripDelete = async () => {
    if (!trip) return

    setIsDeletingTrip(true)
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', trip.id)

      if (error) throw error
      
      router.push('/trips')
    } catch (error) {
      console.error('Error deleting trip:', error)
      alert('여행 삭제에 실패했습니다.')
    } finally {
      setIsDeletingTrip(false)
      setTripDeleteConfirm(false)
    }
  }

  // 스와이프로 날짜 변경 (모바일 UX)
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => handleDayChange('next'),
    onSwipeRight: () => handleDayChange('prev'),
  })

  // Memoized 계산
  const tripDates = useMemo(() => 
    trip ? getDatesBetween(trip.start_date, trip.end_date) : []
  , [trip])

  const selectedDate = tripDates[activeDayIndex] || ''

  const currentItems = useMemo(() => 
    scheduleItems.filter((item) => item.visit_date === selectedDate)
  , [scheduleItems, selectedDate])

  const mapPlaces = useMemo(() => 
    scheduleItems
      .filter((item) => item.latitude && item.longitude)
      .map((item) => ({
        ...item,
        latitude: item.latitude!,
        longitude: item.longitude!,
      }))
  , [scheduleItems])

  // 인증 로딩 또는 비로그인 상태 (리다이렉트 대기 중)
  if (authLoading || (!user && !isGuest)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-12 h-12 gradient-violet rounded-2xl flex items-center justify-center"
        >
          <Navigation className="w-6 h-6 text-white" />
        </motion.div>
        <p className="text-gray-400 font-medium">로그인 상태 확인 중...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-12 h-12 gradient-violet rounded-2xl flex items-center justify-center"
        >
          <Navigation className="w-6 h-6 text-white" />
        </motion.div>
        <p className="text-gray-400 font-medium">여행 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-6" />
        <h2 className="text-xl font-bold mb-4">여행을 찾을 수 없어요</h2>
        <Link href="/trips">
          <Button className="bg-violet-600 hover:bg-violet-700 rounded-xl h-12 px-8">
            목록으로 돌아가기
          </Button>
        </Link>
      </div>
    )
  }

  return (
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <Link href="/trips">
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">{trip.title}</h1>
                <p className="text-sm text-gray-500">{trip.destination}</p>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw 
                  className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin text-violet-600' : 'text-gray-300'}`} 
                />
                {/* Trip Menu */}
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-9 h-9 rounded-xl"
                    onClick={() => setShowTripMenu(!showTripMenu)}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                  
                  {showTripMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowTripMenu(false)} 
                      />
                      <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                        <button
                          onClick={() => {
                            setShowTripMenu(false)
                            setIsTripEditOpen(true)
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          여행 수정
                        </button>
                        <button
                          onClick={() => {
                            setShowTripMenu(false)
                            setTripDeleteConfirm(true)
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          여행 삭제
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Info Card */}
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <p className="text-violet-100 text-sm">여행 기간</p>
                <p className="text-xl font-bold">
                  {formatDate(trip.start_date, { month: 'short', day: 'numeric' })} - {formatDate(trip.end_date, { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-violet-100 text-sm mt-0.5">
                  {tripDates.length}일 일정
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex gap-1" role="tablist" aria-label="일정 보기 방식">
              <button
                role="tab"
                aria-selected={activeTab === 'timeline'}
                aria-controls="timeline-panel"
                onClick={() => setActiveTab('timeline')}
                className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'timeline' 
                    ? 'border-violet-600 text-violet-600' 
                    : 'border-transparent text-gray-500'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <List className="w-4 h-4" />
                  일정
                </div>
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'map'}
                aria-controls="map-panel"
                onClick={() => setActiveTab('map')}
                className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'map' 
                    ? 'border-violet-600 text-violet-600' 
                    : 'border-transparent text-gray-500'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <MapIcon className="w-4 h-4" />
                  지도
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            {activeTab === 'timeline' ? (
              <motion.div
                key="timeline"
                id="timeline-panel"
                role="tabpanel"
                aria-labelledby="timeline-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
                {...swipeHandlers}
              >
                {/* Day Navigation */}
                <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-gray-100">
                  <button
                    onClick={() => handleDayChange('prev')}
                    disabled={activeDayIndex === 0}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="text-center">
                    <p className="text-2xl font-black text-violet-600">Day {activeDayIndex + 1}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedDate).toLocaleDateString('ko-KR', { 
                        month: 'long', 
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleDayChange('next')}
                    disabled={activeDayIndex === tripDates.length - 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Day Tabs */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                  {tripDates.map((date, idx) => {
                    const items = getItemsByDate(date)
                    return (
                      <button
                        key={date}
                        onClick={() => setActiveDayIndex(idx)}
                        className={`flex-shrink-0 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          activeDayIndex === idx
                            ? 'bg-violet-600 text-white'
                            : 'bg-white text-gray-600 border border-gray-100 hover:border-violet-200'
                        }`}
                      >
                        <div className="text-center">
                          <p className="font-bold">Day {idx + 1}</p>
                          <p className={`text-xs mt-0.5 ${activeDayIndex === idx ? 'text-violet-200' : 'text-gray-400'}`}>
                            {items.length}곳
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">
                      일정 {currentItems.length > 0 && `(${currentItems.length})`}
                    </h3>
                    <Button 
                      onClick={() => setIsSearchOpen(true)}
                      className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-10"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      장소 추가
                    </Button>
                  </div>

                  <DayTimeline
                    items={currentItems}
                    onReorder={handleReorder}
                    onDelete={handleDeleteClick}
                    onEdit={handleEdit}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="map"
                id="map-panel"
                role="tabpanel"
                aria-labelledby="map-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Map */}
                <div className="rounded-2xl overflow-hidden border border-gray-100">
                  <KakaoMap
                    places={mapPlaces}
                    height="400px"
                    showPolyline={true}
                    selectedDate={showAllOnMap ? undefined : selectedDate}
                  />
                </div>

                {/* Date Filter */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowAllOnMap(true)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      showAllOnMap
                        ? 'bg-violet-600 text-white' 
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'
                    }`}
                  >
                    전체 보기
                  </button>
                  {tripDates.map((date, idx) => {
                    const hasItems = getItemsByDate(date).length > 0
                    return (
                      <button
                        key={date}
                        onClick={() => {
                          setShowAllOnMap(false)
                          setActiveDayIndex(idx)
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          !showAllOnMap && activeDayIndex === idx
                            ? 'bg-violet-600 text-white' 
                            : hasItems
                              ? 'bg-violet-50 text-violet-600 border border-violet-200'
                              : 'bg-white border border-gray-200 text-gray-400'
                        }`}
                      >
                        Day {idx + 1}
                      </button>
                    )
                  })}
                </div>

                {/* Place List for Map */}
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-900">
                    장소 목록 {showAllOnMap ? '(전체)' : `(Day ${activeDayIndex + 1})`}
                  </h3>
                  
                  {(showAllOnMap 
                    ? scheduleItems 
                    : currentItems
                  ).filter(item => item.latitude && item.longitude)
                    .map((place, index) => (
                    <motion.div
                      key={place.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="card-triple p-4 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 gradient-violet rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{place.place_name}</p>
                        <p className="text-sm text-gray-500 truncate">{place.place_address}</p>
                      </div>
                      {place.visit_time && (
                        <div className="flex items-center gap-1 text-sm text-violet-600">
                          <Clock className="w-4 h-4" />
                          {place.visit_time.slice(0, 5)}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <PlaceSearchDialog
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelect={handleAddPlace}
        />

        <ScheduleEditDialog
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false)
            setEditingItem(null)
          }}
          item={editingItem}
          onSave={handleSaveEdit}
        />

        <ConfirmDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ open, itemId: open ? deleteConfirm.itemId : null })}
          title="장소 삭제"
          description="이 장소를 일정에서 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다."
          confirmText="삭제"
          cancelText="취소"
          variant="destructive"
          onConfirm={handleDeleteConfirm}
          loading={isDeleting}
        />

        <TripEditDialog
          isOpen={isTripEditOpen}
          onClose={() => setIsTripEditOpen(false)}
          trip={trip}
          onSave={handleTripUpdate}
        />

        <ConfirmDialog
          open={tripDeleteConfirm}
          onOpenChange={setTripDeleteConfirm}
          title="여행 삭제"
          description={`"${trip?.title}" 여행을 삭제하시겠습니까? 모든 일정이 함께 삭제되며, 복구할 수 없습니다.`}
          confirmText="삭제"
          cancelText="취소"
          variant="destructive"
          onConfirm={handleTripDelete}
          loading={isDeletingTrip}
        />
      </div>
  )
}
