import {
  Briefcase,
  Building,
  Camera,
  Car,
  Home,
  Landmark,
  Music,
  Package,
  Utensils,
  Warehouse,
  type LucideIcon,
} from "lucide-react"
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
  // Map icon string to Lucide icon component
  const iconMap: Record<string, LucideIcon> = {
    building: Building,
    home: Home,
    camera: Camera,
    car: Car,
    landmark: Landmark,
    package: Package,
    warehouse: Warehouse,
    briefcase: Briefcase,
    music: Music,
    utensils: Utensils,
  }

  const iconKey = getCategoryIcon(category.slug)
  const IconComponent = iconMap[iconKey] || Package

  return (
    <Link
      to={`/browse?category=${encodeURIComponent(category.slug)}`}
      className={cn(
        "flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all",
        className,
      )}
    >
      <div className="bg-blue-100 rounded-full p-4 mb-4">
        <IconComponent className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="font-bold text-lg mb-1">{category.name}</h3>
    </Link>
  )
}

function getCategoryIcon(slug: string) {
  const iconMap: Record<string, string> = {
    homes: "home",
    apartments: "building",
    vehicles: "car",
    equipment: "camera",
    spaces: "landmark",
    tools: "briefcase",
    electronics: "package",
    furniture: "warehouse",
    clothing: "utensils",
  }
  return iconMap[slug.toLowerCase()] || "package"
}
