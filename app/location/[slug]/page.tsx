"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Home,
  ExternalLink,
  Filter,
  MapPin,
  Users,
  Bed,
  DollarSign,
  X,
  Building2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Wifi,
  Car,
  Shield,
  Zap,
  Menu,
  LogOut,
} from "lucide-react"
import { logout } from "@/lib/auth-utils"
  // Responsive mobile menu for location page
  function MobileMenu() {
    const [open, setOpen] = useState(false)
    return (
      <div className="relative">
        <Button variant="outline" size="icon" onClick={() => setOpen(open => !open)} aria-label="Open menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start" onClick={() => setOpen(false)}>
                <Home className="w-4 h-4 mr-2" /> Home
              </Button>
            </Link>
            <Link href="/owner/login">
              <Button variant="ghost" className="w-full justify-start" onClick={() => setOpen(false)}>
                Login
              </Button>
            </Link>
          </div>
        )}
      </div>
    )
  }

// Location data mapping
const messData = {
  "mohabolipur-boys": {
    title: "Mohabolipur Boys Accommodation",
    description:
      "Premium mess services in the heart of Mohabolipur area, offering comfortable living spaces for male students.",
    color: "blue",
    location: "mohabolipur",
    category: "boys",
    image: "/images/boys-mess-building.png",
  },
  "mohabolipur-girls": {
    title: "Mohabolipur Girls Accommodation",
    description:
      "Safe and comfortable mess facilities in Mohabolipur, specially designed for female students with enhanced security.",
    color: "pink",
    location: "mohabolipur",
    category: "girls",
    image: "/images/girls-mess-building.png",
  },
  "bcs-gali-boys": {
    title: "BCS Gali Boys Accommodation",
    description:
      "Convenient mess services in BCS Gali area, providing easy access to campus and local amenities for male students.",
    color: "blue",
    location: "bcs-gali",
    category: "boys",
    image: "/images/boys-mess-building.png",
  },
  "bcs-gali-girls": {
    title: "BCS Gali Girls Accommodation",
    description:
      "Secure and well-maintained mess facilities in BCS Gali, offering a comfortable environment for female students.",
    color: "pink",
    location: "bcs-gali",
    category: "girls",
    image: "/images/girls-mess-building.png",
  },
  "kornai-boys": {
    title: "Kornai Boys Accommodation",
    description:
      "Quality mess services in the peaceful Kornai area, perfect for male students seeking a quiet study environment.",
    color: "blue",
    location: "kornai",
    category: "boys",
    image: "/images/boys-mess-building.png",
  },
  "kornai-girls": {
    title: "Kornai Girls Accommodation",
    description: "Comfortable and secure mess facilities in Kornai, providing a safe haven for female students.",
    color: "pink",
    location: "kornai",
    category: "girls",
    image: "/images/girls-mess-building.png",
  },
}

interface LocationPageProps {
  params: Promise<{
    slug: string
  }>
}

interface MessGroup {
  id: number
  name: string
  location: string
  category: string
  description: string
  single_seats: number
  single_price: number
  double_seats: number
  double_price: number
  rating: number
  amenities: string[]
  contact_phone: string
  contact_email: string
  address: string
  is_active: boolean
  created_at: string
  owner_name?: string
  owner_mobile?: string
  owner_email?: string
  price_per_month: number
  capacity: number
  available_seats: number
  images: string[]
}

const locationNames: { [key: string]: string } = {
  "kornai-boys": "Kornai Boys Area",
  "kornai-girls": "Kornai Girls Area",
  "mohabolipur-boys": "Mohabolipur Boys Area",
  "mohabolipur-girls": "Mohabolipur Girls Area",
  "bcs-gali-boys": "BCS Gali Boys Area",
  "bcs-gali-girls": "BCS Gali Girls Area",
  "priom-building-boys": "Priom Building Boys",
  "priom-building-girls": "Priom Building Girls",
}

const amenityIcons: { [key: string]: any } = {
  WiFi: Wifi,
  "24/7 Security": Shield,
  Security: Shield,
  "Security Guard": Shield,
  CCTV: Shield,
  Parking: Car,
  "Backup Generator": Zap,
  "Backup Power": Zap,
  Elevator: Home,
}

import * as React from "react"

