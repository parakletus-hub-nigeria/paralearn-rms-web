"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Plus, X } from "lucide-react"

interface Term {
  id: string
  name: string
  startDate: string
  endDate: string
}

interface Step1Props {
  academicYear: string
  setAcademicYear: (value: string) => void
  sessionStartDate: string
  setSessionStartDate: (value: string) => void
  sessionEndDate: string
  setSessionEndDate: (value: string) => void
  terms: Term[]
  setTerms: (terms: Term[]) => void
  onSubmit?: () => void
  loading?: boolean
}

export function Step1SessionSetup({
  academicYear,
  setAcademicYear,
  sessionStartDate,
  setSessionStartDate,
  sessionEndDate,
  setSessionEndDate,
  terms,
  setTerms,
  onSubmit,
  loading = false,
}: Step1Props) {
  const addTerm = () => {
    const newTerm: Term = {
      id: Date.now().toString(),
      name: "",
      startDate: "",
      endDate: "",
    }
    setTerms([...terms, newTerm])
  }

  const removeTerm = (id: string) => {
    setTerms(terms.filter((term) => term.id !== id))
  }

  const updateTerm = (id: string, field: keyof Term, value: string) => {
    setTerms(terms.map((term) => (term.id === id ? { ...term, [field]: value } : term)))
  }

  return (
    <>
      {/* Academic Year Section */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <h2 className="font-semibold text-foreground">Academic Year</h2>
            <p className="text-sm text-muted-foreground">Set up your academic year and session dates</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="academic-year">Academic Year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger id="academic-year">
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2025-2026">2025-2026</SelectItem>
                  <SelectItem value="2026-2027">2026-2027</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="session-start">Session Start Date</Label>
                <Input
                  id="session-start"
                  type="date"
                  placeholder="mm/dd/yyyy"
                  value={sessionStartDate}
                  onChange={(e) => setSessionStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-end">Session End Date</Label>
                <Input
                  id="session-end"
                  type="date"
                  placeholder="mm/dd/yyyy"
                  value={sessionEndDate}
                  onChange={(e) => setSessionEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Semesters Section */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <h2 className="font-semibold text-foreground">Terms & Semesters</h2>
            <p className="text-sm text-muted-foreground">Divide your academic year into terms or semesters</p>
          </div>

          {terms.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-border">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1 text-center">
                <p className="font-medium text-foreground">No term added yet</p>
                <p className="text-sm text-muted-foreground">
                  {'Click "Add Term" to create your first term or semester'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {terms.map((term) => (
                <div key={term.id} className="relative space-y-4 rounded-lg border border-border bg-background p-4">
                  <button
                    type="button"
                    onClick={() => removeTerm(term.id)}
                    className="absolute right-2 top-2 text-destructive hover:text-destructive/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="space-y-2">
                    <Label>Term Name</Label>
                    <Select value={term.name} onValueChange={(value) => updateTerm(term.id, "name", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="First Term">First Term</SelectItem>
                        <SelectItem value="Second Term">Second Term</SelectItem>
                        <SelectItem value="Third Term">Third Term</SelectItem>
                        <SelectItem value="Fall Semester">Fall Semester</SelectItem>
                        <SelectItem value="Spring Semester">Spring Semester</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        placeholder="mm/dd/yyyy"
                        value={term.startDate}
                        onChange={(e) => updateTerm(term.id, "startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        placeholder="mm/dd/yyyy"
                        value={term.endDate}
                        onChange={(e) => updateTerm(term.id, "endDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button className="w-full" onClick={addTerm} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Term
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
