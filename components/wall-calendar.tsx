'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import { PageFlip3D, PageFlip3DHandle } from './page-flip-3d'
import { CalendarMonth } from './calendar-month'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCalendarData } from '@/hooks/use-calendar-data'

function CalendarLayout({ currentDate, setCurrentDate, isFlipping = false, capturedDate = null, isBackPage = false, onNotesPanelPointerDown }: any) {
  const { getMonthlyNote, setMonthlyNote } = useCalendarData()
  const displayDate = (isFlipping && capturedDate && !isBackPage) ? capturedDate : currentDate
  const monthKey = format(displayDate, 'yyyy-MM')
  
  const monthQuotes = [
    "Every day is a fresh start.",
    "Make today amazing.",
    "Small steps every day.",
    "Keep moving forward.",
    "The best is yet to come.",
    "Dream big, work hard.",
    "Focus on the good.",
    "Enjoy the little things.",
    "Believe you can.",
    "Create your own sunshine.",
    "Stay positive, work hard.",
    "Do what you love."
  ]
  const quote = monthQuotes[displayDate.getMonth()]

  return (
    <div className={`w-full h-full relative pt-10 px-4 md:px-8 pb-4 md:pb-6 bg-[#fdfbf7] flex flex-col items-stretch`}>
      
      <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 mt-2 mb-2 md:mb-4 h-full overflow-hidden">
        
        {/* Calendar Grid (Left/Top) */}
        <div 
          className="flex-[2] md:flex-[2.5] bg-white shadow border border-gray-200 no-drag rounded relative overflow-hidden flex flex-col min-h-[300px] cursor-default"
        >
          <CalendarMonth currentDate={currentDate} onNoteAdded={() => {}} onDateChange={setCurrentDate} />
        </div>
        
        {/* Notes (Right/Bottom) */}
        <div 
          className="flex-1 flex flex-col bg-yellow-50/80 shadow-sm border border-yellow-200 rounded p-4 relative overflow-hidden min-h-[150px] cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          onPointerDown={onNotesPanelPointerDown}
        >
          <div className="absolute top-0 right-0 left-0 h-4 bg-yellow-200/40 border-b border-yellow-200/60 flex justify-evenly items-center pt-1 px-4 select-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-2 mx-auto h-2 rounded-full bg-white shadow-inner opacity-60"></div>
            ))}
          </div>
          <h3 className="text-yellow-800 font-bold mb-2 mt-2 font-serif text-center md:text-left select-none pointer-events-none">Monthly Goals</h3>
          <textarea 
            className="flex-1 bg-transparent resize-none outline-none text-yellow-900 text-sm leading-6 selection:bg-yellow-200/50 no-drag"
            style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, rgba(251, 191, 36, 0.3) 24px)', lineHeight: '24px' }}
            placeholder="Write here..."
            value={getMonthlyNote(monthKey)}
            onChange={(e) => setMonthlyNote(monthKey, e.target.value)}
            disabled={isBackPage || isFlipping}
          />
        </div>
        
      </div>
      
      {/* Quote (Bottom) */}
      <div className="text-center font-serif text-gray-500 italic text-xs md:text-sm mt-auto tracking-wide shrink-0 select-none pointer-events-none">
        "{quote}"
      </div>
      
    </div>
  )
}

