import apiClient from "@/api/client"
import config from "@/config/api.config"
import type { CreateUserTagsPayload, Tag } from "@/types/tag.types"

const mockTags: Tag[] = [
  { id: "1", name: "Electronics" },
  { id: "2", name: "Furniture" },
  { id: "3", name: "Vehicles" },
  { id: "4", name: "Apartments" },
  { id: "5", name: "Houses" },
  { id: "6", name: "Office Space" },
  { id: "7", name: "Tools" },
  { id: "8", name: "Sports Equipment" },
  { id: "9", name: "Clothing" },
  { id: "10", name: "Books" },
  { id: "11", name: "Music Equipment" },
  { id: "12", name: "Photography" },
  { id: "13", name: "Gaming" },
  { id: "14", name: "Garden & Outdoor" },
  { id: "15", name: "Kitchen Appliances" },
]

export const tagApi = {
  getAllTags: async (): Promise<Tag[]> => {
    try {
      if (config.useMockApi) {
        return mockTags
      }

      const response = await apiClient.get<Tag[]>("/tags")
      return response.data
    } catch (error) {
      console.error("Error fetching tags:", error)
      return mockTags
    }
  },

  getUserTags: async (userId: string): Promise<Tag[]> => {
    try {
      if (config.useMockApi) {
        return []
      }

      const response = await apiClient.get<Tag[]>(`/users/${userId}/tags`)
      return response.data
    } catch (error) {
      console.error("Error fetching user tags:", error)
      return []
    }
  },
  updateUserTags: async (userId: string, tagIds: string[]): Promise<void> => {
    try {
      if (config.useMockApi) {
        await new Promise(resolve => setTimeout(resolve, 500))
        return
      }

      const payload: CreateUserTagsPayload = { tag_ids: tagIds }
      await apiClient.post(`/users/${userId}/tags`, payload)
    } catch (error) {
      console.error("Error updating user tags:", error)
      throw error
    }
  },

  removeUserTag: async (userId: string, tagId: string): Promise<void> => {
    try {
      if (config.useMockApi) {
        await new Promise(resolve => setTimeout(resolve, 300))
        return
      }

      await apiClient.delete(`/user/${userId}/tag/${tagId}`)
    } catch (error) {
      console.error("Error removing user tag:", error)
      throw error
    }
  }
}
