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
