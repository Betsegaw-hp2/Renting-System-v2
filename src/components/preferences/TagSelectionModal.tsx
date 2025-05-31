import { tagApi } from "@/api/tagApi"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/useToast"
import type { Tag } from "@/types/tag.types"
import { Loader2, Tags, X } from "lucide-react"
import { useEffect, useState } from "react"

interface TagSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (selectedTagIds: string[]) => Promise<void>
  initialSelectedTags?: Tag[]
  title?: string
  description?: string
  showSkipOption?: boolean
}

export function TagSelectionModal({
  isOpen,
  onClose,
  onSave,
  initialSelectedTags = [],
  title = "Choose Your Interests",
  description = "Select tags that match your interests to get better recommendations.",
  showSkipOption = true
}: TagSelectionModalProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Initialize selected tags
  useEffect(() => {
    if (initialSelectedTags?.length > 0) {
      setSelectedTagIds(new Set(initialSelectedTags?.map(tag => tag.id)))
    }
  }, [initialSelectedTags])

  // Fetch available tags when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTags()
    }
  }, [isOpen])

  const fetchTags = async () => {
    try {
      setIsLoading(true)
      const tags = await tagApi.getAllTags()
      setAvailableTags(tags)
    } catch (error) {
      console.error("Failed to fetch tags:", error)
      toast({
        title: "Error",
        description: "Failed to load available tags. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTagToggle = (tagId: string) => {
    const newSelectedTags = new Set(selectedTagIds)
    if (newSelectedTags.has(tagId)) {
      newSelectedTags.delete(tagId)
    } else {
      newSelectedTags.add(tagId)
    }
    setSelectedTagIds(newSelectedTags)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSave(Array.from(selectedTagIds))
      onClose()
      toast({
        title: "Success",
        description: "Your preferences have been saved successfully!",
      })
    } catch (error) {
      console.error("Failed to save tags:", error)
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSkip = () => {
    onClose()
    // Optionally save to session storage that user skipped
    sessionStorage.setItem('skippedTagPrompt', 'true')
  }

  const selectedTagsArray = availableTags.filter(tag => selectedTagIds.has(tag.id))

  return (
    <Dialog open={isOpen} onOpenChange={showSkipOption ? onClose : undefined}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading tags...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected tags preview */}
              {selectedTagsArray?.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Selected ({selectedTagsArray?.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedTagsArray?.map(tag => (
                        <Badge 
                          key={tag.id} 
                          variant="default" 
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleTagToggle(tag.id)}
                        >
                          {tag.name}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Available tags */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Available Tags</CardTitle>
                  <CardDescription>Click to select/deselect tags</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableTags?.map(tag => {
                      const isSelected = selectedTagIds.has(tag.id)
                      return (
                        <div
                          key={tag.id}
                          className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected 
                              ? "bg-primary/10 border-primary" 
                              : "hover:bg-muted border-border"
                          }`}
                          onClick={() => handleTagToggle(tag.id)}
                        >
                          <Checkbox 
                            checked={isSelected}
                            onChange={() => handleTagToggle(tag.id)}
                          />
                          <label className="text-sm font-medium cursor-pointer">
                            {tag.name}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {showSkipOption && (
            <Button variant="outline" onClick={handleSkip} disabled={isSaving}>
              Skip for now
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={selectedTagIds.size === 0 || isSaving}
            className="min-w-[100px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              `Save ${selectedTagIds.size > 0 ? `(${selectedTagIds.size})` : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
