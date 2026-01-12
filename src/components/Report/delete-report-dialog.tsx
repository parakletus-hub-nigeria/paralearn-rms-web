"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DialogContent, Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ReportCard {
  id: string
  name: string
}

interface DeleteReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: ReportCard
}

export function DeleteReportDialog({ open, onOpenChange, report }: DeleteReportDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 space-y-6">
          <header className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800">Delete Report</h2>
            <p className="text-slate-500 font-medium">Are you sure you want to delete this report? This action cannot be undone.</p>
          </header>

          <div className="flex gap-4 justify-end pt-2">
            <Button variant="outline" className="h-12 px-8 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="h-12 px-8 rounded-xl bg-[var(--red-vivid)] hover:bg-[var(--red-vivid)]/90 text-white font-bold transition-all shadow-lg shadow-red-100" onClick={() => onOpenChange(false)}>
              Delete Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </AlertDialog>
  )
}
