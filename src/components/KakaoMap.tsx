'use client'

import { useEffect, useState } from 'react'
import { Map, MapMarker } from 'react-kakao-maps-sdk'

interface Place {
  id: string
  place_name: string
  latitude: number
  longitude: number
  visit_date: string
}

interface KakaoMapProps {
  places: Place[]
  center?: { lat: number; lng: number }
  onMarkerClick?: (place: Place) => void
  height?: string
}

export function KakaoMap({ places, center, onMarkerClick, height = '400px' }: KakaoMapProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [mapCenter, setMapCenter] = useState(center || { lat: 37.5665, lng: 126.9780 })

  useEffect(() => {
    // 카카오맵 SDK 로드 확인
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
      // 장소들의 중심점 계산
      const avgLat = places.reduce((sum, p) => sum + p.latitude, 0) / places.length
      const avgLng = places.reduce((sum, p) => sum + p.longitude, 0) / places.length
      setMapCenter({ lat: avgLat, lng: avgLng })
    }
  }, [places, isLoaded])

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
    <Map
      center={mapCenter}
      style={{ width: '100%', height }}
      className="rounded-lg"
      level={3}
    >
      {places.map((place, index) => (
        <MapMarker
          key={place.id}
          position={{ lat: place.latitude, lng: place.longitude }}
          onClick={() => onMarkerClick?.(place)}
        >
          <div className="px-2 py-1 bg-white rounded shadow text-xs font-medium">
            {index + 1}. {place.place_name}
          </div>
        </MapMarker>
      ))}
    </Map>
  )
}
