"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { format } from "date-fns"
import { CalendarIcon, Loader2, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/useToast"
import type { RootState } from "@/store"
import { ownerApi, type CreateListingPayload } from "../api/ownerApi"
import { ImageUploadStep } from "../components/ImageUploadStep"
import type { FeaturedListing } from "@/api/publicApi"

interface Category {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  created_at: string
  updated_at: string
}

interface AddPropertyFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

type FormStep = "details" | "images" | "complete"

export const AddPropertyForm: React.FC<AddPropertyFormProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)

  const [currentStep, setCurrentStep] = useState<FormStep>("details")
  const [createdListing, setCreatedListing] = useState<FeaturedListing | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<CreateListingPayload>({
    title: "",
    description: "",
    address: "",
    city: "",
    region: "",
    country: "",
    price: 0,
    category_id: "",
    availability_start: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    availability_end: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    status: "available",
  })

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Date picker state
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() + 1)))

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      try {
        const data = await ownerApi.getCategories()
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast({
          title: "Error",
          description: "Failed to load property categories. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [toast])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  // Handle select changes
  const handleSelectChange = (value: string, name: string) => {
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle date changes
  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(date)
      setFormData((prev) => ({
        ...prev,
        availability_start: format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      }))

      // Clear error
      if (errors.availability_start) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.availability_start
          return newErrors
        })
      }
    }
  }

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setEndDate(date)
      setFormData((prev) => ({
        ...prev,
        availability_end: format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      }))

      // Clear error
      if (errors.availability_end) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.availability_end
          return newErrors
        })
      }
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required"
    }

    if (!formData.region.trim()) {
      newErrors.region = "Region/State is required"
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required"
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0"
    }

    if (!formData.category_id) {
      newErrors.category_id = "Category is required"
    }

    // Check if end date is after start date
    if (new Date(formData.availability_end) <= new Date(formData.availability_start)) {
      newErrors.availability_end = "End date must be after start date"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission for details step
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await ownerApi.createListing({
        ...formData
      })
      setCreatedListing(response)
      setCurrentStep("images")

      toast({
        title: "Property Details Saved!",
        description: "Now let's add some images to your listing.",
      })
    } catch (error: any) {
      console.error("Error creating listing:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create listing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle successful image upload
  const handleImageUploadSuccess = () => {
    setCurrentStep("complete")
    toast({
      title: "Success!",
      description: "Your property has been listed successfully with images.",
    })

    // Auto-close dialog after a brief delay to show success state
    setTimeout(() => {
      if (onSuccess) {
        onSuccess()
      }
    }, 2000)
  }

  // Handle skip images
  const handleSkipImages = () => {
    setCurrentStep("complete")
    toast({
      title: "Property Listed!",
      description: "Your property has been listed successfully. You can add images later.",
    })

    // Auto-close dialog after a brief delay
    setTimeout(() => {
      if (onSuccess) {
        onSuccess()
      }
    }, 2000)
  }

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-4">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep === "details"
              ? "bg-blue-600 text-white"
              : currentStep === "images" || currentStep === "complete"
                ? "bg-green-600 text-white"
                : "bg-gray-200"
          }`}
        >
          {currentStep === "images" || currentStep === "complete" ? <Check className="w-4 h-4" /> : "1"}
        </div>
        <span className="text-sm font-medium">Property Details</span>

        <div
          className={`w-12 h-0.5 ${
            currentStep === "images" || currentStep === "complete" ? "bg-green-600" : "bg-gray-200"
          }`}
        />

        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep === "images"
              ? "bg-blue-600 text-white"
              : currentStep === "complete"
                ? "bg-green-600 text-white"
                : "bg-gray-200"
          }`}
        >
          {currentStep === "complete" ? <Check className="w-4 h-4" /> : "2"}
        </div>
        <span className="text-sm font-medium">Images</span>

        <div className={`w-12 h-0.5 ${currentStep === "complete" ? "bg-green-600" : "bg-gray-200"}`} />

        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep === "complete" ? "bg-green-600 text-white" : "bg-gray-200"
          }`}
        >
          {currentStep === "complete" ? <Check className="w-4 h-4" /> : "3"}
        </div>
        <span className="text-sm font-medium">Complete</span>
      </div>
    </div>
  )

  // Render details step
  const renderDetailsStep = () => (
    <form onSubmit={handleDetailsSubmit}>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter a descriptive title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your property"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category_id">Category</Label>
              <Select value={formData.category_id} onValueChange={(value) => handleSelectChange(value, "category_id")}>
                <SelectTrigger className={errors.category_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading categories...</span>
                    </div>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price (per month)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price || ""}
                  onChange={handleInputChange}
                  className={`pl-8 ${errors.price ? "border-red-500" : ""}`}
                />
              </div>
              {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Location</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="Street address"
                value={formData.address}
                onChange={handleInputChange}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="region">State/Province/Region</Label>
              <Input
                id="region"
                name="region"
                placeholder="State/Province/Region"
                value={formData.region}
                onChange={handleInputChange}
                className={errors.region ? "border-red-500" : ""}
              />
              {errors.region && <p className="text-sm text-red-500">{errors.region}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleInputChange}
                className={errors.country ? "border-red-500" : ""}
              />
              {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Availability</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="availability_start">Available From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      errors.availability_start ? "border-red-500" : ""
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={handleStartDateChange} initialFocus />
                </PopoverContent>
              </Popover>
              {errors.availability_start && <p className="text-sm text-red-500">{errors.availability_start}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="availability_end">Available Until</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      errors.availability_end ? "border-red-500" : ""
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateChange}
                    initialFocus
                    disabled={(date) => date < startDate}
                  />
                </PopoverContent>
              </Popover>
              {errors.availability_end && <p className="text-sm text-red-500">{errors.availability_end}</p>}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Next: Add Images
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </form>
  )

  // Render complete step
  const renderCompleteStep = () => (
    <CardContent className="text-center py-12">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Property Listed Successfully!</h3>
      <p className="text-gray-600 mb-6">
        Your property "{createdListing?.title}" has been created and is now live on the platform.
      </p>
      <Button onClick={onSuccess}>View My Properties</Button>
    </CardContent>
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <StepIndicator />
        <CardTitle>
          {currentStep === "details" && "Add New Property"}
          {currentStep === "images" && "Add Property Images"}
          {currentStep === "complete" && "Property Created!"}
        </CardTitle>
        <CardDescription>
          {currentStep === "details" && "Fill in the details below to list your property for rent"}
          {currentStep === "images" && "Upload images to showcase your property"}
          {currentStep === "complete" && "Your property has been successfully created"}
        </CardDescription>
      </CardHeader>

      {currentStep === "details" && renderDetailsStep()}
      {currentStep === "images" && createdListing && (
        <ImageUploadStep
          listingId={createdListing.id}
          onSuccess={handleImageUploadSuccess}
          onSkip={handleSkipImages}
          onBack={() => setCurrentStep("details")}
        />
      )}
      {currentStep === "complete" && renderCompleteStep()}
    </Card>
  )
}
