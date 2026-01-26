"use client"

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
    <div className="space-y-6">
      {/* Academic Year Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#641BC4] to-[#8538E0] text-white flex items-center justify-center font-bold text-sm shadow-md">
              1
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Academic Year
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Set up your academic year and session dates
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="academic-year" className="text-xs sm:text-sm font-semibold text-slate-700">
                  Academic Year
                </Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger 
                  id="academic-year"
                  className="h-11 bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#641BC4] font-medium rounded-lg"
                >
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                    <SelectItem value="2025-2026">2025-2026</SelectItem>
                    <SelectItem value="2026-2027">2026-2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-2">
                  <Label htmlFor="session-start" className="text-xs sm:text-sm font-semibold text-slate-700">
                    Session Start Date
                  </Label>
                  <Input
                    id="session-start"
                    type="date"
                    value={sessionStartDate}
                    onChange={(e) => setSessionStartDate(e.target.value)}
                    className="h-11 bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#641BC4] rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-end" className="text-xs sm:text-sm font-semibold text-slate-700">
                    Session End Date
                  </Label>
                  <Input
                    id="session-end"
                    type="date"
                    value={sessionEndDate}
                    onChange={(e) => setSessionEndDate(e.target.value)}
                    className="h-11 bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#641BC4] rounded-lg"
                  />
                </div>
              </div>
        </div>
      </div>

      {/* Terms Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#641BC4] to-[#8538E0] text-white flex items-center justify-center font-bold text-sm shadow-md">
              2
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Terms
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Divide your academic year into terms
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8 space-y-5">
            {terms.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-12 sm:py-16">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-2xl blur-2xl opacity-50" />
                  <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50">
                    <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-purple-400" />
                  </div>
                </div>
                <div className="space-y-1.5 text-center">
                  <p className="font-black text-base sm:text-lg text-slate-900">No term added yet</p>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md font-medium">
                    Click "Add Term" to create your first term
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {terms.map((term, index) => (
                  <div 
                    key={term.id} 
                    className="relative space-y-4 rounded-lg border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                        Term {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeTerm(term.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all shadow-sm hover:shadow-md"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2 pr-16">
                      <Label className="text-xs sm:text-sm font-semibold text-slate-700">Term Name</Label>
                      <Select value={term.name} onValueChange={(value) => updateTerm(term.id, "name", value)}>
                        <SelectTrigger className="h-11 bg-white border border-slate-300 focus:border-[#641BC4] font-medium rounded-lg">
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="First Term">First Term</SelectItem>
                          <SelectItem value="Second Term">Second Term</SelectItem>
                          <SelectItem value="Third Term">Third Term</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-semibold text-slate-700">Start Date</Label>
                        <Input
                          type="date"
                          value={term.startDate}
                          onChange={(e) => updateTerm(term.id, "startDate", e.target.value)}
                          className="h-11 bg-white border border-slate-300 focus:border-[#641BC4] rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-semibold text-slate-700">End Date</Label>
                        <Input
                          type="date"
                          value={term.endDate}
                          onChange={(e) => updateTerm(term.id, "endDate", e.target.value)}
                          className="h-11 bg-white border border-slate-300 focus:border-[#641BC4] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button 
              className="w-full h-11 bg-gradient-to-r from-[#641BC4] to-[#8538E0] hover:from-[#5a2ba8] hover:to-[#7530c7] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all rounded-lg" 
              onClick={addTerm}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Term
            </Button>
          </div>
        </div>
    </div>
  )
}
