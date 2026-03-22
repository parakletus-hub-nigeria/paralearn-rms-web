"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ImageOff, Loader2 } from "lucide-react";
import { useGetSchoolReportCardTemplatesQuery } from "@/reduxToolKit/api/endpoints/settings";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the selection ID when the user confirms */
  onConfirm: (selectionId: string) => void;
}

export function ReportCardTemplatePicker({ open, onOpenChange, onConfirm }: Props) {
  const { data: selections = [], isLoading, isError } = useGetSchoolReportCardTemplatesQuery(
    undefined,
    { skip: !open }
  );
  const [picked, setPicked] = useState<string | null>(null);

  const activeSelections = selections.filter((s: any) => s.isActive);

  const handleConfirm = () => {
    if (picked) {
      onConfirm(picked);
      onOpenChange(false);
      setPicked(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a Report Card Template</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : isError ? (
            <p className="text-sm text-center text-red-500 py-8">
              Failed to load templates. Please try again.
            </p>
          ) : activeSelections.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <ImageOff className="mx-auto h-10 w-10" />
              <p className="text-sm">No active templates. Go to Settings → Report Card Templates to add one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeSelections.map((sel: any) => {
                const tpl = sel.template ?? {};
                const isSelected = picked === sel.id;
                return (
                  <button
                    key={sel.id}
                    type="button"
                    onClick={() => setPicked(sel.id)}
                    className={`relative rounded-xl border-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 overflow-hidden ${
                      isSelected ? "border-purple-600 shadow-md" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                      {tpl.thumbnailUrl ? (
                        <img src={tpl.thumbnailUrl} alt={tpl.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageOff className="h-8 w-8 text-slate-300" />
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="h-6 w-6 text-purple-600 bg-white rounded-full" />
                      </div>
                    )}
                    <div className="p-3 space-y-1">
                      <p className="font-semibold text-sm text-slate-800">{tpl.name ?? "Template"}</p>
                      {tpl.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">{tpl.description}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!picked}
            onClick={handleConfirm}
            className="bg-gradient-to-r from-[#641BC4] to-[#8538E0] text-white hover:from-[#5a2ba8] hover:to-[#7530c7]"
          >
            Generate PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
