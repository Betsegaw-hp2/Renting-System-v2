"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./button"

const CarouselContext = React.createContext<{
  api: any
  currentSlide: number
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
    opts?: any
    orientation?: "horizontal" | "vertical"
    setApi?: (api: any) => void
  }
>(({ opts, orientation = "horizontal", setApi, className, children, ...props }, ref) => {
  const [carouselRef, setCarouselRef] = React.useState<HTMLDivElement | null>(null)
  const [api, setInternalApi] = React.useState<any | null>(null)
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback(() => {
    if (!api) return

    setCurrentSlide(api.selectedScrollSnap())
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [api])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

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

  React.useEffect(() => {
    if (!carouselRef) return

    // Simulate a simple carousel behavior
    const interval = setInterval(() => {
      if (canScrollNext) {
        scrollNext()
      } else {
        // Reset to first slide
        setCurrentSlide(0)
        carouselRef.scrollTo({ left: 0, behavior: "smooth" })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [carouselRef, canScrollNext, scrollNext])

  React.useEffect(() => {
    if (!api) return

    onSelect()
    api.on("select", onSelect)

    return () => {
      api.off("select", onSelect)
    }
  }, [api, onSelect])

  const contextValue = React.useMemo(
    () => ({
      api,
      currentSlide,
      scrollPrev,
      scrollNext,
      canScrollPrev,
      canScrollNext,
    }),
    [api, currentSlide, scrollPrev, scrollNext, canScrollPrev, canScrollNext],
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
        {children}
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
        className={cn("relative flex transition-transform duration-300 ease-in-out", className)}
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
        className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
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
          "absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full",
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
          "absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full",
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
    const { currentSlide, api } = useCarousel()

    return (
      <div ref={ref} className={cn("flex justify-center gap-1 mt-4", className)} {...props}>
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              currentSlide === index ? "bg-primary" : "bg-gray-300",
            )}
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    )
  },
)
CarouselDots.displayName = "CarouselDots"

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots, useCarousel }
