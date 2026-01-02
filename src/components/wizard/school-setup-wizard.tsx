"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, GraduationCap, ArrowLeft } from "lucide-react";
import { Step1SessionSetup } from "./step1-session-setup";
import { Step2ClassesGrades } from "./step2-classes-grades";
import { Step3Subjects } from "./step3-subjects";
import { Step4GradingSystem } from "./step4-grading-system";
import { SubjectsManagementModal } from "./subjects-management-modal";

interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface Class {
  id: string;
  name: string;
  capacity: string;
  gradeLevel: string;
}

interface GradeScale {
  letter: string;
  minPoints: number;
  maxPoints: number;
}

const defaultGradeScales: GradeScale[] = [
  { letter: "A", minPoints: 81, maxPoints: 100 },
  { letter: "A-", minPoints: 75, maxPoints: 80 },
  { letter: "B+", minPoints: 70, maxPoints: 74 },
  { letter: "B", minPoints: 65, maxPoints: 69 },
  { letter: "B-", minPoints: 60, maxPoints: 64 },
  { letter: "C+", minPoints: 55, maxPoints: 59 },
  { letter: "C", minPoints: 50, maxPoints: 54 },
  { letter: "C-", minPoints: 44, maxPoints: 49 },
  { letter: "D+", minPoints: 40, maxPoints: 44 },
  { letter: "D", minPoints: 35, maxPoints: 39 },
  { letter: "D-", minPoints: 30, maxPoints: 34 },
  { letter: "E", minPoints: 25, maxPoints: 29 },
  { letter: "F", minPoints: 0, maxPoints: 24 },
];

export function SchoolSetupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Step 1 state
  const [terms, setTerms] = useState<Term[]>([]);
  const [academicYear, setAcademicYear] = useState("");
  const [sessionStartDate, setSessionStartDate] = useState("");
  const [sessionEndDate, setSessionEndDate] = useState("");

  // Step 2 state
  const [classes, setClasses] = useState<Class[]>([]);

  // Step 4 state
  const [gradingSystemType, setGradingSystemType] = useState("letter");
  const [passingGrade, setPassingGrade] = useState("60");
  const [maximumPoints, setMaximumPoints] = useState("100");
  const [gradeScales, setGradeScales] =
    useState<GradeScale[]>(defaultGradeScales);

  // Subjects modal state
  const [subjectsModalOpen, setSubjectsModalOpen] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const progressPercentage = (currentStep / totalSteps) * 100;

  const toggleClass = (id: string) => {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((clsId) => clsId !== id) : [...prev, id]
    );
  };

  const stepHeaders = [
    {
      icon: Calendar,
      number: 1,
      title: "session set up",
      subtitle: "Configure academic year and terms",
    },
    {
      icon: GraduationCap,
      number: 2,
      title: "Classes & Grades",
      subtitle: "Add classes and grade levels",
    },
    {
      icon: Calendar,
      number: 3,
      title: "Subjects",
      subtitle: "Organize subjects by grades",
    },
    {
      icon: GraduationCap,
      number: 4,
      title: "Grading System",
      subtitle: "Set up grading scales",
    },
  ];

  const currentStepHeader = stepHeaders[currentStep - 1];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <h1 className="text-center font-sans text-2xl font-semibold text-foreground">
            School set up wizard
          </h1>

          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {"Step "}
                {currentStep}
                {" of "}
                {totalSteps}
              </span>
              <span className="text-muted-foreground">
                {progressPercentage}
                {"% complete"}
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
              <div
                className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-4 border-primary bg-background transition-all duration-300"
                style={{ left: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Header Card */}
        <Card className="border-primary/20 bg-primary/10">
          <CardContent className="flex items-center justify-center gap-3 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {currentStepHeader.number}
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">
                {currentStepHeader.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentStepHeader.subtitle}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {currentStep === 1 && (
          <Step1SessionSetup
            academicYear={academicYear}
            setAcademicYear={setAcademicYear}
            sessionStartDate={sessionStartDate}
            setSessionStartDate={setSessionStartDate}
            sessionEndDate={sessionEndDate}
            setSessionEndDate={setSessionEndDate}
            terms={terms}
            setTerms={setTerms}
          />
        )}

        {currentStep === 2 && (
          <Step2ClassesGrades classes={classes} setClasses={setClasses} />
        )}

        {currentStep === 3 && (
          <Step3Subjects onAddSubject={() => setSubjectsModalOpen(true)} />
        )}

        {currentStep === 4 && (
          <Step4GradingSystem
            academicYear={academicYear}
            setAcademicYear={setAcademicYear}
            gradingSystemType={gradingSystemType}
            setGradingSystemType={setGradingSystemType}
            passingGrade={passingGrade}
            setPassingGrade={setPassingGrade}
            maximumPoints={maximumPoints}
            setMaximumPoints={setMaximumPoints}
            gradeScales={gradeScales}
            setGradeScales={setGradeScales}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {currentStep === totalSteps ? (
            <Button>Finish Set Up</Button>
          ) : (
            <Button
              onClick={() =>
                setCurrentStep(Math.min(totalSteps, currentStep + 1))
              }
            >
              Next
            </Button>
          )}
        </div>
      </div>

      {/* Subjects Management Modal */}
      <SubjectsManagementModal
        open={subjectsModalOpen}
        onOpenChange={setSubjectsModalOpen}
        subjectName={subjectName}
        setSubjectName={setSubjectName}
        subjectCode={subjectCode}
        setSubjectCode={setSubjectCode}
        selectedClasses={selectedClasses}
        toggleClass={toggleClass}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </div>
  );
}
