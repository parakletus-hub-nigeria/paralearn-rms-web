"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ImageOff, Loader2, PlusCircle, ToggleLeft, ToggleRight, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  useGetAvailableReportCardTemplatesQuery,
  useGetSchoolReportCardTemplatesQuery,
  useSelectReportCardTemplateMutation,
  useDeactivateSchoolTemplateMutation,
  useActivateSchoolTemplateMutation,
  useRemoveSchoolTemplateMutation,
} from "@/reduxToolKit/api/endpoints/settings";

export function ReportCardTemplateSettings() {
  const [browseOpen, setBrowseOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const { data: schoolSelections = [], isLoading: loadingSelections, refetch } =
    useGetSchoolReportCardTemplatesQuery();
  const { data: availableTemplates = [], isLoading: loadingAvailable } =
    useGetAvailableReportCardTemplatesQuery(undefined, { skip: !browseOpen });

  const [selectTemplate, { isLoading: selecting }] = useSelectReportCardTemplateMutation();
  const [deactivate] = useDeactivateSchoolTemplateMutation();
  const [activate] = useActivateSchoolTemplateMutation();
  const [remove] = useRemoveSchoolTemplateMutation();

  const alreadySelectedGlobalIds = new Set(
    schoolSelections.map((s: any) => s.templateId)
  );

  const handleSelect = async (templateId: string) => {
    try {
      await selectTemplate(templateId).unwrap();
      toast.success("Template added to your school.");
    } catch (err: any) {
      if (err?.status === 409) {
        toast.info("Template already added.");
      } else {
        toast.error("Failed to add template.");
      }
    }
  };

  const handleToggle = async (sel: any) => {
    try {
      if (sel.isActive) {
        await deactivate(sel.id).unwrap();
        toast.success("Template deactivated.");
      } else {
        await activate(sel.id).unwrap();
        toast.success("Template activated.");
      }
    } catch {
      toast.error("Failed to update template status.");
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      await remove(removeTarget).unwrap();
      toast.success("Template removed.");
    } catch {
      toast.error("Failed to remove template.");
    } finally {
      setRemoveTarget(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Report Card Templates</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage the templates available for generating student report cards.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBrowseOpen(true)}
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingSelections ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-7 w-7 animate-spin text-purple-600" />
            </div>
          ) : schoolSelections.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <ImageOff className="mx-auto h-10 w-10" />
              <p className="text-sm">No templates added yet. Click "Add Template" to browse.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {schoolSelections.map((sel: any) => {
                const tpl = sel.template ?? {};
                return (
                  <div
                    key={sel.id}
                    className={`rounded-xl border overflow-hidden ${
                      sel.isActive ? "border-slate-200" : "border-slate-200 opacity-60"
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
                    <div className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm text-slate-800 leading-tight">
                          {tpl.name ?? "Template"}
                        </p>
                        <Badge
                          className={`text-xs shrink-0 ${
                            sel.isActive
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          {sel.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {tpl.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">{tpl.description}</p>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggle(sel)}
                          className="h-7 px-2 text-xs gap-1"
                        >
                          {sel.isActive ? (
                            <>
                              <ToggleRight className="h-4 w-4 text-green-600" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-4 w-4 text-slate-400" />
                              Activate
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRemoveTarget(sel.id)}
                          className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 gap-1 ml-auto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Browse available templates dialog */}
      <Dialog open={browseOpen} onOpenChange={setBrowseOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Browse Available Templates</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {loadingAvailable ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : availableTemplates.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-8">No templates available in the library.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
                {availableTemplates.map((tpl: any) => {
                  const alreadyAdded = alreadySelectedGlobalIds.has(tpl.id);
                  return (
                    <div key={tpl.id} className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                        {tpl.thumbnailUrl ? (
                          <img src={tpl.thumbnailUrl} alt={tpl.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageOff className="h-8 w-8 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-3 space-y-2">
                        <p className="font-semibold text-sm text-slate-800">{tpl.name}</p>
                        {tpl.description && (
                          <p className="text-xs text-slate-500 line-clamp-2">{tpl.description}</p>
                        )}
                        <Button
                          size="sm"
                          disabled={alreadyAdded || selecting}
                          onClick={() => handleSelect(tpl.id)}
                          className={`w-full h-8 text-xs gap-1 ${
                            alreadyAdded
                              ? "bg-green-50 text-green-600 border-green-200 cursor-default"
                              : "bg-gradient-to-r from-[#641BC4] to-[#8538E0] text-white hover:from-[#5a2ba8] hover:to-[#7530c7]"
                          }`}
                        >
                          {alreadyAdded ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Already Added
                            </>
                          ) : (
                            "Add to School"
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBrowseOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <AlertDialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the template from your school. You can re-add it later from the library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
