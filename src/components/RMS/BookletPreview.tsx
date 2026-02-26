import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Copy, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { BookletPreviewResponse } from "@/reduxToolKit/admin/adminThunks";

interface BookletPreviewProps {
  data: BookletPreviewResponse | null;
  isLoading: boolean;
  error: any;
  onRefresh?: () => void;
}

export const BookletPreview: React.FC<BookletPreviewProps> = ({
  data,
  isLoading,
  error,
  onRefresh,
}) => {
  const handleCopyId = (studentId: string) => {
    navigator.clipboard.writeText(studentId);
    toast.success("Student ID copied to clipboard");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p>Loading booklet preview...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-destructive flex flex-col items-center justify-center space-y-4">
          <AlertCircle className="w-12 h-12" />
          <p>Failed to load booklet preview.</p>
          <p className="text-sm text-muted-foreground">
            {error?.data?.message || "An unexpected error occurred."}
          </p>
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh}>
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.students) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>No preview data available for this class, term, and session.</p>
        </CardContent>
      </Card>
    );
  }

  const {
    className,
    session,
    term,
    totalStudents,
    reportProgress,
    students,
  } = data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Class Summary: {className}</CardTitle>
          <CardDescription>
            Session: {session} | Term: {term}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold">{totalStudents}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Students with Scores</p>
              <p className="text-2xl font-bold">{data.studentsWithScores}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <div className="flex items-center space-x-2 mt-1">
                <Progress value={reportProgress?.percentage || 0} className="h-2 flex-1" />
                <span className="text-sm font-medium">
                  {reportProgress?.percentage || 0}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {reportProgress?.subjectsSubmitted || 0} / {reportProgress?.totalSubjects || 0} subjects graded
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Academic Preview</CardTitle>
          <CardDescription>Review student performance before finalizing report cards.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Average</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Subjects Graded</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const hasAllSubjects =
                    student.subjectsSubmitted === student.subjectCount &&
                    student.subjectCount > 0;

                  return (
                    <TableRow key={student.studentId}>
                      <TableCell>
                        <div className="font-medium">{student.studentName}</div>
                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                          {student.studentIdNumber || "No ID"}
                          {student.studentIdNumber && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1"
                              onClick={() => handleCopyId(student.studentIdNumber)}
                              title="Copy ID"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.totalScore} / {student.possibleScore || 0}
                      </TableCell>
                      <TableCell>
                        {student.average > 0 ? (
                          <span className="font-medium">{Number(student.average).toFixed(1)}%</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.overallGrade && student.overallGrade !== "N/A" ? (
                          <Badge variant="outline">{student.overallGrade}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {student.subjectsSubmitted} / {student.subjectCount}
                          </span>
                          {hasAllSubjects ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <span className="flex h-2 w-2 rounded-full bg-yellow-500" title="Missing subjects" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.reportStatus ? (
                          <Badge
                            variant={
                              student.reportStatus === "approved"
                                ? "default" // Changed from success to default as a workaround for now, or you can add custom class
                                : student.reportStatus === "rejected"
                                ? "destructive"
                                : student.reportStatus === "published"
                                ? "default"
                                : "secondary"
                            }
                            className={`capitalize ${student.reportStatus === "approved" ? "bg-green-500 hover:bg-green-600" : ""}`}
                          >
                            {student.reportStatus}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground italic">
                            Draft
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No students found in this class.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookletPreview;
