"use client"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Scissors,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  X,
  Plus,
  Minus,
} from "lucide-react"

// Frame color options
const FRAME_COLORS = [
  { name: 'Matte Black', value: 'matte_black', color: '#1f2937', border: '#374151' },
  { name: 'White', value: 'white', color: '#ffffff', border: '#e5e7eb' },
  { name: 'Natural Wood', value: 'natural_wood', color: '#d4a574', border: '#b8935f' },
  { name: 'Grey', value: 'grey', color: '#6b7280', border: '#9ca3af' },
] as const

const FRAME_SIZES = [
  { label: '4×6 inch', width: 100, height: 150, price: 24.99 },
  { label: '5×7 inch', width: 120, height: 168, price: 29.99 },
  { label: '8×10 inch', width: 160, height: 200, price: 39.99 },
  { label: '11×14 inch', width: 220, height: 280, price: 54.99 },
  { label: '16×20 inch', width: 280, height: 350, price: 79.99 },
] as const

const MATTING_OPTIONS = [
  { label: 'No Matting', value: 'none', price: 0 },
  { label: 'White Mat (1")', value: 'white_1', price: 5 },
  { label: 'White Mat (2")', value: 'white_2', price: 10 },
] as const

// ==================== COMPONENTS ====================

function PhotoUploader({ onUpload }: { onUpload: (file: File | null) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      onUpload(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all",
        isDragging
          ? "border-accent-blue bg-accent-blue/5"
          : "border-border hover:border-printframe-400 hover:bg-printframe-50"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Upload className="h-12 w-12 text-printframe-300 mx-auto mb-3" />
      <h3 className="font-medium text-printframe-900">Upload your photo</h3>
      <p className="mt-2 text-sm text-printframe-500">
        Drag & drop, or click to browse
        <br />
        <span className="text-xs">JPG, PNG, WebP up to 25MB</span>
      </p>
    </div>
  )
}

function FramePreview({
  image,
  size,
  color,
  matting,
}: {
  image: string | null
  size: typeof FRAME_SIZES[0]
  color: typeof FRAME_COLORS[0]
  matting: typeof MATTING_OPTIONS[0]
}) {
  // Calculate matting dimensions
  const matPadding = matting.value === 'white_1' ? 16 : matting.value === 'white_2' ? 32 : 0
  const totalWidth = size.width + matPadding * 2
  const totalHeight = size.height + matPadding * 2

  return (
    <div className="relative flex items-center justify-center p-8 bg-printframe-100 rounded-2xl">
      <div
        className="relative shadow-2xl"
        style={{
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
          backgroundColor: color.color,
          border: `8px solid ${color.border}`,
          borderRadius: '2px',
        }}
      >
        {matPadding > 0 && (
          <div
            className="absolute inset-0 m-2 bg-white"
            style={{ padding: `${matPadding}px` }}
          />
        )}
        <div className="relative overflow-hidden" style={{ 
          width: `${size.width}px`, 
          height: `${size.height}px`,
          margin: matPadding > 0 ? `${matPadding}px` : '0',
        }}>
          {image ? (
            <Image
              src={image}
              alt="Frame preview"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-printframe-50">
              <div className="text-center">
                <ImageIcon className="h-8 w-8 text-printframe-300 mx-auto mb-2" />
                <p className="text-xs text-printframe-400">Your photo preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ColorSelector({ selected, onSelect }: {
  selected: string
  onSelect: (value: string) => void
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-printframe-700">Frame Color</label>
      <div className="flex gap-3">
        {FRAME_COLORS.map((c) => (
          <button
            key={c.value}
            onClick={() => onSelect(c.value)}
            className={cn(
              "relative h-10 w-10 rounded-full transition-all",
              selected === c.value ? "ring-2 ring-accent-blue ring-offset-2" : "hover:scale-110"
            )}
            style={{ backgroundColor: c.color, border: `2px solid ${c.border}` }}
            title={c.name}
          />
        ))}
      </div>
      <p className="text-sm text-printframe-500">
        {FRAME_COLORS.find(c => c.value === selected)?.name}
      </p>
    </div>
  )
}

function SizeSelector({ selected, onSelect }: {
  selected: typeof FRAME_SIZES[0]
  onSelect: (size: typeof FRAME_SIZES[0]) => void
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-printframe-700">Size</label>
      <div className="grid gap-2">
        {FRAME_SIZES.map((s) => (
          <button
            key={s.label}
            onClick={() => onSelect(s)}
            className={cn(
              "flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all",
              selected.label === s.label
                ? "border-accent-blue bg-accent-blue/5"
                : "border-border hover:border-printframe-400"
            )}
          >
            <span className="font-medium">{s.label}</span>
            <span className="text-accent-blue font-semibold">${s.price}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function MattingSelector({ selected, onSelect }: {
  selected: typeof MATTING_OPTIONS[0]
  onSelect: (option: typeof MATTING_OPTIONS[0]) => void
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-printframe-700">Matting</label>
      <div className="grid gap-2">
        {MATTING_OPTIONS.map((m) => (
          <button
            key={m.value}
            onClick={() => onSelect(m)}
            className={cn(
              "flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all",
              selected.value === m.value
                ? "border-accent-blue bg-accent-blue/5"
                : "border-border hover:border-printframe-400"
            )}
          >
            <span className="font-medium">{m.label}</span>
            {m.price > 0 && <span className="text-printframe-500 text-sm">+${m.price}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

function QuantitySelector({ value, onChange }: {
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-8 text-center font-medium">{value}</span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.min(10, value + 1))}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

function ImageEditor({ image, onUpdate }: {
  image: string
  onUpdate: (image: string) => void
}) {
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [rotation, setRotation] = useState(0)

  const filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) rotate(${rotation}deg)`

  const handleApply = () => {
    // In production, this would process the image and save it
    onUpdate(image)
  }

  const handleReset = () => {
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setRotation(0)
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden bg-printframe-100 aspect-video">
        <Image src={image} alt="Edited preview" fill className="object-contain" style={{ filter: filterString }} />
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-printframe-600">Brightness</span>
            <span className="text-printframe-400">{brightness}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="150"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full accent-accent-blue"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-printframe-600">Contrast</span>
            <span className="text-printframe-400">{contrast}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="150"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="w-full accent-accent-blue"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-printframe-600">Saturation</span>
            <span className="text-printframe-400">{saturation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            className="w-full accent-accent-blue"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleReset} className="flex-1">
          Reset
        </Button>
        <Button size="sm" onClick={handleApply} className="flex-1">
          Apply Changes
        </Button>
      </div>
    </div>
  )
}

// ==================== MAIN COMPONENT ====================

export function FrameConfigurator() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [selectedSize, setSelectedSize] = useState(FRAME_SIZES[2]) // 8x10
  const [selectedColor, setSelectedColor] = useState(FRAME_COLORS[0].value)
  const [selectedMatting, setSelectedMatting] = useState(MATTING_OPTIONS[0])
  const [quantity, setQuantity] = useState(1)
  const [showEditor, setShowEditor] = useState(false)
  const [inCart, setInCart] = useState(false)

  // Calculate price
  const total = (selectedSize.price + selectedMatting.price) * quantity

  const handleFileUpload = (uploadFile: File | null) => {
    if (!uploadFile) return
    setFile(uploadFile)
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
    }
    reader.readAsDataURL(uploadFile)
    setInCart(false)
  }

  const handleAddToCart = () => {
    if (!uploadedImage) return
    // In production, this would add to the cart context
    setInCart(true)
    // Show success feedback
    setTimeout(() => setInCart(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-printframe-950 font-display mb-8">Customize Your Frame</h1>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Left: Preview */}
        <div className="space-y-6">
          {!uploadedImage ? (
            <PhotoUploader onUpload={handleFileUpload} />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-printframe-900">Live Preview</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowEditor(!showEditor)}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {showEditor ? "Hide Editor" : "Enhance Photo"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setUploadedImage(null); setFile(null); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {showEditor ? (
                <ImageEditor image={uploadedImage} onUpdate={setUploadedImage} />
              ) : (
                <FramePreview
                  image={uploadedImage}
                  size={selectedSize}
                  color={FRAME_COLORS.find(c => c.value === selectedColor) || FRAME_COLORS[0]}
                  matting={selectedMatting}
                />
              )}
            </div>
          )}

          {uploadedImage && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
              <Button variant="outline" size="sm">
                <RotateCw className="h-4 w-4 mr-2" />
                Rotate
              </Button>
              <Button variant="outline" size="sm">
                <Scissors className="h-4 w-4 mr-2" />
                Crop
              </Button>
            </div>
          )}
        </div>

        {/* Right: Configuration */}
        <div className="space-y-8">
          {/* Size */}
          <SizeSelector selected={selectedSize} onSelect={setSelectedSize} />

          {/* Color */}
          <ColorSelector selected={selectedColor} onSelect={setSelectedColor} />

          {/* Matting */}
          <MattingSelector selected={selectedMatting} onSelect={setSelectedMatting} />

          {/* Quantity */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-printframe-700">Quantity</label>
            <QuantitySelector value={quantity} onChange={setQuantity} />
          </div>

          {/* Price Summary */}
          <div className="rounded-xl border border-border/60 bg-printframe-50 p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-printframe-600">Frame ({selectedSize.label})</span>
                <span className="font-medium">${selectedSize.price.toFixed(2)}</span>
              </div>
              {selectedMatting.price > 0 && (
                <div className="flex justify-between">
                  <span className="text-printframe-600">{selectedMatting.label}</span>
                  <span className="font-medium">${selectedMatting.price.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-printframe-600">Quantity × {quantity}</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="border-t border-border/40 pt-2 mt-2">
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-printframe-900">Total</span>
                  <span className="font-bold text-accent-blue">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="flex gap-3">
            <Button 
              size="lg" 
              className="flex-1" 
              onClick={handleAddToCart}
              disabled={!uploadedImage || inCart}
            >
              {inCart ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
            <Button variant="outline" size="lg">
              Buy Now
            </Button>
          </div>

          {/* Shipping Info */}
          <div className="flex items-center gap-2 text-sm text-printframe-500">
            <Truck className="h-4 w-4" />
            <span>Standard shipping: $5.99 (5-7 days)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-printframe-500">
            <Truck className="h-4 w-4" />
            <span>Free shipping on orders over $50</span>
          </div>
        </div>
      </div>
    </div>
  )
}

import { ShoppingCart, Truck } from "lucide-react"
