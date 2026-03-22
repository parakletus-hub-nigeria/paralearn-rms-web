"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ImageOff, Loader2 } from "lucide-react";
import { useGetAvailableReportCardTemplatesQuery } from "@/reduxToolKit/api/endpoints/settings";

interface Props {
  selectedTemplateIds: string[];
  onToggle: (templateId: string) => void;
}

export function Step5ReportCardTemplates({ selectedTemplateIds, onToggle }: Props) {
  const { data: templates = [], isLoading, isError } = useGetAvailableReportCardTemplatesQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>Failed to load templates. You can skip this step and choose templates later in Settings.</p>
      </div>
    );
  }

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Report Card Templates</h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose one or more templates for generating student report cards. You can change this later in Settings.
          </p>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <ImageOff className="mx-auto h-10 w-10 mb-3" />
            <p className="text-sm">No templates available yet. Check back later or skip this step.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => {
              const isSelected = selectedTemplateIds.includes(tpl.id);
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => onToggle(tpl.id)}
                  className={`relative rounded-xl border-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 overflow-hidden ${
                    isSelected
                      ? "border-purple-600 shadow-md"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                    {tpl.thumbnailUrl ? (
                      <img
                        src={tpl.thumbnailUrl}
                        alt={tpl.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="h-8 w-8 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Selected badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="h-6 w-6 text-purple-600 bg-white rounded-full" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-3 space-y-1">
                    <p className="font-semibold text-sm text-slate-800">{tpl.name}</p>
                    {tpl.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{tpl.description}</p>
                    )}
                    {isSelected && (
                      <Badge className="mt-1 text-xs bg-purple-100 text-purple-700 border-purple-200">
                        Selected
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selectedTemplateIds.length > 0 && (
          <p className="text-sm text-purple-600 font-medium">
            {selectedTemplateIds.length} template{selectedTemplateIds.length > 1 ? "s" : ""} selected
          </p>
        )}
      </CardContent>
    </Card>
  );
}
