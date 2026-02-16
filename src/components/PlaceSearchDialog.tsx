'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, MapPin, Plus, Utensils, Coffee, Camera, Bed, Store } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

type CategoryType = 'all' | 'food' | 'cafe' | 'sight' | 'stay'

const categories: { id: CategoryType; label: string; icon: typeof Utensils }[] = [
  { id: 'all', label: '전체', icon: Store },
  { id: 'food', label: '맛집', icon: Utensils },
  { id: 'cafe', label: '카페', icon: Coffee },
  { id: 'sight', label: '관광지', icon: Camera },
  { id: 'stay', label: '숙소', icon: Bed },
]

interface PlaceSearchDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (place: {
    place_name: string
    address: string
    phone?: string
    latitude: number
    longitude: number
    category?: string
  }) => void
}

export function PlaceSearchDialog({ isOpen, onClose, onSelect }: PlaceSearchDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<KakaoPlace[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false)
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all')

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
      setQuery('')
      setResults([])
      setActiveCategory('all')
    }
  }, [isOpen])

  const searchPlaces = useCallback(() => {
    if (!query.trim() || !isKakaoLoaded) return

    setIsLoading(true)
    const ps = new window.kakao.maps.services.Places()
    
    // Add category filter to query
    let searchQuery = query
    if (activeCategory !== 'all') {
      const categoryKeywords: Record<CategoryType, string> = {
        all: '',
        food: '맛집 식당 음식점',
        cafe: '카페 커피',
        sight: '관광지 명소',
        stay: '호텔 펜션 숙소',
      }
      searchQuery = `${query} ${categoryKeywords[activeCategory]}`
    }
    
    ps.keywordSearch(searchQuery, (data: KakaoPlace[], status: string) => {
      setIsLoading(false)
      if (status === window.kakao.maps.services.Status.OK) {
        setResults(data)
      } else {
        setResults([])
      }
    })
  }, [query, isKakaoLoaded, activeCategory])

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
      category: place.category_name,
    })
    setQuery('')
    setResults([])
    onClose()
  }

  const getCategoryFromPlace = (place: KakaoPlace) => {
    const category = place.category_name.toLowerCase()
    if (category.includes('카페') || category.includes('커피')) return { color: 'bg-amber-100 text-amber-700', label: '카페' }
    if (category.includes('음식') || category.includes('식당') || category.includes('맛집')) return { color: 'bg-orange-100 text-orange-700', label: '맛집' }
    if (category.includes('호텔') || category.includes('숙박') || category.includes('펜션')) return { color: 'bg-blue-100 text-blue-700', label: '숙소' }
    return { color: 'bg-violet-100 text-violet-700', label: '관광' }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100"
        >
          <DialogTitle className="text-xl font-bold">장소 검색</DialogTitle>
        </DialogHeader>
        
        <div className="px-6 py-4 space-y-4">
          {/* Search Input */}
          <div className="relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="장소 이름을 입력하세요"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-12 pl-12 pr-20 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500"
            />
            <Button 
              onClick={searchPlaces} 
              disabled={isLoading || !isKakaoLoaded || !query.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 rounded-lg bg-violet-600 hover:bg-violet-700"
            >
              검색
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id)
                  if (query.trim()) {
                    setTimeout(searchPlaces, 0)
                  }
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 pb-6"
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="w-10 h-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
                <p className="text-gray-400 mt-4">검색 중...</p>
              </motion.div>
            ) : results.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <MapPin className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">
                  {query ? '검색 결과가 없습니다' : '장소 이름을 입력하고 검색하세요'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <p className="text-sm text-gray-500 mb-3">{results.length}개의 결과</p>
                
                {results.map((place, idx) => {
                  const category = getCategoryFromPlace(place)
                  return (
                    <motion.button
                      key={place.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => handleSelect(place)}
                      className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all group"
                    >
                      <div className="flex items-start gap-3"
                      >
                        <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-violet-200 transition-colors"
                        >
                          <MapPin className="w-6 h-6 text-violet-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0"
                        >
                          <div className="flex items-center gap-2 mb-1"
                          >
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${category.color}`}
                            >
                              {category.label}
                            </span>
                            <h4 className="font-bold text-gray-900 truncate"
                            >{place.place_name}</h4>
                          </div>
                          
                          <p className="text-sm text-gray-500 truncate"
                          >
                            {place.road_address_name || place.address_name}
                          </p>
                          
                          {place.phone && (
                            <p className="text-xs text-gray-400 mt-1"
                            >{place.phone}</p>
                          )}
                        </div>

                        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        >
                          <Plus className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
