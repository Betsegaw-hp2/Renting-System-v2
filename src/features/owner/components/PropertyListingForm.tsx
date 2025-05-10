"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { useRoleBasedAccess } from "../../../hooks/useRoleBasedAccess"
import type { RootState } from "../../../store"
import { UserRole } from "../../../types/user.types"

interface PropertyFormData {
  title: string
  description: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  // Add more fields as needed
}

export const PropertyListingForm: React.FC = () => {
  const { hasAccess } = useRoleBasedAccess([UserRole.PROPERTY_OWNER])
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormData>()

  const onSubmit = (data: PropertyFormData) => {
    // Here you would typically call an API to create the listing
    console.log("Submitting property listing:", data)

    // Navigate to the owner's listings page after submission
    navigate("/owner/listings")
  }

  if (!hasAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            Only property owners can create listings. Please create an owner account to list properties.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Property Listing</CardTitle>
        <CardDescription>Fill out the form below to list your property for rent.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Property Title
            </label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              placeholder="Enter a descriptive title"
            />
            {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              {...register("description", { required: "Description is required" })}
              className="w-full min-h-[100px] p-2 border rounded-md"
              placeholder="Describe your property"
            />
            {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">
                Price per Night ($)
              </label>
              <Input
                id="price"
                type="number"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 1, message: "Price must be greater than 0" },
                })}
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <Input
                id="location"
                {...register("location", { required: "Location is required" })}
                placeholder="City, State"
              />
              {errors.location && <p className="text-red-500 text-xs">{errors.location.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="bedrooms" className="text-sm font-medium">
                Bedrooms
              </label>
              <Input
                id="bedrooms"
                type="number"
                {...register("bedrooms", {
                  required: "Number of bedrooms is required",
                  min: { value: 1, message: "Must have at least 1 bedroom" },
                })}
                placeholder="1"
              />
              {errors.bedrooms && <p className="text-red-500 text-xs">{errors.bedrooms.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="bathrooms" className="text-sm font-medium">
                Bathrooms
              </label>
              <Input
                id="bathrooms"
                type="number"
                {...register("bathrooms", {
                  required: "Number of bathrooms is required",
                  min: { value: 1, message: "Must have at least 1 bathroom" },
                })}
                placeholder="1"
              />
              {errors.bathrooms && <p className="text-red-500 text-xs">{errors.bathrooms.message}</p>}
            </div>
          </div>

          {/* Add more form fields as needed */}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">Create Listing</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
