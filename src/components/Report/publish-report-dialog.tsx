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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 space-y-6">
          <header className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800">Publish Report Card</h2>
            <p className="text-slate-500 font-medium tracking-tight">Are you sure you want to publish this report card?</p>
          </header>

          <div className="bg-[#FFF4F4] border border-[#FFE0E0] rounded-xl p-5 relative overflow-hidden">
             <div className="flex gap-4">
                <div className="flex-shrink-0 mt-0.5">
                   <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                   </div>
                </div>
                <div className="space-y-3">
                   <p className="text-[13px] font-bold text-red-900/80 uppercase tracking-wider">Once published, this report card will be:</p>
                   <ul className="space-y-2">
                      {['Visible to parents and students', 'Locked from further edits', 'Included in official records'].map((text, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm font-semibold text-red-800/70">
                           <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                           {text}
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>

          <div className="flex gap-4 justify-end pt-2">
            <Button variant="outline" className="h-12 px-8 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all font-sans" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="h-12 px-10 rounded-xl bg-[var(--purple-vivid)] hover:bg-[var(--purple-vivid)]/90 text-white font-bold transition-all shadow-lg shadow-purple-100 flex items-center gap-2" onClick={() => onOpenChange(false)}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              Publish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
