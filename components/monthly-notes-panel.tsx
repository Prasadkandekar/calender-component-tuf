'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useCalendarData } from '@/hooks/use-calendar-data'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { X } from 'lucide-react'

interface MonthlyNotesPanelProps {
  currentDate: Date
  isOpen: boolean
  onClose: () => void
}

export function MonthlyNotesPanel({ currentDate, isOpen, onClose }: MonthlyNotesPanelProps) {
  const { getMonthlyNote, setMonthlyNote } = useCalendarData()
  const [content, setContent] = useState('')

  const monthKey = format(currentDate, 'yyyy-MM')

  useEffect(() => {
    if (isOpen) {
      setContent(getMonthlyNote(monthKey))
    }
  }, [isOpen, monthKey, getMonthlyNote])

  const handleSave = () => {
    setMonthlyNote(monthKey, content)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Card className="w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Notes for {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add monthly notes here..."
          className="mb-4 resize-none h-32"
        />

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Save
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
          >
            Close
          </Button>
        </div>
      </Card>
    </div>
  )
}
