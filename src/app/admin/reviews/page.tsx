'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, Trash2, CheckCircle, XCircle, Eye, User } from 'lucide-react'
import { useToast } from '@/components/Toast'

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  authorName: string
  authorEmail: string | null
  verified: boolean
  approved: boolean
  productId: string
  createdAt: string
  product: {
    id: string
    name: string
    imageUrl: string | null
  }
}

export default function AdminReviewsPage() {
  const { showToast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  useEffect(() => {
    fetchReviews()
  }, [filter])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter === 'pending') params.set('approved', 'false')
      else if (filter === 'approved') params.set('approved', 'true')
      params.set('limit', '50')
      
      const res = await fetch(`/api/admin/reviews?${params}`)
      const data = await res.json()
      setReviews(data.reviews || [])
    } catch {
      showToast('Error loading reviews', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved }),
      })
      if (res.ok) {
        showToast(approved ? 'Review approved' : 'Review rejected', 'success')
        fetchReviews()
      }
    } catch {
      showToast('Error updating', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        showToast('Review deleted', 'success')
        fetchReviews()
      }
    } catch {
      showToast('Error deleting', 'error')
    }
  }

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= rating ? 'fill-[#c9a55a] text-[--accent]' : 'fill-none text-[--text-tertiary]'
          }`}
          strokeWidth={1}
        />
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-[--bg]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[--bg]/95 backdrop-blur-xl border-b border-[--border]">
        <div className="flex items-center h-16 px-6 gap-4 max-w-7xl mx-auto">
          <Link href="/admin" className="p-2 -ml-2 text-[--text-secondary] hover:text-[--text] transition-colors duration-300">
            <ArrowLeft className="w-4 h-4" strokeWidth={1} />
          </Link>
          <h1 className="font-serif text-lg font-light text-[--text] tracking-[0.1em]">REVIEWS</h1>
          <span className="ml-auto text-[9px] uppercase tracking-[0.25em] text-[--text-secondary]">
            {reviews.length} REVIEWS
          </span>
        </div>
      </header>

      <div className="h-16" />

      <main className="max-w-5xl mx-auto py-8 px-6">
        {/* Filters */}
        <div className="flex items-center gap-2 mb-8">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-none text-[8px] uppercase tracking-[0.25em] font-medium transition-all duration-300 ${
                filter === f
                  ? 'bg-[--accent] text-[--bg]'
                  : 'bg-[--bg-surface] border border-[--border] text-[--text-secondary] hover:text-[--text] hover:border-[--border]'
              }`}
            >
              {f === 'all' ? 'ALL' : f === 'pending' ? 'PENDING' : f === 'approved' ? 'APPROVED' : 'REJECTED'}
            </button>
          ))}
        </div>

        {/* Reviews list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-[--bg-surface] border border-[--border] rounded-none animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-none bg-[--bg] border border-[--border] flex items-center justify-center mx-auto mb-5">
              <User className="w-7 h-7 text-[--text-tertiary]" strokeWidth={1} />
            </div>
            <p className="text-[--text-secondary] text-[13px] uppercase tracking-[0.2em] mb-1">NO REVIEWS</p>
            <p className="text-[--text-tertiary] text-[11px] uppercase tracking-[0.15em]">
              {filter === 'pending' ? 'No pending reviews to moderate' : 'No reviews yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-[--bg-surface] border border-[--border] rounded-none p-5 hover:border-[--border] transition-colors duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* Product thumbnail */}
                  <Link
                    href={`/product/${review.productId}`}
                    target="_blank"
                    className="w-16 h-16 rounded-none bg-[--bg] border border-[--border] overflow-hidden flex-shrink-0"
                  >
                    {review.product.imageUrl ? (
                      <img
                        src={review.product.imageUrl}
                        alt={review.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[--text-tertiary]" strokeWidth={1} />
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      {review.verified && (
                        <span className="inline-flex items-center gap-1.5 text-[8px] uppercase tracking-[0.2em] text-[--green] bg-[--green]/10 px-2.5 py-1 rounded-none border border-[--green]/20">
                          <CheckCircle className="w-3 h-3" strokeWidth={1} />
                          VERIFIED
                        </span>
                      )}
                      <span className={`text-[8px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-none border ${
                        review.approved
                          ? 'text-[--green] bg-[--green]/10 border-[--green]/20'
                          : 'text-[--accent] bg-[--accent]/10 border-[--accent]/20'
                      }`}>
                        {review.approved ? 'APPROVED' : 'PENDING'}
                      </span>
                    </div>

                    {review.title && (
                      <h4 className="font-serif text-[14px] font-light text-[--text] mb-1 tracking-[0.05em]">{review.title}</h4>
                    )}
                    {review.comment && (
                      <p className="text-[13px] text-[--text-secondary] line-clamp-2 mb-2 leading-relaxed">{review.comment}</p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.15em] text-[--text-secondary]">
                      <span>BY <span className="text-[--text]">{review.authorName}</span></span>
                      <span>•</span>
                      <span>{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <Link
                        href={`/product/${review.productId}`}
                        target="_blank"
                        className="text-[--accent] hover:text-[--text] flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" strokeWidth={1} />
                        VIEW PRODUCT
                      </Link>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {!review.approved && (
                      <>
                        <button
                          onClick={() => handleApprove(review.id, true)}
                          className="p-2 rounded-none bg-[--green]/10 text-[--green] hover:bg-[--green]/20 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" strokeWidth={1} />
                        </button>
                        <button
                          onClick={() => handleApprove(review.id, false)}
                          className="p-2 rounded-none bg-[--accent]/10 text-[--accent] hover:bg-[--accent]/20 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" strokeWidth={1} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 rounded-none bg-[--red]/10 text-[--red] hover:bg-[--red]/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
