"use client"

import type React from "react"

import { ChevronLeft, ChevronRight, DollarSign, Filter, Home, MapPin, Search, Tag, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import type { FeaturedListing } from "../api/publicApi"
import { publicApi } from "../api/publicApi"
import { Header } from "../components/layout/Header"
import { ListingCard } from "../components/listings/ListingCard"
import { Button } from "../components/ui/button"
import { Checkbox } from "../components/ui/checkbox"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Slider } from "../components/ui/slider"

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [listings, setListings] = useState<FeaturedListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "")
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("relevance")
  const [sidebarVisible, setSidebarVisible] = useState(true)

  // Categories for filter
  const categories = [
    { id: "apartment", name: "Apartments" },
    { id: "house", name: "Houses" },
    { id: "condo", name: "Condos" },
    { id: "vehicle", name: "Vehicles" },
    { id: "equipment", name: "Equipment" },
    { id: "event", name: "Event Spaces" },
  ]

  useEffect(() => {
    // Check if we should hide sidebar by default on mobile
    const checkMobileView = () => {
      if (window.innerWidth < 768) {
        setSidebarVisible(false)
      }
    }

    checkMobileView()
    window.addEventListener("resize", checkMobileView)

    return () => {
      window.removeEventListener("resize", checkMobileView)
    }
  }, [])

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true)
      try {
        // Get initial query parameters from URL
        const query = searchParams.get("query") || ""
        const locationParam = searchParams.get("location") || ""

        // Fetch listings based on search parameters
        const results = await publicApi.getFeaturedListings()

        // Filter results based on search query and location
        let filteredResults = results

        if (query) {
          filteredResults = filteredResults.filter(
            (listing) =>
              listing.title.toLowerCase().includes(query.toLowerCase()) ||
              listing.description.toLowerCase().includes(query.toLowerCase()),
          )
        }

        if (locationParam) {
          filteredResults = filteredResults.filter(
            (listing) =>
              listing.city.toLowerCase().includes(locationParam.toLowerCase()) ||
              listing.region.toLowerCase().includes(locationParam.toLowerCase()),
          )
        }

        setListings(filteredResults)
      } catch (error) {
        console.error("Error fetching listings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchListings()
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Update URL search parameters
    const params = new URLSearchParams()
    if (searchQuery) params.set("query", searchQuery)
    if (location) params.set("location", location)

    setSearchParams(params)
  }

  const handleFilterApply = () => {
    // Apply filters to the current listings
    // In a real implementation, this would make an API call with filter parameters

    // For mobile view, hide sidebar after applying filters
    if (window.innerWidth < 768) {
      setSidebarVisible(false)
    }
  }

  const handleClearFilters = () => {
    setPriceRange([0, 5000])
    setSelectedCategories([])
    setSortBy("relevance")
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        showSearch={true}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
      />

      <main className="flex-1 bg-gray-50 flex">
        {/* Filter Sidebar */}
        <aside
          className={`bg-white border-r border-gray-200 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto transition-all duration-300 ${
            sidebarVisible ? "w-64 md:w-80" : "w-0"
          }`}
        >
          <div className={`p-4 ${!sidebarVisible ? "hidden" : ""}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-8 px-2">
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>

            {/* Sort By */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Sort by</h3>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Price Range
              </h3>
              <div className="px-2">
                <Slider
                  defaultValue={[0, 5000]}
                  max={5000}
                  step={100}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                />
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply Filters Button - Mobile Only */}
            <Button onClick={handleFilterApply} className="w-full md:hidden mt-4">
              Apply Filters
            </Button>
          </div>
        </aside>

        {/* Toggle Sidebar Button */}
        <button
          onClick={toggleSidebar}
          className="fixed left-0 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 rounded-r-md p-2 shadow-md z-10"
          aria-label={sidebarVisible ? "Hide filters" : "Show filters"}
        >
          {sidebarVisible ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {/* Listings Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarVisible ? "md:ml-0" : "ml-0"}`}>
          {/* Search Bar */}
          <div className="bg-white border-b border-gray-200 py-4">
            <div className="container mx-auto px-4">
              <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="What are you looking for?"
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="relative flex-1 min-w-[200px]">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Location"
                    className="pl-10"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <Button type="submit" className="shrink-0">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>

                {/* Filter Button - Mobile Only */}
                <Button variant="outline" className="md:hidden" onClick={() => setSidebarVisible(true)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </form>
            </div>
          </div>

          {/* Listings Section */}
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                  {searchQuery || location ? "Search Results" : "Browse All Listings"}
                </h1>
                <p className="text-gray-500">
                  {listings.length} {listings.length === 1 ? "listing" : "listings"} found
                </p>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                      <div className="h-48 bg-gray-200"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                        <div className="flex justify-between">
                          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} showFavorite={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Home className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No listings found</h2>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your search or filter criteria to find what you're looking for.
                  </p>
                  <Button onClick={handleClearFilters}>Clear All Filters</Button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}