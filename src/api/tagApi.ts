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

// Mock storage for user tags (in-memory storage for development)
const mockUserTags: Record<string, string[]> = {}

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
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Get user's tag IDs from mock storage
        const userTagIds = mockUserTags[userId] || []
        
        // Return the actual tag objects for the user's selected tag IDs
        return mockTags.filter(tag => userTagIds.includes(tag.id))
      }

      const response = await apiClient.get<Tag[]>(`/users/${userId}/tags`)
      return response.data
    } catch (error) {
      console.error("Error fetching user tags:", error)
      return []
    }
  },  updateUserTags: async (userId: string, tagIds: string[]): Promise<void> => {
    try {      if (config.useMockApi) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Get existing tags to filter out duplicates (mock version)
        const existingTagIds = mockUserTags[userId] || []
        
        // Filter out tags that user already has
        const newTagIds = tagIds.filter(tagId => !existingTagIds.includes(tagId))
        
        // Update mock storage with all tags (existing + new)
        mockUserTags[userId] = [...existingTagIds, ...newTagIds]
        
        console.log("Mock: User tags updated successfully. Added:", newTagIds)
        return
      }

      // First get existing user tags to filter out duplicates
      const existingTagsResponse = await apiClient.get<Tag[]>(`/users/${userId}/tags`)
      const existingTagIds = existingTagsResponse.data.map(tag => tag.id)
      
      // Filter out tags that user already has
      const newTagIds = tagIds.filter(tagId => !existingTagIds.includes(tagId))
      
      // Only send request if there are new tags to add
      if (newTagIds.length > 0) {
        const payload: CreateUserTagsPayload = { tags: newTagIds }
        const response = await apiClient.post(`/users/${userId}/tags`, payload)
        console.log("User tags updated successfully:", response.data)
      } else {
        console.log("No new tags to add - user already has all selected tags")
      }
    } catch (error) {
      console.error("Error updating user tags:", error)
      throw error
    }
  },
  removeUserTag: async (userId: string, tagId: string): Promise<void> => {
    try {
      if (config.useMockApi) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Remove the tag ID from mock storage
        if (mockUserTags[userId]) {
          mockUserTags[userId] = mockUserTags[userId].filter(id => id !== tagId)
        }
        return
      }

      await apiClient.delete(`/users/${userId}/tags/${tagId}`)
    } catch (error) {
      console.error("Error removing user tag:", error)
      throw error
    }
  }
}
