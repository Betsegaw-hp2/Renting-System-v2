"use client"

import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Footer } from "../components/layout/Footer"
import { Header } from "../components/layout/Header"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"

export default function TermsAndConditionsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back button */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="flex items-center text-gray-600">
              <Link to="/signup">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Signup
              </Link>
            </Button>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-4">
              Terms & Conditions
            </h1>
            <p className="text-gray-600">
              Please read these terms and conditions carefully before using our platform.
            </p>
          </div>

          <div className="space-y-8">
            {/* General Terms */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <span className="text-2xl mr-3">🧾</span>
                  <h2 className="text-2xl font-bold">General Terms</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <p>By using this platform, users agree to abide by the rental rules, payment conditions, and platform policies.</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <p>The platform serves as a mediator between renters and owners but is not responsible for individual rental agreements beyond system-facilitated policies.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category-Specific Terms */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <span className="text-2xl mr-3">📋</span>
                  <h2 className="text-2xl font-bold">Category-Specific Terms</h2>
                </div>
                
                <div className="space-y-8">
                  {/* Car Rental Terms */}
                  <div>
                    <div className="flex items-center mb-4">
                      <span className="text-xl mr-2">🚗</span>
                      <h3 className="text-xl font-semibold">Car Rental Terms</h3>
                    </div>
                    <div className="space-y-3 text-gray-700 ml-8">
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>Renters must provide a valid driver's license and be over 21 years old.</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>Fuel policy: Cars must be returned with the same fuel level as at the start.</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>Late returns may result in additional hourly or daily charges.</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>The renter is responsible for any damage not reported at pickup.</p>
                      </div>
                    </div>
                  </div>

                  {/* Construction Material Terms */}
                  <div>
                    <div className="flex items-center mb-4">
                      <span className="text-xl mr-2">🧱</span>
                      <h3 className="text-xl font-semibold">Construction Material Rental Terms</h3>
                    </div>
                    <div className="space-y-3 text-gray-700 ml-8">
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>Materials must be returned in usable condition; damages may incur extra charges.</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>Rental duration and return deadlines are agreed upon at checkout.</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>Heavy machinery may require trained personnel for usage and return.</p>
                      </div>
                    </div>
                  </div>

                  {/* Clothing Terms */}
                  <div>
                    <div className="flex items-center mb-4">
                      <span className="text-xl mr-2">👗</span>
                      <h3 className="text-xl font-semibold">Clothing Rental Terms</h3>
                    </div>
                    <div className="space-y-3 text-gray-700 ml-8">
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>Clothes must be returned clean and undamaged.</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>Late return fees apply for overdue items beyond the agreed rental period.</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>Stains or damage may incur cleaning or replacement fees.</p>
                      </div>
                    </div>
                  </div>

                  {/* House Rental Terms */}
                  <div>
                    <div className="flex items-center mb-4">
                      <span className="text-xl mr-2">🏠</span>
                      <h3 className="text-xl font-semibold">House Rental Terms</h3>
                    </div>
                    <div className="space-y-3 text-gray-700 ml-8">
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>A deposit may be required and will be refunded after the rental period if no damage is reported.</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>Renters must comply with the owner's house rules.</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>Subletting is not allowed unless explicitly agreed in writing.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Policy */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <span className="text-2xl mr-3">💵</span>
                  <h2 className="text-2xl font-bold">Payment Policy</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <p>All bookings require full or partial payment via the platform at the time of confirmation.</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <p>Secure payments are processed through integrated gateways (e.g., Chapa).</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <p>Transaction records and receipts are stored in your account dashboard.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Return Policy */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <span className="text-2xl mr-3">🔄</span>
                  <h2 className="text-2xl font-bold">Return Policy</h2>
                </div>
                
                <div className="space-y-6">
                  {/* Car Returns */}
                  <div>
                    <div className="flex items-center mb-3">
                      <span className="text-lg mr-2">🚗</span>
                      <h3 className="text-lg font-semibold">Car Returns</h3>
                    </div>
                    <div className="space-y-2 text-gray-700 ml-6">
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>Inspect the car with the owner during pickup and return.</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>Late returns beyond a grace period of 1 hour incur extra fees.</p>
                      </div>
                    </div>
                  </div>

                  {/* Construction Materials */}
                  <div>
                    <div className="flex items-center mb-3">
                      <span className="text-lg mr-2">🧱</span>
                      <h3 className="text-lg font-semibold">Construction Materials</h3>
                    </div>
                    <div className="space-y-2 text-gray-700 ml-6">
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>Must be returned clean and undamaged.</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>Replacement charges apply for missing/damaged items.</p>
                      </div>
                    </div>
                  </div>

                  {/* Clothing */}
                  <div>
                    <div className="flex items-center mb-3">
                      <span className="text-lg mr-2">👗</span>
                      <h3 className="text-lg font-semibold">Clothing</h3>
                    </div>
                    <div className="space-y-2 text-gray-700 ml-6">
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>Must be returned within 24–72 hours (based on item type).</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>Clean and undamaged return required for full deposit refund.</p>
                      </div>
                    </div>
                  </div>

                  {/* House */}
                  <div>
                    <div className="flex items-center mb-3">
                      <span className="text-lg mr-2">🏠</span>
                      <h3 className="text-lg font-semibold">House</h3>
                    </div>
                    <div className="space-y-2 text-gray-700 ml-6">
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>No early cancellation refund within 48 hours of move-in.</p>
                      </div>
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <p>Damages will be deducted from the deposit or charged separately.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & User Responsibility */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <span className="text-2xl mr-3">🔐</span>
                  <h2 className="text-2xl font-bold">Privacy & User Responsibility</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <p>Users must keep their account credentials secure.</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <p>The platform will not share personal data with third parties without consent.</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <p>Renters and owners are expected to use real information and interact respectfully.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dispute Resolution */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <span className="text-2xl mr-3">🛠</span>
                  <h2 className="text-2xl font-bold">Dispute Resolution</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <p>Disputes are handled by platform admins.</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <p>Evidence (photos, receipts, chat logs) may be required.</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <p>Final decisions are communicated within 7 working days.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact & Support */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <span className="text-2xl mr-3">📬</span>
                  <h2 className="text-2xl font-bold">Contact & Support</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <p>Customer support is available via live chat and email.</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <p>Rental issues must be reported within 24 hours of occurrence.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Actions */}
            <div className="flex justify-center pt-8">
              <Button asChild>
                <Link to="/signup?checked=true">
                  I Agree to Terms & Conditions
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}