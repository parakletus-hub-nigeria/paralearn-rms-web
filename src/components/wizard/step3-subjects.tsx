"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  code: string;
  classIds: string[];
  description?: string;
}

interface Class {
  id: string;
  name: string;
  level: number;
  stream: string;
  capacity: string;
}

interface Step3Props {
  onAddSubject: () => void;
  subjects: Subject[];
  classes: Class[];
  onRemoveSubject?: (id: string) => void;
}

export function Step3Subjects({ onAddSubject, subjects, classes, onRemoveSubject }: Step3Props) {
  const getClassName = (classId: string) => {
    const cls = classes.find((c) => c.id === classId);
    return cls?.name || "Unknown Class";
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <h2 className="font-semibold text-foreground">Subjects Management</h2>
          <p className="text-sm text-muted-foreground">
            Add subjects for each class and organize them by category
          </p>
        </div>

        {subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <p className="text-sm text-muted-foreground">No subjects added yet</p>
            <Button onClick={onAddSubject} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
              >
                <div className="flex-1">
                  <div className="font-medium">{subject.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Code: {subject.code}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {subject.classIds.map((classId) => (
                      <span
                        key={classId}
                        className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800"
                      >
                        {getClassName(classId)}
                      </span>
                    ))}
                  </div>
                </div>
                {onRemoveSubject && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveSubject(subject.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button onClick={onAddSubject} className="w-full" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
