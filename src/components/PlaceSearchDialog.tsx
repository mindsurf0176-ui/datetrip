'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, MapPin, Plus } from 'lucide-react'

interface KakaoPlace {
  id: string
  place_name: string
  address_name: string
  road_address_name: string
  phone: string
  x: string
  y: string
  category_name: string
}

interface PlaceSearchDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (place: {
    place_name: string
    address: string
    phone?: string
    latitude: number
    longitude: number
  }) => void
}

export function PlaceSearchDialog({ isOpen, onClose, onSelect }: PlaceSearchDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<KakaoPlace[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false)

  useEffect(() => {
    const checkKakaoLoaded = () => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        setIsKakaoLoaded(true)
      } else {
        setTimeout(checkKakaoLoaded, 100)
      }
    }
    if (isOpen) {
      checkKakaoLoaded()
    }
  }, [isOpen])

  const searchPlaces = useCallback(() => {
    if (!query.trim() || !isKakaoLoaded) return

    setIsLoading(true)
    const ps = new window.kakao.maps.services.Places()
    
    ps.keywordSearch(query, (data: KakaoPlace[], status: string) => {
      setIsLoading(false)
      if (status === window.kakao.maps.services.Status.OK) {
        setResults(data)
      } else {
        setResults([])
      }
    })
  }, [query, isKakaoLoaded])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPlaces()
    }
  }

  const handleSelect = (place: KakaoPlace) => {
    onSelect({
      place_name: place.place_name,
      address: place.road_address_name || place.address_name,
      phone: place.phone || undefined,
      latitude: parseFloat(place.y),
      longitude: parseFloat(place.x),
    })
    setQuery('')
    setResults([])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>장소 검색</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="장소 이름을 입력하세요"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={searchPlaces} disabled={isLoading || !isKakaoLoaded}>
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-4 overflow-y-auto flex-1">
          {isLoading ? (
            <p className="text-center text-gray-500 py-8">검색 중...</p>
          ) : results.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {query ? '검색 결과가 없습니다' : '장소 이름을 입력하고 검색하세요'}
            </p>
          ) : (
            <div className="space-y-2">
              {results.map((place) => (
                <button
                  key={place.id}
                  onClick={() => handleSelect(place)}
                  className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{place.place_name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {place.road_address_name || place.address_name}
                      </p>
                      {place.phone && (
                        <p className="text-xs text-gray-400 mt-1">{place.phone}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{place.category_name}</p>
                    </div>
                    <Plus className="w-5 h-5 text-rose-600 flex-shrink-0 ml-2" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
