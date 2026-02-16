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
      <DialogContent className="max-w-md rounded-[2rem] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <MapPin className="w-6 h-6 text-rose-500" />
            일정 수정
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Place Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              장소명
            </label>
            <Input
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="장소 이름"
              className="h-14 rounded-xl border-rose-100 focus:border-rose-300 font-bold"
            />
          </div>

          {/* Visit Time */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" />
              방문 시간
            </label>
            <Input
              type="time"
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
              className="h-14 rounded-xl border-rose-100 focus:border-rose-300 font-bold"
            />
          </div>

          {/* Memo */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-400" />
              메모
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모를 입력하세요"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-rose-100 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none resize-none font-medium"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-14 rounded-xl font-bold border-rose-200 hover:bg-rose-50"
            >
              <X className="w-4 h-4 mr-2" />
              취소
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 h-14 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white"
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
