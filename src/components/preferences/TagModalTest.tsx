import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TagSelectionModal } from "./TagSelectionModal"
import type { Tag } from "@/types/tag.types"

export function TagModalTest() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [testTags] = useState<Tag[]>([
    { id: "1", name: "Electronics" },
    { id: "2", name: "Furniture" }
  ])

  const handleSave = async (tagIds: string[]) => {
    console.log("Saving tags:", tagIds)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
  }

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tag Modal Closing Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Profile Page Modal (should close with X button)</h3>
            <Button onClick={() => setIsProfileModalOpen(true)}>
              Open Profile Modal (showSkipOption=false)
            </Button>
            <p className="text-sm text-muted-foreground mt-1">
              Should close with X button or clicking outside
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Signup Flow Modal (should NOT close with X button)</h3>
            <Button onClick={() => setIsSignupModalOpen(true)}>
              Open Signup Modal (showSkipOption=true)
            </Button>
            <p className="text-sm text-muted-foreground mt-1">
              Should only close via Save or Skip buttons
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile page modal */}
      <TagSelectionModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          console.log("Profile modal closing")
          setIsProfileModalOpen(false)
        }}
        onSave={handleSave}
        initialSelectedTags={testTags}
        title="Profile: Manage Your Interests"
        description="This should close with X button or outside click"
        showSkipOption={false}
      />

      {/* Signup flow modal */}
      <TagSelectionModal
        isOpen={isSignupModalOpen}
        onClose={() => {
          console.log("Signup modal closing")
          setIsSignupModalOpen(false)
        }}
        onSave={handleSave}
        initialSelectedTags={[]}
        title="Signup: Choose Your Interests"
        description="This should only close via Save or Skip buttons"
        showSkipOption={true}
      />
    </div>
  )
}
