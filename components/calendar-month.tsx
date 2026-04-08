'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays } from 'date-fns'
import { useCalendarData, DateRange } from '@/hooks/use-calendar-data'
import { getHeaderImageForMonth } from '@/lib/calendar-utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { X, NotebookPen } from 'lucide-react'
import { DateSelector } from './date-selector'

interface CalendarMonthProps {
  currentDate: Date
  onNoteAdded: (date: string) => void
  onDateChange?: (date: Date) => void
}

export function CalendarMonth({ currentDate, onNoteAdded, onDateChange }: CalendarMonthProps) {
  const { addDateNote, removeDateNote, getDateNote, setDateRange, dateRange, selectedDate, setSelectedDate } = useCalendarData()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [localSelectedStr, setLocalSelectedStr] = useState<string | null>(
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
  )
  const containerRef = useRef<HTMLDivElement>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get days from previous and next months to fill the grid
  const firstDayOfWeek = monthStart.getDay()
  const prevMonthDays = Array.from({ length: firstDayOfWeek }, (_, i) =>
    addDays(monthStart, -(firstDayOfWeek - i))
  )

  const totalCells = 42 // 6 rows * 7 days
  const nextMonthDays = Array.from(
    { length: totalCells - prevMonthDays.length - days.length },
    (_, i) => addDays(monthEnd, i + 1)
  )

  const calendarDays = [...prevMonthDays, ...days, ...nextMonthDays]

  const handleDateSelect = (date: Date, e?: React.MouseEvent) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const isRangeMode = e?.shiftKey || false
    
    if (!isRangeMode) {
      setSelectedDate(date)
      setLocalSelectedStr(format(date, 'yyyy-MM-dd'))
      const note = getDateNote(dateStr)
      setNoteContent(note?.content || '')
      setIsSelecting(false)
      setIsModalOpen(true)
    } else {
      // Range selection mode
      if (!dateRange.start) {
        setDateRange({ start: dateStr, end: null })
      } else if (!dateRange.end) {
        const start = new Date(dateRange.start)
        const end = date
        if (end < start) {
          setDateRange({ start: dateStr, end: dateRange.start })
        } else {
          setDateRange({ start: dateRange.start, end: dateStr })
        }
      } else {
        // Reset and start new range
        setDateRange({ start: dateStr, end: null })
      }
    }
  }

  const handleSaveNote = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (noteContent.trim()) {
      addDateNote(dateStr, noteContent)
      onNoteAdded(dateStr)
    } else {
      removeDateNote(dateStr)
    }
  }

  const isDateInRange = (date: Date) => {
    if (!dateRange.start || !dateRange.end) return false
    const dateStr = format(date, 'yyyy-MM-dd')
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    const current = new Date(dateStr)
    return current >= start && current <= end
  }

  const isDateRangeStart = (date: Date) => {
    return dateRange.start === format(date, 'yyyy-MM-dd')
  }

  const isDateRangeEnd = (date: Date) => {
    return dateRange.end === format(date, 'yyyy-MM-dd')
  }

  return (
    <div className="w-full h-full flex bg-white overflow-hidden" ref={containerRef}
    >
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Header Image */}
        <div className="relative h-20 flex-shrink-0 overflow-hidden bg-gradient-to-r from-amber-100 to-orange-100">
          <img 
            src={getHeaderImageForMonth(currentDate.getMonth())}
            alt="Calendar header"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20"></div>
        </div>

        {/* Month Title */}
        <div 
          className="flex-shrink-0 px-4 py-2 text-center border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <DateSelector date={currentDate} onChange={(date) => {
            const str = format(date, 'yyyy-MM-dd')
            setLocalSelectedStr(str)
            setSelectedDate(date)
            if (onDateChange) onDateChange(date)
          }}>
            <h2 className="text-lg font-bold text-gray-800">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
          </DateSelector>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 border-t border-l border-gray-200 bg-white auto-rows-fr select-none">
          {/* Day headers */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <div key={`day-${idx}`} className="text-center font-bold text-gray-500 text-xs h-6 flex items-center justify-center border-r border-b border-gray-200 bg-gray-50">
              {day}
            </div>
          ))}

          {/* Calendar dates */}
          {calendarDays.map((date) => {
            const isCurrentMonth = isSameMonth(date, currentDate)
            const dateStr = format(date, 'yyyy-MM-dd')
            const hasNote = getDateNote(dateStr)
            const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
            const isSelected = localSelectedStr === dateStr
            const isToday = isSameDay(date, new Date())
            const isInRange = isDateInRange(date)
            const isRangeStart = isDateRangeStart(date)
            const isRangeEnd = isDateRangeEnd(date)

            return (
              <div
                key={dateStr}
                onClick={(e) => handleDateSelect(date, e as React.MouseEvent)}
                className={`
                  relative flex items-center justify-center cursor-default transition-all text-xs font-semibold group
                  border-r border-b border-gray-200
                  ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'text-gray-800 hover:bg-amber-50'}
                  ${isToday && !isSelected ? 'ring-2 ring-inset ring-amber-400' : ''}
                  ${isSelected ? '!bg-blue-500 !text-white shadow-inner' : ''}
                  ${isInRange && !isRangeStart && !isRangeEnd ? 'bg-blue-100' : ''}
                  ${isRangeStart ? '!bg-blue-600 !text-white' : ''}
                  ${isRangeEnd ? '!bg-blue-600 !text-white' : ''}
                `}
              >
                {format(date, 'd')}
                {hasNote && (
                  <>
                    <NotebookPen className={`absolute top-1 right-1 w-3 h-3 ${isSelected ? 'text-white/90' : 'text-green-500'}`} />
                    {/* Hover Tooltip/Preview */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-amber-50 border border-amber-200 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] text-[10px] text-amber-900 leading-tight">
                      <div className="line-clamp-3 italic">
                        {hasNote.content}
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-amber-200"></div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Note Editor Modal - rendered via portal to escape 3D transform stacking context */}
        {isModalOpen && selectedDate && createPortal(
          <div 
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" 
            onClick={() => setIsModalOpen(false)}
          >
            <div 
              className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-sm border border-gray-200 select-text" 
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-800">
                  Notes for {format(selectedDate, 'MMM dd, yyyy')}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    handleSaveNote(selectedDate)
                    setIsModalOpen(false)
                  }
                }}
                placeholder="What's on your mind?"
                className="mb-4 min-h-[120px] resize-none text-sm"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    handleSaveNote(selectedDate)
                    setIsModalOpen(false)
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  Save Note
                </Button>
                {getDateNote(format(selectedDate, 'yyyy-MM-dd')) && (
                  <Button
                    onClick={() => {
                      removeDateNote(format(selectedDate, 'yyyy-MM-dd'))
                      setNoteContent('')
                      setIsModalOpen(false)
                    }}
                    variant="outline"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  )
}
