'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CalendarProps {
  selectedDate?: string
  onSelectDate: (date: string) => void
  highlightDates?: string[]
  startDate?: string
  endDate?: string
}

export function Calendar({ 
  selectedDate, 
  onSelectDate, 
  highlightDates = [],
  startDate,
  endDate 
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) return new Date(selectedDate)
    if (startDate) return new Date(startDate)
    return new Date()
  })

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const isSelected = (day: number) => {
    return selectedDate === formatDate(day)
  }

  const isHighlighted = (day: number) => {
    return highlightDates.includes(formatDate(day))
  }

  const isInTripRange = (day: number) => {
    if (!startDate || !endDate) return false
    const date = formatDate(day)
    return date >= startDate && date <= endDate
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  return (
    <div className="bg-glass rounded-[2rem] p-6 border border-white shadow-xl shadow-rose-100/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={prevMonth}
          className="text-rose-500 hover:bg-rose-50 rounded-xl w-10 h-10 p-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h3 className="text-xl font-black text-foreground">
          {year}년 {month + 1}월
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={nextMonth}
          className="text-rose-500 hover:bg-rose-50 rounded-xl w-10 h-10 p-0"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-bold text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-12" />
          }

          const selected = isSelected(day)
          const highlighted = isHighlighted(day)
          const inRange = isInTripRange(day)
          const today = isToday(day)

          return (
            <button
              key={day}
              onClick={() => onSelectDate(formatDate(day))}
              className={`
                h-12 rounded-xl font-bold text-sm transition-all relative
                ${selected 
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 scale-105' 
                  : highlighted
                    ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                    : inRange
                      ? 'bg-rose-50/50 text-foreground hover:bg-rose-100'
                      : 'text-foreground hover:bg-gray-100'
                }
                ${today && !selected ? 'ring-2 ring-rose-300 ring-offset-2' : ''}
              `}
            >
              {day}
              {highlighted && !selected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-rose-100">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="text-xs font-semibold text-muted-foreground">선택</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-300" />
          <span className="text-xs font-semibold text-muted-foreground">일정 있음</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-50 border border-rose-200" />
          <span className="text-xs font-semibold text-muted-foreground">여행 기간</span>
        </div>
      </div>
    </div>
  )
}
