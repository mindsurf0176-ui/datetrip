export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

export interface Couple {
  id: string
  user1_id: string
  user2_id: string
  invite_code: string
  created_at: string
}

export interface Trip {
  id: string
  couple_id: string
  title: string
  destination: string
  start_date: string
  end_date: string
  cover_image?: string
  created_at: string
  updated_at: string
}

export interface ScheduleItem {
  id: string
  trip_id: string
  place_name: string
  place_address?: string
  place_phone?: string
  latitude?: number
  longitude?: number
  visit_date: string
  visit_time?: string
  memo?: string
  order_index: number
  created_by: string
  created_at: string
}

export interface WishlistItem {
  id: string
  couple_id: string
  place_name: string
  place_address?: string
  place_phone?: string
  latitude?: number
  longitude?: number
  source_url?: string
  source_type?: 'instagram' | 'youtube' | 'other'
  liked_by: string[]
  created_by: string
  created_at: string
}

export interface Destination {
  id: string
  name: string
  description?: string
  image_url?: string
  rating: number
  tags: string[]
  is_active: boolean
  order_index: number
  created_at: string
}

export interface Course {
  id: string
  title: string
  author_name: string
  destination?: string
  days: number
  places_count: number
  likes_count: number
  image_url?: string
  is_featured: boolean
  created_at: string
}

// Kakao Maps Types
interface KakaoPlaceResult {
  id: string
  place_name: string
  address_name: string
  road_address_name: string
  phone: string
  x: string
  y: string
  category_name: string
}

interface KakaoMapsEvent {
  addListener: (target: unknown, type: string, handler: () => void) => void
}

declare global {
  interface Window {
    kakao: {
      maps: {
        services: {
          Places: new () => {
            keywordSearch: (
              keyword: string,
              callback: (data: KakaoPlaceResult[], status: string) => void
            ) => void
          }
          Status: {
            OK: string
            ZERO_RESULT: string
            ERROR: string
          }
        }
        event: KakaoMapsEvent
        LatLng: new (lat: number, lng: number) => unknown
        Map: new (container: HTMLElement, options: Record<string, unknown>) => unknown
        Marker: new (options: Record<string, unknown>) => unknown
      }
    }
  }
}
