import { Header } from "../components/layout/Header"
import { Footer } from "../components/layout/Footer"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* About Us */}
        <section id="about" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-2">About Us</h1>
              <p className="text-gray-600">Learn about our mission and values</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4">Our Story</h2>
                <p className="text-gray-600 mb-6">
                  Founded in 2020, All-in-One Rental Place was created to solve a simple problem: making it easy to rent
                  anything, anywhere. What started as a small platform connecting local property owners with renters has
                  grown into a comprehensive marketplace for all types of rentals.
                </p>
                <p className="text-gray-600 mb-6">
                  Our mission is to create a world where renting is the smarter, more sustainable choice for everyone.
                  We believe that access is better than ownership, and that sharing resources benefits both individuals
                  and the planet.
                </p>
                <h2 className="text-2xl font-bold mb-4">Our Values</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Trust and safety in every transaction</li>
                  <li>Sustainability through resource sharing</li>
                  <li>Empowering local economies</li>
                  <li>Creating opportunities for everyone</li>
                  <li>Innovation that simplifies renting</li>
                </ul>
              </div>
              <div className="rounded-lg overflow-hidden">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Our team"
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            </div>

            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6 text-center">Our Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Team Member 1 */}
                <div className="text-center">
                  <div className="mb-4 mx-auto w-32 h-32 rounded-full overflow-hidden">
                    <img
                      src="/placeholder.svg?height=128&width=128"
                      alt="Team Member"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold">Jane Doe</h3>
                  <p className="text-blue-600">CEO & Founder</p>
                  <p className="mt-2 text-gray-600">
                    With over 15 years of experience in the rental industry, Jane leads our vision and strategy.
                  </p>
                </div>

                {/* Team Member 2 */}
                <div className="text-center">
                  <div className="mb-4 mx-auto w-32 h-32 rounded-full overflow-hidden">
                    <img
                      src="/placeholder.svg?height=128&width=128"
                      alt="Team Member"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold">John Smith</h3>
                  <p className="text-blue-600">CTO</p>
                  <p className="mt-2 text-gray-600">
                    John oversees our technology infrastructure and ensures a seamless user experience.
                  </p>
                </div>

                {/* Team Member 3 */}
                <div className="text-center">
                  <div className="mb-4 mx-auto w-32 h-32 rounded-full overflow-hidden">
                    <img
                      src="/placeholder.svg?height=128&width=128"
                      alt="Team Member"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold">Sarah Johnson</h3>
                  <p className="text-blue-600">Head of Operations</p>
                  <p className="mt-2 text-gray-600">
                    Sarah ensures that our platform runs smoothly and that all rentals meet our quality standards.
                  </p>
                </div>

                {/* Team Member 4 */}
                <div className="text-center">
                  <div className="mb-4 mx-auto w-32 h-32 rounded-full overflow-hidden">
                    <img
                      src="/placeholder.svg?height=128&width=128"
                      alt="Team Member"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold">Michael Chen</h3>
                  <p className="text-blue-600">Customer Success</p>
                  <p className="mt-2 text-gray-600">
                    Michael leads our customer support team, ensuring that both renters and owners have a great
                    experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-16 bg-gray-50 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 text-center">Our History</h2>
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4 flex flex-col items-center mb-4 md:mb-0">
                    <div className="text-2xl font-bold text-blue-600">2020</div>
                    <div className="h-full w-1 bg-blue-600"></div>
                  </div>
                  <div className="md:w-3/4 pl-0 md:pl-6">
                    <h3 className="text-xl font-semibold">Company Founded</h3>
                    <p className="text-gray-600">
                      All-in-One Rental Place was founded with the vision of creating a comprehensive rental
                      marketplace.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4 flex flex-col items-center mb-4 md:mb-0">
                    <div className="text-2xl font-bold text-blue-600">2021</div>
                    <div className="h-full w-1 bg-blue-600"></div>
                  </div>
                  <div className="md:w-3/4 pl-0 md:pl-6">
                    <h3 className="text-xl font-semibold">Expanded to 10 Cities</h3>
                    <p className="text-gray-600">
                      After a successful launch, we expanded our operations to 10 major cities across the country.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4 flex flex-col items-center mb-4 md:mb-0">
                    <div className="text-2xl font-bold text-blue-600">2022</div>
                    <div className="h-full w-1 bg-blue-600"></div>
                  </div>
                  <div className="md:w-3/4 pl-0 md:pl-6">
                    <h3 className="text-xl font-semibold">Added New Categories</h3>
                    <p className="text-gray-600">
                      We expanded beyond property rentals to include vehicles, equipment, and event spaces.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4 flex flex-col items-center">
                    <div className="text-2xl font-bold text-blue-600">2023</div>
                  </div>
                  <div className="md:w-3/4 pl-0 md:pl-6">
                    <h3 className="text-xl font-semibold">Going International</h3>
                    <p className="text-gray-600">
                      We launched our platform in international markets, bringing our rental marketplace to a global
                      audience.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
