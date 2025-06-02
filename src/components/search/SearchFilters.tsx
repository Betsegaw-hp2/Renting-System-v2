"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Filter, AlertCircle } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Label } from "../ui/label"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { cn } from "../../lib/utils"
import { addDays, subDays } from "date-fns"
import { publicApi, type CategoryCount } from "@/api/publicApi"
import { tagApi } from "@/api/tagApi"

interface SearchFiltersProps {
  onSearch?: (filters: SearchFilters) => void
  className?: string
  showAdvanced?: boolean
  initialValues?: Partial<SearchFilters>
}

export interface SearchFilters {
  query: string
  category: string
  dateRange: {
    label: string
    startDate?: Date
    endDate?: Date
  }
  useMockApi: boolean
  minPrice?: number
  maxPrice?: number
  city?: string
  tags?: string[]
}

// Predefined date ranges
const DATE_RANGES = [
  { label: "Any time", value: "any" },
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7days" },
  { label: "Last 30 days", value: "30days" },
  { label: "Last 90 days", value: "90days" },
  { label: "Next 7 days", value: "next7days" },
  { label: "Next 30 days", value: "next30days" },
  { label: "Next 90 days", value: "next90days" },
]

// Predefined tags
const AVAILABLE_TAGS = [
  "Pet Friendly",
  "Furnished",
  "Parking",
  "Gym",
  "Pool",
  "Air Conditioning",
  "Balcony",
  "Garden",
  "Security",
  "Elevator",
]

