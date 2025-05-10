// "use client"

// import { useState, useEffect } from "react"
// import { useSearchParams, useNavigate } from "react-router-dom"
// import { Header } from "../components/layout/Header"
// import { Footer } from "../components/layout/Footer"
// import { SearchFilters, type SearchFilters as SearchFiltersType } from "../components/search/SearchFilters"
// import { ListingCard } from "../components/listings/ListingCard"
// import { publicApi } from "../api/publicApi"
// import type { FeaturedListing } from "../api/publicApi"
// import { Button } from "../components/ui/button"
// import { Link } from "react-router-dom"
// import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
// import { AlertCircle, Loader2 } from "lucide-react"

// export default function BrowsePage() {
//   const [searchParams] = useSearchParams()
//   const navigate = useNavigate()
//   const [listings, setListings] = useState<FeaturedListing[]>([])
//   const [filteredListings, setFilteredListings] = useState<FeaturedListing[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   // Get search params
//   const queryParam = searchParams.get("query") || ""
//   const categoryParam = searchParams.get("category") || ""
//   const dateRangeParam = searchParams.get("dateRange") || "any"
//   const useMockApiParam = searchParams.get("mock") !== "false" // Default to true if not specified

//   // Date range options mapping
//   const getDateRangeFromValue = (value: string) => {
//     const today = new Date()
//     today.setHours(0, 0, 0, 0)

//     switch (value) {
//       case "today":
//         return {
//           label: "Today",
//           startDate: today,
//           endDate: today,
//         }
//       case "7days":
//         return {
//           label: "Last 7 days",
//           startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
//           endDate: today,
//         }
//       case "30days":
//         return {
//           label: "Last 30 days",
//           startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
//           endDate: today,
//         }
//       case "90days":
//         return {
//           label: "Last 90 days",
//           startDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
//           endDate: today,
//         }
//       case "next7days":
//         return {
//           label: "Next 7 days",
//           startDate: today,
//           endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
//         }
//       case "next30days":
//         return {
//           label: "Next 30 days",
//           startDate: today,
//           endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
//         }
//       case "next90days":
//         return {
//           label: "Next 90 days",
//           startDate: today,
//           endDate: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000),
//         }
//       default:
//         return {
//           label: "Any time",
//           startDate: undefined,
//           endDate: undefined,
//         }
//     }
//   }

//   useEffect(() => {
//     const fetchAndFilterListings = async () => {
//       setIsLoading(true)
//       setError(null)

//       try {
//         // Get date range from param
//         const dateRange = getDateRangeFromValue(dateRangeParam)

//         console.log("Fetching listings with params:", {
//           query: queryParam,
//           category: categoryParam,
//           dateRange,
//           useMockApi: false, // Force use of real API
//         })

//         // Always use the search API with appropriate filters
//         const searchResults = await publicApi.searchListings(
//           queryParam,
//           categoryParam || undefined,
//           dateRange.startDate,
//           dateRange.endDate,
//           false, // Force use of real API, not mock data
//         )

//         console.log(`Fetched ${searchResults.length} listings from API`)
//         setListings(searchResults)
//         setFilteredListings(searchResults)
//       } catch (error) {
//         console.error("Error fetching listings:", error)
//         setError("Failed to load listings from the API. Please try again later.")
//         setFilteredListings([])
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchAndFilterListings()
//   }, [queryParam, categoryParam, dateRangeParam])

//   // Update the handleSearch function to not use mock data
//   const handleSearch = async (filters: SearchFiltersType) => {
//     setIsLoading(true)
//     setError(null)

//     try {
//       // Update URL with search params (without navigating)
//       const params = new URLSearchParams(window.location.search)

//       if (filters.query) {
//         params.set("query", filters.query)
//       } else {
//         params.delete("query")
//       }

//       if (filters.category) {
//         params.set("category", filters.category)
//       } else {
//         params.delete("category")
//       }

//       // Get the date range value from the label
//       const dateRangeValue = DATE_RANGES.find((range) => range.label === filters.dateRange.label)?.value || "any"

//       if (dateRangeValue !== "any") {
//         params.set("dateRange", dateRangeValue)
//       } else {
//         params.delete("dateRange")
//       }

//       // Always set mock to false to use real API
//       params.set("mock", "false")

//       window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`)

//       console.log("Searching with filters:", filters)

