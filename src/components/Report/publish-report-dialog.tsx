"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

interface ReportCard {
  id: string
  name: string
}

interface PublishReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: ReportCard
}

export function PublishReportDialog({ open, onOpenChange, report }: PublishReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish Report Card</DialogTitle>
          <DialogDescription className="pt-2">Are you sure you want to publish this report card?</DialogDescription>
        </DialogHeader>

        <Alert className="border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="ml-2 text-sm">
            <div className="font-semibold text-foreground mb-2">Once published, this report card will be:</div>
            <ul className="space-y-1 text-foreground/80 ml-4 list-disc">
              <li>Visible to parents and students</li>
              <li>Locked from further edits</li>
              <li>Included in official records</li>
            </ul>
          </AlertDescription>
        </Alert>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <CheckCircle className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
