'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { KakaoMap } from '@/components/KakaoMap'
import { Trip, ScheduleItem } from '@/types'
import { motion } from 'framer-motion'
import { MapPin, Calendar, ChevronDown, X, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PlaceWithTrip extends ScheduleItem {
  trip_title?: string
}

export default function MapPage() {
  const { user, couple, loading, isGuest } = useAuth()
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [places, setPlaces] = useState<PlaceWithTrip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null)
  const [showTripFilter, setShowTripFilter] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!couple || isGuest) {
        setIsLoading(false)
        return
      }

      try {
        // Fetch all trips
        const { data: tripsData, error: tripsError } = await supabase
          .from('trips')
          .select('*')
          .eq('couple_id', couple.id)
          .order('start_date', { ascending: false })

        if (tripsError) throw tripsError
        setTrips(tripsData || [])

        // Fetch all schedule items with valid coordinates
        const { data: placesData, error: placesError } = await supabase
          .from('schedule_items')
          .select('*, trips!inner(title, couple_id)')
          .eq('trips.couple_id', couple.id)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null)

        if (placesError) throw placesError

        // Map places with trip title
        const placesWithTrip = (placesData || []).map((place: ScheduleItem & { trips: { title: string } }) => ({
          ...place,
          trip_title: place.trips?.title
        }))

        setPlaces(placesWithTrip)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (couple) {
      fetchData()
    }
  }, [couple, isGuest])

  // Filter places by selected trip
  const filteredPlaces = selectedTrip
    ? places.filter(p => p.trip_id === selectedTrip)
    : places

  // Convert to KakaoMap format
  const mapPlaces = filteredPlaces.map(p => ({
    id: p.id,
    place_name: p.place_name,
    latitude: p.latitude!,
    longitude: p.longitude!,
    visit_date: p.visit_date,
    place_address: p.place_address,
    place_phone: p.place_phone,
    visit_time: p.visit_time,
    memo: p.memo
  }))

  if (loading || isLoading) {
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
          <p className="text-gray-400 font-medium">지도를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (isGuest) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-violet-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">지도를 보려면 로그인하세요</h2>
          <p className="text-gray-500 mb-6">회원가입 후 여행 일정을 추가하면<br/>모든 장소를 지도에서 볼 수 있어요</p>
          <Link href="/register">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-6">
              회원가입하기
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">전체 여행 지도</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{filteredPlaces.length}개 장소</span>
            </div>
          </div>

          {/* Trip Filter */}
          {trips.length > 0 && (
            <div className="mt-4 relative">
              <button
                onClick={() => setShowTripFilter(!showTripFilter)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {selectedTrip 
                    ? trips.find(t => t.id === selectedTrip)?.title || '여행 선택'
                    : '전체 여행'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showTripFilter ? 'rotate-180' : ''}`} />
              </button>

              {showTripFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setSelectedTrip(null)
                      setShowTripFilter(false)
                    }}
                    className={`w-full px-4 py-3 text-left text-sm flex items-center gap-2 hover:bg-gray-50 ${!selectedTrip ? 'bg-violet-50 text-violet-600' : 'text-gray-700'}`}
                  >
                    <MapPin className="w-4 h-4" />
                    전체 여행
                  </button>
                  {trips.map(trip => (
                    <button
                      key={trip.id}
                      onClick={() => {
                        setSelectedTrip(trip.id)
                        setShowTripFilter(false)
                      }}
                      className={`w-full px-4 py-3 text-left text-sm flex items-center gap-2 hover:bg-gray-50 ${selectedTrip === trip.id ? 'bg-violet-50 text-violet-600' : 'text-gray-700'}`}
                    >
                      <Calendar className="w-4 h-4" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{trip.title}</div>
                        <div className="text-xs text-gray-400">{trip.destination}</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        {mapPlaces.length > 0 ? (
          <KakaoMap 
            places={mapPlaces} 
            height="calc(100vh - 200px)"
            showPolyline={!!selectedTrip}
          />
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-200px)] bg-gray-100">
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-violet-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">아직 등록된 장소가 없어요</h2>
              <p className="text-gray-500 mb-4">여행 일정에 장소를 추가해보세요</p>
              <Link href="/trips/new">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
                  여행 만들기
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Selected Trip Chip */}
        {selectedTrip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4 z-10"
          >
            <div className="bg-white rounded-xl shadow-lg p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">
                  {trips.find(t => t.id === selectedTrip)?.title}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {trips.find(t => t.id === selectedTrip)?.destination}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTrip(null)}
                className="rounded-xl"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
