'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        alert('Error al crear el producto')
      }
    } catch (error) {
      console.error(error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-background text-on-surface py-10 sm:py-16 px-4 sm:px-6 lg:px-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="font-serif text-2xl sm:text-[32px] font-medium leading-[1.2] text-on-surface">Nuevo Producto</h1>
          <Link href="/admin" className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] text-on-surface-variant hover:text-primary transition-colors">
            Cancelar
          </Link>
        </div>

        <div className="glass p-6 sm:p-8 lg:p-12 rounded-xl border border-white/5">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div>
              <label className="block text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2">Nombre del Producto</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="block w-full bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-primary text-base sm:text-lg text-on-surface transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2">Descripción</label>
              <textarea
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                className="block w-full bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-primary text-base text-on-surface transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-y-6 sm:gap-y-8 gap-x-8 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2">Precio (USD)</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="block w-full bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-primary text-base sm:text-lg font-serif text-on-surface transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2">Categoría</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="block w-full bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-primary text-base text-on-surface transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2">URL de la Imagen</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="block w-full bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-primary text-base text-on-surface transition-colors placeholder-on-surface-variant/50"
              />
            </div>

            <div className="pt-4 sm:pt-8">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex justify-center py-3.5 sm:py-4 px-6 sm:px-8 border border-transparent rounded-lg bg-gradient-to-r from-primary-container to-[#8E6E37] text-sm font-semibold tracking-[0.05em] text-on-primary hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Registrar Producto'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
