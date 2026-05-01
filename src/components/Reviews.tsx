'use client'

import { useState, useEffect } from 'react'
import { Star, ThumbsUp, User, CheckCircle, Clock, AlertCircle } from 'lucide-react'

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
      alert('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number, size: number = 4) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-${size} h-${size} ${
            star <= rating
              ? 'fill-primary text-primary'
              : 'fill-none text-tertiary/30'
          }`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )

  return (
    <div className="mt-12 pt-8 border-t border-border/60">
      <h2 className="font-serif text-2xl font-light text-foreground mb-6">
        Opiniones de clientes ({totalReviews})
      </h2>

      {/* Rating summary */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Average rating */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">{averageRating}</div>
              <div className="flex items-center justify-center mt-1">
                {renderStars(Math.round(averageRating), 5)}
              </div>
              <div className="text-xs text-tertiary mt-1">{totalReviews} opiniones</div>
            </div>
          </div>
          
          {/* Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = distribution[stars] || 0
              const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0
              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-xs text-tertiary w-8">{stars} ★</span>
                  <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-tertiary w-6 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Write review CTA */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-center">
          <h3 className="font-medium text-foreground mb-2">¿Compraste este producto?</h3>
          <p className="text-sm text-secondary mb-4">
            Compartí tu experiencia con otros clientes
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="h-11 px-6 rounded-xl border border-primary/30 bg-primary/10 text-primary text-sm font-medium uppercase tracking-[0.12em] hover:bg-primary hover:text-background transition-all duration-300"
          >
            Escribir opinión
          </button>
        </div>
      </div>

      {/* Review form */}
      {showForm && (
        <div className="mb-8 bg-surface border border-border rounded-2xl p-6 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">Tu opinión</h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 text-tertiary hover:text-foreground transition-colors"
            >
              <AlertCircle className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="text-xs uppercase tracking-[0.12em] text-tertiary mb-2 block">
                Calificación *
              </label>
              <div className="flex items-center gap-2">
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
                      className={`w-8 h-8 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-primary text-primary'
                          : 'fill-none text-tertiary/30'
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs uppercase tracking-[0.12em] text-tertiary mb-2 block">
                Título (opcional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Resumen de tu opinión"
                className="w-full bg-background border border-border rounded-xl h-11 px-4 text-sm text-foreground placeholder-tertiary/40 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="text-xs uppercase tracking-[0.12em] text-tertiary mb-2 block">
                Comentario (opcional)
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Contanos tu experiencia con el producto..."
                rows={4}
                className="w-full bg-background border border-border rounded-xl p-4 text-sm text-foreground placeholder-tertiary/40 focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>

            {/* Name & Email */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-[0.12em] text-tertiary mb-2 block">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  placeholder="Tu nombre"
                  className="w-full bg-background border border-border rounded-xl h-11 px-4 text-sm text-foreground placeholder-tertiary/40 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.12em] text-tertiary mb-2 block">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  value={formData.authorEmail}
                  onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
                  placeholder="Para verificación"
                  className="w-full bg-background border border-border rounded-xl h-11 px-4 text-sm text-foreground placeholder-tertiary/40 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="h-11 px-6 rounded-xl border border-primary bg-primary text-background text-sm font-medium uppercase tracking-[0.12em] hover:bg-primary/90 active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Enviar opinión'}
              </button>
              <span className="text-xs text-tertiary">
                Será publicada tras moderación
              </span>
            </div>
          </form>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3 animate-fade-up">
          <CheckCircle className="w-5 h-5 text-success" />
          <div>
            <p className="text-sm font-medium text-success">¡Gracias por tu opinión!</p>
            <p className="text-xs text-success/70">Será publicada tras moderación</p>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-surface border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-tertiary/20 mx-auto mb-4" />
          <p className="text-tertiary">Sin opiniones aún</p>
          <p className="text-sm text-tertiary/60">Sé el primero en opinar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-surface border border-border rounded-2xl p-5 hover:border-border-light transition-colors duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(review.rating, 4)}
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-success bg-success/10 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" strokeWidth={1.5} />
                        Compra verificada
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <h4 className="font-medium text-foreground">{review.title}</h4>
                  )}
                </div>
                <div className="text-xs text-tertiary">
                  {new Date(review.createdAt).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
              
              {review.comment && (
                <p className="text-sm text-secondary leading-relaxed mb-3">
                  {review.comment}
                </p>
              )}
              
              <div className="flex items-center gap-4">
                <span className="text-xs text-tertiary">
                  Por <span className="text-foreground font-medium">{review.authorName}</span>
                </span>
                <button className="flex items-center gap-1.5 text-xs text-tertiary hover:text-foreground transition-colors">
                  <ThumbsUp className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Útil ({review.helpful})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
