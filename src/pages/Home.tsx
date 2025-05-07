"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, CreditCard, Key, Star, Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { ListingCard } from "../components/listings/ListingCard"
import { CategoryCard } from "../components/categories/CategoryCard"
import { publicApi } from "../api/publicApi"
import type { FeaturedListing, Testimonial, CategoryCount } from "../api/publicApi"
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs"

export default function HomePage() {
  const [featuredListings, setFeaturedListings] = useState<FeaturedListing[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [categories, setCategories] = useState<CategoryCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("all")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [categorySlide, setCategorySlide] = useState(0)
  const [listingSlide, setListingSlide] = useState(0)
  const [testimonialSlide, setTestimonialSlide] = useState(0)
  const categoriesPerSlide = 3 // Number of categories per slide
  const listingsPerSlide = 4 // Number of listings per slide

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true)
      try {
        // Fetch data in parallel
        const [listingsData, testimonialsData, categoriesData] = await Promise.all([
          publicApi.getFeaturedListings(),
          publicApi.getTestimonials(),
          publicApi.getCategoryCounts(),
        ])

        setFeaturedListings(listingsData)
        setTestimonials(testimonialsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching home data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  const handleSearch = () => {
    // Navigate to search results page
    window.location.href = `/browse?category=${category}&location=${encodeURIComponent(location)}&start=${dateRange.start}&end=${dateRange.end}`
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-6 w-6 text-blue-600"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="text-xl font-bold text-blue-600">All-in-One Rental Place</span>
            </Link>

            <nav className="hidden md:flex space-x-6">
              <Link to="/browse" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                Browse Rentals
              </Link>
              <Link to="/how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                How It Works
              </Link>
              <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                About Us
              </Link>
              <Link to="/contact" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                Contact
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                Log In
              </Link>
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gray-50 py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Find Your Perfect Rental in One Place
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl">
                  Discover homes, vehicles, equipment, event spaces, and more. Rent with confidence and enjoy a seamless
                  experience.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link
                  to="/browse"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Browse Rentals
                </Link>
                <Link
                  to="/list-property"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  List Your Property
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[300px] w-full overflow-hidden rounded-xl bg-gray-100 sm:h-[350px] lg:h-[400px]">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Rental platform showcase"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-4 left-4 rounded-lg bg-white px-3 py-2 shadow-md">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">4.9 average rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Box */}
      <div className="container mx-auto -mt-8 max-w-4xl rounded-xl border bg-white p-4 shadow-md z-10 relative">
        <Tabs defaultValue={category} className="w-full" onValueChange={setCategory}>
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="homes">Homes</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="spaces">Spaces</TabsTrigger>
          </TabsList>
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder={`Location for ${category === "all" ? "rental" : category}`}
                className="pl-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Start date - End date"
                className="pl-10"
                // This would typically be connected to a date picker component
                onChange={(e) => {
                  // Simple parsing for demo purposes
                  const dates = e.target.value.split("-")
                  if (dates.length === 2) {
                    setDateRange({
                      start: dates[0].trim(),
                      end: dates[1].trim(),
                    })
                  }
                }}
              />
            </div>
            <Button className="flex-shrink-0" onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </Tabs>
      </div>

      {/* Categories Section */}
      <section className="my-10 py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Browse by Category</h2>
            <p className="text-gray-600">Find exactly what you need from our diverse categories</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="bg-gray-200 rounded-full h-16 w-16 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative max-w-6xl mx-auto">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${categorySlide * 100}%)` }}
                >
                  {Array.from({ length: Math.ceil(categories.length / categoriesPerSlide) }).map((_, slideIndex) => (
                    <div key={slideIndex} className="flex-none w-full">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {categories
                          .slice(slideIndex * categoriesPerSlide, (slideIndex + 1) * categoriesPerSlide)
                          .map((category) => (
                            <CategoryCard
                              key={category.category}
                              category={category.category}
                              count={category.count}
                              icon={category.icon}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: Math.ceil(categories.length / categoriesPerSlide) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCategorySlide(index)}
                    className={`h-2 w-2 rounded-full ${categorySlide === index ? "bg-blue-600" : "bg-gray-300"}`}
                    aria-label={`Go to category slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCategorySlide((prev) => Math.max(0, prev - 1))}
                className={`absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md ${categorySlide === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
                disabled={categorySlide === 0}
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              <button
                onClick={() => setCategorySlide((prev) => Math.min(Math.ceil(categories.length / categoriesPerSlide) - 1, prev + 1))}
                className={`absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md ${categorySlide === Math.ceil(categories.length / categoriesPerSlide) - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
                disabled={categorySlide === Math.ceil(categories.length / categoriesPerSlide) - 1}
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Featured Listings</h2>
            <p className="text-gray-600">Discover our most popular rental items</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md animate-pulse">
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
          ) : (
            <div className="relative max-w-6xl mx-auto">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${listingSlide * 100}%)` }}
                >
                  {Array.from({ length: Math.ceil(featuredListings.length / listingsPerSlide) }).map((_, slideIndex) => (
                    <div key={slideIndex} className="flex-none w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredListings
                          .slice(slideIndex * listingsPerSlide, (slideIndex + 1) * listingsPerSlide)
                          .map((listing) => (
                            <ListingCard key={listing.id} listing={listing} />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: Math.ceil(featuredListings.length / listingsPerSlide) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setListingSlide(index)}
                    className={`h-2 w-2 rounded-full ${listingSlide === index ? "bg-blue-600" : "bg-gray-300"}`}
                    aria-label={`Go to listing slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setListingSlide((prev) => Math.max(0, prev - 1))}
                className={`absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md ${listingSlide === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
                disabled={listingSlide === 0}
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              <button
                onClick={() => setListingSlide((prev) => Math.min(Math.ceil(featuredListings.length / listingsPerSlide) - 1, prev + 1))}
                className={`absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md ${listingSlide === Math.ceil(featuredListings.length / listingsPerSlide) - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
                disabled={listingSlide === Math.ceil(featuredListings.length / listingsPerSlide) - 1}
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          )}

          <div className="text-center mt-10">
            <Button asChild variant="outline">
              <Link to="/browse">View All Listings</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">How It Works</h2>
            <p className="text-gray-600">Renting has never been easier</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-xl mb-2">Search</h3>
              <p className="text-gray-600">
                Browse thousands of listings with detailed filters to find exactly what you need.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-xl mb-2">Book</h3>
              <p className="text-gray-600">Schedule viewings and book your rental directly through our platform.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-xl mb-2">Pay</h3>
              <p className="text-gray-600">Secure payment processing with multiple payment options available.</p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Key className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-xl mb-2">Enjoy</h3>
              <p className="text-gray-600">Get your rental and enjoy it with our satisfaction guarantee.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">What Our Users Say</h2>
            <p className="text-gray-600">Don't just take our word for it - hear from our satisfied users</p>
          </div>

          {isLoading ? (
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 w-4 bg-gray-200 rounded-full mr-1"></div>
                ))}
              </div>
              <div className="h-24 bg-gray-200 rounded mb-4"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative max-w-4xl mx-auto">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${testimonialSlide * 100}%)` }}
                >
                  {testimonials.map((testimonial, _index) => (
                    <div key={testimonial.id} className="flex-none w-full">
                      <div className="bg-white p-8 rounded-lg shadow-md mx-4">
                        <div className="flex items-center mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 mb-6 text-lg italic">"{testimonial.comment}"</p>
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-200 rounded-full mr-4">
                            {testimonial.avatar && (
                              <img
                                src={testimonial.avatar || "/placeholder.svg"}
                                alt={testimonial.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                            <p className="text-sm text-gray-500">{testimonial.role}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-6 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setTestimonialSlide(index)}
                    className={`h-2 w-2 rounded-full ${testimonialSlide === index ? "bg-blue-600" : "bg-gray-300"}`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setTestimonialSlide((prev) => Math.max(0, prev - 1))}
                className={`absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md ${testimonialSlide === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
                disabled={testimonialSlide === 0}
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              <button
                onClick={() => setTestimonialSlide((prev) => Math.min(testimonials.length - 1, prev + 1))}
                className={`absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md ${testimonialSlide === testimonials.length - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
                disabled={testimonialSlide === testimonials.length - 1}
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to start renting?</h2>
            <p className="text-blue-100 mb-8">
              Join thousands of happy users who found exactly what they needed on our platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-white text-blue-600 hover:bg-blue-50">
                <Link to="/signup">Sign Up Now</Link>
              </Button>
              <Button asChild className="bg-slate-700 border-white text-white hover:bg-slate-600">
                <Link to="/browse">Browse Listings</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4">All-in-One Rental Place</h3>
              <p className="text-gray-400 mb-4">
                Find anything you need to rent on our easy-to-use platform. We connect renters and owners for a seamless
                rental experience across multiple categories.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/browse" className="text-gray-400 hover:text-white">
                    Browse Rentals
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="text-gray-400 hover:text-white">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-gray-400 hover:text-white">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">For Owners</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/owner-dashboard" className="text-gray-400 hover:text-white">
                    Owner Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/list-item" className="text-gray-400 hover:text-white">
                    List Your Item
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-gray-400 hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/resources" className="text-gray-400 hover:text-white">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-400 hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Contact Us</h3>
              <p className="text-gray-400 mb-2">
                <a href="mailto:support@rentalplace.com" className="hover:text-white">
                  support@rentalplace.com
                </a>
              </p>
              <p className="text-gray-400 mb-4">
                <a href="tel:+15551234567" className="hover:text-white">
                  +1 (555) 123-4567
                </a>
              </p>
              <p className="text-gray-400">Send us a message</p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400 text-sm text-center">
              © {new Date().getFullYear()} All-in-One Rental Place. All rights reserved.
            </p>
            <div className="flex justify-center mt-4 space-x-4 text-sm">
              <Link to="/terms" className="text-gray-400 hover:text-white">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white">
                Privacy Policy
              </Link>
              <Link to="/cookie" className="text-gray-400 hover:text-white">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
