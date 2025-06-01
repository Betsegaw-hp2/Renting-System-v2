import { TagSelectionModal } from "@/components/preferences/TagSelectionModal"
import { useTagManager } from "@/hooks/useTagManager"

export function TagManagerWrapper() {
  const { isTagPromptOpen, handleSaveTags, handleCloseTagPrompt } = useTagManager()

  return (
    <TagSelectionModal
      isOpen={isTagPromptOpen}
      onClose={handleCloseTagPrompt}
      onSave={handleSaveTags}
      title="Choose Your Interests"
      description="Select tags that match your interests to get personalized recommendations for rentals."
      showSkipOption={true}
    />
  )
}
