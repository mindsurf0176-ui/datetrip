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
