"use client";

import { useState } from "react";
import { X, User, BookOpen, GraduationCap, Mail, Phone, Info, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import apiClient from "@/lib/api";

type Step = "profile" | "classes" | "subjects";

type AddUserModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "student" | "teacher";
  onTypeChange: (type: "student" | "teacher") => void;
  primaryColor: string;
  classes: any[];
  onSuccess: () => void;
};

export function AddUserModal({
  open,
  onOpenChange,
  type,
  onTypeChange,
  primaryColor,
  classes,
  onSuccess,
}: AddUserModalProps) {
  const [step, setStep] = useState<Step>("profile");
  const [loading, setLoading] = useState(false);

  // Profile data
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [address, setAddress] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");

  // Classes data (for teachers)
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  // Subjects data (for teachers)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const steps: { id: Step; label: string; icon: typeof User }[] =
    type === "teacher"
      ? [
          { id: "profile", label: "Profile", icon: User },
          { id: "classes", label: "Classes", icon: BookOpen },
          { id: "subjects", label: "Subjects", icon: GraduationCap },
        ]
      : [{ id: "profile", label: "Profile", icon: User }];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  const resetForm = () => {
    setStep("profile");
    setFullName("");
    setEmail("");
    setPhone("");
    setDateOfBirth("");
    setGender("");
    setAddress("");
    setGuardianName("");
    setGuardianPhone("");
    setSelectedClasses([]);
    setSelectedSubjects([]);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleNext = () => {
    if (step === "profile") {
      if (!fullName.trim()) return toast.error("Please enter the full name");
      if (!email.trim()) return toast.error("Please enter the email address");
      if (type === "teacher") {
        setStep("classes");
      } else {
        handleSubmit();
      }
    } else if (step === "classes") {
      setStep("subjects");
    } else if (step === "subjects") {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step === "subjects") setStep("classes");
    else if (step === "classes") setStep("profile");
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // @ts-ignore
      const { apiFetch } = await import("@/lib/interceptor");
      
      // Format date to ISO
      const dateTime = dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined;

      const payload = {
        firstName,
        lastName,
        email: email.trim(),
        phoneNumber: phone.trim() || undefined, // Student phone
        dateOfBirth: dateTime,
        gender: gender || undefined,
        address: address.trim() || undefined,
        roles: type === "teacher" ? ["teacher"] : ["student"],
        // Teacher specific
        classIds: type === "teacher" && selectedClasses.length > 0 ? selectedClasses : undefined,
        subjectIds: type === "teacher" && selectedSubjects.length > 0 ? selectedSubjects : undefined,
        // Student specific
        guardianName: type === "student" ? guardianName.trim() || undefined : undefined,
        guardianPhone: type === "student" ? guardianPhone.trim() || undefined : undefined,
      };

      await apiFetch("/api/proxy/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      toast.success(`${type === "teacher" ? "Teacher" : "Student"} added successfully!`);
      
      onSuccess();
      handleClose();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to add user";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleClass = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId) ? prev.filter((c) => c !== classId) : [...prev, classId]
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Add New {type === "teacher" ? "Teacher" : "Student"}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Fill in the information below to create a new {type} profile.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Type Toggle (only show before starting) */}
          {step === "profile" && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onTypeChange("student")}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                  type === "student"
                    ? "text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                style={type === "student" ? { backgroundColor: primaryColor } : {}}
              >
                Student
              </button>
              <button
                onClick={() => onTypeChange("teacher")}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                  type === "teacher"
                    ? "text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                style={type === "teacher" ? { backgroundColor: primaryColor } : {}}
              >
                Teacher
              </button>
            </div>
          )}

          {/* Step Indicator */}
          {steps.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {steps.map((s, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = s.id === step;
                const Icon = s.icon;

                return (
                  <div key={s.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? "text-white"
                            : isCurrent
                            ? "text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                        style={
                          isCompleted || isCurrent
                            ? { backgroundColor: primaryColor }
                            : {}
                        }
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium mt-1.5 ${
                          isCurrent ? "text-slate-900" : "text-slate-500"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`w-16 h-0.5 mx-2 mb-5 ${
                          isCompleted ? "" : "bg-slate-200"
                        }`}
                        style={isCompleted ? { backgroundColor: primaryColor } : {}}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pb-2 max-h-[400px] overflow-y-auto">
          {step === "profile" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <div className="relative mt-2">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="pl-10 h-12 rounded-xl border-slate-200 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sarah.jenkins@paralearn.edu"
                      className="pl-10 h-12 rounded-xl border-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="pl-10 h-12 rounded-xl border-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Date of Birth</label>
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="mt-2 h-12 rounded-xl border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="mt-2 w-full h-12 rounded-xl border border-slate-200 px-4 bg-white text-slate-700"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Address</label>
                <div className="relative mt-2">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Residential Address"
                    className="pl-10 h-12 rounded-xl border-slate-200"
                  />
                </div>
              </div>

              {type === "student" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Guardian Name</label>
                    <Input
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="Parent/Guardian Name"
                      className="mt-2 h-12 rounded-xl border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Guardian Phone</label>
                    <Input
                      type="tel"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="Guardian Phone"
                      className="mt-2 h-12 rounded-xl border-slate-200"
                    />
                  </div>
                </div>
              )}

              {/* Info box */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 text-sm">Credentials Delivery</p>
                  <p className="text-blue-700 text-sm mt-0.5">
                    An automated email with login instructions will be sent to the address
                    provided above.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === "classes" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                Select the classes this teacher will be assigned to:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {classes.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggleClass(c.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedClasses.includes(c.id)
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    style={
                      selectedClasses.includes(c.id)
                        ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` }
                        : {}
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {c.level || "Level N/A"} • {c.stream || "Stream N/A"}
                        </p>
                      </div>
                      {selectedClasses.includes(c.id) && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {classes.length === 0 && (
                <p className="text-center text-slate-500 py-8">
                  No classes available. Create classes first.
                </p>
              )}
            </div>
          )}

          {step === "subjects" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                Select the subjects this teacher will teach:
              </p>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 text-center">
                  Subjects will be assigned after the teacher is created.
                  <br />
                  You can assign subjects from the Subjects page.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <Button
            variant="outline"
            onClick={currentStepIndex > 0 ? handleBack : handleClose}
            className="h-11 px-6 rounded-xl border-slate-200"
          >
            {currentStepIndex > 0 ? "Back" : "Cancel"}
          </Button>
          <Button
            onClick={handleNext}
            disabled={loading}
            className="h-11 px-6 rounded-xl text-white gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            {loading ? (
              "Creating..."
            ) : step === steps[steps.length - 1].id ? (
              <>
                Create {type === "teacher" ? "Teacher" : "Student"}
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                Next Step
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
