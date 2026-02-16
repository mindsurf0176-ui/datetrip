'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MapPin, Clock, Trash2, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScheduleItem } from '@/types'

interface SortableScheduleItemProps {
  item: ScheduleItem
  onDelete: (id: string) => void
}

function SortableScheduleItem({ item, onDelete }: SortableScheduleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </button>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{item.place_name}</h4>
          
          {item.place_address && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{item.place_address}</span>
            </p>
          )}
          
          {item.visit_time && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 flex-shrink-0" />
              {item.visit_time.slice(0, 5)}
            </p>
          )}
          
          {item.memo && (
            <p className="text-sm text-gray-400 flex items-center gap-1 mt-2 bg-gray-50 p-2 rounded">
              <StickyNote className="w-3 h-3 flex-shrink-0" />
              {item.memo}
            </p>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item.id)}
          className="text-gray-400 hover:text-red-600 flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

interface DayTimelineProps {
  date: string
  items: ScheduleItem[]
  onReorder: (items: ScheduleItem[]) => void
  onDelete: (id: string) => void
}

export function DayTimeline({ date, items, onReorder, onDelete }: DayTimelineProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      const newItems = arrayMove(items, oldIndex, newIndex)
      
      // order_index 업데이트
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        order_index: index,
      }))
      
      onReorder(updatedItems)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return {
      month: date.getMonth() + 1,
      day: date.getDate(),
      weekday: days[date.getDay()],
    }
  }

  const { month, day, weekday } = formatDate(date)

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-rose-600 text-white rounded-lg px-3 py-2 text-center min-w-[60px]">
          <div className="text-xs opacity-90">{month}월</div>
          <div className="text-xl font-bold">{day}</div>
        </div>
        <div>
          <span className="text-lg font-medium text-gray-900">{weekday}요일</span>
          <span className="text-sm text-gray-500 ml-2">({items.length}개 장소)</span>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-gray-400 py-8 text-sm">
          아직 추가된 장소가 없습니다
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {items.map((item) => (
                <SortableScheduleItem
                  key={item.id}
                  item={item}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