//       // Fetch new results based on filters
//       const searchResults = await publicApi.searchListings(
//         filters.query,
//         filters.category || undefined,
//         filters.dateRange.startDate,
//         filters.dateRange.endDate,
//         false, // Force use of real API
//       )

//       console.log(`Search returned ${searchResults.length} results`)
//       setFilteredListings(searchResults)
//     } catch (error) {
//       console.error("Error searching listings:", error)
//       setError("An error occurred while searching. Please try again.")
//       setFilteredListings([])
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Prepare initial values for the search form
//   const initialSearchValues: Partial<SearchFiltersType> = {
//     query: queryParam,
//     category: categoryParam,
//     dateRange: getDateRangeFromValue(dateRangeParam),
//     useMockApi: useMockApiParam,
//   }

//   // Constants for date range options
//   const DATE_RANGES = [
//     { label: "Any time", value: "any" },
//     { label: "Today", value: "today" },
//     { label: "Last 7 days", value: "7days" },
//     { label: "Last 30 days", value: "30days" },
//     { label: "Last 90 days", value: "90days" },
//     { label: "Next 7 days", value: "next7days" },
//     { label: "Next 30 days", value: "next30days" },
//     { label: "Next 90 days", value: "next90days" },
//   ]

//   return (
//     <div className="flex flex-col min-h-screen">
//       <Header />

//       {/* Hero Section - Simplified for Browse Page */}
//       <section className="bg-gray-50 py-8">
//         <div className="container mx-auto px-4">
//           <h1 className="text-3xl font-bold mb-2">Browse Rentals</h1>
//           <p className="text-gray-600 mb-4">Find exactly what you need from our diverse selection</p>
//         </div>
//       </section>

//       {/* Search Filters */}
//       <div className="container mx-auto px-4 -mt-4 mb-8">
//         <SearchFilters
//           onSearch={handleSearch}
//           className="mb-8"
//           showAdvanced={true}
//           initialValues={initialSearchValues}
//         />
//       </div>

//       {/* Results */}
//       <main className="flex-1 bg-gray-50 py-8">
//         <div className="container mx-auto px-4">
//           {error && (
//             <Alert variant="destructive" className="mb-6">
//               <AlertCircle className="h-4 w-4" />
//               <AlertTitle>Error</AlertTitle>
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}

//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-xl font-semibold">
//               {filteredListings.length} {filteredListings.length === 1 ? "Result" : "Results"} Found
//             </h2>

//             {(queryParam || categoryParam || dateRangeParam !== "any") && (
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   window.history.replaceState({}, "", window.location.pathname)
//                   navigate(window.location.pathname)
//                 }}
//               >
//                 Clear Filters
//               </Button>
//             )}
//           </div>

//           {isLoading ? (
//             <div className="flex flex-col items-center justify-center py-12">
//               <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
//               <p className="text-gray-600">Loading listings...</p>
//             </div>
//           ) : filteredListings.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               {filteredListings.map((listing) => (
//                 <ListingCard key={listing.id} listing={listing} />
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12 bg-white rounded-lg shadow-sm">
//               <h3 className="text-xl font-medium mb-2">No listings found</h3>
//               <p className="text-gray-500 mb-6">Try adjusting your search filters to find what you're looking for.</p>
//               <Button
//                 onClick={() => {
//                   window.history.replaceState({}, "", window.location.pathname)
//                   navigate(window.location.pathname)
//                 }}
//               >
//                 Reset All Filters
//               </Button>
//             </div>
//           )}
//         </div>
//       </main>

//       {/* CTA Section */}
//       <section className="py-16 bg-blue-600 text-white">
//         <div className="container mx-auto px-4">
//           <div className="max-w-3xl mx-auto text-center">
//             <h2 className="text-3xl font-bold mb-4">Ready to start renting?</h2>
//             <p className="text-blue-100 mb-8">
//               Join thousands of happy users who found exactly what they needed on our platform.
//             </p>
//             <div className="flex flex-wrap justify-center gap-4">
//               <Button asChild className="bg-white text-blue-600 hover:bg-blue-50">
//                 <Link to="/signup">Sign Up Now</Link>
//               </Button>
//               <Button asChild className="bg-slate-700 border-white text-white hover:bg-slate-600">
//                 <Link to="/list-property">List Your Property</Link>
//               </Button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <Footer />
//     </div>
//   )
// }
