"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, GraduationCap, ArrowLeft } from "lucide-react";
import { Step1SessionSetup } from "./step1-session-setup";
import { Step2ClassesGrades } from "./step2-classes-grades";
import { Step3Subjects } from "./step3-subjects";
import { Step4GradingSystem } from "./step4-grading-system";
import { SubjectsManagementModal } from "./subjects-management-modal";
import {
  createAcademicSession,
  createClass,
  createSubject,
  updateGradingScale,
  clearError,
  clearSuccess,
  clearWizardData,
} from "@/reduxToolKit/setUp/setUpSlice";
import { useRouter } from "next/navigation";
import { routespath } from "@/lib/routepath";
import { toast } from "react-toastify";
import AuthHeader from "@/components/auth/authHeader";

interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface Class {
  id: string;
  name: string;
  level: number;
  stream: string;
  capacity: string;
}

interface GradeScale {
  letter: string;
  minPoints: number;
  maxPoints: number;
  description: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  classId: string;
  description?: string;
}

const defaultGradeScales: GradeScale[] = [
  { letter: "A", minPoints: 80, maxPoints: 100, description: "Excellent" },
  { letter: "B", minPoints: 70, maxPoints: 79, description: "Very Good" },
  { letter: "C", minPoints: 60, maxPoints: 69, description: "Good" },
  { letter: "D", minPoints: 50, maxPoints: 59, description: "Pass" },
  { letter: "E", minPoints: 40, maxPoints: 49, description: "Needs Improvement" },
  { letter: "F", minPoints: 0, maxPoints: 39, description: "Fail" },
];

// Default example data for wizard
const defaultTerms: Term[] = [
  {
    id: "1",
    name: "First Term",
    startDate: "2024-09-01",
    endDate: "2024-12-20",
  },
  {
    id: "2",
    name: "Second Term",
    startDate: "2025-01-10",
    endDate: "2025-04-30",
  },
  {
    id: "3",
    name: "Third Term",
    startDate: "2025-05-15",
    endDate: "2025-08-31",
  },
];

const defaultClasses: Class[] = [
  {
    id: "1",
    name: "JSS1A",
    level: 1,
    stream: "A",
    capacity: "40",
  },
  {
    id: "2",
    name: "JSS1B",
    level: 1,
    stream: "B",
    capacity: "35",
  },
  {
    id: "3",
    name: "JSS2A",
    level: 2,
    stream: "A",
    capacity: "40",
  },
];

// Default example subjects
const defaultSubjects: Subject[] = [
  {
    id: "1",
    name: "Mathematics",
    code: "MATH",
    classId: "1", // Will be transformed to "class_id_1" on submit
    description: "Core mathematics curriculum",
  },
  {
    id: "2",
    name: "English Language",
    code: "ENG",
    classId: "1", // Will be transformed to "class_id_1" on submit
    description: "Core English language curriculum",
  },
];

