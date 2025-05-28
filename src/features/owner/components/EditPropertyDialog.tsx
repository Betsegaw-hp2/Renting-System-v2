"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/useToast"
import { ownerApi } from "../api/ownerApi"
import type { FeaturedListing } from "../../../api/publicApi"

interface Category {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  created_at: string
  updated_at: string
}

interface EditPropertyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listing: FeaturedListing
  onSuccess?: () => void
}

export const EditPropertyDialog: React.FC<EditPropertyDialogProps> = ({ open, onOpenChange, listing, onSuccess }) => {
  const { toast } = useToast()

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: listing.title,
    description: listing.description,
    address: listing.address,
    city: listing.city,
    region: listing.region,
    country: listing.country,
    price: listing.price,
    category_id: listing.category.id,
    availability_start: listing.availability.startDate,
    availability_end: listing.availability.endDate,
    status: listing.status,
  })

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Date picker state
  const [startDate, setStartDate] = useState<Date>(new Date(listing.availability.startDate))
  const [endDate, setEndDate] = useState<Date>(new Date(listing.availability.endDate))

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

    if (open) {
      fetchCategories()
    }
  }, [open, toast])

  // Reset form when listing changes
  useEffect(() => {
    setFormData({
      title: listing.title,
      description: listing.description,
      address: listing.address,
      city: listing.city,
      region: listing.region,
      country: listing.country,
      price: listing.price,
      category_id: listing.category.id,
      availability_start: listing.availability.startDate,
      availability_end: listing.availability.endDate,
      status: listing.status,
    })
    setStartDate(new Date(listing.availability.startDate))
    setEndDate(new Date(listing.availability.endDate))
    setErrors({})
  }, [listing])

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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
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
      await ownerApi.updateListing(listing.id, formData)

      toast({
        title: "Success!",
        description: "Property updated successfully.",
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error("Error updating listing:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update listing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>Update your property details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
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
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleSelectChange(value, "category_id")}
                  >
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
                  <Label htmlFor="price">Price (per day)</Label>
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

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange(value, "status")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
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
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Property"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
