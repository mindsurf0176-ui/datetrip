'use client'

import { useEffect, useState, useCallback } from 'react'
import { Map, MapMarker, Polyline } from 'react-kakao-maps-sdk'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Clock, X, Navigation, Calendar } from 'lucide-react'

interface Place {
  id: string
  place_name: string
  latitude: number
  longitude: number
  visit_date: string
  place_address?: string
  place_phone?: string
  visit_time?: string
  memo?: string
}

interface KakaoMapProps {
  places: Place[]
  center?: { lat: number; lng: number }
  onMarkerClick?: (place: Place) => void
  height?: string
  showPolyline?: boolean
  selectedDate?: string
}

// Day colors for markers
const dayColors = [
  '#7C3AED', // violet-600
  '#EC4899', // pink-500
  '#F59E0B', // amber-500
  '#10B981', // emerald-500
  '#3B82F6', // blue-500
  '#8B5CF6', // violet-500
  '#EF4444', // red-500
]

export function KakaoMap({ 
  places, 
  center, 
  onMarkerClick, 
  height = '400px',
  showPolyline = true,
  selectedDate
}: KakaoMapProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [mapCenter, setMapCenter] = useState(center || { lat: 37.5665, lng: 126.9780 })
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)

  useEffect(() => {
    const checkKakaoLoaded = () => {
      if (window.kakao && window.kakao.maps) {
        setIsLoaded(true)
      } else {
        setTimeout(checkKakaoLoaded, 100)
      }
    }
    checkKakaoLoaded()
  }, [])

  useEffect(() => {
    if (places.length > 0 && isLoaded) {
      const avgLat = places.reduce((sum, p) => sum + p.latitude, 0) / places.length
      const avgLng = places.reduce((sum, p) => sum + p.longitude, 0) / places.length
      setMapCenter({ lat: avgLat, lng: avgLng })
    }
  }, [places, isLoaded])

  const handleMarkerClick = useCallback((place: Place) => {
    setSelectedPlace(place)
    onMarkerClick?.(place)
  }, [onMarkerClick])

  // Filter places by selected date if provided
  const filteredPlaces = selectedDate 
    ? places.filter(p => p.visit_date === selectedDate)
    : places

  // Group places by date for different colors
  const dateGroups = Array.from(new Set(places.map(p => p.visit_date)))
  
  const getMarkerColor = (place: Place) => {
    const dateIndex = dateGroups.indexOf(place.visit_date)
    return dayColors[dateIndex % dayColors.length]
  }

  // Generate polyline path from filtered places
  const polylinePath = showPolyline 
    ? filteredPlaces
        .filter(p => p.latitude && p.longitude)
        .map(p => ({ lat: p.latitude, lng: p.longitude }))
    : []

  if (!isLoaded) {
    return (
      <div 
        style={{ height }} 
        className="bg-gray-100 rounded-2xl flex flex-col items-center justify-center gap-3"
      >
        <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">지도를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <>
      <Map
        center={mapCenter}
        style={{ width: '100%', height }}
        className="rounded-2xl"
        level={3}
      >
        {/* Polyline connecting places */}
        {showPolyline && polylinePath.length > 1 && (
          <Polyline
            path={polylinePath}
            strokeWeight={3}
            strokeColor={selectedDate ? '#7C3AED' : '#9CA3AF'}
            strokeOpacity={0.8}
            strokeStyle="solid"
          />
        )}

        {/* Markers */}
        {filteredPlaces.map((place, index) => {
          const color = getMarkerColor(place)
          return (
            <MapMarker
              key={place.id}
              position={{ lat: place.latitude, lng: place.longitude }}
              onClick={() => handleMarkerClick(place)}
            >
              <div 
                className="px-2 py-1 rounded-lg shadow-md text-xs font-bold whitespace-nowrap"
                style={{ backgroundColor: color, color: 'white' }}
              >
                {index + 1}
              </div>
            </MapMarker>
          )
        })}
      </Map>

      {/* Place Info Dialog */}
      <Dialog open={!!selectedPlace} onOpenChange={() => setSelectedPlace(null)}>
        <DialogContent className="max-w-sm p-0 overflow-hidden rounded-2xl"
        >
          {selectedPlace && (
            <>
              <div 
                className="h-24 relative"
                style={{ backgroundColor: getMarkerColor(selectedPlace) }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPlace(null)}
                  className="absolute top-3 right-3 text-white hover:bg-white/20 rounded-lg w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="absolute -bottom-5 left-5"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                    style={{ backgroundColor: getMarkerColor(selectedPlace) }}
                  >
                    {filteredPlaces.findIndex(p => p.id === selectedPlace.id) + 1}
                  </div>
                </div>
              </div>

              <div className="pt-7 pb-5 px-5">
                <DialogHeader className="mb-4"
                >
                  <DialogTitle className="text-lg font-bold text-gray-900"
                  >
                    {selectedPlace.place_name}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                  {selectedPlace.place_address && (
                    <div className="flex items-start gap-3 text-sm"
                    >
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-gray-600"
                      >{selectedPlace.place_address}</span>
                    </div>
                  )}

                  {selectedPlace.place_phone && (
                    <div className="flex items-center gap-3 text-sm"
                    >
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-gray-600"
                      >{selectedPlace.place_phone}</span>
                    </div>
                  )}

                  {selectedPlace.visit_time && (
                    <div className="flex items-center gap-3 text-sm"
                    >
                      <Clock className="w-4 h-4 text-violet-500 shrink-0" />
                      <span className="text-violet-600 font-medium"
                      >{selectedPlace.visit_time.slice(0, 5)}</span>
                    </div>
                  )}

                  {selectedPlace.visit_date && (
                    <div className="flex items-center gap-3 text-sm"
                    >
                      <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-gray-500"
                      >
                        {new Date(selectedPlace.visit_date).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          weekday: 'short'
                        })}
                      </span>
                    </div>
                  )}

                  {selectedPlace.memo && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-xl"
                    >
                      <p className="text-sm text-gray-600"
                      >{selectedPlace.memo}</p>
                    </div>
                  )}
                </div>

                {/* Open in Kakao Map */}
                <Button
                  variant="outline"
                  className="w-full mt-5 h-11 rounded-xl font-medium border-gray-200 hover:bg-gray-50"
                  onClick={() => {
                    const url = `https://map.kakao.com/link/map/${selectedPlace.place_name},${selectedPlace.latitude},${selectedPlace.longitude}`
                    window.open(url, '_blank')
                  }}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  카카오맵에서 보기
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
