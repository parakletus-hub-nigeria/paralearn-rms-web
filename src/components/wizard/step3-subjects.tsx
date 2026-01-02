"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Step3Props {
  onAddSubject: () => void;
}

export function Step3Subjects({ onAddSubject }: Step3Props) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <h2 className="font-semibold text-foreground">Subjects Management</h2>
          <p className="text-sm text-muted-foreground">
            Add subjects for each class and organize them by category
          </p>
        </div>

        <div className="space-y-2">
          {["Grade 1"].map((grade) => (
            <div
              key={grade}
              className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
            >
              <span className="font-medium">{grade}</span>
              <Button onClick={onAddSubject} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
