"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, X, ArrowLeft, ArrowRight, SkipForward, Loader2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/useToast"
import { ownerApi } from "../api/ownerApi"

interface ImageUploadStepProps {
  listingId: string
  onSuccess: () => void
  onSkip: () => void
  onBack: () => void
}

interface UploadedImage {
  id: string
  file: File
  preview: string
  uploaded: boolean
}

export const ImageUploadStep: React.FC<ImageUploadStepProps> = ({ listingId, onSuccess, onSkip, onBack }) => {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [images, setImages] = useState<UploadedImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const validFiles = Array.from(files).filter((file) => {
      if (file.type.startsWith("image/")) {
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          toast({
            title: "File too large",
            description: `${file.name} is larger than 10MB`,
            variant: "destructive",
          })
          return false
        }
        return true
      } else {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        })
        return false
      }
    })

    const newImages: UploadedImage[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      uploaded: false,
    }))

    setImages((prev) => [...prev, ...newImages])
  }

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  // Remove image
  const removeImage = (id: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview)
      }
      return prev.filter((img) => img.id !== id)
    })
  }

  // Upload images
  const handleUpload = async () => {
    if (images.length === 0) {
      toast({
        title: "No images selected",
        description: "Please select at least one image to upload",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const filesToUpload = images.filter((img) => !img.uploaded).map((img) => img.file)
      await ownerApi.uploadListingMedia(listingId, filesToUpload)

      // Mark all images as uploaded
      setImages((prev) => prev.map((img) => ({ ...img, uploaded: true })))

      toast({
        title: "Images uploaded successfully!",
        description: `${filesToUpload.length} image(s) have been added to your listing.`,
      })

      onSuccess()
    } catch (error: any) {
      console.error("Error uploading images:", error)
      toast({
        title: "Upload failed",
        description: error.response?.data?.message || "Failed to upload images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Property Images</h3>
            <p className="text-sm text-gray-600 mb-4">Drag and drop your images here, or click to browse</p>
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              Choose Files
            </Button>
            <p className="text-xs text-gray-500 mt-2">PNG, JPG, WebP up to 10MB each</p>
          </div>
        </div>

        {/* Image Preview Grid */}
        {images.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Selected Images ({images.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={image.preview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {image.uploaded && (
                      <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                        <div className="bg-green-500 text-white rounded-full p-1">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Tips for great photos:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Include multiple angles of your property</li>
            <li>• Show key features and amenities</li>
            <li>• Use good lighting and high resolution</li>
            <li>• Add exterior and interior shots</li>
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onSkip}>
            <SkipForward className="mr-2 h-4 w-4" />
            Skip Images
          </Button>
          <Button onClick={handleUpload} disabled={isUploading || images.length === 0}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                Upload & Complete
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </>
  )
}
