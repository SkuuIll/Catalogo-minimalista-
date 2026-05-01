'use client'

import { useState } from 'react'
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

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {/* Blur placeholder */}
      {!loaded && (
        <div className="absolute inset-0 bg-[#2A2520] animate-pulse" />
      )}
      <img
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
