'use client'

import { useEffect } from 'react'

export function ErrorLogger() {
  useEffect(() => {
    const logError = async (error: Error, source: string, metadata?: object) => {
      try {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: 'error',
            message: error.message || String(error),
            stack: error.stack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            metadata: { source, ...metadata },
          }),
        })
      } catch (e) {
        console.warn('Failed to log error:', e)
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason
      const message = error instanceof Error ? error.message : String(error)
      logError(new Error(message), 'unhandledrejection', {
        stack: error instanceof Error ? error.stack : null,
      })
    }

    const handleError = (event: ErrorEvent) => {
      const error = event.error
      if (error instanceof Error) {
        logError(error, 'window.onerror', { message: event.message })
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  return null
}