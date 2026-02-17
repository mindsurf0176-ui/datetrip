'use client'

import { useRef, useCallback } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

interface SwipeReturn {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
}

/**
 * 터치 스와이프 감지 훅 (모바일 UX)
 * 최소 스와이프 거리: 50px
 */
export function useSwipe({ onSwipeLeft, onSwipeRight }: SwipeHandlers): SwipeReturn {
  const touchStartX = useRef<number | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return

    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX
    const minSwipeDistance = 50

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // 왼쪽으로 스와이프 = 다음
        onSwipeLeft?.()
      } else {
        // 오른쪽으로 스와이프 = 이전
        onSwipeRight?.()
      }
    }

    touchStartX.current = null
  }, [onSwipeLeft, onSwipeRight])

  return { onTouchStart, onTouchEnd }
}
