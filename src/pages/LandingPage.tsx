"use client"

import type React from "react"

import type { RootState } from "@/store"
import { Calendar, CreditCard, Key, Search, Star } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import type { FeaturedListing, Testimonial } from "../api/publicApi"
import { publicApi } from "../api/publicApi"
import { CategoryCard } from "../components/categories/CategoryCard"
import { Footer } from "../components/layout/Footer"
import { Header } from "../components/layout/Header"
import { ListingCard } from "../components/listings/ListingCard"
import { SearchFilters, type SearchFilters as SearchFiltersType } from "../components/search/SearchFilters"
import { Button } from "../components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel"

export default function HomePage() {
  const navigate = useNavigate()
  const [featuredListings, setFeaturedListings] = useState<FeaturedListing[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const {  is_authenticated } = useSelector((state: RootState) => state.auth)
  const [categories, setCategories] = useState<CategoryCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filteredListings, setFilteredListings] = useState<FeaturedListing[]>([])

  // Refs for scroll behavior
  const howItWorksRef = useRef<HTMLElement>(null)

  // Scroll to section
  const scrollToSection = (ref: React.RefObject<HTMLElement | HTMLDivElement>) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  // 
  type CategoryCount = {
    id: string;
    name: string
    slug: string
    description: string;
    image_url: string;
    created_at: string;
    updated_at: string;
    icon?: string;
  }
  
  

  useEffect(() => {
    if (is_authenticated) {
      navigate("/home")
      return
    }

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
        setFilteredListings(listingsData)
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

  const handleSearch = (filters: SearchFiltersType) => {
    // Filter listings based on search criteria
    const filtered = featuredListings.filter((listing) => {
      // Filter by search query
      const matchesQuery =
        !filters.query ||
        listing.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        listing.description.toLowerCase().includes(filters.query.toLowerCase()) ||
        listing.category.name.toLowerCase().includes(filters.query.toLowerCase())

      // Filter by category
      const matchesCategory =
        !filters.category ||
        filters.category === "all" ||
        listing.category.name.toLowerCase() === filters.category.toLowerCase()

      // Filter by date range (if applicable)
      // This is a simplified example - in a real app, you'd need to check if the listing is available during the selected date range
      const matchesDateRange = true

      return matchesQuery && matchesCategory && matchesDateRange
    })

    setFilteredListings(filtered)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

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
              <div className="relative h-[300px] w-full overflow-hidden rounded-xl bg-transparent sm:h-[350px] lg:h-[400px]">
                <img
                  src="/assets/hero-image.png"
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
      <SearchFilters className="max-w-4xl mx-auto -mt-8" onSearch={handleSearch}/>

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
            <Carousel itemsPerSlide={3} className="w-full">
              <CarouselContent>
                {categories.map((category) => (
                  <CarouselItem key={category.slug} className="md:basis-1/3 lg:basis-1/3">
                    <div className="p-1">
                      <CategoryCard category={category} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
              <CarouselDots count={Math.ceil(categories.length / 3)} className="mt-4" />
            </Carousel>
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
          ) : filteredListings.length > 0 ? (
            <Carousel itemsPerSlide={4} className="w-full">
              <CarouselContent>
                {filteredListings.map((listing) => (
                  <CarouselItem key={listing.id} className="md:basis-1/2 lg:basis-1/4">
                    <div className="p-1">
                      <ListingCard listing={listing} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
              <CarouselDots count={Math.ceil(filteredListings.length / 4)} className="mt-4" />
            </Carousel>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No listings found matching your search criteria.</p>
              <Button variant="outline" className="mt-4" onClick={() => setFilteredListings(featuredListings)}>
                Reset Filters
              </Button>
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
      <section ref={howItWorksRef} id="how-it-works" className="py-16 bg-gray-50">
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
            <Carousel itemsPerSlide={1} className="w-full max-w-4xl mx-auto">
              <CarouselContent>
                {testimonials.map((testimonial) => (
                  <CarouselItem key={testimonial.id}>
                    <div className="p-1">
                      <div className="bg-white p-8 rounded-lg shadow-md">
                        <div className="flex items-center mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
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
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-12" />
              <CarouselNext className="-right-12" />
              <CarouselDots count={testimonials.length} className="mt-4" />
            </Carousel>
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
      <Footer scrollToSection={scrollToSection} howItWorksRef={howItWorksRef} />
    </div>
  )
}