export function SearchFilters({ onSearch, className, showAdvanced = false, initialValues }: SearchFiltersProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<CategoryCount[]>([])
  const [category, setCategory] = useState("")
  const [dateRangeValue, setDateRangeValue] = useState("any")
  const [showFilters, setShowFilters] = useState(showAdvanced)
  const [error, setError] = useState<string | null>(null)  // New state variables for additional filters
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const [city, setCity] = useState<string>("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  // New state for dynamic tags
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [isLoadingTags, setIsLoadingTags] = useState(false)
  
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await publicApi.getCategoryCounts(false)
        setCategories(data)
      } catch (err) {
        console.error("Failed to fetch categories:", err)
      }
    }

    fetchCategories()
  }, [])

  // Fetch tags when category changes
  useEffect(() => {
    async function fetchTagsForCategory() {      if (!category || category === "all") {
        // If no category selected, get all tags from API
        setIsLoadingTags(true)
        try {
          const allTags = await tagApi.getAllTags()
          const tagNames = allTags.map(tag => tag.name)
          setAvailableTags(tagNames)
        } catch (err) {
          console.error("Failed to fetch all tags:", err)
          setAvailableTags(AVAILABLE_TAGS)
        } finally {
          setIsLoadingTags(false)
        }
        return
      }

      setIsLoadingTags(true)
      try {
        // Fetch tags for the specific category
        const categoryTags = await publicApi.getCategoryTags(category)
        setAvailableTags(categoryTags.length > 0 ? categoryTags : AVAILABLE_TAGS)
        
        // Clear selected tags that are not available in the new category
        setSelectedTags(prev => 
          prev.filter(tagName => 
            categoryTags.includes(tagName)
          )
        )
      } catch (err) {
        console.error("Failed to fetch category tags:", err)
        setAvailableTags(AVAILABLE_TAGS)
      } finally {
        setIsLoadingTags(false)
      }
    }

    fetchTagsForCategory()
  }, [category])


  // Load saved filters from localStorage on component mount
  useEffect(() => {
    const pathname = window.location.pathname

    if (initialValues) {
      // Use initial values if passed
      setSearchQuery(initialValues.query || "")
      setCategory(initialValues.category || "")
      setDateRangeValue(
        initialValues.dateRange?.label
          ? DATE_RANGES.find((r) => r.label === initialValues.dateRange?.label)?.value || "any"
          : "any"      )
      setMinPrice(initialValues.minPrice?.toString() || "")
      setMaxPrice(initialValues.maxPrice?.toString() || "")
      setCity(initialValues.city || "")
      setSelectedTags(initialValues.tags || [])
    } else {
      // Only load from localStorage if NOT on the landing page
      if (pathname !== "/") {
        const savedFilters = localStorage.getItem("searchFilters")
        if (savedFilters) {
          try {
            const parsedFilters = JSON.parse(savedFilters)
            setSearchQuery(parsedFilters.query || "")
            setCategory(parsedFilters.category || "")
            setDateRangeValue(parsedFilters.dateRange?.value || "any")
            setMinPrice(parsedFilters.minPrice?.toString() || "")
            setMaxPrice(parsedFilters.maxPrice?.toString() || "")
            setCity(parsedFilters.city || "")
            setSelectedTags(parsedFilters.tags || [])
          } catch (error) {
            console.error("Error parsing saved filters:", error)
          }
        }
      } else {
        // Reset filters on landing page
        setSearchQuery("")
        setCategory("")
        setDateRangeValue("any")
        setMinPrice("")
        setMaxPrice("")
        setCity("")
        setSelectedTags([])
      }
    }
  }, [initialValues])



  // Convert selected date range to actual dates
  const getDateRangeFromValue = (value: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (value) {
      case "today":
        return {
          label: "Today",
          startDate: today,
          endDate: today,
        }
      case "7days":
        return {
          label: "Last 7 days",
          startDate: subDays(today, 7),
          endDate: today,
        }
      case "30days":
        return {
          label: "Last 30 days",
          startDate: subDays(today, 30),
          endDate: today,
        }
      case "90days":
        return {
          label: "Last 90 days",
          startDate: subDays(today, 90),
          endDate: today,
        }
      case "next7days":
        return {
          label: "Next 7 days",
          startDate: today,
          endDate: addDays(today, 7),
        }
      case "next30days":
        return {
          label: "Next 30 days",
          startDate: today,
          endDate: addDays(today, 30),
        }
      case "next90days":
        return {
          label: "Next 90 days",
          startDate: today,
          endDate: addDays(today, 90),
        }
      default:
        return {
          label: "Any time",
          startDate: undefined,
          endDate: undefined,
        }
    }
  }

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }
  // Update the handleSearch function
  const handleSearch = () => {
    setError(null)
    const dateRange = getDateRangeFromValue(dateRangeValue)
    const minPriceValue = minPrice ? parseFloat(minPrice) : undefined
    const maxPriceValue = maxPrice ? parseFloat(maxPrice) : undefined
    if (minPriceValue && maxPriceValue && minPriceValue > maxPriceValue) {
      setError("Minimum price cannot be greater than maximum price")
      return
    }
    const filters: SearchFilters = {
      query: searchQuery,
      category: category,
      dateRange: dateRange,
      useMockApi: false,
      minPrice: minPriceValue,
      maxPrice: maxPriceValue,
      city: city || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    }
    localStorage.setItem(
      "searchFilters",
      JSON.stringify({
        ...filters,
        dateRange: { ...dateRange, value: dateRangeValue },
      }),
    )
    if (onSearch) {
      try {
        onSearch(filters)
      } catch (error) {
        setError("An error occurred while searching. Please try again.")
        console.error("Search error:", error)
      }
    }    const queryParams = new URLSearchParams()
    if (searchQuery) queryParams.append("search", searchQuery)
    if (category) queryParams.append("category", category)
    if (dateRangeValue !== "any") queryParams.append("date_range", dateRangeValue)
    if (minPriceValue !== undefined) queryParams.append("min_price", minPriceValue.toString())
    if (maxPriceValue !== undefined) queryParams.append("max_price", maxPriceValue.toString())
    if (city) queryParams.append("city", city)
    if (selectedTags.length > 0) {
      selectedTags.forEach(tag => queryParams.append("tags", tag))
    }
    queryParams.append("mock", "false")
    navigate(`/browse?${queryParams.toString()}`)
  }

  // Add price validation on input change
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setMinPrice(value)
      setError(null)
    }
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setMaxPrice(value)
      setError(null)
    }
  }

  return (
    <div className={cn("container mx-auto rounded-xl border bg-white p-6 shadow-md z-20 relative", className)}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <h3 className="text-lg font-medium">Find your perfect rental</h3>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2"></div>

            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-gray-500"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-1 h-3 w-3" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          {/* Search Input - Primary */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for anything..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch()
                }
              }}
            />
          </div>

          {/* Search Button */}
          <Button className="flex-shrink-0 bg-gradient-to-r from-blue-800 to-blue-500 text-white hover:bg-gradient-to-r hover:from-blue-900 hover:to-blue-600" onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>

        {/* Additional Filters - Collapsible */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            {/* Category Dropdown */}
            <div>
              <Label htmlFor="category" className="text-sm font-medium mb-1 block">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City Input */}
            <div>
              <Label htmlFor="city" className="text-sm font-medium mb-1 block">
                City
              </Label>
              <Input
                id="city"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="minPrice" className="text-sm font-medium mb-1 block">
                  Min Price
                </Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="maxPrice" className="text-sm font-medium mb-1 block">
                  Max Price
                </Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Date Range Dropdown */}
            <div>
              <Label htmlFor="date-range" className="text-sm font-medium mb-1 block">
                Date Range
              </Label>
              <Select value={dateRangeValue} onValueChange={setDateRangeValue}>
                <SelectTrigger id="date-range">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>            </div>            {/* Dynamic Tags */}
            <div className="md:col-span-2 lg:col-span-3">
              <Label className="text-sm font-medium mb-2 block">
                Tags {category && category !== "all" && (
                  <span className="text-xs text-gray-500 ml-1">
                    (for {categories.find(c => c.slug === category)?.name || category})
                  </span>
                )}
              </Label>
              {isLoadingTags ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                  Loading tags...
                </div>
              ) : availableTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTagToggle(tag)}
                      className="text-sm"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {category && category !== "all" 
                    ? "No tags available for this category" 
                    : "Select a category to see available tags"}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
