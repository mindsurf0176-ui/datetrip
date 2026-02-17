'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gray-200',
        className
      )}
    />
  )
}

export function TripCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <Skeleton className="h-40 rounded-none" />
      
      {/* Content */}
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-48" />
        </div>
        
        <Skeleton className="h-4 w-36" />
        
        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

export function ScheduleItemSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
        <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
        
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-4 w-48" />
          </div>
          
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
        </div>
        
        <div className="flex gap-1">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function MapSkeleton({ height = '400px' }: { height?: string }) {
  return (
    <div 
      style={{ height }}
      className="bg-gray-100 rounded-2xl flex flex-col items-center justify-center gap-3"
    >
      <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">지도를 불러오는 중...</p>
    </div>
  )
}

export function HomePageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Search Header Skeleton */}
      <Skeleton className="h-12 w-full max-w-2xl rounded-xl" />
      
      {/* Trip Cards Skeleton */}
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100">
            <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-16" />
          </div>
        ))}
      </div>
      
      {/* Destinations Skeleton */}
      <div className="flex gap-4 overflow-x-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0 w-40">
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <Skeleton className="h-28 rounded-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