export function SchoolSetupWizard() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error, success, createdSession, createdClasses, gradingScaleData } = useSelector(
    (state: RootState) => state.setUp
  );

  // Store IDs from each step
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [termIds, setTermIds] = useState<string[]>([]);
  const [classIdMap, setClassIdMap] = useState<Map<string, string>>(new Map()); // Maps wizard class.id to API class.id

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Step 1 state
  const [terms, setTerms] = useState<Term[]>(defaultTerms);
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [sessionStartDate, setSessionStartDate] = useState("2024-09-01");
  const [sessionEndDate, setSessionEndDate] = useState("2025-08-31");

  // Step 2 state
  const [classes, setClasses] = useState<Class[]>(defaultClasses);

  // Step 3 state
  const [subjects, setSubjects] = useState<Subject[]>(defaultSubjects);

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
  const [subjectDescription, setSubjectDescription] = useState("");

  const progressPercentage = useMemo(() => (currentStep / totalSteps) * 100, [currentStep, totalSteps]);

  // Handle Redux state changes
  useEffect(() => {
    if (success && gradingScaleData) {
      toast.success("School setup completed successfully!");
      dispatch(clearSuccess());
      dispatch(clearError());
      dispatch(clearWizardData());
      // Redirect to dashboard after successful setup
      setTimeout(() => {
        router.push(routespath.DASHBOARD);
      }, 1500);
    }
  }, [success, gradingScaleData, dispatch, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const toggleClass = useCallback((id: string) => {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((clsId) => clsId !== id) : [...prev, id]
    );
  }, []);

  // Transform component term format to API format
  const transformTermName = useCallback((termName: string): string => {
    const termMap: Record<string, string> = {
      "First Term": "First Term",
      "Second Term": "Second Term",
      "Third Term": "Third Term",
    };
    return termMap[termName] || termName;
  }, []);

  // Handle Step 1 submission (Create Academic Session)
  const handleStep1Submit = useCallback(async () => {
    if (!academicYear || !sessionStartDate || !sessionEndDate) {
      toast.error("Please fill in all session fields");
      return false;
    }

    if (terms.length === 0) {
      toast.error("Please add at least one term");
      return false;
    }

    const incompleteTerms = terms.filter(
      (term) => !term.name || !term.startDate || !term.endDate
    );
    if (incompleteTerms.length > 0) {
      toast.error("Please complete all term fields");
      return false;
    }

    try {
      const sessionData = {
        session: academicYear.replace("-", " / "),
        startsAt: new Date(sessionStartDate).toISOString().split('T')[0],
        endsAt: new Date(sessionEndDate).toISOString().split('T')[0],
        terms: terms.map((term) => ({
          term: transformTermName(term.name),
          startsAt: new Date(term.startDate).toISOString().split('T')[0],
          endsAt: new Date(term.endDate).toISOString().split('T')[0],
        })),
      };

      const result = await dispatch(createAcademicSession(sessionData)).unwrap();
      setSessionId(result.id);
      setTermIds(result.terms.map((t: any) => t.id));
      toast.success("Academic session created successfully!");
      return true;
    } catch (error: any) {
      console.error("Failed to create academic session:", error);
      return false;
    }
  }, [academicYear, sessionStartDate, sessionEndDate, terms, dispatch, transformTermName]);

  // Handle Step 2 submission (Create Classes)
  const handleStep2Submit = useCallback(async () => {
    if (classes.length === 0) {
      toast.error("Please add at least one class");
      return false;
    }

    const incompleteClasses = classes.filter(
      (cls) => !cls.name || !cls.capacity || !cls.level || !cls.stream
    );
    if (incompleteClasses.length > 0) {
      toast.error("Please complete all class fields");
      return false;
    }

    try {
      const classPromises = classes.map(async (cls) => {
        const classData = {
          name: cls.name,
          level: cls.level,
          stream: cls.stream,
          capacity: parseInt(cls.capacity, 10),
        };
        return await dispatch(createClass(classData)).unwrap();
      });

      const createdClasses = await Promise.all(classPromises);
      
      // Map wizard class IDs to API class IDs
      const newClassIdMap = new Map<string, string>();
      classes.forEach((cls, index) => {
        newClassIdMap.set(cls.id, createdClasses[index].id);
      });
      setClassIdMap(newClassIdMap);

      toast.success(`${createdClasses.length} class(es) created successfully!`);
      return true;
    } catch (error: any) {
      console.error("Failed to create classes:", error);
      return false;
    }
  }, [classes, dispatch]);

  // Handle Step 3 submission (Create Subjects)
  const handleStep3Submit = useCallback(async () => {
    if (subjects.length === 0) {
      toast.error("Please add at least one subject");
      return false;
    }

    if (classIdMap.size === 0) {
      toast.error("Classes must be created first");
      return false;
    }

    try {
      const subjectPromises = subjects.map(async (subject) => {
        const apiClassId = classIdMap.get(subject.classId);
        if (!apiClassId) {
          throw new Error(`Class ID not found for subject ${subject.name}`);
        }

        const subjectData = {
          name: subject.name,
          code: subject.code,
          classId: apiClassId,
          description: subject.description || "",
        };
        return await dispatch(createSubject(subjectData)).unwrap();
      });

      await Promise.all(subjectPromises);
      toast.success(`${subjects.length} subject(s) created successfully!`);
      return true;
    } catch (error: any) {
      console.error("Failed to create subjects:", error);
      return false;
    }
  }, [subjects, classIdMap, dispatch]);

  // Handle Step 4 submission (Update Grading Scale)
  const handleStep4Submit = useCallback(async () => {
    try {
      const gradingScaleData: { [key: string]: { min: number; max: number; description: string } } = {};
      gradeScales.forEach((scale) => {
        gradingScaleData[scale.letter] = {
          min: scale.minPoints,
          max: scale.maxPoints,
          description: scale.description || `${scale.letter} Grade`,
        };
      });

      await dispatch(updateGradingScale({ gradingScale: gradingScaleData })).unwrap();
      toast.success("Grading scale updated successfully!");
      return true;
    } catch (error: any) {
      console.error("Failed to update grading scale:", error);
      return false;
    }
  }, [gradeScales, dispatch]);

  // Handle final submission (Step 4 - Update Grading Scale)
  const handleFinishSetup = useCallback(async () => {
    await handleStep4Submit();
  }, [handleStep4Submit]);

  const stepNames = useMemo(() => [
    "Session",
    "Classes",
    "Subjects",
    "Grading",
  ], []);

  const handleBack = useCallback(() => {
    setCurrentStep(Math.max(1, currentStep - 1));
  }, [currentStep]);

  const handleNext = useCallback(async () => {
    let success = false;

    // Submit data for each step before moving to next
    if (currentStep === 1) {
      success = await handleStep1Submit();
    } else if (currentStep === 2) {
      success = await handleStep2Submit();
    } else if (currentStep === 3) {
      success = await handleStep3Submit();
    }

    if (success || currentStep === 4) {
      setCurrentStep(Math.min(totalSteps, currentStep + 1));
    }
  }, [currentStep, totalSteps, handleStep1Submit, handleStep2Submit, handleStep3Submit]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthHeader />
      <div className="py-6 sm:py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Page Title */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              School Setup Wizard
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Complete the setup process to get started with your school management system
            </p>
          </div>

          {/* Wizard Steps */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
            <div className="space-y-6">
              {/* Step Indicators */}
              <div className="flex items-center justify-between">
                {stepNames.map((name, index) => {
                  const stepNum = index + 1;
                  const isActive = currentStep === stepNum;
                  const isCompleted = currentStep > stepNum;
                  
                  return (
                    <div key={stepNum} className="flex flex-col items-center flex-1">
                      <div className="flex items-center w-full">
                        {/* Step Badge */}
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                              isActive
                                ? "bg-gradient-to-br from-[#641BC4] to-[#8538E0] text-white shadow-md"
                                : isCompleted
                                ? "bg-slate-300 text-slate-600"
                                : "bg-slate-200 text-slate-400"
                            }`}
                          >
                            {stepNum}
                          </div>
                          <p
                            className={`mt-2 text-xs sm:text-sm font-medium ${
                              isActive ? "text-slate-900" : "text-slate-500"
                            }`}
                          >
                            {name}
                          </p>
                          {isActive && (
                            <p className="mt-1 text-xs text-slate-600">
                              Step {stepNum} of {totalSteps}
                            </p>
                          )}
                        </div>
                        
                        {/* Connector Line */}
                        {stepNum < totalSteps && (
                          <div className="flex-1 h-0.5 mx-2 -mt-5">
                            <div
                              className={`h-full transition-all ${
                                isCompleted
                                  ? "bg-gradient-to-r from-[#641BC4] to-[#8538E0]"
                                  : "bg-slate-200"
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#641BC4] to-[#8538E0] transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-600">
                    Step {currentStep} of {totalSteps}
                  </span>
                  <span className="text-slate-500">
                    {Math.round(progressPercentage)}% complete
                  </span>
                </div>
              </div>
            </div>
          </div>

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
            loading={loading}
          />
        )}

        {currentStep === 2 && (
          <Step2ClassesGrades classes={classes} setClasses={setClasses} />
        )}

        {currentStep === 3 && (
          <Step3Subjects 
            onAddSubject={() => setSubjectsModalOpen(true)}
            subjects={subjects}
            classes={classes}
            onRemoveSubject={(id) => setSubjects(subjects.filter((s) => s.id !== id))}
          />
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
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mt-6">
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="w-full sm:w-auto h-11 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 font-semibold text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {currentStep === totalSteps ? (
              <Button 
                onClick={handleFinishSetup}
                disabled={loading}
                className="w-full sm:w-auto h-11 bg-gradient-to-r from-[#641BC4] to-[#8538E0] hover:from-[#5a2ba8] hover:to-[#7530c7] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Finish Set Up"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="w-full sm:w-auto h-11 bg-gradient-to-r from-[#641BC4] to-[#8538E0] hover:from-[#5a2ba8] hover:to-[#7530c7] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all rounded-lg"
              >
                Next
              </Button>
            )}
          </div>
        </div>
        </div>
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
        setSelectedClasses={setSelectedClasses}
        toggleClass={toggleClass}
        subjectDescription={subjectDescription}
        setSubjectDescription={setSubjectDescription}
        classes={classes}
        onAddSubject={(subject) => {
          setSubjects([...subjects, subject]);
        }}
      />
    </div>
  );
}
