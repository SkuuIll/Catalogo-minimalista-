'use client'

import { useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [current, setCurrent] = useState(0)
  const [touchStart, setTouchStart] = useState(0)

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext()
      else goPrev()
    }
  }

  if (images.length === 0) return null
  if (images.length === 1) {
    return (
      <div className="relative w-full aspect-square bg-surface rounded-2xl overflow-hidden">
        <img src={images[0]} alt={alt} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className="relative w-full aspect-square bg-surface rounded-2xl overflow-hidden touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${(i - current) * 100}%)` }}
        >
          <img src={src} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" draggable={false} />
        </div>
      ))}

      {/* Indicators */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1 rounded-full transition-all ${
              i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Arrows desktop */}
      <button
        onClick={goPrev}
        className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={goNext}
        className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
