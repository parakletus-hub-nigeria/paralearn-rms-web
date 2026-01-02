"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Plus, X } from "lucide-react"

interface Class {
  id: string
  name: string
  capacity: string
  gradeLevel: string
}

interface Step2Props {
  classes: Class[]
  setClasses: (classes: Class[]) => void
}

export function Step2ClassesGrades({ classes, setClasses }: Step2Props) {
  const addClass = () => {
    const newClass: Class = {
      id: Date.now().toString(),
      name: "",
      capacity: "",
      gradeLevel: "",
    }
    setClasses([...classes, newClass])
  }

  const removeClass = (id: string) => {
    setClasses(classes.filter((cls) => cls.id !== id))
  }

  const updateClass = (id: string, field: keyof Class, value: string) => {
    setClasses(classes.map((cls) => (cls.id === id ? { ...cls, [field]: value } : cls)))
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <h2 className="font-semibold text-foreground">Classes & Grades</h2>
          <p className="text-sm text-muted-foreground">Add classes and grade levels</p>
        </div>

        {classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-border">
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1 text-center">
              <p className="font-medium text-foreground">No class added yet</p>
              <p className="text-sm text-muted-foreground">{'Click "Add Class" to create your first class'}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((cls) => (
              <div key={cls.id} className="relative space-y-4 rounded-lg border border-border bg-background p-4">
                <button
                  type="button"
                  onClick={() => removeClass(cls.id)}
                  className="absolute right-2 top-2 text-destructive hover:text-destructive/80"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="space-y-2">
                  <Label>Class Name</Label>
                  <Input
                    placeholder="Enter class name"
                    value={cls.name}
                    onChange={(e) => updateClass(cls.id, "name", e.target.value)}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Class capacity</Label>
                    <Input
                      type="number"
                      placeholder="Enter capacity"
                      value={cls.capacity}
                      onChange={(e) => updateClass(cls.id, "capacity", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grade Level</Label>
                    <Select value={cls.gradeLevel} onValueChange={(value) => updateClass(cls.id, "gradeLevel", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grade 1">Grade 1</SelectItem>
                        <SelectItem value="Grade 2">Grade 2</SelectItem>
                        <SelectItem value="Grade 3">Grade 3</SelectItem>
                        <SelectItem value="Grade 4">Grade 4</SelectItem>
                        <SelectItem value="Grade 5">Grade 5</SelectItem>
                        <SelectItem value="Grade 6">Grade 6</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button className="w-full" onClick={addClass} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Class
        </Button>
      </CardContent>
    </Card>
  )
}
