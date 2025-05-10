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

export function SearchFilters({ onSearch, className, showAdvanced = false, initialValues }: SearchFiltersProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("")
  const [dateRangeValue, setDateRangeValue] = useState("any")
  const [useMockApi, setUseMockApi] = useState(true)
  const [showFilters, setShowFilters] = useState(showAdvanced)
  const [error, setError] = useState<string | null>(null)

  // Load saved filters from localStorage on component mount
  useEffect(() => {
    if (initialValues) {
      // If initial values are provided, use them
      setSearchQuery(initialValues.query || "")
      setCategory(initialValues.category || "")
      setDateRangeValue(
        initialValues.dateRange?.label
          ? DATE_RANGES.find((r) => r.label === initialValues.dateRange?.label)?.value || "any"
          : "any",
      )
      setUseMockApi(initialValues.useMockApi !== undefined ? initialValues.useMockApi : true)
    } else {
      // Otherwise, try to load from localStorage
      const savedFilters = localStorage.getItem("searchFilters")
      if (savedFilters) {
        try {
          const parsedFilters = JSON.parse(savedFilters)
          setSearchQuery(parsedFilters.query || "")
          setCategory(parsedFilters.category || "")
          setDateRangeValue(parsedFilters.dateRange?.value || "any")
          setUseMockApi(parsedFilters.useMockApi !== undefined ? parsedFilters.useMockApi : true)
        } catch (error) {
          console.error("Error parsing saved filters:", error)
        }
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

  // Update the handleSearch function to always use real API
  const handleSearch = () => {
    // Clear any previous errors
    setError(null)

    // Create filters object
    const dateRange = getDateRangeFromValue(dateRangeValue)

    const filters: SearchFilters = {
      query: searchQuery,
      category: category,
      dateRange: dateRange,
      useMockApi: false, // Always use real API
    }

    // Save filters to localStorage
    localStorage.setItem(
      "searchFilters",
      JSON.stringify({
        ...filters,
        dateRange: { ...dateRange, value: dateRangeValue },
      }),
    )

    // If onSearch prop is provided, call it with the filters
    if (onSearch) {
      try {
        onSearch(filters)
      } catch (error) {
        setError("An error occurred while searching. Please try again.")
        console.error("Search error:", error)
      }
      return
    }

    // Otherwise, navigate to search results page with query parameters
    const queryParams = new URLSearchParams()
    if (searchQuery) queryParams.append("query", searchQuery)
    if (category) queryParams.append("category", category)
    if (dateRangeValue !== "any") queryParams.append("dateRange", dateRangeValue)
    queryParams.append("mock", "false") // Always use real API

    navigate(`/browse?${queryParams.toString()}`)

    // Reset form fields after search only when navigating away
    setSearchQuery("")
    setCategory("")
    setDateRangeValue("any")
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
          <Button className="flex-shrink-0" onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>

        {/* Additional Filters - Collapsible */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
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
                  <SelectItem value="homes">Homes</SelectItem>
                  <SelectItem value="vehicles">Vehicles</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="spaces">Spaces</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                </SelectContent>
              </Select>
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
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
