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

interface CategoryCardProps {
  category: string
  count: number
  icon: string
  className?: string
}

export function CategoryCard({ category, count, icon, className }: CategoryCardProps) {
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

  const IconComponent = iconMap[icon] || Building

  return (
    <Link
      to={`/browse?category=${encodeURIComponent(category)}`}
      className={cn(
        "flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all",
        className,
      )}
    >
      <div className="bg-blue-100 rounded-full p-4 mb-4">
        <IconComponent className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="font-bold text-lg mb-1">{category}</h3>
      <p className="text-gray-500 text-sm">{count} listings</p>
    </Link>
  )
}
