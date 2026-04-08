'use client'

import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle, PointerEvent as ReactPointerEvent } from 'react'

interface PageFlip3DProps {
  frontPage: React.ReactNode
  backPage: React.ReactNode
  isFlipping: boolean
  onFlipComplete: () => void
  onHalfway?: () => void
  direction: 'forward' | 'backward'
  onDragRequestFlip?: (direction: 'forward' | 'backward') => void
  dragHandlers?: {
    onPointerDown: (e: React.PointerEvent) => void
    onPointerMove: (e: React.PointerEvent) => void
    onPointerUp: (e: React.PointerEvent) => void
    onPointerCancel: () => void
  }
}

export interface PageFlip3DHandle {
  handlePointerDown: (e: React.PointerEvent) => void
  handlePointerMove: (e: React.PointerEvent) => void
  handlePointerUp: (e: React.PointerEvent) => void
  handlePointerCancel: () => void
}

export const PageFlip3D = forwardRef<PageFlip3DHandle, PageFlip3DProps>(function PageFlip3D(
  { frontPage, backPage, isFlipping, onFlipComplete, onHalfway, direction, onDragRequestFlip, dragHandlers },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState(0)
  
  const rotRef = useRef(0)
  const snapAnimationRef = useRef<number>(0)
  const updateRotation = useCallback((r: number) => {
    rotRef.current = r
    setRotation(r)
  }, [])

  // Paper flip sound effect synthesizer
  const playFlipSound = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const bufferSize = ctx.sampleRate * 0.09; // very short sound
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // white noise
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 0.5;

      const envelope = ctx.createGain();
      envelope.gain.setValueAtTime(0, ctx.currentTime);
      envelope.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01);
      envelope.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      
      noise.connect(filter);
      filter.connect(envelope);
      envelope.connect(ctx.destination);
      
      noise.start();
    } catch (e) {
      // Ignore audio errors gracefully
    }
  }, [])
  
  // Dragging state
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startX = useRef(0)
  const isDragTriggered = useRef(false)
  const isFlippingRef = useRef(isFlipping)
  useEffect(() => { isFlippingRef.current = isFlipping }, [isFlipping])

  const handlePointerDown = useCallback((e: ReactPointerEvent) => {
    if (snapAnimationRef.current) cancelAnimationFrame(snapAnimationRef.current)
    if (isFlippingRef.current || (e.target as HTMLElement).closest('.no-drag')) return
    isDragging.current = true
    isDragTriggered.current = false
    startY.current = e.clientY
    startX.current = e.clientX
  }, [])

  const handlePointerMove = useCallback((e: ReactPointerEvent) => {
    if (!isDragging.current || isFlippingRef.current) return
    const deltaY = e.clientY - startY.current
    const deltaX = e.clientX - startX.current
    
    // Strict deadzone to separate taps from drags
    if (!isDragTriggered.current) {
        if (Math.abs(deltaX) > 20 || Math.abs(deltaY) > 20) {
            isDragTriggered.current = true
        } else {
            return
        }
    }
    
    // Check if movement is primarily horizontal or vertical
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY)
    
    let rot = 0
    if (!isHorizontal) {
       rot = (deltaY / 400) * 180 
    } else {
       rot = (deltaX / 300) * 30
    }
    
    if (rot > 0) rot = Math.min(rot, 180)
    else rot = Math.max(rot, -180)
    
    updateRotation(rot)
  }, [updateRotation])

  const snapBack = useCallback(() => {
     let rot = rotRef.current
     const animateBack = () => {
        rot *= 0.8
        if (Math.abs(rot) < 1) {
           updateRotation(0)
        } else {
           updateRotation(rot)
           snapAnimationRef.current = requestAnimationFrame(animateBack)
        }
     }
     if (snapAnimationRef.current) cancelAnimationFrame(snapAnimationRef.current)
     snapAnimationRef.current = requestAnimationFrame(animateBack)
  }, [updateRotation])

  const onDragRequestFlipRef = useRef(onDragRequestFlip)
  useEffect(() => { onDragRequestFlipRef.current = onDragRequestFlip }, [onDragRequestFlip])

  const handlePointerUp = useCallback((e: ReactPointerEvent) => {
    if (!isDragging.current) return
    isDragging.current = false

    if (!isDragTriggered.current) {
        return
    }

    const deltaY = e.clientY - startY.current
    const deltaX = e.clientX - startX.current
    
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY)
    
    if (isHorizontal) {
       if (deltaX < -50 && onDragRequestFlipRef.current) {
         onDragRequestFlipRef.current('forward')
       } else if (deltaX > 50 && onDragRequestFlipRef.current) {
         onDragRequestFlipRef.current('backward')
       } else {
         snapBack()
       }
    } else {
       if (deltaY < -50 && onDragRequestFlipRef.current) {
         onDragRequestFlipRef.current('forward')
       } else if (deltaY > 50 && onDragRequestFlipRef.current) {
         onDragRequestFlipRef.current('backward')
       } else {
         snapBack()
       }
    }
  }, [snapBack])

  const handlePointerCancel = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false
      snapBack()
    }
  }, [snapBack])

  useImperativeHandle(ref, () => ({
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  }))

  const handleFlipComplete = useCallback(() => {
    onFlipComplete()
    setRotation(0)
  }, [onFlipComplete])

  useEffect(() => {
    if (!isFlipping) return

    playFlipSound()

    let animationFrameId: number
    rotRef.current = 0 // Force start from absolute zero
    const startRot = 0
    const targetRotation = direction === 'forward' ? 360 : -360
    const diff = targetRotation - startRot
    const animationDuration = 1400 // Slower, smoother flip
    const startTime = Date.now()
    let hasTriggeredUpdate = false

    let currentRotation = startRot

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / animationDuration, 1)

      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2

      currentRotation = startRot + diff * easeProgress
      updateRotation(currentRotation)

      // Trigger month data swap slightly LATER than halfway (60% progress)
      // This makes the transition feel more natural during a 360 flip
      if (!hasTriggeredUpdate && progress >= 0.6) {
        hasTriggeredUpdate = true
        if (onHalfway) onHalfway()
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        updateRotation(0) 
        onFlipComplete()
      }
    }

    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlipping, direction, onFlipComplete])

  const isBackVisible = rotation < -90 || rotation > 90

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{
        perspective: '2000px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: Math.abs(rotation) < 45 ? 0 : 1,
          transition: Math.abs(rotation) < 45 ? 'none' : 'opacity 0.3s'
        }}
      >
        {backPage}
      </div>

      <div
        style={{
          transform: rotation ? `rotateX(${rotation}deg)` : 'none',
          transformOrigin: 'top center',
          backfaceVisibility: 'hidden',
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%'
        }}
      >
        {frontPage}
      </div>

      {(rotation !== 0 || isFlipping) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(0,0,0,${Math.abs(Math.sin((rotation * Math.PI) / 180)) * 0.2}) 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 20
          }}
        />
      )}
    </div>
  )
})
