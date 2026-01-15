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

      <Card className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
                <TableHead className="text-primary-foreground">Part A Cognitive</TableHead>
                <TableHead className="text-primary-foreground text-center">1st Test</TableHead>
                <TableHead className="text-primary-foreground text-center">2nd Test</TableHead>
                <TableHead className="text-primary-foreground text-center">Total</TableHead>
                <TableHead className="text-primary-foreground text-center">Position</TableHead>
                <TableHead className="text-primary-foreground">Teacher&apos;s Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject, index) => (
                <TableRow key={subject.name} className={index % 2 === 0 ? "bg-primary/5" : "bg-background"}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell className="text-center">{subject.partA}</TableCell>
                  <TableCell className="text-center">{subject.firstTest}</TableCell>
                  <TableCell className="text-center">{subject.secondTest}</TableCell>
                  <TableCell className="text-center">{subject.total}</TableCell>
                  <TableCell className="text-center">{subject.position}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  )
}
