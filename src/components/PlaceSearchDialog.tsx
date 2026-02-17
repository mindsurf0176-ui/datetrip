'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, MapPin, Plus, Utensils, Coffee, Camera, Bed, Store } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCategoryStyle } from '@/lib/utils'

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

// Kakao API category_name 기반 필터링 패턴
const categoryPatterns: Record<CategoryType, RegExp[]> = {
  all: [],
  food: [
    /음식점/,
    /한식|중식|일식|양식|분식|패스트푸드/,
    /치킨|피자|햄버거|국밥|삼겹살|고기|해산물|초밥|라멘|파스타/,
  ],
  cafe: [
    /카페/,
    /커피/,
    /디저트/,
    /베이커리/,
    /빙수|아이스크림/,
  ],
  sight: [
    /관광/,
    /명소/,
    /문화시설/,
    /공원/,
    /박물관|미술관|전시/,
    /테마파크|놀이공원/,
    /해수욕장|바다|해변/,
  ],
  stay: [
    /숙박/,
    /호텔/,
    /모텔/,
    /펜션/,
    /리조트/,
    /게스트하우스/,
    /민박/,
  ],
}

// category_name을 기반으로 카테고리 타입 확인
function matchesCategory(categoryName: string, category: CategoryType): boolean {
  if (category === 'all') return true
  const patterns = categoryPatterns[category]
  return patterns.some(pattern => pattern.test(categoryName))
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
    category?: string
  }) => void
}

export function PlaceSearchDialog({ isOpen, onClose, onSelect }: PlaceSearchDialogProps) {
  const [query, setQuery] = useState('')
  const [allResults, setAllResults] = useState<KakaoPlace[]>([]) // 원본 결과
  const [isLoading, setIsLoading] = useState(false)
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false)
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all')
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // category_name 기반 실제 필터링
  const filteredResults = useMemo(() => {
    if (activeCategory === 'all') return allResults
    return allResults.filter(place => matchesCategory(place.category_name, activeCategory))
  }, [allResults, activeCategory])

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
      setAllResults([])
      setActiveCategory('all')
    }
  }, [isOpen])

  const searchPlaces = useCallback(() => {
    if (!query.trim() || !isKakaoLoaded) return

    setIsLoading(true)
    const ps = new window.kakao.maps.services.Places()
    
    // 순수 키워드로 검색, 필터링은 category_name 기반으로 클라이언트에서 처리
    ps.keywordSearch(query, (data: KakaoPlace[], status: string) => {
      setIsLoading(false)
      if (status === window.kakao.maps.services.Status.OK) {
        setAllResults(data)
      } else {
        setAllResults([])
      }
    })
  }, [query, isKakaoLoaded])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      searchPlaces()
    }
  }

  // 입력 시 자동 검색 (디바운싱) - 카테고리 변경은 클라이언트 필터링이므로 재검색 불필요
  useEffect(() => {
    if (!query.trim() || !isKakaoLoaded) return
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    debounceTimerRef.current = setTimeout(() => {
      searchPlaces()
    }, 500)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query, isKakaoLoaded, searchPlaces])

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
    setAllResults([])
    onClose()
  }

  const getCategoryFromPlace = (place: KakaoPlace) => {
    return getCategoryStyle(place.place_name, place.category_name)
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

          {/* Category Tabs - 클라이언트 필터링이므로 재검색 불필요 */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
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
            ) : filteredResults.length === 0 ? (
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
                  {!query ? '장소 이름을 입력하고 검색하세요' 
                    : activeCategory !== 'all' && allResults.length > 0 
                      ? `'${categories.find(c => c.id === activeCategory)?.label}' 카테고리에 해당하는 결과가 없습니다`
                      : '검색 결과가 없습니다'}
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
                <p className="text-sm text-gray-500 mb-3">
                  {filteredResults.length}개의 결과
                  {activeCategory !== 'all' && allResults.length !== filteredResults.length && (
                    <span className="text-gray-400"> (전체 {allResults.length}개 중)</span>
                  )}
                </p>
                
                {filteredResults.map((place, idx) => {
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
