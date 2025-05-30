"use client"

import CameraCapture from "@/components/camera/CameraCapture";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { userApi } from "@/features/auth/api/userApi";
import { useToast } from "@/hooks/useToast";
import { Check, FileImage, Loader2, User, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react"; // Added useRef
import { useSelector } from "react-redux";

const CaptureState = {
  IDLE: 0,
  CAPTURING_FACE: 1,
  REVIEW: 4,
  SUBMITTING: 5,
  SUCCESS: 6,
  ERROR: 7,
} as const;
type CaptureState = (typeof CaptureState)[keyof typeof CaptureState];

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

  const [facePreviewUrl, setFacePreviewUrl] = useState<string | null>(null)
  const [frontPreviewUrl, setFrontPreviewUrl] = useState<string | null>(null)
  const [backPreviewUrl, setBackPreviewUrl] = useState<string | null>(null)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [kycResponse, setKycResponse] = useState<KycResponse | null>(null)

  // Refs for native camera input elements
  const frontIdInputRef = useRef<HTMLInputElement>(null);
  const backIdInputRef = useRef<HTMLInputElement>(null);

  // Effect to cleanup object URLs
  useEffect(() => {
    // This cleanup function will run if the component unmounts or if the dependencies change.
    // It ensures that any active object URLs are revoked.
    const urlsToClean = [facePreviewUrl, frontPreviewUrl, backPreviewUrl];
    return () => {
      urlsToClean.forEach(url => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [facePreviewUrl, frontPreviewUrl, backPreviewUrl]);

  // Start capturing face image
  const startCapturingFace = useCallback(() => {
    setCaptureState(CaptureState.CAPTURING_FACE)
  }, [])

  // Modified to trigger native camera input
  const startCapturingFront = useCallback(() => {
    frontIdInputRef.current?.click();
  }, []);

  // Modified to trigger native camera input
  const startCapturingBack = useCallback(() => {
    backIdInputRef.current?.click();
  }, []);

  // Handle face image capture
  const handleFaceCapture = useCallback((image: File) => {
    if (facePreviewUrl) URL.revokeObjectURL(facePreviewUrl)
    setFaceImage(image)
    setFacePreviewUrl(URL.createObjectURL(image))
    setCaptureState(CaptureState.IDLE)
    toast({
      title: "Selfie captured",
      description: "Your selfie has been captured successfully.",
    })
  }, [facePreviewUrl, toast])

  const handleFrontsideCapture = useCallback((image: File) => {
    if (frontPreviewUrl) URL.revokeObjectURL(frontPreviewUrl)
    setFrontsideImage(image)
    setFrontPreviewUrl(URL.createObjectURL(image))
    setCaptureState(CaptureState.IDLE) // Ensure state returns to IDLE
    toast({
      title: "Front image captured",
      description: "Front side of your ID has been captured successfully.",
    })
  }, [frontPreviewUrl, toast])

  const handleBacksideCapture = useCallback((image: File) => {
    if (backPreviewUrl) URL.revokeObjectURL(backPreviewUrl)
    setBacksideImage(image)
    setBackPreviewUrl(URL.createObjectURL(image))
    setCaptureState(CaptureState.IDLE) // Ensure state returns to IDLE
    toast({
      title: "Back image captured",
      description: "Back side of your ID has been captured successfully.",
    })
  }, [backPreviewUrl, toast])

  // Handler for native file inputs (ID front/back)
  const handleIdFileSelected = useCallback((
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'back'
  ) => {
    if (event.target.files && event.target.files[0]) {
      const imageFile = event.target.files[0];
      if (type === 'front') {
        handleFrontsideCapture(imageFile);
      } else {
        handleBacksideCapture(imageFile);
      }
    }
    if (event.target) {
      event.target.value = ""; // Reset input to allow re-capture of same file name
    }
  }, [handleFrontsideCapture, handleBacksideCapture]);


  const handleCancelCapture = useCallback(() => {
    setCaptureState(CaptureState.IDLE)
  }, [])

  const resetImage = useCallback((type: "face" | "front" | "back") => {
    if (type === "face") {
      if (facePreviewUrl) URL.revokeObjectURL(facePreviewUrl)
      setFaceImage(null)
      setFacePreviewUrl(null)
    } else if (type === "front") {
      if (frontPreviewUrl) URL.revokeObjectURL(frontPreviewUrl)
      setFrontsideImage(null)
      setFrontPreviewUrl(null)
    } else {
      if (backPreviewUrl) URL.revokeObjectURL(backPreviewUrl)
      setBacksideImage(null)
      setBackPreviewUrl(null)
    }
  }, [facePreviewUrl, frontPreviewUrl, backPreviewUrl])

  const reviewImages = useCallback(() => {
    if (!faceImage || !frontsideImage || !backsideImage) {
      setErrorMessage("Your selfie and both front and back images of your ID are required before review.");
    } else {
      setErrorMessage(null);
    }
    setCaptureState(CaptureState.REVIEW)
  }, [faceImage, frontsideImage, backsideImage])

  const submitKyc = useCallback(async () => {
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
  }, [faceImage, frontsideImage, backsideImage, user?.id, toast]) // Removed setKycResponse, setCaptureState, setErrorMessage from deps as they are stable

  const resetForm = useCallback(() => {
    if (facePreviewUrl) URL.revokeObjectURL(facePreviewUrl)
    setFaceImage(null)
    setFacePreviewUrl(null)
    if (frontPreviewUrl) URL.revokeObjectURL(frontPreviewUrl)
    setFrontsideImage(null)
    setFrontPreviewUrl(null)
    if (backPreviewUrl) URL.revokeObjectURL(backPreviewUrl)
    setBacksideImage(null)
    setBackPreviewUrl(null)
    setCaptureState(CaptureState.IDLE)
    setErrorMessage(null)
    setKycResponse(null)
  }, [facePreviewUrl, frontPreviewUrl, backPreviewUrl])

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

      case CaptureState.REVIEW:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-center">Review Your Images</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Please verify that all images are clear and all information is readable.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {faceImage && facePreviewUrl && (
                <div className="relative">
                  <div className="aspect-[4/3] rounded-md overflow-hidden border">
                    <img
                      src={facePreviewUrl || "/placeholder.svg"}
                      alt="Selfie"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium mt-2">Selfie</p>
                </div>
              )}

              {frontsideImage && frontPreviewUrl && (
                <div className="relative">
                  <div className="aspect-[4/3] rounded-md overflow-hidden border">
                    <img
                      src={frontPreviewUrl || "/placeholder.svg"}
                      alt="Front side of ID"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium mt-2">Front Side</p>
                </div>
              )}

              {backsideImage && backPreviewUrl && (
                <div className="relative">
                  <div className="aspect-[4/3] rounded-md overflow-hidden border">
                    <img
                      src={backPreviewUrl || "/placeholder.svg"}
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
            {/* Hidden file inputs for native camera access */}
            <input
              type="file"
              accept="image/*"
              capture="environment" // For back camera, typically used for IDs
              ref={frontIdInputRef}
              style={{ display: 'none' }}
              onChange={(e) => handleIdFileSelected(e, 'front')}
            />
            <input
              type="file"
              accept="image/*"
              capture="environment" // For back camera
              ref={backIdInputRef}
              style={{ display: 'none' }}
              onChange={(e) => handleIdFileSelected(e, 'back')}
            />

            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <h3 className="font-medium text-amber-800">Verification Required</h3>
              <p className="text-sm text-amber-700 mt-1">
                Please capture a selfie and clear images of your ID document using your device's camera.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Selfie Card */}
              <Card className="p-6 flex flex-col items-center justify-center">
                {faceImage && facePreviewUrl ? (
                  <div className="w-full">
                    <div className="aspect-[4/3] rounded-md overflow-hidden border mb-4">
                      <img
                        src={facePreviewUrl || "/placeholder.svg"}
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
                {frontsideImage && frontPreviewUrl ? (
                  <div className="w-full">
                    <div className="aspect-[4/3] rounded-md overflow-hidden border mb-4">
                      <img
                        src={frontPreviewUrl || "/placeholder.svg"}
                        alt="Front side of ID"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => resetImage("front")}>
                        Reset
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <FileImage className="h-10 w-10 text-gray-400 mb-4" />
                    <p className="text-sm font-medium mb-2">ID Front</p>
                    <p className="text-xs text-gray-500 mb-4 text-center">Capture the front of your ID</p>
                    <Button onClick={startCapturingFront}>Capture Front ID</Button>
                  </>
                )}
              </Card>

              {/* ID Back Card */}
              <Card className="p-6 flex flex-col items-center justify-center">
                {backsideImage && backPreviewUrl ? (
                  <div className="w-full">
                    <div className="aspect-[4/3] rounded-md overflow-hidden border mb-4">
                      <img
                        src={backPreviewUrl || "/placeholder.svg"}
                        alt="Back side of ID"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => resetImage("back")}>
                        Reset
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <FileImage className="h-10 w-10 text-gray-400 mb-4" />
                    <p className="text-sm font-medium mb-2">ID Back</p>
                    <p className="text-xs text-gray-500 mb-4 text-center">Capture the back of your ID</p>
                    <Button onClick={startCapturingBack}>Capture Back ID</Button>
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
