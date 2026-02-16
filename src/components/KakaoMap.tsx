'use client'

import { useEffect, useState, useCallback } from 'react'
import { Map, MapMarker, Polyline } from 'react-kakao-maps-sdk'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Clock, X, Navigation } from 'lucide-react'

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
        className="bg-gray-100 rounded-lg flex items-center justify-center"
      >
        <p className="text-gray-500">지도 로딩 중...</p>
      </div>
    )
  }

  return (
    <>
      <Map
        center={mapCenter}
        style={{ width: '100%', height }}
        className="rounded-lg"
        level={3}
      >
        {/* Polyline connecting places */}
        {showPolyline && polylinePath.length > 1 && (
          <Polyline
            path={polylinePath}
            strokeWeight={4}
            strokeColor="#f43f5e"
            strokeOpacity={0.7}
            strokeStyle="solid"
          />
        )}

        {/* Markers */}
        {filteredPlaces.map((place, index) => (
          <MapMarker
            key={place.id}
            position={{ lat: place.latitude, lng: place.longitude }}
            onClick={() => handleMarkerClick(place)}
          >
              <div className="px-2 py-1 bg-white rounded shadow text-xs font-medium whitespace-nowrap">
                {index + 1}. {place.place_name}
              </div>
          </MapMarker>
        ))}
      </Map>

      {/* Place Info Dialog */}
      <Dialog open={!!selectedPlace} onOpenChange={() => setSelectedPlace(null)}>
        <DialogContent className="max-w-sm rounded-[2rem] p-0 overflow-hidden">
          {selectedPlace && (
            <>
              <div className="h-24 bg-gradient-to-br from-rose-500 to-pink-500 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPlace(null)}
                  className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="absolute -bottom-6 left-6">
                  <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shadow-rose-200">
                    {filteredPlaces.findIndex(p => p.id === selectedPlace.id) + 1}
                  </div>
                </div>
              </div>

              <div className="pt-8 pb-6 px-6">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl font-black text-foreground">
                    {selectedPlace.place_name}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                  {selectedPlace.place_address && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground font-medium">
                        {selectedPlace.place_address}
                      </span>
                    </div>
                  )}

                  {selectedPlace.place_phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="text-muted-foreground font-medium">
                        {selectedPlace.place_phone}
                      </span>
                    </div>
                  )}

                  {selectedPlace.visit_time && (
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="text-rose-500 font-bold">
                        {selectedPlace.visit_time.slice(0, 5)}
                      </span>
                    </div>
                  )}

                  {selectedPlace.memo && (
                    <div className="mt-4 p-4 bg-rose-50 rounded-xl">
                      <p className="text-sm text-rose-600/80 font-medium italic">
                      &ldquo;{selectedPlace.memo}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Open in Kakao Map */}
                <Button
                  variant="outline"
                  className="w-full mt-6 h-12 rounded-xl font-bold border-rose-200 hover:bg-rose-50"
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
