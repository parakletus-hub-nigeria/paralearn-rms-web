"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X } from "lucide-react"

interface Class {
  id: string
  name: string
  level: number
  stream: string
  capacity: string
}

interface SubjectsManagementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectName: string
  setSubjectName: (value: string) => void
  subjectCode: string
  setSubjectCode: (value: string) => void
  selectedClasses: string[]
  setSelectedClasses: (classes: string[]) => void
  toggleClass: (id: string) => void
  subjectDescription: string
  setSubjectDescription: (value: string) => void
  classes: Class[]
  onAddSubject: (subject: { id: string; name: string; code: string; classId: string; description?: string }) => void
}

export function SubjectsManagementModal({
  open,
  onOpenChange,
  subjectName,
  setSubjectName,
  subjectCode,
  setSubjectCode,
  selectedClasses,
  setSelectedClasses,
  toggleClass,
  subjectDescription,
  setSubjectDescription,
  classes,
  onAddSubject,
}: SubjectsManagementModalProps) {
  const handleAddSubject = () => {
    if (!subjectName || !subjectCode || selectedClasses.length === 0) {
      return;
    }

    // Create a subject for each selected class
    selectedClasses.forEach((classId) => {
      onAddSubject({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: subjectName,
        code: subjectCode,
        classId: classId,
        description: subjectDescription || undefined,
      });
    });

    // Reset form
    setSubjectName("");
    setSubjectCode("");
    setSelectedClasses([]);
    setSubjectDescription("");
    onOpenChange(false);
  };
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
                className="h-11 bg-white border border-slate-300 focus:border-[#641BC4] rounded-lg"
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
                  className="h-11 bg-white border border-slate-300 focus:border-[#641BC4] rounded-lg"
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

          <div className="space-y-2">
            <Label>Class</Label>
            {classes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Please add classes in Step 2 first</p>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded-md border border-slate-300 p-2 bg-white">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex cursor-pointer items-center justify-between px-2 py-1.5 hover:bg-slate-50 rounded-sm"
                    onClick={() => toggleClass(cls.id)}
                  >
                    <span>{cls.name}</span>
                    <Checkbox checked={selectedClasses.includes(cls.id)} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject-description">Description</Label>
            <Input
              id="subject-description"
              value={subjectDescription}
              onChange={(e) => setSubjectDescription(e.target.value)}
              placeholder="Enter description (e.g., Core mathematics curriculum)"
              className="h-11 bg-white border border-slate-300 focus:border-[#641BC4] rounded-lg"
            />
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={handleAddSubject}
            disabled={!subjectName || !subjectCode || selectedClasses.length === 0 || classes.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
