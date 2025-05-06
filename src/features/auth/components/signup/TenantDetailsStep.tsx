"use client"

import { Calendar, DollarSign, MapPin, Phone } from "lucide-react"
import { Checkbox } from "../../../../components/ui/checkbox"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import type { SignupFormData } from "../../types/signup.types"

interface TenantDetailsStepProps {
  formData: SignupFormData
  errors: Record<string, string>
  updateFormData: (field: keyof SignupFormData, value: any) => void
}

export function TenantDetailsStep({ formData, errors, updateFormData }: TenantDetailsStepProps) {
  const budgetRanges = [
    "Under $500",
    "$500 - $1,000",
    "$1,000 - $1,500",
    "$1,500 - $2,000",
    "$2,000 - $2,500",
    "Over $2,500",
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="preferredLocation">Preferred Location</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <MapPin className="h-4 w-4" />
          </div>
          <Input
            id="preferredLocation"
            placeholder="Enter your preferred location"
            value={formData.preferredLocation || ""}
            onChange={(e) => updateFormData("preferredLocation", e.target.value)}
            className={`pl-10 ${errors.preferredLocation ? "border-red-500" : ""}`}
          />
        </div>
        {errors.preferredLocation && <p className="text-sm text-red-500">{errors.preferredLocation}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget">Monthly Budget</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <DollarSign className="h-4 w-4" />
          </div>
          <Select value={formData.budget || ""} onValueChange={(value) => updateFormData("budget", value)}>
            <SelectTrigger id="budget" className={`pl-10 ${errors.budget ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Select your budget range" />
            </SelectTrigger>
            <SelectContent>
              {budgetRanges.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {errors.budget && <p className="text-sm text-red-500">{errors.budget}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="moveInDate">Preferred Move-in Date</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Calendar className="h-4 w-4" />
          </div>
          <Input
            id="moveInDate"
            type="date"
            value={formData.moveInDate || ""}
            onChange={(e) => updateFormData("moveInDate", e.target.value)}
            className={`pl-10 ${errors.moveInDate ? "border-red-500" : ""}`}
          />
        </div>
        {errors.moveInDate && <p className="text-sm text-red-500">{errors.moveInDate}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Phone className="h-4 w-4" />
          </div>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phoneNumber}
            onChange={(e) => updateFormData("phoneNumber", e.target.value)}
            className={`pl-10 ${errors.phoneNumber ? "border-red-500" : ""}`}
          />
        </div>
        {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
      </div>

      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
        <p className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Your preferences help us find the perfect rental for you.
        </p>
      </div>

      <div className="flex items-start space-x-2 pt-4">
        <Checkbox
          id="agreeToTerms"
          checked={formData.agreeToTerms}
          onCheckedChange={(checked) => updateFormData("agreeToTerms", checked)}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="agreeToTerms"
            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
              errors.agreeToTerms ? "text-red-500" : ""
            }`}
          >
            I agree to the Terms of Service and Privacy Policy
          </Label>
          {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms}</p>}
        </div>
      </div>
    </div>
  )
}
