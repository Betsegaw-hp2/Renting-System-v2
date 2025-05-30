"use client"

import { Button } from "@/components/ui/button"
import { Camera, FlipHorizontal, X } from "lucide-react"
import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"

interface CameraCaptureProps {
  onCapture: (image: File) => void
  onCancel: () => void
  captureType: "face" | "id-front" | "id-back"
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel, captureType }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [isFrontCamera, setIsFrontCamera] = useState(captureType === "face")
  const [error, setError] = useState<string | null>(null)

  // Initialize camera
  const initCamera = useCallback(async () => {
    try {
      // If a stream already exists, stop its tracks before getting a new one.
      // This is important when switching cameras or re-initializing.
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      const constraints = {
        video: {
          facingMode: isFrontCamera ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // Ensure video plays automatically
        videoRef.current.play().catch((e) => {
          console.error("Error playing video:", e)
          setError("Could not start video stream. Please check your browser settings.")
        })
      }

      setError(null)
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Could not access camera. Please ensure you've granted camera permissions.")
    }
  }, [isFrontCamera]) // Removed 'stream' from dependencies

  // Handle video loaded metadata
  const handleVideoMetadata = () => {
    setIsCameraReady(true)
  }

  // Initialize camera on component mount
  useEffect(() => {
    async function listDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      devices.forEach(device => {
        console.log(`${device.kind}: ${device.label} id = ${device.deviceId}`);
      });
    } catch (err) {
      console.error("Error listing devices:", err);
    }
  }
    listDevices()

    initCamera();

    // Cleanup function to stop camera stream when component unmounts
    // or when initCamera changes (e.g., due to isFrontCamera changing)
    return () => {
      // Access the stream directly from the state for cleanup
      // This ensures we're cleaning up the most current stream
      // if the component unmounts while a stream is active.
      setStream(currentStream => {
        if (currentStream) {
          currentStream.getTracks().forEach((track) => track.stop());
        }
        return null; // Set stream to null after stopping
      });
    };
  }, [initCamera])

  // Switch between front and back camera
  const toggleCamera = () => {
    setIsFrontCamera((prev) => !prev)
  }

  // Capture image from video stream
  const captureImage = () => {
    if (!canvasRef.current || !videoRef.current || !isCameraReady) return

    const canvas = canvasRef.current
    const video = videoRef.current

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas
    const context = canvas.getContext("2d")
    if (context) {
      // Flip horizontally if using front camera for selfie
      if (captureType === "face" && isFrontCamera) {
        context.translate(canvas.width, 0)
        context.scale(-1, 1)
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Reset transform if we applied one
      if (captureType === "face" && isFrontCamera) {
        context.setTransform(1, 0, 0, 1, 0, 0)
      }

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a File object from the blob
            const fileName =
              captureType === "face"
                ? `selfie-${Date.now()}.jpg`
                : `id-${captureType === "id-front" ? "front" : "back"}-${Date.now()}.jpg`

            const file = new File([blob], fileName, { type: "image/jpeg" })
            onCapture(file)
          }
        },
        "image/jpeg",
        0.95,
      ) // High quality JPEG
    }
  }

  // Get appropriate guide frame and instructions based on capture type
  const getGuideFrame = () => {
    switch (captureType) {
      case "face":
        return (
          <div className="border-2 border-dashed border-white rounded-full w-48 h-48 opacity-70">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm text-center bg-black bg-opacity-50 p-1 rounded w-40">
              Position your face within the circle
            </div>
          </div>
        )
      case "id-front":
      case "id-back":
        return (
          <div className="border-2 border-dashed border-white w-4/5 h-3/5 rounded-md opacity-70">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm text-center bg-black bg-opacity-50 p-1 rounded">
              Position {captureType === "id-front" ? "front" : "back"} of ID card within frame
            </div>
          </div>
        )
    }
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">{error}</div>}

      <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/3]">
        {/* The key attribute forces React to recreate the video element when camera changes */}
        <video
          ref={videoRef}
          key={`video-${isFrontCamera ? "front" : "back"}`}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={handleVideoMetadata}
          className={`w-full h-full object-cover ${captureType === "face" && isFrontCamera ? "transform scale-x-[-1]" : ""}`}
        />

        {/* Overlay with guide frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">{getGuideFrame()}</div>

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex justify-between mt-4">
        <Button variant="outline" size="icon" onClick={onCancel} aria-label="Cancel">
          <X className="h-5 w-5" />
        </Button>

        <Button variant="default" onClick={captureImage} disabled={!isCameraReady} className="px-6">
          <Camera className="h-5 w-5 mr-2" />
          Capture
        </Button>

        {/* Only show camera toggle for ID captures, not for selfie */}
        {captureType !== "face" && (
          <Button variant="outline" size="icon" onClick={toggleCamera} aria-label="Switch camera">
            <FlipHorizontal className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default CameraCapture
