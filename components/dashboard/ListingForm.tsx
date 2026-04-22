'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { CATEGORIES, Listing } from '@/types/database'

interface ListingFormProps {
  initialData?: Partial<Listing>
  onSubmit: (data: Partial<Listing>) => Promise<void>
  loading?: boolean
}

export function ListingForm({ initialData, onSubmit, loading }: ListingFormProps) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [price, setPrice] = useState(initialData?.price?.toString() ?? '')
  const [category, setCategory] = useState(initialData?.category ?? CATEGORIES[0])
  const [stock, setStock] = useState(initialData?.stock?.toString() ?? '1')
  const [images, setImages] = useState<string[]>(initialData?.images ?? [])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setUploadError(null)

    const uploaded: string[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Only image files are allowed.')
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Each image must be under 5MB.')
        continue
      }

      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage.from('listings').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (error) {
        setUploadError(error.message)
        break
      }

      const { data: urlData } = supabase.storage.from('listings').getPublicUrl(path)
      uploaded.push(urlData.publicUrl)
    }

    setImages((prev) => [...prev, ...uploaded])
    setUploading(false)
  }

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      title,
      description: description || undefined,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      images,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Images */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-3">
          Product Photos
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded bg-surface-2 border border-divider overflow-hidden group">
              <Image src={img} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="120px" />
              <button
                type="button"
                onClick={() => removeImage(img)}
                className="absolute inset-0 bg-bg/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="text-red-400 text-xs font-bold">Remove</span>
              </button>
              {i === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-bg/70 text-accent text-[9px] font-bold uppercase text-center py-0.5">
                  Cover
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || images.length >= 6}
            className="aspect-square rounded border-2 border-dashed border-divider hover:border-accent transition-colors flex flex-col items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-muted">Add photo</span>
              </>
            )}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleImageUpload(e.target.files)}
        />

        {uploadError && (
          <p className="text-xs text-red-400 mt-1">{uploadError}</p>
        )}
        <p className="text-xs text-muted">Up to 6 photos. First photo is the cover. Max 5MB each.</p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={120}
          placeholder="Hand-thrown ceramic mug"
          className="w-full px-4 py-3 bg-surface border border-divider rounded text-sm text-white placeholder-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Describe your item — materials, dimensions, care instructions..."
          className="w-full px-4 py-3 bg-surface border border-divider rounded text-sm text-white placeholder-muted focus:outline-none focus:border-accent transition-colors resize-y"
        />
      </div>

      {/* Price + Category + Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
            Price (USD) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">$</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min={0.01}
              step={0.01}
              placeholder="25.00"
              className="w-full pl-7 pr-4 py-3 bg-surface border border-divider rounded text-sm text-white placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
            Category <span className="text-red-400">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full px-4 py-3 bg-surface border border-divider rounded text-sm text-white focus:outline-none focus:border-accent transition-colors"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
            Stock <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            min={0}
            step={1}
            className="w-full px-4 py-3 bg-surface border border-divider rounded text-sm text-white placeholder-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      <Button type="submit" size="lg" disabled={loading || uploading}>
        {loading ? 'Saving...' : initialData?.id ? 'Save Changes' : 'Publish Listing'}
      </Button>
    </form>
  )
}
