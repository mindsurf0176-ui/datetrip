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
import { GripVertical, MapPin, Clock, Trash2, StickyNote, Edit2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScheduleItem } from '@/types'
import { motion } from 'framer-motion'

interface SortableScheduleItemProps {
  item: ScheduleItem
  onDelete: (id: string) => void
  onEdit: (item: ScheduleItem) => void
  index: number
}

// Category icons and colors
const getCategoryStyle = (placeName: string) => {
  const name = placeName.toLowerCase()
  if (name.includes('카페') || name.includes('커피')) {
    return { color: 'bg-amber-100 text-amber-700', label: '카페', icon: 'cafe' }
  }
  if (name.includes('식당') || name.includes('음식점') || name.includes('맛집')) {
    return { color: 'bg-orange-100 text-orange-700', label: '맛집', icon: 'food' }
  }
  if (name.includes('호텔') || name.includes('펜션') || name.includes('숙소')) {
    return { color: 'bg-blue-100 text-blue-700', label: '숙소', icon: 'hotel' }
  }
  if (name.includes('공원') || name.includes('산') || name.includes('바다') || name.includes('해변')) {
    return { color: 'bg-green-100 text-green-700', label: '자연', icon: 'nature' }
  }
  return { color: 'bg-violet-100 text-violet-700', label: '관광', icon: 'sight' }
}

function SortableScheduleItem({ item, onDelete, onEdit, index }: SortableScheduleItemProps) {
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
    zIndex: isDragging ? 50 : 0,
  }

  const category = getCategoryStyle(item.place_name)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <div className={`
        bg-white rounded-2xl p-4 border border-gray-100 shadow-sm transition-all duration-200
        ${isDragging ? 'shadow-xl scale-[1.02] ring-2 ring-violet-500' : 'hover:shadow-md'}
      `}>
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            aria-label="드래그하여 순서 변경"
            className="mt-1 p-2 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-xl transition-colors cursor-grab active:cursor-grabbing shrink-0 touch-manipulation"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          
          {/* Number Badge */}
          <div className="w-8 h-8 gradient-violet rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">
            {index + 1}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${category.color}`}>
                    {category.label}
                  </span>
                  <h4 className="font-bold text-gray-900 truncate">
                    {item.place_name}
                  </h4>
                </div>
                
                {item.place_address && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{item.place_address}</span>
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(item)}
                  aria-label={`${item.place_name} 수정`}
                  className="w-8 h-8 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(item.id)}
                  aria-label={`${item.place_name} 삭제`}
                  className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Time & Memo */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {item.visit_time && (
                <div className="flex items-center gap-1.5 text-sm text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-medium">{item.visit_time.slice(0, 5)}</span>
                </div>
              )}
              
              {item.memo && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg"
                >
                  <StickyNote className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate max-w-[200px]">{item.memo}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Connector Line */}
      <div className="absolute left-[26px] -bottom-3 w-0.5 h-3 bg-gray-200" />
    </div>
  )
}

interface DayTimelineProps {
  items: ScheduleItem[]
  onReorder: (items: ScheduleItem[]) => void
  onDelete: (id: string) => void
  onEdit?: (item: ScheduleItem) => void
}

export function DayTimeline({ items, onReorder, onDelete, onEdit }: DayTimelineProps) {
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
      
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        order_index: index,
      }))
      
      onReorder(updatedItems)
    }
  }

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">아직 일정이 없어요</p>
          <p className="text-sm text-gray-400 mt-1">장소를 추가하세요</p>
        </motion.div>
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
              {items.map((item, index) => (
                <div key={item.id} className="group"
                >
                  <SortableScheduleItem
                    item={item}
                    onDelete={onDelete}
                    onEdit={onEdit || (() => {})}
                    index={index}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
