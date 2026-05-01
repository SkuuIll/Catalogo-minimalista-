'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Dot } from 'lucide-react'

export function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [current, setCurrent] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const goNext = useCallback(() => {
    setCurrent(prev => (prev + 1) % images.length)
  }, [images.length])

  const goPrev = useCallback(() => {
    setCurrent(prev => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX)
  }
  const handleTouchEnd = () => {
    const diff = touchStart - touchEnd
    if (Math.abs(diff) > 40) {
      if (diff > 0) goNext()
      else goPrev()
    }
  }

  if (images.length === 0) return null

  return (
    <div className="relative w-full aspect-[4/5] sm:aspect-square bg-[#221E1A] overflow-hidden">
      {images.length === 1 ? (
        <img src={images[0]} alt={alt} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <>
          <div
            className="relative w-full h-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {images.map((src, i) => (
              <div
                key={src}
                className="absolute inset-0 transition-transform duration-500 ease-out"
                style={{ transform: `translateX(${(i - current) * 100}%)` }}
              >
                <img src={src} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" draggable={false} />
              </div>
            ))}
          </div>

          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${i === current ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30'}`}
              />
            ))}
          </div>

          <button
            onClick={goPrev}
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white/70 hover:text-white hover:bg-black/50 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goNext}
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white/70 hover:text-white hover:bg-black/50 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  )
}
