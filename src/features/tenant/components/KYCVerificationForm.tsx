"use client"

import type React from "react"
import { useState } from "react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/useToast"
import { userApi } from "@/features/auth/api/userApi"
import CameraCapture from "@/components/camera/CameraCapture"
import { Check, Loader2, X, User, CreditCard } from "lucide-react"

const CaptureState = {
  IDLE: 0,
  CAPTURING_FACE: 1,
  CAPTURING_FRONT: 2,
  CAPTURING_BACK: 3,
  REVIEW: 4,
  SUBMITTING: 5,
  SUCCESS: 6,
  ERROR: 7,
} as const
type CaptureState = typeof CaptureState[keyof typeof CaptureState]

interface KycResponse {
  backside: string
  created_at: string
  face: string
  frontside: string
  id: string
  updated_at: string
  user_id: string
}

const KycVerificationForm: React.FC = () => {
  const { toast } = useToast()
  const user = useSelector((state: any) => state.auth.user)
  const [captureState, setCaptureState] = useState<CaptureState>(CaptureState.IDLE)
  const [faceImage, setFaceImage] = useState<File | null>(null)
  const [frontsideImage, setFrontsideImage] = useState<File | null>(null)
  const [backsideImage, setBacksideImage] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [kycResponse, setKycResponse] = useState<KycResponse | null>(null)

  // Start capturing face image
  const startCapturingFace = () => {
    setCaptureState(CaptureState.CAPTURING_FACE)
  }

  // Start capturing frontside image
  const startCapturingFront = () => {
    setCaptureState(CaptureState.CAPTURING_FRONT)
  }

  // Start capturing backside image
  const startCapturingBack = () => {
    setCaptureState(CaptureState.CAPTURING_BACK)
  }

  // Handle face image capture
  const handleFaceCapture = (image: File) => {
    setFaceImage(image)
    setCaptureState(CaptureState.IDLE)
    toast({
      title: "Selfie captured",
      description: "Your selfie has been captured successfully.",
    })
  }

  // Handle frontside image capture
  const handleFrontsideCapture = (image: File) => {
    setFrontsideImage(image)
    setCaptureState(CaptureState.IDLE)
    toast({
      title: "Front image captured",
      description: "Front side of your ID has been captured successfully.",
    })
  }

  // Handle backside image capture
  const handleBacksideCapture = (image: File) => {
    setBacksideImage(image)
    setCaptureState(CaptureState.IDLE)
    toast({
      title: "Back image captured",
      description: "Back side of your ID has been captured successfully.",
    })
  }

  // Cancel capture
  const handleCancelCapture = () => {
    setCaptureState(CaptureState.IDLE)
  }

  // Reset a specific image
  const resetImage = (type: "face" | "front" | "back") => {
    if (type === "face") {
      setFaceImage(null)
    } else if (type === "front") {
      setFrontsideImage(null)
    } else {
      setBacksideImage(null)
    }
  }

  // Review images before submission
  const reviewImages = () => {
    setCaptureState(CaptureState.REVIEW)
  }

  // Submit KYC documents
  const submitKyc = async () => {
    if (!faceImage || !frontsideImage || !backsideImage || !user?.id) {
      setErrorMessage("Your selfie and both front and back images of your ID are required.")
      return
    }

    setCaptureState(CaptureState.SUBMITTING)
    setErrorMessage(null)

    try {
      const response = await userApi.uploadKycDocuments(user.id, faceImage, frontsideImage, backsideImage)
      setKycResponse(response)
      setCaptureState(CaptureState.SUCCESS)
      toast({
        title: "KYC submitted successfully",
        description: "Your ID documents have been submitted for verification.",
      })
    } catch (error: any) {
      setCaptureState(CaptureState.ERROR)
      setErrorMessage(error.message || "Failed to submit KYC documents. Please try again.")
      toast({
        title: "KYC submission failed",
        description: error.message || "Failed to submit KYC documents. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Reset the form
  const resetForm = () => {
    setFaceImage(null)
    setFrontsideImage(null)
    setBacksideImage(null)
    setCaptureState(CaptureState.IDLE)
    setErrorMessage(null)
    setKycResponse(null)
  }

  // Render based on current state
  const renderContent = () => {
    switch (captureState) {
      case CaptureState.CAPTURING_FACE:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-center">Take a Selfie</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Position your face within the circle and take a clear photo.
            </p>
            <CameraCapture onCapture={handleFaceCapture} onCancel={handleCancelCapture} captureType="face" />
          </div>
        )

      case CaptureState.CAPTURING_FRONT:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-center">Capture Front Side of ID</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Position the front of your ID card within the frame and take a clear photo.
            </p>
            <CameraCapture onCapture={handleFrontsideCapture} onCancel={handleCancelCapture} captureType="id-front" />
          </div>
        )

      case CaptureState.CAPTURING_BACK:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-center">Capture Back Side of ID</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Position the back of your ID card within the frame and take a clear photo.
            </p>
            <CameraCapture onCapture={handleBacksideCapture} onCancel={handleCancelCapture} captureType="id-back" />
          </div>
        )

      case CaptureState.REVIEW:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-center">Review Your Images</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Please verify that all images are clear and all information is readable.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {faceImage && (
                <div className="relative">
                  <div className="aspect-[4/3] rounded-md overflow-hidden border">
                    <img
                      src={URL.createObjectURL(faceImage) || "/placeholder.svg"}
                      alt="Selfie"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium mt-2">Selfie</p>
                </div>
              )}

              {frontsideImage && (
                <div className="relative">
                  <div className="aspect-[4/3] rounded-md overflow-hidden border">
                    <img
                      src={URL.createObjectURL(frontsideImage) || "/placeholder.svg"}
                      alt="Front side of ID"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium mt-2">Front Side</p>
                </div>
              )}

              {backsideImage && (
                <div className="relative">
                  <div className="aspect-[4/3] rounded-md overflow-hidden border">
                    <img
                      src={URL.createObjectURL(backsideImage) || "/placeholder.svg"}
                      alt="Back side of ID"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium mt-2">Back Side</p>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">{errorMessage}</div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCaptureState(CaptureState.IDLE)}>
                Back
              </Button>
              <Button onClick={submitKyc}>Submit for Verification</Button>
            </div>
          </div>
        )

      case CaptureState.SUBMITTING:
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-medium">Submitting Your Documents</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Please wait while we upload your ID documents...
            </p>
          </div>
        )

      case CaptureState.SUCCESS:
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-green-100 rounded-full p-4 mb-4">
              <Check className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-lg font-medium">Verification Submitted</h3>
            <p className="text-sm text-muted-foreground text-center mt-2 mb-6">
              Your ID documents have been submitted successfully. We'll review them and update your verification status.
            </p>
            {kycResponse && (
              <div className="bg-gray-50 p-4 rounded-md w-full mb-6">
                <h4 className="text-sm font-medium mb-2">Submission Details:</h4>
                <p className="text-xs text-muted-foreground">ID: {kycResponse.id}</p>
                <p className="text-xs text-muted-foreground">
                  Submitted: {new Date(kycResponse.created_at).toLocaleString()}
                </p>
              </div>
            )}
            <Button onClick={resetForm}>Done</Button>
          </div>
        )

      case CaptureState.ERROR:
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-red-100 rounded-full p-4 mb-4">
              <X className="h-12 w-12 text-red-600" />
            </div>
            <h3 className="text-lg font-medium">Submission Failed</h3>
            <p className="text-sm text-red-600 text-center mt-2 mb-2">
              {errorMessage || "There was an error submitting your documents."}
            </p>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Please try again or contact support if the problem persists.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={resetForm}>
                Start Over
              </Button>
              <Button onClick={() => setCaptureState(CaptureState.REVIEW)}>Try Again</Button>
            </div>
          </div>
        )

      default: // IDLE state
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <h3 className="font-medium text-amber-800">Verification Required</h3>
              <p className="text-sm text-amber-700 mt-1">
                Please capture a selfie and clear images of your ID document using your device's camera.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Selfie Card */}
              <Card className="p-6 flex flex-col items-center justify-center">
                {faceImage ? (
                  <div className="w-full">
                    <div className="aspect-[4/3] rounded-md overflow-hidden border mb-4">
                      <img
                        src={URL.createObjectURL(faceImage) || "/placeholder.svg"}
                        alt="Selfie"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => resetImage("face")}>
                        Reset
                      </Button>
                      <Button size="sm" onClick={startCapturingFace}>
                        Retake
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <User className="h-10 w-10 text-gray-400 mb-4" />
                    <p className="text-sm font-medium mb-2">Selfie</p>
                    <p className="text-xs text-gray-500 mb-4 text-center">Take a clear photo of your face</p>
                    <Button onClick={startCapturingFace}>Capture Selfie</Button>
                  </>
                )}
              </Card>

              {/* ID Front Card */}
              <Card className="p-6 flex flex-col items-center justify-center">
                {frontsideImage ? (
                  <div className="w-full">
                    <div className="aspect-[4/3] rounded-md overflow-hidden border mb-4">
                      <img
                        src={URL.createObjectURL(frontsideImage) || "/placeholder.svg"}
                        alt="Front side of ID"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => resetImage("front")}>
                        Reset
                      </Button>
                      <Button size="sm" onClick={startCapturingFront}>
                        Retake
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <CreditCard className="h-10 w-10 text-gray-400 mb-4" />
                    <p className="text-sm font-medium mb-2">ID Card (Front)</p>
                    <p className="text-xs text-gray-500 mb-4 text-center">
                      Capture a clear image of the front of your ID card
                    </p>
                    <Button onClick={startCapturingFront}>Capture Front</Button>
                  </>
                )}
              </Card>

              {/* ID Back Card */}
              <Card className="p-6 flex flex-col items-center justify-center">
                {backsideImage ? (
                  <div className="w-full">
                    <div className="aspect-[4/3] rounded-md overflow-hidden border mb-4">
                      <img
                        src={URL.createObjectURL(backsideImage) || "/placeholder.svg"}
                        alt="Back side of ID"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => resetImage("back")}>
                        Reset
                      </Button>
                      <Button size="sm" onClick={startCapturingBack}>
                        Retake
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <CreditCard className="h-10 w-10 text-gray-400 mb-4" />
                    <p className="text-sm font-medium mb-2">ID Card (Back)</p>
                    <p className="text-xs text-gray-500 mb-4 text-center">
                      Capture a clear image of the back of your ID card
                    </p>
                    <Button onClick={startCapturingBack}>Capture Back</Button>
                  </>
                )}
              </Card>
            </div>

            <Button
              className="w-full"
              disabled={!faceImage || !frontsideImage || !backsideImage}
              onClick={reviewImages}
            >
              Continue to Review
            </Button>
          </div>
        )
    }
  }

  return <div className="max-w-2xl mx-auto">{renderContent()}</div>
}

export default KycVerificationForm
