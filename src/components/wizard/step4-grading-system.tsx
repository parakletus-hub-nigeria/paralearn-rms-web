"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface GradeScale {
  letter: string
  minPoints: number
  maxPoints: number
  description: string
}

interface Step4Props {
  academicYear: string
  setAcademicYear: (value: string) => void
  gradingSystemType: string
  setGradingSystemType: (value: string) => void
  passingGrade: string
  setPassingGrade: (value: string) => void
  maximumPoints: string
  setMaximumPoints: (value: string) => void
  gradeScales: GradeScale[]
  setGradeScales: (scales: GradeScale[]) => void
}

export function Step4GradingSystem({
  academicYear,
  setAcademicYear,
  gradingSystemType,
  setGradingSystemType,
  passingGrade,
  setPassingGrade,
  maximumPoints,
  setMaximumPoints,
  gradeScales,
  setGradeScales,
}: Step4Props) {
  const updateGradeScale = (index: number, field: keyof GradeScale, value: number | string) => {
    const newGradeScales = [...gradeScales]
    newGradeScales[index] = { ...newGradeScales[index], [field]: value }
    setGradeScales(newGradeScales)
  }

  return (
    <>
      {/* Grading System Type */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <h2 className="font-semibold text-foreground">Grading System Type</h2>
            <p className="text-sm text-muted-foreground">Select your preferred grading system</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grading-academic-year">Academic Year</Label>
            <Select value={academicYear} onValueChange={setAcademicYear}>
              <SelectTrigger id="grading-academic-year" className="h-11 bg-white border border-slate-300 focus:border-[#641BC4] font-medium rounded-lg">
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-2025">2024-2025</SelectItem>
                <SelectItem value="2025-2026">2025-2026</SelectItem>
                <SelectItem value="2026-2027">2026-2027</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <RadioGroup value={gradingSystemType} onValueChange={setGradingSystemType} className="space-y-3">
            <div className="flex items-center space-x-3 rounded-md border border-input p-3">
              <RadioGroupItem value="letter" id="letter" />
              <Label htmlFor="letter" className="flex-1 cursor-pointer">
                <span className="font-medium">Letter Grades</span>
                <span className="ml-2 text-muted-foreground">(A, B, C, D, E, F System)</span>
              </Label>
            </div>
            <div className="flex items-center space-x-3 rounded-md border border-input p-3">
              <RadioGroupItem value="percentage" id="percentage" />
              <Label htmlFor="percentage" className="flex-1 cursor-pointer">
                <span className="font-medium">Percentage</span>
                <span className="ml-2 text-muted-foreground">(0-100%) System</span>
              </Label>
            </div>
            <div className="flex items-center space-x-3 rounded-md border border-input p-3">
              <RadioGroupItem value="gpa" id="gpa" />
              <Label htmlFor="gpa" className="flex-1 cursor-pointer">
                <span className="font-medium">GPA Scale</span>
                <span className="ml-2 text-muted-foreground">(0-100%) System</span>
              </Label>
            </div>
            <div className="flex items-center space-x-3 rounded-md border border-input p-3">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom" className="flex-1 cursor-pointer">
                <span className="font-medium">Custom Scale</span>
                <span className="ml-2 text-muted-foreground">Define your own system</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Basic Settings */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <h2 className="font-semibold text-foreground">Basic Settings</h2>
            <p className="text-sm text-muted-foreground">Configure basic grading parameters</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="passing-grade">Passing grades</Label>
              <Input
                id="passing-grade"
                type="number"
                value={passingGrade}
                onChange={(e) => setPassingGrade(e.target.value)}
                className="h-11 bg-white border border-slate-300 focus:border-[#641BC4] rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-points">Maximum Points</Label>
              <Input
                id="max-points"
                type="number"
                value={maximumPoints}
                onChange={(e) => setMaximumPoints(e.target.value)}
                className="h-11 bg-white border border-slate-300 focus:border-[#641BC4] rounded-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade Scale Configuration */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <h2 className="font-semibold text-foreground">Grade Scale Configuration</h2>
            <p className="text-sm text-muted-foreground">Define your grading scale ranges and corresponding values</p>
          </div>

          <div className="space-y-3">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground">
              <span>Letter Grade</span>
              <span>Min Points</span>
              <span>Max Points</span>
              <span>Description</span>
            </div>

            {/* Grade Rows */}
            {gradeScales.map((grade, index) => (
              <div key={grade.letter} className="grid grid-cols-4 gap-4">
                <Input
                  value={grade.letter}
                  onChange={(e) => updateGradeScale(index, "letter", e.target.value)}
                  className="h-11 bg-white border border-slate-300 focus:border-[#641BC4] rounded-lg text-center"
                />
                <Input
                  type="number"
                  value={grade.minPoints}
                  onChange={(e) => updateGradeScale(index, "minPoints", Number.parseInt(e.target.value) || 0)}
                  className="h-11 bg-white border border-slate-300 focus:border-[#641BC4] rounded-lg"
                />
                <Input
                  type="number"
                  value={grade.maxPoints}
                  onChange={(e) => updateGradeScale(index, "maxPoints", Number.parseInt(e.target.value) || 0)}
                  className="h-11 bg-white border border-slate-300 focus:border-[#641BC4] rounded-lg"
                />
                <Input
                  value={grade.description}
                  onChange={(e) => updateGradeScale(index, "description", e.target.value)}
                  placeholder="Enter description"
                  className="h-11 bg-white border border-slate-300 focus:border-[#641BC4] rounded-lg"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
