'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trip } from '@/types'
import { MapPin, Calendar, Navigation, Save, X } from 'lucide-react'

interface TripEditDialogProps {
  isOpen: boolean
  onClose: () => void
  trip: Trip | null
  onSave: (trip: Trip) => Promise<void>
}

export function TripEditDialog({ isOpen, onClose, trip, onSave }: TripEditDialogProps) {
  const [title, setTitle] = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (trip) {
      setTitle(trip.title)
      setDestination(trip.destination)
      setStartDate(trip.start_date)
      setEndDate(trip.end_date)
      setError('')
    }
  }, [trip])

  const handleSave = async () => {
    if (!trip) return
    
    setError('')
    
    if (!title.trim()) {
      setError('여행 제목을 입력해주세요.')
      return
    }
    
    if (!destination.trim()) {
      setError('여행지를 입력해주세요.')
      return
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setError('종료일은 시작일보다 늦어야 합니다.')
      return
    }
    
    setLoading(true)
    
    try {
      await onSave({
        ...trip,
        title: title.trim(),
        destination: destination.trim(),
        start_date: startDate,
        end_date: endDate,
      })
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : '여행 수정에 실패했습니다.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <Navigation className="w-4 h-4 text-violet-600" />
            </div>
            여행 정보 수정
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-violet-500" />
              여행 제목
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 우리의 1000일 기념 제주도 여행"
              className="h-11 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500"
            />
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-violet-500" />
              여행지
            </label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="예: 제주도 서귀포시"
              className="h-11 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-500" />
                출발일
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  if (endDate && e.target.value > endDate) {
                    setEndDate(e.target.value)
                  }
                }}
                className="h-11 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-500" />
                도착일
              </label>
              <Input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-11 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl font-medium border-gray-200 hover:bg-gray-50"
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              취소
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-11 rounded-xl font-medium bg-violet-600 hover:bg-violet-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  저장 중...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
