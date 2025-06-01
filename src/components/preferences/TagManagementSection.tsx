import { tagApi } from "@/api/tagApi"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/contexts/UserContext"
import { useToast } from "@/hooks/useToast"
import type { Tag } from "@/types/tag.types"
import { Loader2, Plus, Settings, Tags } from "lucide-react"
import { useEffect, useState } from "react"
import { TagSelectionModal } from "./TagSelectionModal"

export function TagManagementSection() {
  const { currentUser, refreshUser } = useUser()
  const { toast } = useToast()
  const [userTags, setUserTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (currentUser) {
      fetchUserTags()
    }
  }, [currentUser])
  const fetchUserTags = async () => {
    if (!currentUser) return
    
    try {
      setIsLoading(true)
      if (currentUser.tags && currentUser.tags?.length > 0) {
        setUserTags(currentUser.tags)
      } else {
        const tags = await tagApi.getUserTags(currentUser.id)
        setUserTags(tags)
      }
    } catch (error) {
      console.error("Failed to fetch user tags:", error)
      toast({
        title: "Error",
        description: "Failed to load your tags. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  const handleSaveTags = async (selectedTagIds: string[]): Promise<void> => {
    if (!currentUser) throw new Error("No user logged in")

    try {
      await tagApi.updateUserTags(currentUser.id, selectedTagIds)
      // Refresh user data to get updated tags
      await refreshUser()
      await fetchUserTags()
      toast({
        title: "Success",
        description: "Your interest tags have been updated successfully!",
      })
    } catch (error) {
      console.error("Failed to save user tags:", error)
      throw error
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleRemoveTag = async (tagId: string) => {
    if (!currentUser) return

    try {
      await tagApi.removeUserTag(currentUser.id, tagId)
      await refreshUser()
      await fetchUserTags()
      toast({
        title: "Success",
        description: "Tag removed successfully.",
      })
    } catch (error) {
      console.error("Failed to remove tag:", error)
      toast({
        title: "Error",
        description: "Failed to remove tag. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading your tags...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Tags className="h-4 w-4" />
                Your Interest Tags
              </CardTitle>
              <CardDescription>
                {userTags?.length > 0 
                  ? `You have ${userTags?.length} interest${userTags?.length === 1 ? '' : 's'} selected`
                  : "No tags selected yet. Add some to get personalized recommendations."
                }
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
            >
              {userTags?.length > 0 ? (
                <>
                  <Settings className="h-4 w-4" />
                  Manage
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Tags
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        {userTags?.length > 0 && (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userTags.map(tag => (
                <Badge 
                  key={tag.id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => handleRemoveTag(tag.id)}
                  title="Click to remove"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Click on any tag to remove it
            </p>
          </CardContent>
        )}
      </Card>      <TagSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTags}
        initialSelectedTags={userTags}
        title="Manage Your Interests"
        description="Select tags that match your interests to get personalized rental recommendations."
        showSkipOption={false}
      />
    </>
  )
}