export function WallCalendar() {
  const [mounted, setMounted] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [capturedDate, setCapturedDate] = useState(new Date())
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward'>('forward')
  const scrollYRef = useRef(0)
  const lastFlipRef = useRef(0)
  const pageFlipRef = useRef<PageFlip3DHandle>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle scroll-triggered page flip
  useEffect(() => {
    const handleScroll = () => {
      if (!mounted || isFlipping) return
      
      const now = Date.now()
      if (now - lastFlipRef.current < 800) return

      const scrollDelta = window.scrollY - scrollYRef.current

      if (scrollDelta > 50) {
        flipMonth('forward')
        lastFlipRef.current = now
      } else if (scrollDelta < -50) {
        flipMonth('backward')
        lastFlipRef.current = now
      }

      scrollYRef.current = window.scrollY
    }

    window.addEventListener('wheel', handleScroll, { passive: true })
    return () => window.removeEventListener('wheel', handleScroll)
  }, [isFlipping, mounted])

  const flipMonth = useCallback((direction: 'forward' | 'backward') => {
    if (isFlipping) return
    setCapturedDate(currentDate)
    setIsFlipping(true)
    setFlipDirection(direction)
  }, [isFlipping, currentDate])

  const handleHalfwaySwap = useCallback(() => {
    setCurrentDate(prev =>
      flipDirection === 'forward' ? addMonths(prev, 1) : subMonths(prev, 1)
    )
  }, [flipDirection])

  const handleFlipComplete = useCallback(() => {
    setIsFlipping(false)
  }, [])

  // Drag is only allowed from the notes panel and nav buttons.
  // pointermove/pointerup are attached to the document so they work globally once drag starts.
  const isDragActive = useRef(false)

  const forwardPointerDown = useCallback((e: React.PointerEvent) => {
    pageFlipRef.current?.handlePointerDown(e)
    isDragActive.current = true
  }, [])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!isDragActive.current) return
      pageFlipRef.current?.handlePointerMove(e as unknown as React.PointerEvent)
    }
    const onUp = (e: PointerEvent) => {
      if (!isDragActive.current) return
      isDragActive.current = false
      pageFlipRef.current?.handlePointerUp(e as unknown as React.PointerEvent)
    }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
    document.addEventListener('pointercancel', onUp)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointercancel', onUp)
    }
  }, [])

  if (!mounted) return <div className="min-h-screen bg-gray-100" />

  return (
    <div 
      className="min-h-screen bg-stone-200 flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Wall Texture / Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stucco.png')] opacity-40 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Hanging Nail and Thread */}
        <div className="relative flex flex-col items-center mb-12">
          {/* Nail head */}
          <div className="w-4 h-4 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full shadow-[0px_3px_5px_rgba(0,0,0,0.5)] z-20 absolute -top-8"></div>
          
          {/* Thread */}
          <svg className="absolute -top-8 w-[240px] h-[80px]" style={{ zIndex: 10 }}>
            <path d="M120 4 L10 80" stroke="#78716c" strokeWidth="2" fill="none" className="opacity-80 drop-shadow-md" />
            <path d="M120 4 L230 80" stroke="#78716c" strokeWidth="2" fill="none" className="opacity-80 drop-shadow-md" />
          </svg>
        </div>

        {/* Calendar frame */}
        <div
          className="relative wall-mounted-frame shadow-[0_15px_35px_rgba(0,0,0,0.2)] bg-white rounded-none w-[95vw] max-w-[800px] h-[85vh] min-h-[550px] max-h-[800px]"
        >
          {/* Spiral binding and Holes */}
          <div className="absolute -top-3 left-0 right-0 h-6 z-40 flex items-center justify-between px-8 pointer-events-none">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="relative flex flex-col items-center">
                {/* 3D Metal Spiral */}
                <div className="w-2 h-8 sm:w-2.5 sm:h-8 bg-gradient-to-r from-gray-400 via-gray-100 to-gray-500 rounded-full shadow-md border border-gray-400/50 -translate-y-1"></div>
                {/* Hole punch */}
                <div className="absolute bottom-1 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-gray-900 rounded-full shadow-inner opacity-90 z-[-1]"></div>
              </div>
            ))}
          </div>

          {/* Back stack pages (sharp corners) */}
          <div className="absolute inset-0 bg-white shadow-2xl translate-y-1 z-0 rounded-none border-b border-gray-200"></div>
          <div className="absolute inset-0 bg-white shadow-lg translate-y-2 z-0 border-b border-gray-100 rounded-none"></div>

          {/* Main flip container */}
          <PageFlip3D
            ref={pageFlipRef}
            isFlipping={isFlipping}
            onFlipComplete={handleFlipComplete}
            onHalfway={handleHalfwaySwap}
            direction={flipDirection}
            onDragRequestFlip={flipMonth}
            frontPage={
              <CalendarLayout 
                currentDate={currentDate} 
                setCurrentDate={setCurrentDate} 
                isFlipping={isFlipping} 
                capturedDate={capturedDate}
                onNotesPanelPointerDown={forwardPointerDown}
              />
            }
            backPage={
              <CalendarLayout 
                currentDate={flipDirection === 'forward' ? addMonths(capturedDate, 1) : subMonths(capturedDate, 1)} 
                setCurrentDate={() => {}} 
                isBackPage={true}
              />
            }
          />
        </div>

        {/* Desktop Navigation Buttons (Right Side) */}
        <div 
          className="hidden md:flex absolute right-[-80px] top-1/2 -translate-y-1/2 flex-col gap-6 z-50"
          onPointerDown={forwardPointerDown}
        >
          <button
            onClick={() => flipMonth('backward')}
            className="w-14 h-14 bg-white/90 backdrop-blur rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-amber-600 hover:scale-110 active:scale-95 transition-all group"
            title="Prevous Month"
          >
            <ChevronLeft className="w-8 h-8 rotate-90 group-hover:-translate-y-1 transition-transform" />
          </button>
          <button
            onClick={() => flipMonth('forward')}
            className="w-14 h-14 bg-white/90 backdrop-blur rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-amber-600 hover:scale-110 active:scale-95 transition-all group"
            title="Next Month"
          >
            <ChevronRight className="w-8 h-8 rotate-90 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}
