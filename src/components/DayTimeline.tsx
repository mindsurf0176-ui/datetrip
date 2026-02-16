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
import { GripVertical, MapPin, Clock, Trash2, StickyNote, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScheduleItem } from '@/types'
import { motion } from 'framer-motion'

interface SortableScheduleItemProps {
  item: ScheduleItem
  onDelete: (id: string) => void
  onEdit: (item: ScheduleItem) => void
  index: number
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50 shadow-2xl' : ''}`}
    >
      <div className={`
        bg-glass rounded-3xl p-5 border border-white shadow-xl shadow-rose-100/30 transition-all duration-300
        ${isDragging ? 'scale-105 border-rose-300 ring-4 ring-rose-100' : 'hover:-translate-y-1 hover:shadow-rose-200/40'}
      `}>
        <div className="flex items-start gap-4">
          <button
            {...attributes}
            {...listeners}
            className="mt-1 p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-grab active:cursor-grabbing shrink-0"
          >
            <GripVertical className="w-5 h-5" />
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-rose-100 text-rose-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0">
                {index + 1}
              </span>
              <h4 className="font-black text-lg text-foreground truncate group-hover:text-rose-600 transition-colors">
                {item.place_name}
              </h4>
            </div>
            
            <div className="space-y-1 ml-9">
              {item.place_address && (
                <p className="text-sm text-muted-foreground font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{item.place_address}</span>
                </p>
              )}
              
              {item.visit_time && (
                <p className="text-sm text-rose-500 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  {item.visit_time.slice(0, 5)}
                </p>
              )}
              
              {item.memo && (
                <div className="mt-3 bg-rose-50/50 backdrop-blur-sm p-3 rounded-2xl border border-rose-100 flex items-start gap-2">
                  <StickyNote className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-rose-600/80 font-medium italic">
                    &ldquo;{item.memo}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-xl w-10 h-10 p-0"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-xl w-10 h-10 p-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Connector line for list items */}
      <div className="absolute left-[34px] -bottom-4 w-0.5 h-4 bg-rose-100 hidden group-last:hidden" />
    </div>
  )
}

interface DayTimelineProps {
  date: string
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
    <div className="space-y-4">
      {items.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-glass rounded-[2rem] border-2 border-dashed border-rose-100 p-10 text-center"
        >
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PlusIcon />
          </div>
          <p className="text-muted-foreground font-bold">아직 일정이 없어요. 장소를 추가해 보세요!</p>
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
            <div className="space-y-4 pb-4">
              {items.map((item, index) => (
                <SortableScheduleItem
                  key={item.id}
                  item={item}
                  onDelete={onDelete}
                  onEdit={onEdit || (() => {})}
                  index={index}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function PlusIcon() {
  return (
    <svg className="w-8 h-8 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
    </svg>
  )
}
