"use client";

import { useState } from "react";
import { MoreVertical, Trash2, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DeleteReportDialog } from "./delete-report-dialog";
import { PublishReportDialog } from "./publish-report-dialog";

interface ReportCard {
  id: string;
  studentId: string;
  name: string;
  class: string;
  lastUpdated: string;
  contact: string;
  status: "Published" | "Draft";
}

interface ReportCardTableProps {
  onViewReport?: (reportId: string) => void;
}

const mockReportCards: ReportCard[] = [
  {
    id: "S-101",
    studentId: "S-101",
    name: "John Doe",
    class: "1 South",
    lastUpdated: "01/01/2001",
    contact: "+23456789045６",
    status: "Published",
  },
  {
    id: "S-102",
    studentId: "S-101",
    name: "John Doe",
    class: "1 South",
    lastUpdated: "01/01/2001",
    contact: "+23456789045６",
    status: "Draft",
  },
  {
    id: "S-103",
    studentId: "S-101",
    name: "John Doe",
    class: "1 South",
    lastUpdated: "01/01/2001",
    contact: "+23456789045６",
    status: "Draft",
  },
  {
    id: "S-104",
    studentId: "S-101",
    name: "John Doe",
    class: "1 South",
    lastUpdated: "01/01/2001",
    contact: "+23456789045６",
    status: "Published",
  },
  {
    id: "S-105",
    studentId: "S-101",
    name: "John Doe",
    class: "1 North",
    lastUpdated: "01/01/2001",
    contact: "+23456789045６",
    status: "Published",
  },
  {
    id: "S-106",
    studentId: "S-101",
    name: "John Doe",
    class: "1 East",
    lastUpdated: "01/01/2001",
    contact: "+23456678904６",
    status: "Draft",
  },
  {
    id: "S-107",
    studentId: "S-101",
    name: "John Doe",
    class: "1 South",
    lastUpdated: "01/01/2001",
    contact: "+23456789045６",
    status: "Published",
  },
];

export function ReportCardTable({ onViewReport }: ReportCardTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportCard | null>(null);

  const filteredCards = mockReportCards.filter((card) => {
    const matchesSearch = card.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClass === "All Classes" || card.class === selectedClass;
    const matchesStatus =
      selectedStatus === "All Status" || card.status === selectedStatus;

    return matchesSearch && matchesClass && matchesStatus;
  });

  const handleDelete = (report: ReportCard) => {
    setSelectedReport(report);
    setDeleteDialogOpen(true);
  };

  const handlePublish = (report: ReportCard) => {
    setSelectedReport(report);
    setPublishDialogOpen(true);
  };

  const classes = [
    "All Classes",
    "1 South",
    "1 North",
    "1 East",
    "1 West",
    "1 Central",
  ];
  const statuses = ["All Status", "Published", "Draft"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between">
        <div className="relative max-w-sm w-full">
           <Input
            placeholder="Search by student name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-none"
          />
          <Eye className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        <div className="flex gap-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="h-12 w-44 rounded-xl border-slate-200 bg-slate-50/50 shadow-none font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              {classes.map((cls) => (
                <SelectItem key={cls} value={cls} className="rounded-lg py-2.5">
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-12 w-44 rounded-xl border-slate-200 bg-slate-50/50 shadow-none font-medium text-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              {statuses.map((status) => (
                <SelectItem key={status} value={status} className="rounded-lg py-2.5">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--lavender)] hover:bg-[var(--lavender)] border-none">
              <TableHead className="text-white font-bold h-14">ID</TableHead>
              <TableHead className="text-white font-bold h-14">Name</TableHead>
              <TableHead className="text-white font-bold h-14">Class</TableHead>
              <TableHead className="text-white font-bold h-14 text-center">Last updated</TableHead>
              <TableHead className="text-white font-bold h-14">Contact</TableHead>
              <TableHead className="text-white font-bold h-14 text-center">Status</TableHead>
              <TableHead className="text-white font-bold h-14 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCards.map((card, index) => (
              <TableRow
                key={index}
                className={`border-none transition-colors group ${
                  index % 2 === 0 ? "bg-white" : "bg-[var(--purple-light)]/30"
                }`}
              >
                <TableCell className="font-bold text-[var(--brand-primary)] py-5 pl-4">
                  {card.id}
                </TableCell>
                <TableCell className="font-semibold text-slate-800">{card.name}</TableCell>
                <TableCell className="font-medium text-slate-600 tracking-tight">{card.class}</TableCell>
                <TableCell className="text-center font-medium text-slate-500">{card.lastUpdated}</TableCell>
                <TableCell className="font-medium text-slate-600 font-mono text-sm">{card.contact}</TableCell>
                <TableCell className="text-center">
                  <span
                    className={`status-badge inline-block ${
                      card.status === "Published"
                        ? "bg-[var(--green-light)] text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {card.status}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 transition-colors">
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl p-1.5 min-w-[160px]">
                      <DropdownMenuItem onClick={() => onViewReport?.(card.id)} className="rounded-lg py-2.5 cursor-pointer">
                        <Eye className="w-4 h-4 mr-3 text-slate-400" />
                        <span className="font-medium">View Report</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePublish(card)} className="rounded-lg py-2.5 cursor-pointer">
                        <FileText className="w-4 h-4 mr-3 text-slate-400" />
                        <span className="font-medium">Publish</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(card)}
                        className="rounded-lg py-2.5 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-3" />
                        <span className="font-medium">Delete Request</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedReport && (
        <>
          <DeleteReportDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            report={selectedReport}
          />
          <PublishReportDialog
            open={publishDialogOpen}
            onOpenChange={setPublishDialogOpen}
            report={selectedReport}
          />
        </>
      )}
    </div>
  );
}
