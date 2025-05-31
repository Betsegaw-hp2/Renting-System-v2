import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TagSelectionModal } from "@/components/preferences/TagSelectionModal"
import { TagManagementSection } from "@/components/preferences/TagManagementSection"
import { TagModalTest } from "@/components/preferences/TagModalTest"
import { useTagManager } from "@/hooks/useTagManager"
import { useUser } from "@/contexts/UserContext"
import { Tags, RefreshCw, AlertCircle } from "lucide-react"
import type { RootState } from "@/store"

export function TagSystemTestPage() {
  const [showTestModal, setShowTestModal] = useState(false)
  const { manuallyOpenTagPrompt, isTagPromptOpen } = useTagManager()
  const { currentUser, loading } = useUser()
  const { user: authUser } = useSelector((state: RootState) => state.auth)

  // Update session data periodically for display (optional monitoring)
  useEffect(() => {
    const interval = setInterval(() => {
      // This periodically checks session storage for debugging
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleTestSave = async (selectedTagIds: string[]): Promise<void> => {
    console.log("Test save with tag IDs:", selectedTagIds)
    // This is just for testing
  }
  const testLoginTrigger = () => {
    console.log("🧪 Testing login trigger manually")
    
    // Clear any existing flags first
    sessionStorage.removeItem('skippedTagPrompt')
    sessionStorage.removeItem('lastCheckedUserId')
    
    // Set the login trigger flag
    sessionStorage.setItem('triggerTagPromptAfterLogin', 'true')
    
    console.log("🧪 Set trigger flag, reloading page to simulate navigation")
    
    // Force a page reload to simulate navigation after login
    window.location.reload()
  }

  const clearAllFlags = () => {
    sessionStorage.removeItem('skippedTagPrompt')
    sessionStorage.removeItem('triggerTagPromptAfterLogin')
    sessionStorage.removeItem('triggerTagPromptAfterSignup')
    sessionStorage.removeItem('lastCheckedUserId')
    console.log("🧹 Cleared all session storage flags")
  }

  const triggerPromptDirectly = () => {
    console.log("🧪 Opening tag prompt directly")
    manuallyOpenTagPrompt()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Tag System Test Page</h1>
        <p className="text-muted-foreground">Test the tag selection and management functionality</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tag Selection Modal Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Tag Selection Modal
            </CardTitle>
            <CardDescription>
              Test the tag selection modal component
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => setShowTestModal(true)}>
              Open Test Modal
            </Button>
            <Button onClick={manuallyOpenTagPrompt} variant="outline">
              Open App-wide Tag Prompt
            </Button>
            <Button onClick={testLoginTrigger} variant="secondary">
              Test Login Trigger (Reload)
            </Button>
            <p className="text-sm text-muted-foreground">
              Status: {isTagPromptOpen ? "App prompt is open" : "App prompt is closed"}
            </p>
          </CardContent>
        </Card>

        {/* Tag Management Section Test */}
        <Card>
          <CardHeader>
            <CardTitle>Tag Management</CardTitle>
            <CardDescription>
              Test the tag management component (requires login)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TagManagementSection />
          </CardContent>
        </Card>
      </div>

      {/* API Test Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tag API Tests</CardTitle>
          <CardDescription>
            Test various tag API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                const { tagApi } = await import("@/api/tagApi")
                const tags = await tagApi.getAllTags()
                console.log("All tags:", tags)
                alert(`Loaded ${tags.length} tags. Check console for details.`)
              }}
            >
              Test Get All Tags
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                console.log("Session storage:")
                console.log("- skippedTagPrompt:", sessionStorage.getItem('skippedTagPrompt'))
                console.log("- triggerTagPromptAfterLogin:", sessionStorage.getItem('triggerTagPromptAfterLogin'))
                console.log("- triggerTagPromptAfterSignup:", sessionStorage.getItem('triggerTagPromptAfterSignup'))
              }}
            >
              Check Session Storage
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                sessionStorage.clear()
                alert("Session storage cleared!")
              }}
            >
              Clear Session Storage
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                sessionStorage.setItem('triggerTagPromptAfterLogin', 'true')
                alert("Login trigger flag set! Navigate to trigger the prompt.")
              }}
            >
              Simulate Login Trigger
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Debug Section */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
          <CardDescription>
            Debug information for troubleshooting tag prompt triggers
          </CardDescription>
        </CardHeader>        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            <div>Session Storage:</div>
            <ul className="pl-4 space-y-1">
              <li>• skippedTagPrompt: {sessionStorage.getItem('skippedTagPrompt') || 'null'}</li>
              <li>• triggerTagPromptAfterLogin: {sessionStorage.getItem('triggerTagPromptAfterLogin') || 'null'}</li>
              <li>• triggerTagPromptAfterSignup: {sessionStorage.getItem('triggerTagPromptAfterSignup') || 'null'}</li>
              <li>• lastCheckedUserId: {sessionStorage.getItem('lastCheckedUserId') || 'null'}</li>
            </ul>
            <div className="mt-4">Tag Manager State:</div>
            <ul className="pl-4 space-y-1">
              <li>• isTagPromptOpen: {isTagPromptOpen ? 'true' : 'false'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* User State Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            User State Information
          </CardTitle>
          <CardDescription>
            Compare user data from different sources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">UserContext User:</h4>
              <div className="text-sm text-muted-foreground">
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
                <p>ID: {currentUser?.id || 'None'}</p>
                <p>Email: {currentUser?.email || 'None'}</p>                <p>Tags: {currentUser?.tags?.length || 0} tags</p>
                {currentUser?.tags && currentUser.tags.length > 0 && (
                  <p>Tag IDs: {currentUser.tags.map(t => t.id).join(', ')}</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Redux Auth User:</h4>
              <div className="text-sm text-muted-foreground">
                <p>ID: {authUser?.id || 'None'}</p>
                <p>Email: {authUser?.email || 'None'}</p>                <p>Tags: {authUser?.tags?.length || 0} tags</p>
                {authUser?.tags && authUser.tags.length > 0 && (
                  <p>Tag IDs: {authUser.tags.map(t => t.id).join(', ')}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={clearAllFlags} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear All Flags
            </Button>
            <Button onClick={triggerPromptDirectly} variant="outline" size="sm">
              Direct Trigger
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Modal */}
      <TagSelectionModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        onSave={handleTestSave}
        title="Test Tag Selection"
        description="This is a test of the tag selection modal component."
        showSkipOption={true}
      />

      {/* Tag Modal Test */}
      <TagModalTest />
    </div>
  )
}

export default TagSystemTestPage
