"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Upload, X, ZoomIn, ZoomOut, Move, Heart, ChevronRight, ChevronLeft, Check } from "lucide-react"

interface FrameSize {
  id: string
  name: string
  dimensions: string
  price: number
}

interface FrameColor {
  id: string
  name: string
  hex: string
}

interface FrameMatting {
  id: string
  name: string
  width: string
}

export function FrameConfigurator() {
  const { state, dispatch, total } = useCart()
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedSize, setSelectedSize] = useState<FrameSize | null>(null)
  const [selectedColor, setSelectedColor] = useState<FrameColor | null>(null)
  const [selectedMatting, setSelectedMatting] = useState<FrameMatting | null>(null)
  const [mountType, setMountType] = useState<string>("no-mount")

  const sizes: FrameSize[] = [
    { id: "4x6", name: "4×6\"", dimensions: "4 × 6 inches", price: 15.99 },
    { id: "5x7", name: "5×7\"", dimensions: "5 × 7 inches", price: 19.99 },
    { id: "8x10", name: "8×10\"", dimensions: "8 × 10 inches", price: 24.99 },
    { id: "11x14", name: "11×14\"", dimensions: "11 × 14 inches", price: 34.99 },
    { id: "16x20", name: "16×20\"", dimensions: "16 × 20 inches", price: 44.99 },
    { id: "24x36", name: "24×36\"", dimensions: "24 × 36 inches", price: 59.99 },
  ]

  const colors: FrameColor[] = [
    { id: "matte-black", name: "Matte Black", hex: "#1a1a1a" },
    { id: "white", name: "Classic White", hex: "#ffffff" },
    { id: "natural-wood", name: "Natural Wood", hex: "#c4a46c" },
    { id: "grey", name: "Slate Grey", hex: "#6b7280" },
  ]

  const matting: FrameMatting[] = [
    { id: "none", name: "No Matting", width: "—" },
    { id: "white-1", name: "White Mat (1\")", width: "1 inch" },
    { id: "white-2", name: "White Mat (2\")", width: "2 inches" },
  ]

  const mountTypes = [
    { id: "no-mount", name: "No Mount", price: 0 },
    { id: "paper-mount", name: "Paper Mount", price: 4.99 },
    { id: "foam-board", name: "Foam Board", price: 7.99 },
    { id: "acrylic-face", name: "Acrylic Face", price: 12.99 },
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB")
      return
    }

    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string)
      toast.success("Image uploaded successfully")
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setUploadedImage(null)
    setPhotoFile(null)
    toast.info("Image removed")
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const totalPrice =
    (selectedSize?.price ?? 0) +
    (selectedMatting?.id !== "none" ? 4.99 : 0) +
    (mountTypes.find((m) => m.id === mountType)?.price ?? 0)

  const addToCart = () => {
    if (!selectedSize || !selectedColor || !photoFile) {
      toast.error("Please complete all steps")
      return
    }

    const variantId = `${selectedSize.id}-${selectedColor.id}-${selectedMatting?.id || "none"}`
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: crypto.randomUUID(),
        productVariantId: variantId,
        size: selectedSize.id,
        color: selectedColor.id,
        matting: selectedMatting?.id || "none",
        quantity: 1,
        unitPrice: totalPrice,
        totalPrice: totalPrice,
        name: `Custom Frame ${selectedSize.name} - ${selectedColor.name}`,
      },
    })

    toast.success("Added to cart!", {
      description: `Frame ${selectedSize.name} with ${selectedColor.name}`,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {["Upload Photo", "Choose Size", "Customize Frame", "Review"].map((step, idx) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    currentStep > idx
                      ? "bg-primary text-primary-foreground"
                      : currentStep === idx + 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {currentStep > idx + 1 ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={cn(
                    "text-sm hidden sm:block",
                    currentStep >= idx + 1 ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step}
                </span>
                {idx < 3 && <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left: Preview */}
          <div className="space-y-6">
            <div
              className={cn(
                "aspect-[3/4] rounded-lg border-2 border-dashed flex items-center justify-center relative overflow-hidden",
                uploadedImage ? "border-primary" : "border-border",
              )}
              style={{
                backgroundColor: selectedColor?.hex ?? "#f5f5f5",
                padding: selectedMatting?.id === "none" ? "0" : selectedMatting?.id === "white-1" ? "8%" : "16%",
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {uploadedImage ? (
                <div
                  className="relative w-full h-full cursor-grab active:cursor-grabbing"
                  onMouseDown={handleMouseDown}
                >
                  <img
                    src={uploadedImage}
                    alt="Uploaded photo"
                    className="w-full h-full object-cover transition-transform duration-200"
                    style={{
                      transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                    }}
                  />
                  {!isDragging && (
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                      Drag to pan
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-8">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Upload Your Photo</h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop or click to select
                  </p>
                  <Label
                    htmlFor="photo-upload"
                    className="cursor-pointer inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Choose Photo
                  </Label>
                </div>
              )}

              {uploadedImage && (
                <button
                  onClick={removeImage}
                  className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Zoom Controls */}
            {uploadedImage && (
              <div className="flex items-center gap-4 bg-card border rounded-lg p-4">
                <ZoomOut className="w-5 h-5 text-muted-foreground" />
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <ZoomIn className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground w-12 text-right">{zoom.toFixed(1)}x</span>
              </div>
            )}
          </div>

          {/* Right: Configuration */}
          <div className="space-y-8">
            {/* Step 1: Upload */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground font-display mb-2">
                    Upload Your Photo
                  </h1>
                  <p className="text-muted-foreground">
                    Choose a high-quality photo for the best print results
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Upload Requirements</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Accepted formats: JPG, PNG, WebP
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Maximum file size: 10MB
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Recommended: 300 DPI or higher
                    </li>
                  </ul>
                </div>

                <Button
                  className="w-full"
                  disabled={!uploadedImage}
                  onClick={() => setCurrentStep(2)}
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 2: Size */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground font-display mb-2">
                    Choose Your Size
                  </h2>
                  <p className="text-muted-foreground">
                    Select the frame dimensions
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "p-4 rounded-lg border-2 text-left transition-all",
                        selectedSize?.id === size.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <div className="font-medium text-foreground">{size.name}</div>
                      <div className="text-sm text-muted-foreground">{size.dimensions}</div>
                      <div className="mt-2 font-semibold text-primary">${size.price}</div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!selectedSize}
                    onClick={() => setCurrentStep(3)}
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Frame Options */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground font-display mb-2">
                    Customize Your Frame
                  </h2>
                  <p className="text-muted-foreground">
                    Choose color, matting, and mount options
                  </p>
                </div>

                {/* Color Selection */}
                <div className="space-y-3">
                  <Label>Frame Color</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                          selectedColor?.id === color.id
                            ? "border-primary"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        <div
                          className="w-8 h-8 rounded-md border"
                          style={{
                            backgroundColor: color.hex,
                            boxShadow: color.hex === "#ffffff"
                              ? "inset 0 0 0 1px #e5e7eb"
                              : "none",
                          }}
                        />
                        <span className="text-sm font-medium text-foreground">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Matting */}
                <div className="space-y-3">
                  <Label>Matting</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {matting.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMatting(m)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border-2 transition-all",
                          selectedMatting?.id === m.id
                            ? "border-primary"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        <span className="text-sm font-medium text-foreground">{m.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {m.id !== "none" ? "+$4.99" : "Free"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mount Type */}
                <div className="space-y-3">
                  <Label>Mount Type</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {mountTypes.map((mount) => (
                      <button
                        key={mount.id}
                        onClick={() => setMountType(mount.id)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border-2 transition-all",
                          mountType === mount.id
                            ? "border-primary"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        <span className="text-sm font-medium text-foreground">{mount.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {mount.price > 0 ? `+$${mount.price}` : "Free"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!selectedColor}
                    onClick={() => setCurrentStep(4)}
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground font-display mb-2">
                    Review Your Frame
                  </h2>
                  <p className="text-muted-foreground">
                    Everything looks good? Add to cart or go back to make changes
                  </p>
                </div>

                <div className="bg-card border rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Frame Size</span>
                    <span className="font-medium text-foreground">
                      {selectedSize?.name ?? "—"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Frame Color</span>
                    <span className="font-medium text-foreground">
                      {selectedColor?.name ?? "—"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Matting</span>
                    <span className="font-medium text-foreground">
                      {selectedMatting?.name ?? "No Matting"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Mount</span>
                    <span className="font-medium text-foreground">
                      {mountTypes.find((m) => m.id === mountType)?.name ?? "No Mount"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-primary">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!selectedSize || !selectedColor}
                    onClick={addToCart}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Add to Cart — ${totalPrice.toFixed(2)}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FrameConfigurator
