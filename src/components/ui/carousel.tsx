"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./button"

// Context to share carousel state
const CarouselContext = React.createContext<{
  currentSlide: number
  setCurrentSlide: (index: number) => void
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }
  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "horizontal" | "vertical"
    itemsPerSlide: number
    onSlideChange?: (index: number) => void
  }
>(({ orientation = "horizontal", className, children, itemsPerSlide, onSlideChange, ...props }, ref) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [totalSlides, setTotalSlides] = React.useState(0)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(true)

  React.useEffect(() => {
    if (containerRef.current) {
      const items = containerRef.current.querySelectorAll('[role="group"]')
      const slides = Math.ceil(items.length / itemsPerSlide)
      setTotalSlides(slides)
      setCanScrollNext(currentSlide < slides - 1)
      setCanScrollPrev(currentSlide > 0)
    }
  }, [currentSlide, children, itemsPerSlide])

  const scrollPrev = React.useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1)
      onSlideChange?.(currentSlide - 1)
    }
  }, [currentSlide, onSlideChange])

  const scrollNext = React.useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1)
      onSlideChange?.(currentSlide + 1)
    }
  }, [currentSlide, totalSlides, onSlideChange])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext],
  )

  const contextValue = React.useMemo(
    () => ({
      currentSlide,
      setCurrentSlide,
      scrollPrev,
      scrollNext,
      canScrollPrev,
      canScrollNext,
    }),
    [currentSlide, scrollPrev, scrollNext, canScrollPrev, canScrollNext],
  )

  return (
    <CarouselContext.Provider value={contextValue}>
      <div
        ref={ref}
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        <div ref={containerRef} className="overflow-hidden">
          {children}
        </div>
      </div>
    </CarouselContext.Provider>
  )
})
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { currentSlide } = useCarousel()

    return (
      <div
        ref={ref}
        className={cn("relative flex transition-transform duration-500 ease-in-out", className)}
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        {...props}
      />
    )
  },
)
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        className={cn("min-w-0 shrink-0 grow-0 basis-full px-4", className)}
        {...props}
      />
    )
  },
)
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { scrollPrev, canScrollPrev } = useCarousel()

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute left-4 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full",
          !canScrollPrev && "opacity-50 cursor-not-allowed",
          className,
        )}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        {...props}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>
    )
  },
)
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { scrollNext, canScrollNext } = useCarousel()

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute right-4 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full",
          !canScrollNext && "opacity-50 cursor-not-allowed",
          className,
        )}
        disabled={!canScrollNext}
        onClick={scrollNext}
        {...props}
      >
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>
    )
  },
)
CarouselNext.displayName = "CarouselNext"

const CarouselDots = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { count: number }>(
  ({ className, count, ...props }, ref) => {
    const { currentSlide, setCurrentSlide } = useCarousel()

    return (
      <div ref={ref} className={cn("flex justify-center gap-1 mt-4", className)} {...props}>
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              currentSlide === index ? "bg-primary" : "bg-gray-300",
            )}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    )
  },
)
CarouselDots.displayName = "CarouselDots"

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  useCarousel,
}
