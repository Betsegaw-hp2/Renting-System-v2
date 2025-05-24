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
  const { is_authenticated } = useSelector((state: RootState) => state.auth)
  const [categories, setCategories] = useState<CategoryCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filteredListings, setFilteredListings] = useState<FeaturedListing[]>([])
  const [isVisible, setIsVisible] = useState({
    hero: false,
    categories: false,
    listings: false,
    howItWorks: false,
    testimonials: false,
    cta: false,
  })

  // Refs for scroll behavior and animations
  const howItWorksRef = useRef<HTMLElement>(null)
  const categoriesRef = useRef<HTMLElement>(null)
  const listingsRef = useRef<HTMLElement>(null)
  const testimonialsRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLElement>(null)

  // Scroll to section
  const scrollToSection = (ref: React.RefObject<HTMLElement | HTMLDivElement>) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Intersection Observer for animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    }

    const observerCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target.getAttribute("data-section")
          if (target) {
            setIsVisible((prev) => ({ ...prev, [target]: true }))
          }
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    const sections = [
      { ref: categoriesRef, name: "categories" },
      { ref: listingsRef, name: "listings" },
      { ref: howItWorksRef, name: "howItWorks" },
      { ref: testimonialsRef, name: "testimonials" },
      { ref: ctaRef, name: "cta" },
    ]

    sections.forEach((section) => {
      if (section.ref.current) {
        observer.observe(section.ref.current)
      }
    })

    // Trigger hero animation on load
    setTimeout(() => {
      setIsVisible((prev) => ({ ...prev, hero: true }))
    }, 100)

    return () => {
      sections.forEach((section) => {
        if (section.ref.current) {
          observer.unobserve(section.ref.current)
        }
      })
    }
  }, [])

  type CategoryCount = {
    id: string
    name: string
    slug: string
    description: string
    image_url: string
    created_at: string
    updated_at: string
    icon?: string
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
  }, [is_authenticated, navigate])

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
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Header */}
      <Header />

      {/* Enhanced Hero Section with Creative Visual Elements */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-white to-blue-50">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Main Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/80 via-white/60 to-purple-50/70 z-0"></div>

          {/* Animated Blob Shapes */}
          <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[60%] rounded-full bg-gradient-to-br from-blue-200/30 to-blue-300/20 blur-3xl animate-blob"></div>
          <div className="absolute top-[20%] -right-[10%] w-[50%] h-[60%] rounded-full bg-gradient-to-bl from-blue-100/30 to-indigo-200 blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-[20%] right-[10%] w-[40%] h-[60%] rounded-full bg-gradient-to-tr from-blue-200/30 to-indigo-200/20 blur-3xl animate-blob animation-delay-4000"></div>
          <div className="absolute -bottom-[20%] right-[10%] w-[50%] h-[60%] rounded-full bg-gradient-to-tr from-purple-200/30 to-blue-200/20 blur-3xl animate-blob animation-delay-4000"></div>


          {/* Decorative Elements */}
          <div className="absolute top-[15%] left-[15%] w-[70%] h-[70%] rounded-full border border-blue-200/10"></div>
          <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] rounded-full border border-blue-200/10"></div>

          {/* Dot Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, #1E40AF 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          ></div>
          {/* Zigzag Lines */}
          <svg
            className="absolute left-0 bottom-[20%] h-[300px] w-[150px] text-blue-200/20 opacity-20"
            viewBox="0 0 100 600"
            preserveAspectRatio="none"
          >
            <path
              d="M100,0 L80,40 L100,80 L80,120 L100,160 L80,200 L100,240 L80,280 L100,320 L80,360 L100,400 L80,440 L100,480 L80,520 L100,560 L80,600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <svg
            className="absolute left-0 bottom-[20%] h-[300px] w-[150px] text-blue-200/20 opacity-20"
            viewBox="0 0 100 600"
            preserveAspectRatio="none"
          >
            <path
              d="M100,0 L80,40 L100,80 L80,120 L100,160 L80,200 L100,240 L80,280 L100,320 L80,360 L100,400 L80,440 L100,480 L80,520 L100,560 L80,600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          {/* Curved Lines */}
          <svg
            className="absolute left-[10%] top-[10%] w-[200px] h-[200px] text-blue-300/20 opacity-20"
            viewBox="0 0 200 200"
          >
            <path
              d="M10,100 C30,30 170,30 190,100 C170,170 30,170 10,100 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>

          <svg
            className="absolute right-[10%] bottom-[10%] w-[200px] h-[200px] text-blue-300/20 opacity-20"
            viewBox="0 0 200 200"
          >
            <path
              d="M10,100 C30,30 170,30 190,100 C170,170 30,170 10,100 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </div>

        <div className="container relative mx-auto px-4 md:px-6 z-10">
          <div
            className={`grid gap-8 lg:grid-cols-2 lg:gap-12 items-center transition-all duration-1000 ${isVisible.hero ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            <div className="flex flex-col justify-center space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-sm font-medium mb-2 w-fit shadow-sm border border-blue-100/50">
                <span className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                  All-In-One Rental Platform
                </span>
              </div>

              {/* Main Content */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
                  <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 pb-2">
                    Find Your Perfect Rental
                  </span>
                  <br />
                  <span className="text-gray-800">in One Place</span>
                </h1>
                <p className="max-w-[600px] text-gray-600 md:text-xl">
                  Discover homes, vehicles, equipment, event spaces, and more. Rent with confidence and enjoy a seamless
                  experience.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link
                  to="/browse"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-blue-500 px-8 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <span>Browse Rentals</span>
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <Link
                  to="/list-property"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-blue-200 bg-white/80 backdrop-blur-sm px-8 text-sm font-medium text-blue-600 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-blue-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  List Your Property
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 mt-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-white"
                      ></div>
                    ))}
                  </div>
                  <span>10k+ users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span>4.9 rating</span>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              {/* Enhanced Image Container with Advanced Lighting Effects */}
              <div className="relative w-full max-w-[500px] h-[350px] md:h-[400px]">
                {/* Decorative Elements */}
                <div className="absolute -top-6 -right-6 w-20 h-20">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-blue-500/20">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" fill="none" />
                    <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </div>

                <div className="absolute -bottom-6 -left-6 w-16 h-16">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-blue-500/20">
                    <rect x="20" y="20" width="60" height="60" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </div>

                {/* Advanced Glow Effects */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 rounded-2xl blur-xl opacity-70"></div>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-md"></div>

                {/* Spotlight Effect */}
                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-3xl"></div>

                {/* Main Image with Frame */}
                <div className="relative h-full w-full rounded-2xl overflow-hidden bg-white shadow-xl border border-blue-100/50">
                  {/* Gradient Overlay for Image */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 z-10 pointer-events-none"></div>

                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hero-image-r36Rq3qLwq1G3UEtuLm8v8SSQCdbez.png"
                    alt="Luxury home and car rentals"
                    className="h-full w-full object-contain"
                  />

                  {/* Enhanced Floating Badge */}
                  <div className="absolute bottom-4 left-4 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-2 shadow-lg border border-blue-100/50 z-20">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                        Premium Rentals Available
                      </span>
                    </div>
                  </div>

                  {/* Decorative Corner Elements */}
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-blue-200/30 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-blue-200/30 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-blue-200/30 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-blue-200/30 rounded-br-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path
              fill="#F9FAFB"
              fillOpacity="1"
              d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,80C672,64,768,64,864,69.3C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Search Box */}
      <div className="relative z-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto -mt-6 md:-mt-16 mb-8 transition-all duration-700 transform">
            <SearchFilters className="rounded-xl shadow-xl bg-white border border-gray-100" onSearch={handleSearch} />
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <section ref={categoriesRef} data-section="categories" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div
            className={`text-center mb-12 transition-all duration-700 ${isVisible.categories ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            <h2 className="text-3xl font-bold mb-2 relative inline-block">
              Browse by Category
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-blue-500 rounded-full"></span>
            </h2>
            <p className="text-gray-600 mt-4">Find exactly what you need from our diverse categories</p>
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
            <div
              className={`transition-all duration-1000 delay-300 ${isVisible.categories ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
            >
              <Carousel itemsPerSlide={3} className="w-full">
                <CarouselContent>
                  {categories.map((category, index) => (
                    <CarouselItem key={category.slug} className="md:basis-1/3 lg:basis-1/3">
                      <div className="p-1 transition-all duration-500" style={{ transitionDelay: `${index * 100}ms` }}>
                        <div className="transform transition-transform duration-300 hover:scale-105">
                          <CategoryCard category={category} />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 bg-white shadow-md hover:bg-blue-50 transition-all duration-300" />
                <CarouselNext className="right-2 bg-white shadow-md hover:bg-blue-50 transition-all duration-300" />
                <CarouselDots count={Math.ceil(categories.length / 3)} className="mt-4" />
              </Carousel>
            </div>
          )}
        </div>
      </section>

      {/* Featured Listings */}
      <section ref={listingsRef} data-section="listings" className="py-16 bg-white relative overflow-hidden">
        {/* Background Blob */}
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-[40%] h-[80%] rounded-full bg-blue-50 opacity-50 blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div
            className={`text-center mb-12 transition-all duration-700 ${isVisible.listings ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            <h2 className="text-3xl font-bold mb-2 relative inline-block">
              Featured Listings
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-blue-500 rounded-full"></span>
            </h2>
            <p className="text-gray-600 mt-4">Discover our most popular rental items</p>
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
            <div
              className={`transition-all duration-1000 delay-300 ${isVisible.listings ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
            >
              <Carousel itemsPerSlide={4} className="w-full">
                <CarouselContent>
                  {filteredListings.map((listing, index) => (
                    <CarouselItem key={listing.id} className="md:basis-1/2 lg:basis-1/4">
                      <div className="p-1 transition-all duration-500" style={{ transitionDelay: `${index * 100}ms` }}>
                        <div className="transform transition-transform duration-300 hover:scale-105 hover:shadow-lg rounded-lg">
                          <ListingCard listing={listing} />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 bg-white shadow-md hover:bg-blue-50 transition-all duration-300" />
                <CarouselNext className="right-2 bg-white shadow-md hover:bg-blue-50 transition-all duration-300" />
                <CarouselDots count={Math.ceil(filteredListings.length / 4)} className="mt-4" />
              </Carousel>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No listings found matching your search criteria.</p>
              <Button
                variant="outline"
                className="mt-4 transition-all duration-300 hover:bg-blue-50 hover:scale-105"
                onClick={() => setFilteredListings(featuredListings)}
              >
                Reset Filters
              </Button>
            </div>
          )}

          <div className="text-center mt-10">
            <Button
              asChild
              variant="outline"
              className="transition-all duration-300 hover:bg-blue-50 hover:scale-105 hover:shadow-md"
            >
              <Link to="/browse">View All Listings</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        ref={howItWorksRef}
        data-section="howItWorks"
        id="how-it-works"
        className="py-16 bg-gray-50 relative overflow-hidden"
      >
        {/* Background Blobs */}
        <div className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[60%] rounded-full bg-blue-100 opacity-30 blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div
            className={`text-center mb-12 transition-all duration-700 ${isVisible.howItWorks ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            <h2 className="text-3xl font-bold mb-2 relative inline-block">
              How It Works
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-blue-500 rounded-full"></span>
            </h2>
            <p className="text-gray-600 mt-4">Renting has never been easier</p>
          </div>

          <div
            className={`relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-1000 delay-300 ${isVisible.howItWorks ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            {/* Connecting Line (visible on larger screens) */}
            <div className="absolute top-16 left-0 w-full h-0.5 bg-blue-100 hidden lg:block"></div>

            {/* Step 1 */}
            <div className="text-center relative">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-6 text-white font-bold shadow-lg shadow-blue-200 z-20 relative">
                  1
                </div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-blue-100 rounded-full w-20 h-20 -z-10 opacity-20 blur-md"></div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-xl mb-2">Search</h3>
                <p className="text-gray-600">
                  Browse thousands of listings with detailed filters to find exactly what you need.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center relative">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-6 text-white font-bold shadow-lg shadow-blue-200 z-20 relative">
                  2
                </div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-blue-100 rounded-full w-20 h-20 -z-10 opacity-20 blur-md"></div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-xl mb-2">Book</h3>
                <p className="text-gray-600">Schedule viewings and book your rental directly through our platform.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center relative">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-6 text-white font-bold shadow-lg shadow-blue-200 z-20 relative">
                  3
                </div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-blue-100 rounded-full w-20 h-20 -z-10 opacity-20 blur-md"></div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-xl mb-2">Pay</h3>
                <p className="text-gray-600">Secure payment processing with multiple payment options available.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="text-center relative">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-6 text-white font-bold shadow-lg shadow-blue-200 z-20 relative">
                  4
                </div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-blue-100 rounded-full w-20 h-20 -z-10 opacity-20 blur-md"></div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Key className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-xl mb-2">Enjoy</h3>
                <p className="text-gray-600">Get your rental and enjoy it with our satisfaction guarantee.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} data-section="testimonials" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div
            className={`text-center mb-12 transition-all duration-700 ${isVisible.testimonials ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            <h2 className="text-3xl font-bold mb-2 relative inline-block">
              What Our Users Say
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-blue-500 rounded-full"></span>
            </h2>
            <p className="text-gray-600 mt-4">Don't just take our word for it - hear from our satisfied users</p>
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
            <div
              className={`transition-all duration-1000 delay-300 ${isVisible.testimonials ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
            >
              <Carousel itemsPerSlide={1} className="w-full max-w-4xl mx-auto">
                <CarouselContent>
                  {testimonials.map((testimonial) => (
                    <CarouselItem key={testimonial.id}>
                      <div className="p-1">
                        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
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
                            <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 overflow-hidden border-2 border-blue-100">
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
                <CarouselPrevious className="-left-12 bg-white shadow-md hover:bg-blue-50 transition-all duration-300" />
                <CarouselNext className="-right-12 bg-white shadow-md hover:bg-blue-50 transition-all duration-300" />
                <CarouselDots count={testimonials.length} className="mt-4" />
              </Carousel>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        data-section="cta"
        className="py-16 bg-gradient-to-r from-blue-600 to-blue-500 text-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>

        {/* Blob Shapes */}
        <div className="absolute -top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-400 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[60%] rounded-full bg-blue-700 opacity-20 blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div
            className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${isVisible.cta ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to start renting?</h2>
            <p className="text-blue-100 mb-8">
              Join thousands of happy users who found exactly what they needed on our platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                asChild
                className="bg-white text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Link to="/signup">Sign Up Now</Link>
              </Button>
              <Button
                asChild
                className="bg-blue-700 border-white text-white hover:bg-blue-800 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Link to="/browse">Browse Listings</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Footer */}
      <Footer scrollToSection={scrollToSection} howItWorksRef={howItWorksRef} />
    </div>
  )
}
