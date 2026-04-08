'use client'

import { useState, ReactNode } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface DateSelectorProps {
  date: Date
  onChange: (date: Date) => void
  children?: ReactNode
}

export function DateSelector({ date, onChange, children }: DateSelectorProps) {
  const [showSelector, setShowSelector] = useState(false)
  const [tempDate, setTempDate] = useState(date)
  
  const [yearStr, setYearStr] = useState(date.getFullYear().toString())
  const [dayStr, setDayStr] = useState(date.getDate().toString())

  const currentYear = tempDate.getFullYear()
  const currentMonth = tempDate.getMonth()

  const handleYearChange = (delta: number) => {
    const newDate = new Date(tempDate)
    newDate.setFullYear(newDate.getFullYear() + delta)
    setTempDate(newDate)
    setYearStr(newDate.getFullYear().toString())
  }

  const handleMonthChange = (delta: number) => {
    const newDate = new Date(tempDate)
    newDate.setMonth(newDate.getMonth() + delta)
    setTempDate(newDate)
  }

  const handleDateChange = (delta: number) => {
    const newDate = new Date(tempDate)
    newDate.setDate(newDate.getDate() + delta)
    setTempDate(newDate)
    setDayStr(newDate.getDate().toString())
  }

  const handleApply = () => {
    onChange(tempDate)
    setShowSelector(false)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="relative">
      {!showSelector ? (
        children ? (
          <div onClick={() => setShowSelector(true)} className="cursor-pointer">
            {children}
          </div>
        ) : (
          <button
            onClick={() => setShowSelector(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all text-sm"
          >
            📅 {monthNames[currentMonth]} {currentYear}
          </button>
        )
      ) : (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center no-drag" 
          onClick={() => setShowSelector(false)}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl p-6 border-2 border-amber-200 select-none" 
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">Select Date</h3>

            {/* Year Selector */}
            <div className="flex flex-col items-center gap-3 mb-6 pb-6 border-b">
              <label className="text-sm font-semibold text-gray-600">Year</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleYearChange(-1)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                </button>
                <input
                  type="text"
                  value={yearStr}
                  onChange={(e) => {
                    setYearStr(e.target.value)
                    const parsed = parseInt(e.target.value)
                    if (!isNaN(parsed) && parsed > 0) {
                      const newDate = new Date(tempDate)
                      newDate.setFullYear(parsed)
                      setTempDate(newDate)
                    }
                  }}
                  className="text-2xl font-bold text-gray-800 w-24 text-center bg-gray-50 focus:bg-white border focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 rounded-lg select-text py-1"
                />
                <button
                  onClick={() => handleYearChange(1)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Month Selector */}
            <div className="flex flex-col items-center gap-3 mb-6 pb-6 border-b">
              <label className="text-sm font-semibold text-gray-600">Month</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleMonthChange(-1)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                </button>
                <select
                  value={currentMonth}
                  onChange={(e) => {
                    const newDate = new Date(tempDate)
                    newDate.setMonth(parseInt(e.target.value))
                    setTempDate(newDate)
                  }}
                  className="text-2xl font-bold text-gray-800 w-48 text-center bg-gray-50 focus:bg-white border focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 rounded-lg select-text py-1 appearance-none cursor-pointer"
                  style={{ textAlignLast: 'center' }}
                >
                  {monthNames.map((name, index) => (
                    <option key={name} value={index}>{name}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleMonthChange(1)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Date Selector */}
            <div className="flex flex-col items-center gap-3 mb-6">
              <label className="text-sm font-semibold text-gray-600">Day</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleDateChange(-1)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                </button>
                <input
                  type="text"
                  value={dayStr}
                  onChange={(e) => {
                    setDayStr(e.target.value)
                    const parsed = parseInt(e.target.value)
                    if (!isNaN(parsed) && parsed > 0 && parsed <= 31) {
                      const newDate = new Date(tempDate)
                      newDate.setDate(parsed)
                      setTempDate(newDate)
                    }
                  }}
                  className="text-2xl font-bold text-gray-800 w-20 text-center bg-gray-50 focus:bg-white border focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 rounded-lg select-text py-1"
                />
                <button
                  onClick={() => handleDateChange(1)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSelector(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
