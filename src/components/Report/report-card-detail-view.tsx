"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, ArrowLeft } from "lucide-react"

interface ReportCardDetailViewProps {
  studentName: string
  className: string
  onBack?: () => void
}

const subjects = [
  {
    name: "Mathematics",
    partA: 10,
    firstTest: 5,
    secondTest: 15,
    total: 30,
    position: "Fair",
  },
  {
    name: "Basic English",
    partA: 10,
    firstTest: 5,
    secondTest: 15,
    total: 30,
    position: "Fair",
  },
  {
    name: "Basic Science",
    partA: 10,
    firstTest: 5,
    secondTest: 15,
    total: 30,
    position: "Fair",
  },
  {
    name: "Social Studies",
    partA: 10,
    firstTest: 5,
    secondTest: 15,
    total: 30,
    position: "Fair",
  },
  {
    name: "Computer",
    partA: 10,
    firstTest: 5,
    secondTest: 15,
    total: 30,
    position: "Fair",
  },
]

export function ReportCardDetailView({
  studentName = "Jane Doe",
  className = "1 South",
  onBack,
}: ReportCardDetailViewProps) {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-end justify-between">
        <div className="bg-[var(--purple-light)]/20 p-5 rounded-2xl border border-[var(--purple-light)]/40 min-w-[240px]">
          <div className="flex flex-col gap-1.5">
             <div className="flex items-center gap-3">
               <span className="text-slate-500 font-semibold text-sm w-12">Name :</span>
               <span className="text-slate-900 font-bold">{studentName}</span>
             </div>
             <div className="flex items-center gap-3">
               <span className="text-slate-500 font-semibold text-sm w-12">Class :</span>
               <span className="text-slate-900 font-bold">{className}</span>
             </div>
          </div>
        </div>
        <Button className="btn-primary shadow-purple-100 h-12 px-8 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--lavender)] hover:bg-[var(--lavender)] border-none">
              <TableHead className="text-white font-bold h-14 pl-6">Part A Cognitive</TableHead>
              <TableHead className="text-white font-bold h-14 text-center">1st Test 20%</TableHead>
              <TableHead className="text-white font-bold h-14 text-center">2nd Test 20%</TableHead>
              <TableHead className="text-white font-bold h-14 text-center">Total</TableHead>
              <TableHead className="text-white font-bold h-14 text-center">Position</TableHead>
              <TableHead className="text-white font-bold h-14 pr-6">Teacher's Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject, index) => (
              <TableRow 
                key={subject.name} 
                className={`border-none transition-colors ${
                  index % 2 === 0 ? "bg-white" : "bg-[var(--purple-light)]/30"
                }`}
              >
                <TableCell className="font-bold text-slate-800 py-5 pl-6">{subject.name}</TableCell>
                <TableCell className="text-center font-medium text-slate-600">{subject.partA}</TableCell>
                <TableCell className="text-center font-medium text-slate-600">{subject.firstTest}</TableCell>
                <TableCell className="text-center font-medium text-slate-600">{subject.secondTest}</TableCell>
                <TableCell className="text-center font-bold text-slate-900">{subject.total}</TableCell>
                <TableCell className="text-center">
                  <span className="status-badge bg-white shadow-sm border border-slate-100 text-slate-600">
                    {subject.position}
                  </span>
                </TableCell>
                <TableCell className="text-slate-400 italic font-medium pr-6">Fair</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="h-12 px-8 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button 
          className="bg-[var(--purple-vivid)] hover:bg-[var(--purple-vivid)]/90 text-white font-bold h-12 px-10 rounded-xl shadow-lg shadow-purple-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          Publish
        </Button>
      </div>
    </div>
  )
}
