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
    <div className="flex h-screen bg-background">
      {/* <Sidebar activeItem="Report Cards" /> */}

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Good morning Admin!
            </h1>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Report Card Management
                </h2>
                <p className="text-muted-foreground mt-1">
                  Generate, preview, and publish student report cards
                </p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Generate New Report
              </Button>
            </div>
          </div>

          {view === "list" ? (
            <ReportCardTable onViewReport={handleViewReport} />
          ) : (
            <ReportCardDetailView
              studentName="Jane Doe"
              className="1 South"
              onBack={handleBack}
            />
          )}
        </div>
      </main>
    </div>
  );
}
