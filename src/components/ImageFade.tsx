'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/cn'

export function ImageFade({
  src,
  alt,
  className,
  containerClassName,
}: {
  src: string
  alt: string
  className?: string
  containerClassName?: string
}) {
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true)
    }
  }, [src])

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {/* Blur placeholder */}
      {!loaded && (
        <div className="absolute inset-0 bg-[--bg-elevated] animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={cn(
          'w-full h-full object-cover transition-all duration-700 ease-out',
          loaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm',
          className
        )}
        loading="lazy"
      />
    </div>
  )
}
