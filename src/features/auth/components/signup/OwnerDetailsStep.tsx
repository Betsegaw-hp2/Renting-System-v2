"use client"

import { Building, MapPin, Phone, Shield } from "lucide-react"
import { Checkbox } from "../../../../components/ui/checkbox"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs"
import type { SignupFormData } from "../../types/signup.types"

interface OwnerDetailsStepProps {
  formData: SignupFormData
  errors: Record<string, string>
  updateFormData: (field: keyof SignupFormData, value: any) => void
}

export function OwnerDetailsStep({ formData, errors, updateFormData }: OwnerDetailsStepProps) {
  const businessTypes = [
    "Individual",
    "LLC",
    "Corporation",
    "Partnership",
    "Real Estate Agency",
    "Property Management Company",
    "Other",
  ]

  const propertyCountOptions = ["1", "2-5", "6-10", "11-20", "21-50", "50+"]

  const propertyTypes = ["Apartment", "House", "Condo", "Townhouse", "Commercial", "Vacation Rental", "Other"]

  const idTypes = ["Driver's License", "Passport", "National ID Card", "Residence Permit"]

  const states = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ]

  return (
    <div className="space-y-6">
      <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm text-blue-800">
        <p>These details are optional. You can skip this step and complete your profile later.</p>
      </div>
      <Tabs defaultValue="location" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="location" className="flex items-center gap-2 py-3">
            <MapPin className="h-4 w-4" />
            <span>Location</span>
          </TabsTrigger>
          <TabsTrigger value="property" className="flex items-center gap-2 py-3">
            <Building className="h-4 w-4" />
            <span>Property</span>
          </TabsTrigger>
          <TabsTrigger value="kyc" className="flex items-center gap-2 py-3">
            <Shield className="h-4 w-4" />
            <span>Verification</span>
          </TabsTrigger>
        </TabsList>

        {/* Location Tab */}
        <TabsContent value="location" className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address (Optional)</Label>
            <Input
              id="address"
              placeholder="Enter your street address"
              value={formData.address || ""}
              onChange={(e) => updateFormData("address", e.target.value)}
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City (Optional)</Label>
              <Input
                id="city"
                placeholder="Enter your city"
                value={formData.city || ""}
                onChange={(e) => updateFormData("city", e.target.value)}
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State (Optional)</Label>
              <Select value={formData.state || ""} onValueChange={(value) => updateFormData("state", value)}>
                <SelectTrigger id="state" className={errors.state ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">Zip Code (Optional)</Label>
            <Input
              id="zipCode"
              placeholder="Enter your zip code"
              value={formData.zipCode || ""}
              onChange={(e) => updateFormData("zipCode", e.target.value)}
              className={errors.zipCode ? "border-red-500" : ""}
            />
            {errors.zipCode && <p className="text-sm text-red-500">{errors.zipCode}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Phone className="h-4 w-4" />
              </div>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone || ""}
                onChange={(e) => updateFormData("phone", e.target.value)}
                className={`pl-10 ${errors.phoneNumber ? "border-red-500" : ""}`}
              />
            </div>
            {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
          </div>
        </TabsContent>

        {/* Property Info Tab */}
        <TabsContent value="property" className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name (Optional)</Label>
            <Input
              id="companyName"
              placeholder="Enter your company name (if applicable)"
              // value={formData.companyName || ""}
              // onChange={(e) => updateFormData("companyName", e.target.value)}
              className={errors.companyName ? "border-red-500" : ""}
            />
            {errors.companyName && <p className="text-sm text-red-500">{errors.companyName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type (Optional)</Label>
            <Select
              // value={formData.businessType || ""}
              // onValueChange={(value) => updateFormData("businessType", value)}
            >
              <SelectTrigger id="businessType" className={errors.businessType ? "border-red-500" : ""}>
                <SelectValue placeholder="Select your business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.businessType && <p className="text-sm text-red-500">{errors.businessType}</p>}
          </div>

          <div className="space-y-2">
            <Label>Property Types (Optional)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 border rounded-md p-3 bg-gray-50">
              {propertyTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`property-type-${type}`}
                    checked={(formData.propertyTypes || []).includes(type)}
                    onCheckedChange={(checked) => {
                      const currentTypes = formData.propertyTypes || []
                      if (checked) {
                        updateFormData("propertyTypes", [...currentTypes, type])
                      } else {
                        updateFormData(
                          "propertyTypes",
                          currentTypes.filter((t) => t !== type),
                        )
                      }
                    }}
                  />
                  <Label htmlFor={`property-type-${type}`} className="text-sm">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
            {errors.propertyTypes && <p className="text-sm text-red-500">{errors.propertyTypes}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertiesOwned">Number of Properties (Optional)</Label>
            <Select
              value={formData.propertiesOwned || ""}
              onValueChange={(value) => updateFormData("propertiesOwned", value)}
            >
              <SelectTrigger id="propertiesOwned" className={errors.propertiesOwned ? "border-red-500" : ""}>
                <SelectValue placeholder="Select number of properties" />
              </SelectTrigger>
              <SelectContent>
                {propertyCountOptions.map((count) => (
                  <SelectItem key={count} value={count}>
                    {count}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.propertiesOwned && <p className="text-sm text-red-500">{errors.propertiesOwned}</p>}
          </div>
        </TabsContent>

        {/* KYC Verification Tab */}
        <TabsContent value="kyc" className="space-y-4 pt-2">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
            <p className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              We need to verify your identity to comply with regulations. This information is securely stored and
              protected.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idType">ID Type (Optional)</Label>
            <Select value={formData.idType || ""} onValueChange={(value) => updateFormData("idType", value)}>
              <SelectTrigger id="idType" className={errors.idType ? "border-red-500" : ""}>
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                {idTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.idType && <p className="text-sm text-red-500">{errors.idType}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="idNumber">ID Number (Optional)</Label>
            <Input
              id="idNumber"
              placeholder="Enter your ID number"
              value={formData.idNumber || ""}
              onChange={(e) => updateFormData("idNumber", e.target.value)}
              className={errors.idNumber ? "border-red-500" : ""}
            />
            {errors.idNumber && <p className="text-sm text-red-500">{errors.idNumber}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth || ""}
              onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
              className={errors.dateOfBirth ? "border-red-500" : ""}
            />
            {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
          </div>

          <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-gray-600">Drag and drop your ID document here, or click to browse</p>
              <button type="button" className="text-sm text-blue-600 hover:text-blue-500">
                Upload ID Document
              </button>
            </div>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}