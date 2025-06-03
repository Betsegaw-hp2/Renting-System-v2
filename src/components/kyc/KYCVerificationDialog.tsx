import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface KYCVerificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KYCVerificationDialog({ open, onOpenChange }: KYCVerificationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            KYC Verification Required
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            To add properties to our platform, you need to complete your KYC (Know Your Customer) verification first. 
            This helps us maintain a secure and trusted marketplace for all users.
            <br /><br />
            Please complete your KYC verification in your profile settings to unlock property creation features.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            onOpenChange(false)
            // Navigate to profile/verification page
            window.location.href = "/owner/profile"
          }}>
            Go to Profile
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
