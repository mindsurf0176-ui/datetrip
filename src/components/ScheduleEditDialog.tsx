'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScheduleItem } from '@/types'
import { Clock, MapPin, FileText, Save, X } from 'lucide-react'

interface ScheduleEditDialogProps {
  isOpen: boolean
  onClose: () => void
  item: ScheduleItem | null
  onSave: (item: ScheduleItem) => void
}

export function ScheduleEditDialog({ isOpen, onClose, item, onSave }: ScheduleEditDialogProps) {
  const [placeName, setPlaceName] = useState('')
  const [visitTime, setVisitTime] = useState('')
  const [memo, setMemo] = useState('')

  useEffect(() => {
    if (item) {
      setPlaceName(item.place_name)
      setVisitTime(item.visit_time || '')
      setMemo(item.memo || '')
    }
  }, [item])

  const handleSave = () => {
    if (!item) return
    
    onSave({
      ...item,
      place_name: placeName,
      visit_time: visitTime || undefined,
      memo: memo || undefined,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100"
        >
          <DialogTitle className="text-lg font-bold flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center"
            >
              <MapPin className="w-4 h-4 text-violet-600" />
            </div>
            일정 수정
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5"
        >
          {/* Place Name */}
          <div className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-500 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-violet-500" />
              장소명
            </label>
            <Input
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="장소 이름"
              className="h-11 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500"
            />
          </div>

          {/* Visit Time */}
          <div className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-500 flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-violet-500" />
              방문 시간
            </label>
            <Input
              type="time"
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
              className="h-11 rounded-xl border-gray-200 focus:border-violet-500 focus:ring-violet-500"
            />
          </div>

          {/* Memo */}
          <div className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-500 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-violet-500" />
              메모
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모를 입력하세요"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none resize-none text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2"
          >
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl font-medium border-gray-200 hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" />
              취소
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-11 rounded-xl font-medium bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
