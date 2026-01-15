"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { ReportCardTable } from "./report-card-table";
import { ReportCardDetailView } from "./report-card-detail-view";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function ReportCardAdminPage() {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setView("detail");
  };

  const handleBack = () => {
    setView("list");
    setSelectedReportId(null);
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-700">
      <header className="flex justify-between items-start mb-12">
        <div className="space-y-1">
          <h1 className="text-2xl font-medium text-slate-500">
            Good morning <span className="text-slate-900 font-bold">Admin!</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-[var(--green-light)] rounded-full flex items-center justify-center">
               <span className="text-xs font-bold text-emerald-700">LOGO</span>
            </div>
          </div>
        </div>
      </header>

      <section className="mb-10 text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Report Card Management
        </h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto">
          Generate, preview, and publish student report cards with ease.
        </p>
      </section>

      <div className="card-premium relative">
        <div className="flex flex-col mb-8">
           <h3 className="text-lg font-bold text-slate-800">Student Database</h3>
           <p className="text-sm text-slate-400">Manage and track all academic records</p>
        </div>

        {view === "list" ? (
          <div className="space-y-8">
            <ReportCardTable onViewReport={handleViewReport} />
            <div className="flex justify-end pt-6">
              <Button className="bg-[var(--purple-vivid)] hover:bg-[var(--purple-vivid)]/90 text-white font-bold h-14 px-10 rounded-2xl shadow-xl shadow-purple-100 flex items-center gap-3 transition-all active:scale-95">
                <Plus className="w-5 h-5 text-white stroke-[3px]" />
                <span className="text-base tracking-tight">Generate New Report</span>
              </Button>
            </div>
          </div>
        ) : (
          <ReportCardDetailView
            studentName="Jane Doe"
            className="1 South"
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
