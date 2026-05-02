'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ImageFade } from './ImageFade'

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
    <div className="relative w-full aspect-[4/5] sm:aspect-square bg-[--bg-surface] overflow-hidden">
      {images.length === 1 ? (
        <ImageFade src={images[0]} alt={alt} containerClassName="w-full h-full" />
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
                <ImageFade
                  src={src}
                  alt={`${alt} ${i + 1}`}
                  containerClassName="w-full h-full"
                  className="select-none"
                />
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Imagen ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-5 h-1.5 bg-white shadow-sm'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Navigation arrows — desktop only */}
          {images.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-[--bg]/60 backdrop-blur-md text-[--text-secondary] hover:text-[--text] hover:bg-[--bg]/80 transition-all border border-[--border]/30"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goNext}
                className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-[--bg]/60 backdrop-blur-md text-[--text-secondary] hover:text-[--text] hover:bg-[--bg]/80 transition-all border border-[--border]/30"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}
