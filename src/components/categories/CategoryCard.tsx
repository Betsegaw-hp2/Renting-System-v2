import { Link } from "react-router-dom"
import { cn } from "../../lib/utils"

type Category = {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  created_at: string
  updated_at: string
  icon?: string
}

interface CategoryCardProps {
  category: Category
  className?: string
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  // Use a default image if none is provided
  const imageUrl = category.image_url || "/placeholder.svg?height=200&width=300"

  return (
    <Link
      to={`/browse?category=${encodeURIComponent(category.slug)}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg shadow-md transition-all hover:shadow-lg",
        className,
      )}
    >
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90"></div>
      </div>

      {/* Category name */}
      <div className="absolute bottom-0 left-0 w-full p-4">
        <h3 className="font-semibold text-lg text-white">{category.name}</h3>
      </div>
    </Link>
  )
}
