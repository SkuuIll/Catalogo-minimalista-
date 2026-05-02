'use client'

import { useState, useEffect } from 'react'
import { Star, ThumbsUp, User, CheckCircle, AlertCircle } from 'lucide-react'

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  authorName: string
  verified: boolean
  approved: boolean
  helpful: number
  createdAt: string
}

interface ReviewsProps {
  productId: string
  averageRating: number
  totalReviews: number
  distribution: Record<number, number>
}

export function Reviews({ productId, averageRating, totalReviews, distribution }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [formData, setFormData] = useState({
    title: '',
    comment: '',
    authorName: '',
    authorEmail: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews?approved=true`)
      const data = await res.json()
      setReviews(data.reviews || [])
    } catch {} finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          ...formData,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(true)
        setShowForm(false)
        setFormData({ title: '', comment: '', authorName: '', authorEmail: '' })
        setRating(5)
        setTimeout(() => setSuccess(false), 5000)
      } else {
        alert(data.error || 'Error al enviar review')
      }
    } catch {
      alert('Error de conexiÃ³n')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (value: number, size: string = 'w-4 h-4') => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= value
              ? 'fill-[--accent] text-[--accent]'
              : 'fill-none text-[--text-tertiary]/30'
          }`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )

  return (
    <div className="mt-12 pt-8 border-t border-[--border]/60">
      <h2 className="font-display font-bold text-[20px] text-[--text] mb-6">
        Opiniones de clientes ({totalReviews})
      </h2>

      {/* Rating summary */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {/* Average rating */}
        <div className="bg-[--bg-surface] border border-[--border] rounded-2xl p-5">
          <div className="flex items-center gap-5 mb-5">
            <div className="text-center">
              <div className="text-[36px] font-bold text-[--accent] leading-none">{averageRating || 'â€”'}</div>
              <div className="flex items-center justify-center mt-2">
                {renderStars(Math.round(averageRating), 'w-5 h-5')}
              </div>
              <div className="text-[11px] text-[--text-tertiary] mt-1">{totalReviews} opiniones</div>
            </div>
          </div>
          
          {/* Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = distribution[stars] || 0
              const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0
              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-[11px] text-[--text-tertiary] w-8 tabular-nums">{stars} â˜…</span>
                  <div className="flex-1 h-1.5 bg-[--bg] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[--accent] rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-[--text-tertiary] w-6 text-right tabular-nums">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Write review CTA */}
        <div className="bg-[--bg-surface] border border-[--border] rounded-2xl p-5 flex flex-col justify-center">
          <h3 className="font-medium text-[--text] mb-1.5">Â¿Compraste este producto?</h3>
          <p className="text-[13px] text-[--text-secondary] mb-4">
            CompartÃ­ tu experiencia con otros clientes
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="h-10 px-5 rounded-xl border border-[--accent]/30 bg-[--accent-soft] text-[--accent] text-[11px] font-semibold uppercase tracking-[0.12em] hover:bg-[--accent] hover:text-[--bg] transition-all duration-300"
          >
            Escribir opiniÃ³n
          </button>
        </div>
      </div>

      {/* Review form */}
      {showForm && (
        <div className="mb-8 bg-[--bg-surface] border border-[--border] rounded-2xl p-5 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-[--text]">Tu opiniÃ³n</h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 text-[--text-tertiary] hover:text-[--text] hover:bg-[--bg-elevated] rounded-lg transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.12em] text-[--text-tertiary] mb-2 block">
                CalificaciÃ³n *
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-[--accent] text-[--accent]'
                          : 'fill-none text-[--text-tertiary]/30'
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.12em] text-[--text-tertiary] mb-1.5 block">
                TÃ­tulo (opcional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Resumen de tu opiniÃ³n"
                className="w-full bg-[--bg] border border-[--border] rounded-xl h-10 px-3 text-[13px] text-[--text] placeholder:text-[--text-tertiary] focus:outline-none focus:border-[--accent]/50 transition-colors"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.12em] text-[--text-tertiary] mb-1.5 block">
                Comentario (opcional)
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Contanos tu experiencia con el producto..."
                rows={4}
                className="w-full bg-[--bg] border border-[--border] rounded-xl p-3 text-[13px] text-[--text] placeholder:text-[--text-tertiary] focus:outline-none focus:border-[--accent]/50 transition-colors resize-none"
              />
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-[0.12em] text-[--text-tertiary] mb-1.5 block">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  placeholder="Tu nombre"
                  className="w-full bg-[--bg] border border-[--border] rounded-xl h-10 px-3 text-[13px] text-[--text] placeholder:text-[--text-tertiary] focus:outline-none focus:border-[--accent]/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.12em] text-[--text-tertiary] mb-1.5 block">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  value={formData.authorEmail}
                  onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
                  placeholder="Para verificaciÃ³n"
                  className="w-full bg-[--bg] border border-[--border] rounded-xl h-10 px-3 text-[13px] text-[--text] placeholder:text-[--text-tertiary] focus:outline-none focus:border-[--accent]/50 transition-colors"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="h-10 px-5 rounded-xl bg-[--accent] text-[--bg] text-[11px] font-semibold uppercase tracking-[0.12em] hover:opacity-90 active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Enviar opiniÃ³n'}
              </button>
              <span className="text-[10px] text-[--text-tertiary]">
                SerÃ¡ publicada tras moderaciÃ³n
              </span>
            </div>
          </form>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-[--green]/10 border border-[--green]/20 flex items-center gap-3 animate-fade-up">
          <CheckCircle className="w-5 h-5 text-[--green]" />
          <div>
            <p className="text-[13px] font-medium text-[--green]">Â¡Gracias por tu opiniÃ³n!</p>
            <p className="text-[11px] text-[--green]/70">SerÃ¡ publicada tras moderaciÃ³n</p>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-[--bg-surface] border border-[--border] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-10 h-10 text-[--text-tertiary]/20 mx-auto mb-3" />
          <p className="text-[13px] text-[--text-tertiary]">Sin opiniones aÃºn</p>
          <p className="text-[12px] text-[--text-tertiary]/60 mt-1">SÃ© el primero en opinar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-[--bg-surface] border border-[--border] rounded-2xl p-4 hover:border-[--border-mid] transition-colors duration-300"
            >
              <div className="flex items-start justify-between mb-2.5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {renderStars(review.rating)}
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.12em] text-[--green] bg-[--green]/10 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" strokeWidth={1.5} />
                        Verificada
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <h4 className="font-medium text-[--text] text-[13px]">{review.title}</h4>
                  )}
                </div>
                <div className="text-[10px] text-[--text-tertiary] tabular-nums shrink-0 ml-3">
                  {new Date(review.createdAt).toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </div>
              </div>
              
              {review.comment && (
                <p className="text-[13px] text-[--text-secondary] leading-relaxed mb-3">
                  {review.comment}
                </p>
              )}
              
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[--text-tertiary]">
                  Por <span className="text-[--text] font-medium">{review.authorName}</span>
                </span>
                <button className="flex items-center gap-1 text-[10px] text-[--text-tertiary] hover:text-[--text] transition-colors">
                  <ThumbsUp className="w-3 h-3" strokeWidth={1.5} />
                  Ãštil ({review.helpful})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
