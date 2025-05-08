"use client"

import { ArrowUpDown, Edit, Filter, FolderPlus, ImageIcon, MoreHorizontal, Search, Trash } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "../../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Textarea } from "../../../components/ui/textarea"
import { adminApi } from "../api/adminApi"
import { AdminLayout } from "../components/layout/AdminLayout"
import type { TableState } from "../types"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tableState, setTableState] = useState<TableState>({
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
    sorting: null,
    filters: {
      search: "",
    },
  })
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    slug: "",
  })
  const [categoryImage, setCategoryImage] = useState<File | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const { pagination, sorting, filters } = tableState

        const params: any = {
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
          search: filters.search || undefined,
          sort: sorting ? `${sorting.desc ? "desc" : "asc"}` : undefined,
        }

        const data = await adminApi.getCategories(params)
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [tableState])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTableState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        search: e.target.value,
      },
      pagination: {
        ...prev.pagination,
        pageIndex: 0,
      },
    }))
  }

  const handleSort = (columnId: string) => {
    setTableState((prev) => ({
      ...prev,
      sorting:
        prev.sorting?.id === columnId ? { id: columnId, desc: !prev.sorting.desc } : { id: columnId, desc: false },
    }))
  }

  const handlePageChange = (pageIndex: number) => {
    setTableState((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        pageIndex,
      },
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewCategory((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Auto-generate slug from name if slug field is empty
    if (name === "name" && !newCategory.slug) {
      setNewCategory((prev) => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCategoryImage(e.target.files[0])
    }
  }

  const handleCreateCategory = async () => {
    try {
      const formData = new FormData()
      formData.append("name", newCategory.name)
      formData.append("description", newCategory.description)
      formData.append("slug", newCategory.slug)

      if (categoryImage) {
        formData.append("image", categoryImage)
      }

      await adminApi.createCategory(formData)

      // Reset form and refresh categories
      setNewCategory({ name: "", description: "", slug: "" })
      setCategoryImage(null)
      setIsDialogOpen(false)

      // Refresh categories list
      const { pagination, sorting, filters } = tableState
      const params: any = {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        search: filters.search || undefined,
        sort: sorting ? `${sorting.desc ? "desc" : "asc"}` : undefined,
      }

      const data = await adminApi.getCategories(params)
      setCategories(data)
    } catch (error) {
      console.error("Error creating category:", error)
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FolderPlus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>Add a new category for rental listings.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Category name"
                    value={newCategory.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    name="slug"
                    placeholder="category-slug"
                    value={newCategory.slug}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Category description"
                    value={newCategory.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Category Image</Label>
                  <div className="flex items-center gap-2">
                    <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <Label
                      htmlFor="image"
                      className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                      <ImageIcon className="h-4 w-4" />
                      {categoryImage ? categoryImage.name : "Choose image"}
                    </Label>
                    {categoryImage && (
                      <Button variant="ghost" size="sm" onClick={() => setCategoryImage(null)}>
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCategory}>Create Category</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full items-center gap-2 md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search categories..."
                  className="w-full pl-8"
                  value={tableState.filters.search}
                  onChange={handleSearch}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>All categories</DropdownMenuItem>
                  <DropdownMenuItem>Recently added</DropdownMenuItem>
                  <DropdownMenuItem>Most listings</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 p-0 font-medium"
                      onClick={() => handleSort("name")}
                    >
                      Name
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 p-0 font-medium"
                      onClick={() => handleSort("slug")}
                    >
                      Slug
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 p-0 font-medium"
                      onClick={() => handleSort("created_at")}
                    >
                      Created
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 animate-pulse rounded bg-muted"></div>
                            <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-8 w-8 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : categories&& categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No categories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories&& categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {category.imageUrl ? (
                            <img
                              src={category.imageUrl || "/placeholder.svg"}
                              alt={category.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                              <FolderPlus className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{category.description}</TableCell>
                      <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ImageIcon className="mr-2 h-4 w-4" />
                              Update Image
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {tableState.pagination.pageIndex * tableState.pagination.pageSize + 1} to{" "}
              {Math.min((tableState.pagination.pageIndex + 1) * tableState.pagination.pageSize, categories&& categories.length || 0)}{" "}
              of {categories&& categories.length || 0} categories
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(tableState.pagination.pageIndex - 1)}
                disabled={tableState.pagination.pageIndex === 0 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(tableState.pagination.pageIndex + 1)}
                disabled={
                  (tableState.pagination.pageIndex + 1) * tableState.pagination.pageSize >= (categories&& categories.length || 0) ||
                  loading
                }
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
