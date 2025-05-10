"use client"

import type React from "react"

import { Link, useNavigate } from "react-router-dom"
import { Button } from "../ui/button"

interface HeaderProps {
  scrollToSection?: (ref: React.RefObject<HTMLElement | HTMLDivElement>) => void
  howItWorksRef?: React.RefObject<HTMLElement>
}

export function Header({ scrollToSection, howItWorksRef }: HeaderProps) {
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
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
            <span className="text-xl font-bold text-black">All-in-One Rental Place</span>
          </Link>

          <nav className="hidden md:flex space-x-6">
            {howItWorksRef && scrollToSection ? (
              <button
                onClick={() => scrollToSection(howItWorksRef)}
                className="text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                How It Works
              </button>
            ) : (
              <Link to="/#how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                How It Works
              </Link>
            )}
            <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-blue-600">
              About Us
            </Link>
            <Link to="/contact" className="text-sm font-medium text-gray-600 hover:text-blue-600">
              Contact
            </Link>
            <Link to="/browse" className="text-sm font-medium text-gray-600 hover:text-blue-600">
              Browse Rentals
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
  )
}
