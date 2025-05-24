"use client"

import React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddPropertyForm } from "./AddPropertyForm"

interface AddPropertyDialogProps {
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export const AddPropertyDialog: React.FC<AddPropertyDialogProps> = ({ trigger, onSuccess }) => {
  const [open, setOpen] = React.useState(false)

  const handleSuccess = () => {
    setOpen(false)
    if (onSuccess) {
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>Add New Property</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>Fill out the form below to list your property</DialogDescription>
          </div>
          {/* <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button> */}
        </DialogHeader>
        <AddPropertyForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
          
      </DialogContent>
    </Dialog>
  )
}