// Client component for the main page logic
function LocationPageClient({ slug }: { slug: string }) {
  const [singlePriceFilter, setSinglePriceFilter] = useState("")
  const [doublePriceFilter, setDoublePriceFilter] = useState("")
  const [messGroups, setMessGroups] = useState<MessGroup[]>([])
  const [filteredMesses, setFilteredMesses] = useState<MessGroup[]>([])
  const [hasFilters, setHasFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retryCount, setRetryCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [ratingLoading, setRatingLoading] = useState<{[key: number]: boolean}>({})
  const [ratingMessages, setRatingMessages] = useState<{[key: number]: {type: 'success' | 'error', message: string}}>({})

  const locationData = messData[slug as keyof typeof messData] || {
    title: "Mess Accommodation",
    description: "Find the best mess services in this location.",
    color: "blue",
    location: "",
    category: "",
    image: "/images/boys-mess-building.png",
  }

  const locationName = locationNames[slug] || slug
  const isDevelopment = process.env.NODE_ENV === "development"

  useEffect(() => {
    if (locationData.location && locationData.category) {
      fetchMessGroups()
    }
  }, [slug, locationData.location, locationData.category, retryCount])

  const fetchMessGroups = async () => {
    try {
      setLoading(true)
      setError("")

      console.log("Frontend: Fetching mess groups for:", {
        location: locationData.location,
        category: locationData.category,
        slug,
        attempt: retryCount + 1,
      })

      const url = `/api/mess-groups?location=${encodeURIComponent(locationData.location)}&category=${encodeURIComponent(locationData.category)}`
      console.log("Frontend: Fetching from URL:", url)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("Frontend: Response status:", response.status)
      console.log("Frontend: Response headers:", Object.fromEntries(response.headers.entries()))

      // Always try to get response as text first for debugging
      const responseText = await response.text()
      console.log("Frontend: Raw response (first 500 chars):", responseText.substring(0, 500))

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        console.error("Frontend: Non-JSON response received")
        throw new Error(
          `Server returned ${contentType} instead of JSON. This usually indicates a server error. Response: ${responseText.substring(0, 200)}`,
        )
      }

      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Frontend: JSON parse error:", parseError)
        throw new Error(`Invalid JSON response from server. Raw response: ${responseText.substring(0, 200)}`)
      }

      console.log("Frontend: Parsed data:", data)

      if (!data.success) {
        throw new Error(data.details || data.error || "Failed to fetch mess groups")
      }

      const messGroupsData = data.data || []
      console.log("Frontend: Received mess groups:", messGroupsData.length)

      // Process amenities for each mess group
      const processedMessGroups = messGroupsData.map((group: any) => ({
        ...group,
        amenities: Array.isArray(group.amenities) ? group.amenities : [],
        images: Array.isArray(group.images) ? group.images : [],
      }))

      setMessGroups(processedMessGroups)
      setFilteredMesses(processedMessGroups)
      setRetryCount(0) // Reset retry count on success
    } catch (error: any) {
      console.error("Frontend: Error fetching mess groups:", error)

      let errorMessage = "Failed to load mess groups"

      if (error.name === "AbortError") {
        errorMessage = "Request timed out. Please check your connection and try again."
      } else if (error.message.includes("JSON")) {
        errorMessage = "Server error: Unable to process the response. Please try again."
      } else if (error.message.includes("fetch")) {
        errorMessage = "Network error: Unable to connect to the server. Please check your connection."
      } else {
        errorMessage = error.message || errorMessage
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  const searchSingleSeat = () => {
    if (!singlePriceFilter) {
      setFilteredMesses(messGroups)
      setHasFilters(false)
      return
    }
    const filtered = messGroups.filter((mess) => mess.single_price <= Number.parseInt(singlePriceFilter))
    setFilteredMesses(filtered)
    setHasFilters(true)
  }

  const searchDoubleSeat = () => {
    if (!doublePriceFilter) {
      setFilteredMesses(messGroups)
      setHasFilters(false)
      return
    }
    const filtered = messGroups.filter((mess) => mess.double_price <= Number.parseInt(doublePriceFilter))
    setFilteredMesses(filtered)
    setHasFilters(true)
  }

  const resetFilters = () => {
    setSinglePriceFilter("")
    setDoublePriceFilter("")
    setFilteredMesses(messGroups)
    setHasFilters(false)
  }

  const colorClasses = {
    blue: {
      gradient: "from-blue-600 to-cyan-600",
      bg: "from-blue-50 to-cyan-50",
      button: "from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700",
    },
    pink: {
      gradient: "from-pink-600 to-rose-600",
      bg: "from-pink-50 to-rose-50",
      button: "from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700",
    },
  }

  const colors = colorClasses[locationData.color as keyof typeof colorClasses]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading mess groups...</p>
          <p className="text-sm text-slate-500 mt-2">{retryCount > 0 && `Attempt ${retryCount + 1}`}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and title: compact on mobile, full on desktop */}
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-orange-600" />
              <span className="hidden sm:inline text-2xl font-bold text-slate-800">HSTU Mess Finder</span>
              <span className="sm:hidden text-lg font-bold text-slate-800">Location</span>
            </Link>
            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              {localStorage.getItem("user") ? (
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    Profile
                  </Button>
                  {mobileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                      <Link href="/user">
                        <Button variant="ghost" className="w-full justify-start">
                          Profile
                        </Button>
                      </Link>
                      {JSON.parse(localStorage.getItem("user") || "{}").role === "owner" && (
                        <Link href="/admin/dashboard">
                          <Button variant="ghost" className="w-full justify-start">
                            Admin Dashboard
                          </Button>
                        </Link>
                      )}
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                        onClick={logout}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/owner/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
              )}
            </div>
            {/* Mobile nav */}
            <div className="sm:hidden">
              <MobileMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Header with Image */}
      <div className="relative overflow-hidden h-96">
        <Image src={locationData.image || "/placeholder.svg"} alt={locationData.title} fill className="object-cover" />
        <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} bg-opacity-80`}></div>
        <div className="relative container mx-auto px-4 py-16 h-full flex flex-col justify-center">
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <MapPin className="w-4 h-4 mr-1" />
              {filteredMesses.length} Available Options
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{locationData.title}</h1>
          <p className="text-xl text-white/90 max-w-3xl leading-relaxed">{locationData.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 font-medium">Error loading mess groups</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
                >
                  Reload Page
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info (development only) */}
        {isDevelopment && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Debug Info:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>Slug: {slug}</p>
              <p>Location: {locationData.location}</p>
              <p>Category: {locationData.category}</p>
              <p>Mess Groups Found: {messGroups.length}</p>
              <p>Retry Count: {retryCount}</p>
              <p>Has Error: {error ? "Yes" : "No"}</p>
            </div>
          </div>
        )}

        {/* Search Section */}
        {!error && (
          <Card className="mb-8 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Filter className="w-6 h-6 mr-3" />
                Filter by Price Range
              </CardTitle>
              <CardDescription>Find mess services that fit your budget by setting maximum price limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="singlePrice" className="text-base font-medium">
                    Single Seat Maximum Price
                  </Label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="singlePrice"
                        type="number"
                        placeholder="e.g., 1500"
                        value={singlePriceFilter}
                        onChange={(e) => setSinglePriceFilter(e.target.value)}
                        className="pl-10 h-12"
                      />
                    </div>
                    <Button
                      onClick={searchSingleSeat}
                      className={`bg-gradient-to-r ${colors.button} text-white px-6 h-12 shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="doublePrice" className="text-base font-medium">
                    Double Seat Maximum Price
                  </Label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="doublePrice"
                        type="number"
                        placeholder="e.g., 1200"
                        value={doublePriceFilter}
                        onChange={(e) => setDoublePriceFilter(e.target.value)}
                        className="pl-10 h-12"
                      />
                    </div>
                    <Button
                      onClick={searchDoubleSeat}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 h-12 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </div>

              {hasFilters && (
                <div className="mt-6 flex items-center gap-4">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                    Filters Applied
                  </Badge>
                  <Button variant="outline" onClick={resetFilters} size="sm">
                    <X className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results Summary */}
        {!error && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {hasFilters
                ? `Filtered Results (${filteredMesses.length})`
                : `All Available Options (${filteredMesses.length})`}
            </h2>
            <p className="text-slate-600">
              {hasFilters
                ? "Showing mess services matching your price criteria"
                : "Browse all available mess services in this area"}
            </p>
          </div>
        )}

        {/* Mess Table */}
        {!error && (
          <Card className="border-0 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              {filteredMesses.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                        <TableHead className="text-center font-semibold text-slate-700 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Mess Name
                          </div>
                        </TableHead>
                        <TableHead colSpan={2} className="text-center font-semibold text-slate-700 border-l">
                          <div className="flex items-center justify-center gap-2">
                            <Bed className="w-4 h-4" />
                            Single Seat
                          </div>
                        </TableHead>
                        <TableHead colSpan={2} className="text-center font-semibold text-slate-700 border-l">
                          <div className="flex items-center justify-center gap-2">
                            <Users className="w-4 h-4" />
                            Double Seat
                          </div>
                        </TableHead>
                        <TableHead className="text-center font-semibold text-slate-700 border-l py-4">
                          Details
                        </TableHead>
                      </TableRow>
                      <TableRow className="bg-slate-50">
                        <TableHead className="text-center text-sm text-slate-600 py-2">Rating</TableHead>
                        <TableHead className="text-center text-sm text-slate-600 border-l">Available</TableHead>
                        <TableHead className="text-center text-sm text-slate-600">Price</TableHead>
                        <TableHead className="text-center text-sm text-slate-600 border-l">Available</TableHead>
                        <TableHead className="text-center text-sm text-slate-600">Price</TableHead>
                        <TableHead className="text-center text-sm text-slate-600 border-l">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMesses.map((mess, index) => (
                        <TableRow key={mess.id || index} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="font-medium py-6">
                            <div className="text-center">
                              <div className="font-semibold text-slate-800 mb-1">{mess.name}</div>
                              <div className="flex items-center justify-center gap-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      aria-label={`Rate ${mess.name} ${i + 1} out of 5 stars`}
                                      className={`w-4 h-4 focus:outline-none transition-colors ${
                                        i < Math.round(mess.rating || 0) ? "text-yellow-400" : "text-slate-300"
                                      } hover:text-yellow-500`}
                                      disabled={ratingLoading[mess.id] || false}
                                      onClick={async () => {
                                        setRatingLoading(prev => ({ ...prev, [mess.id]: true }))
                                        setRatingMessages(prev => ({ ...prev, [mess.id]: { type: 'success', message: '' } }))
                                        try {
                                          const res = await fetch(`/api/mess-groups/${mess.id}/rating`, {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ rating: i + 1 }),
                                          })
                                          const data = await res.json()
                                          if (!res.ok) throw new Error(data.error || "Failed to update rating")
                                          
                                          setFilteredMesses((prev) => prev.map((m) => m.id === mess.id ? { ...m, rating: i + 1 } : m))
                                          setMessGroups((prev) => prev.map((m) => m.id === mess.id ? { ...m, rating: i + 1 } : m))
                                          
                                          setRatingMessages(prev => ({ 
                                            ...prev, 
                                            [mess.id]: { type: 'success', message: 'Rating updated successfully!' }
                                          }))
                                          
                                          // Clear success message after 3 seconds
                                          setTimeout(() => {
                                            setRatingMessages(prev => ({ ...prev, [mess.id]: { type: 'success', message: '' } }))
                                          }, 3000)
                                        } catch (err: any) {
                                          setRatingMessages(prev => ({ 
                                            ...prev, 
                                            [mess.id]: { type: 'error', message: err.message || 'Failed to update rating' }
                                          }))
                                          
                                          // Clear error message after 5 seconds
                                          setTimeout(() => {
                                            setRatingMessages(prev => ({ ...prev, [mess.id]: { type: 'error', message: '' } }))
                                          }, 5000)
                                        } finally {
                                          setRatingLoading(prev => ({ ...prev, [mess.id]: false }))
                                        }
                                      }}
                                    >
                                      <span role="img" aria-label={i < Math.round(mess.rating || 0) ? "filled star" : "empty star"}>★</span>
                                    </button>
                                  ))}
                                </div>
                                <span className="text-sm text-slate-600 ml-1">{mess.rating || 0}</span>
                              </div>
                              
                              {/* Rating feedback messages */}
                              {ratingMessages[mess.id]?.message && (
                                <div className={`mt-1 text-xs px-2 py-1 rounded ${
                                  ratingMessages[mess.id].type === 'success' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {ratingMessages[mess.id].message}
                                </div>
                              )}
                              
                              {ratingLoading[mess.id] && (
                                <div className="mt-1 text-xs text-slate-500 flex items-center justify-center">
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Updating...
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center border-l">
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              {mess.single_seats || 0} seats
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-semibold text-lg text-slate-800">৳{mess.single_price || 0}</div>
                            <div className="text-sm text-slate-500">per month</div>
                          </TableCell>
                          <TableCell className="text-center border-l">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              {mess.double_seats || 0} seats
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-semibold text-lg text-slate-800">৳{mess.double_price || 0}</div>
                            <div className="text-sm text-slate-500">per month</div>
                          </TableCell>
                          <TableCell className="text-center border-l">
                            <Link href={`/mess/${mess.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-slate-50 transition-colors bg-transparent"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">No Results Found</h3>
                  <p className="text-slate-600 mb-6">
                    {hasFilters
                      ? "No mess services match your current price criteria. Try adjusting your filters."
                      : "No mess services are currently available in this area."}
                  </p>
                  {hasFilters && (
                    <Button onClick={resetFilters} variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-bold mb-4">HSTU Mess Finder</h3>
          <Separator className="bg-slate-700 mb-6" />
          <p className="text-slate-400 mb-2">&copy; 2025 HSTU Mess Finder. All rights reserved.</p>
          <p className="text-slate-500">
            Developed with ❤️ by <span className="text-orange-400 font-medium">Ashikul Islam</span>
          </p>
        </div>
      </footer>
    </div>
  )
}

// Server component wrapper
export default async function LocationPage({ params }: LocationPageProps) {
  const { slug } = await params
  return <LocationPageClient slug={slug} />
}
