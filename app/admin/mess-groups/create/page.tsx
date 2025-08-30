"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Building2, Users, Phone, Mail, Home, Loader2, AlertCircle, CheckCircle } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  mobile: string
  role: string
}

const availableAmenities = [
  "WiFi",
  "24/7 Security",
  "Generator",
  "AC",
  "Parking",
  "Study Room",
  "Common Room",
  "Garden",
  "Laundry",
  "CCTV",
  "Lift",
  "Balcony",
]

const locations = [
  { value: "mohabolipur", label: "Mohabolipur" },
  { value: "bcs-gali", label: "BCS Gali" },
  { value: "kornai", label: "Kornai" },
]

export default function CreateMessGroupPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    category: "",
    description: "",
    single_seats: "",
    single_price: "",
    double_seats: "",
    double_price: "",
    contact_phone: "",
    contact_email: "",
    address: "",
    amenities: [] as string[],
  })

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/owner/login")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      // Pre-fill contact info
      setFormData((prev) => ({
        ...prev,
        contact_email: parsedUser.email,
        contact_phone: parsedUser.mobile || "",
      }))
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/owner/login")
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      amenities: checked ? [...prev.amenities, amenity] : prev.amenities.filter((a) => a !== amenity),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/owner/login")
      return
    }

    try {
      // Calculate required fields for API
      const singleSeats = Number.parseInt(formData.single_seats) || 0;
      const doubleSeats = Number.parseInt(formData.double_seats) || 0;
      const singlePrice = Number.parseFloat(formData.single_price) || 0;
      const doublePrice = Number.parseFloat(formData.double_price) || 0;
      const capacity = singleSeats + doubleSeats;
      // Use the minimum non-zero price as price_per_month, or 0 if both are 0
      let price_per_month = 0;
      if (singlePrice && doublePrice) price_per_month = Math.min(singlePrice, doublePrice);
      else if (singlePrice) price_per_month = singlePrice;
      else if (doublePrice) price_per_month = doublePrice;

      console.log("Frontend: Creating mess group with data:", {
        ...formData,
        price_per_month,
        capacity,
      });

      const response = await fetch("/api/mess-groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          category: formData.category,
          description: formData.description,
          single_seats: singleSeats,
          single_price: singlePrice,
          double_seats: doubleSeats,
          double_price: doublePrice,
          price_per_month,
          capacity,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email,
          address: formData.address,
          amenities: formData.amenities,
        }),
      });

      const responseText = await response.text();
      console.log("Frontend: Raw response:", responseText.substring(0, 200));

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Frontend: JSON parse error:", parseError);
        throw new Error(`Invalid response: ${responseText.substring(0, 100)}`);
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to create mess group");
      }

      setSuccess("Mess group created successfully! Redirecting to dashboard...");

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Frontend: Error creating mess group:", error);
      setError(error.message || "Failed to create mess group");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
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
            <Link href="/" className="text-2xl font-bold text-slate-800">
              HSTU Mess Finder
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Create New Mess Listing</h1>
            <p className="text-slate-600">Add your mess to help students find accommodation</p>
          </div>

          <Card className="border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Building2 className="w-6 h-6 mr-3" />
                Mess Information
              </CardTitle>
              <CardDescription>Fill in the details about your mess facility</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Basic Information</h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-700 font-medium">
                        Mess Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g., Green Valley Boys Mess"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="h-12"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-slate-700 font-medium">
                        Location *
                      </Label>
                      <Select
                        value={formData.location}
                        onValueChange={(value) => handleSelectChange("location", value)}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.value} value={location.value}>
                              {location.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-slate-700 font-medium">
                        Category *
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleSelectChange("category", value)}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="boys">Boys Mess</SelectItem>
                          <SelectItem value="girls">Girls Mess</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-slate-700 font-medium">
                        Full Address *
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder="e.g., House #45, Road #3, Mohabolipur"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-slate-700 font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe your mess facilities, food quality, environment, etc."
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>
                </div>

                {/* Pricing & Capacity */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Pricing & Capacity</h3>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-blue-50 p-6 rounded-xl space-y-4">
                      <h4 className="font-semibold text-blue-800 flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Single Room
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="single_seats" className="text-blue-700 font-medium">
                            Available Seats
                          </Label>
                          <Input
                            id="single_seats"
                            name="single_seats"
                            type="number"
                            placeholder="0"
                            value={formData.single_seats}
                            onChange={handleInputChange}
                            className="h-10"
                            min="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="single_price" className="text-blue-700 font-medium">
                            Price (৳/month)
                          </Label>
                          <Input
                            id="single_price"
                            name="single_price"
                            type="number"
                            placeholder="0"
                            value={formData.single_price}
                            onChange={handleInputChange}
                            className="h-10"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 p-6 rounded-xl space-y-4">
                      <h4 className="font-semibold text-emerald-800 flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Double Room
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="double_seats" className="text-emerald-700 font-medium">
                            Available Seats
                          </Label>
                          <Input
                            id="double_seats"
                            name="double_seats"
                            type="number"
                            placeholder="0"
                            value={formData.double_seats}
                            onChange={handleInputChange}
                            className="h-10"
                            min="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="double_price" className="text-emerald-700 font-medium">
                            Price (৳/month)
                          </Label>
                          <Input
                            id="double_price"
                            name="double_price"
                            type="number"
                            placeholder="0"
                            value={formData.double_price}
                            onChange={handleInputChange}
                            className="h-10"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Contact Information</h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contact_phone" className="text-slate-700 font-medium">
                        Phone Number *
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="contact_phone"
                          name="contact_phone"
                          type="tel"
                          placeholder="01XXXXXXXXX"
                          value={formData.contact_phone}
                          onChange={handleInputChange}
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_email" className="text-slate-700 font-medium">
                        Email Address *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="contact_email"
                          name="contact_email"
                          type="email"
                          placeholder="your@email.com"
                          value={formData.contact_email}
                          onChange={handleInputChange}
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Amenities & Facilities</h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availableAmenities.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={formData.amenities.includes(amenity)}
                          onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                        />
                        <Label htmlFor={amenity} className="text-sm font-medium text-slate-700">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Listing...
                      </>
                    ) : (
                      <>
                        <Building2 className="w-5 h-5 mr-2" />
                        Create Mess Listing
                      </>
                    )}
                  </Button>
                  <Link href="/admin/dashboard">
                    <Button variant="outline" className="h-12 px-8 bg-transparent">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
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
