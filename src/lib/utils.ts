import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 날짜를 한국어 형식으로 포맷팅
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    ...options
  }
  return new Date(dateString).toLocaleDateString('ko-KR', defaultOptions)
}

/**
 * 장소명/카테고리로 카테고리 스타일 반환
 */
export type CategoryStyle = {
  color: string
  label: string
  icon: 'cafe' | 'food' | 'hotel' | 'nature' | 'sight'
}

export function getCategoryStyle(placeName: string, categoryName?: string): CategoryStyle {
  const name = (categoryName || placeName).toLowerCase()
  
  if (name.includes('카페') || name.includes('커피')) {
    return { color: 'bg-amber-100 text-amber-700', label: '카페', icon: 'cafe' }
  }
  if (name.includes('식당') || name.includes('음식점') || name.includes('맛집') || name.includes('음식')) {
    return { color: 'bg-orange-100 text-orange-700', label: '맛집', icon: 'food' }
  }
  if (name.includes('호텔') || name.includes('펜션') || name.includes('숙소') || name.includes('숙박')) {
    return { color: 'bg-blue-100 text-blue-700', label: '숙소', icon: 'hotel' }
  }
  if (name.includes('공원') || name.includes('산') || name.includes('바다') || name.includes('해변')) {
    return { color: 'bg-green-100 text-green-700', label: '자연', icon: 'nature' }
  }
  return { color: 'bg-violet-100 text-violet-700', label: '관광', icon: 'sight' }
}

/**
 * D-day 계산
 */
export function calculateDday(startDate: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const diffTime = start.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'D-Day'
  if (diffDays < 0) return `D+${Math.abs(diffDays)}`
  return `D-${diffDays}`
}

/**
 * 여행 상태 계산
 */
export function getTripStatus(startDate: string, endDate: string): 'upcoming' | 'ongoing' | 'past' {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)
  
  if (today < start) return 'upcoming'
  if (today > end) return 'past'
  return 'ongoing'
}

/**
 * 두 날짜 사이의 모든 날짜 배열 반환
 */
export function getDatesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const current = new Date(startDate)
  const end = new Date(endDate)
  
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}

/**
 * 여행 기간 일수 계산
 */
export function getTripDuration(startDate: string, endDate: string): number {
  return Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1
}
