'use client'

import { useState, useCallback, useEffect } from 'react'

export interface DateRange {
  start: string | null
  end: string | null
}

interface DateNote {
  content: string
  date: string
}

// Module-level store — persists across remounts
const store = {
  monthlyNotes: {} as Record<string, string>,
  dateNotes: {} as Record<string, DateNote>,
  dateRange: { start: null, end: null } as DateRange,
  selectedDate: null as Date | null,
  listeners: new Set<() => void>(),
  notify() {
    this.listeners.forEach(fn => fn())
  }
}

export function useCalendarData() {
  const [, rerender] = useState(0)

  // Subscribe/unsubscribe properly so each mounted instance gets notified
  useEffect(() => {
    const fn = () => rerender(n => n + 1)
    store.listeners.add(fn)
    return () => { store.listeners.delete(fn) }
  }, [])

  const getMonthlyNote = useCallback((monthKey: string) =>
    store.monthlyNotes[monthKey] || '', [])

  const setMonthlyNote = useCallback((monthKey: string, content: string) => {
    store.monthlyNotes[monthKey] = content
    store.notify()
  }, [])

  const addDateNote = useCallback((dateStr: string, content: string) => {
    store.dateNotes[dateStr] = { content, date: dateStr }
    store.notify()
  }, [])

  const removeDateNote = useCallback((dateStr: string) => {
    delete store.dateNotes[dateStr]
    store.notify()
  }, [])

  const getDateNote = useCallback((dateStr: string) =>
    store.dateNotes[dateStr] || null, [])

  const setDateRange = useCallback((range: DateRange) => {
    store.dateRange = range
    store.notify()
  }, [])

  const setSelectedDate = useCallback((date: Date | null) => {
    store.selectedDate = date
    store.notify()
  }, [])

  return {
    getMonthlyNote,
    setMonthlyNote,
    addDateNote,
    removeDateNote,
    getDateNote,
    dateRange: store.dateRange,
    setDateRange,
    selectedDate: store.selectedDate,
    setSelectedDate,
  }
}
