"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X } from "lucide-react"

interface SubjectsManagementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectName: string
  setSubjectName: (value: string) => void
  subjectCode: string
  setSubjectCode: (value: string) => void
  selectedClasses: string[]
  toggleClass: (id: string) => void
  selectedCategory: string
  setSelectedCategory: (value: string) => void
}

const classOptions = [
  { id: "1-north", label: "1 North" },
  { id: "1-east", label: "1 East" },
  { id: "1-west", label: "1 West" },
  { id: "1-south", label: "1 South" },
  { id: "1-central", label: "1 Central" },
]

const categoryOptions = ["Mathematics", "English Language", "Basic Science", "Basic Technology", "Social Studies"]

export function SubjectsManagementModal({
  open,
  onOpenChange,
  subjectName,
  setSubjectName,
  subjectCode,
  setSubjectCode,
  selectedClasses,
  toggleClass,
  selectedCategory,
  setSelectedCategory,
}: SubjectsManagementModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Subjects Management</DialogTitle>
          <p className="text-sm text-muted-foreground">Add subjects for each class and organize them by category</p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="subject-name">Subject Name</Label>
              <Input
                id="subject-name"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Enter subject name"
              />
            </div>
            <div className="relative space-y-2">
              <Label htmlFor="subject-code">Subject Code</Label>
              <div className="relative">
                <Input
                  id="subject-code"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="Enter code"
                />
                {subjectCode && (
                  <button
                    type="button"
                    onClick={() => setSubjectCode("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive hover:text-destructive/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select classes" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map((cls) => (
                    <div
                      key={cls.id}
                      className="flex cursor-pointer items-center justify-between px-2 py-1.5 hover:bg-accent"
                      onClick={() => toggleClass(cls.id)}
                    >
                      <span>{cls.label}</span>
                      <Checkbox checked={selectedClasses.includes(cls.id)} />
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full" size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
