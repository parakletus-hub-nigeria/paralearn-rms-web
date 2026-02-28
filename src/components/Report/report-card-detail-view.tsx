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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Name: {studentName}</p>
          <p className="text-sm text-muted-foreground">Class: {className}</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--lavender)] hover:bg-[var(--lavender)] border-none">
                <TableHead className="text-white font-bold h-14 pl-6">Part A Cognitive</TableHead>
                <TableHead className="text-white font-bold h-14 text-center">1st Test 20%</TableHead>
                <TableHead className="text-white font-bold h-14 text-center">2nd Test 20%</TableHead>
                <TableHead className="text-white font-bold h-14 text-center">Total</TableHead>
                <TableHead className="text-white font-bold h-14 text-center">Position</TableHead>
                <TableHead className="text-white font-bold h-14 pr-6">Teacher Remarks</TableHead>
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
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  )
}
