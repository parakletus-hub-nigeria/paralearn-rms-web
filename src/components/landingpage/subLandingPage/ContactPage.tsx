"use client";

import { useState, useCallback } from "react";
import { ScrollReveal } from "../ScrollReveal";
import { LandingLayout } from "../LandingLayout";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Building2,
  HeadphonesIcon,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface FormErrors {
  fullName?: string;
  schoolName?: string;
  role?: string;
  schoolSize?: string;
  message?: string;
}

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    schoolName: "",
    role: "",
    schoolSize: "",
    message: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateField = useCallback((name: string, value: string): string => {
    switch (name) {
      case "fullName":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2) return "Full name must be at least 2 characters";
        if (value.trim().length > 100) return "Full name must be less than 100 characters";
        if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) return "Full name can only contain letters, spaces, hyphens, and apostrophes";
        return "";
      case "schoolName":
        if (!value.trim()) return "School name is required";
        if (value.trim().length < 2) return "School name must be at least 2 characters";
        if (value.trim().length > 200) return "School name must be less than 200 characters";
        return "";
      case "role":
        if (!value) return "Please select your role";
        return "";
      case "schoolSize":
        if (!value) return "Please select school size";
        return "";
      case "message":
        if (!value.trim()) return "Message is required";
        if (value.trim().length < 10) return "Message must be at least 10 characters";
        if (value.trim().length > 1000) return "Message must be less than 1000 characters";
        return "";
      default:
        return "";
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user selects
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form before submitting.");
      return;
    }

    setIsSubmitting(true);
    setIsSubmitted(false);

    try {
      const response = await fetch("/api/contact/inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          schoolName: formData.schoolName.trim(),
          role: formData.role,
          schoolSize: formData.schoolSize,
          message: formData.message.trim(),
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to submit form: ${response.status}`);
      }

      if (process.env.NODE_ENV === "development") {
        console.log("Form submitted:", formData);
      }

      setFormData({
        fullName: "",
        schoolName: "",
        role: "",
        schoolSize: "",
        message: ""
      });
      setErrors({});
      setIsSubmitted(true);

      toast.success("Thank you for your inquiry! We will get back to you soon.");

      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.success("Thank you for your inquiry! We will get back to you soon. For immediate assistance, please email us at growth@paralearn.ng");

      setFormData({
        fullName: "",
        schoolName: "",
        role: "",
        schoolSize: "",
        message: ""
      });
      setErrors({});
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  return (
    <LandingLayout className="min-h-screen">
      {/* Hero Section */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-12 md:py-20 lg:py-24 pt-24 md:pt-32 lg:pt-40 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal animation="reveal" delay="0s">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white mb-4 md:mb-6">
                How can we help you?
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-lg text-slate-600 dark:text-slate-400 font-medium max-w-4xl mx-auto leading-relaxed">
                Whether you are looking to onboard your school or need help with your current workspace, our team is ready.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Options Section */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-12 md:py-16 lg:py-20 relative overflow-hidden bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 dark:from-slate-900/50 dark:via-slate-900 dark:to-slate-800/30">
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-10 mb-8 md:mb-12">
            <ScrollReveal animation="reveal-left" delay="0.1s">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-indigo-600/10 rounded-3xl blur-xl transform rotate-3" />
                <div className="relative bg-white dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-3xl p-5 md:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-10 h-10 md:w-12 md:h-12 mb-3 md:mb-4 rounded-full bg-gradient-to-br from-primary via-purple-600 to-indigo-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-3 md:mb-4">
                    New Schools (Sales & Inquiries)
                  </h2>
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-4 md:mb-5">
                    Ready to modernize your administration?
                  </p>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-4 md:mb-5">
                    Fill out the form below to speak with an onboarding specialist. We will help you understand pricing, setup, and custom requirements.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                      <a href="mailto:paralearn.io@gmail.com" className="text-sm md:text-base text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium">
                        paralearn.io@gmail.com
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                      <a href="tel:+2348148876125" className="text-sm md:text-base text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium">
                        +234 814887 6125

                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="reveal-right" delay="0.2s">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-indigo-600/10 rounded-3xl blur-xl transform -rotate-3" />
                <div className="relative bg-white dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-3xl p-5 md:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-10 h-10 md:w-12 md:h-12 mb-3 md:mb-4 rounded-full bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 flex items-center justify-center">
                    <HeadphonesIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-3 md:mb-4">
                    Existing Users (Technical Support)
                  </h2>
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-4 md:mb-5">
                    Already use ParaLearn?
                  </p>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-4 md:mb-5">
                    For the fastest response regarding account issues, bug reports, or How-to questions, please contact our support desk directly or visit the Knowledge Base.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                      <a href="mailto:paralearn.io@gmail.com" className="text-sm md:text-base text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium">
                        paralearn.io@gmail.com
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                      <a href="mailto:paralearn.io@gmail.com" className="text-sm md:text-base text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium">
                        paralearn.io@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-12 md:py-16 lg:py-20 relative overflow-hidden bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto relative z-10">
          <ScrollReveal animation="reveal" delay="0.1s">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4">
                The Inquiry Form
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="reveal" delay="0.2s">
            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6" noValidate>
              <div>
                <label htmlFor="fullName" className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={(e) => {
                    const error = validateField("fullName", e.target.value);
                    setErrors(prev => ({ ...prev, fullName: error || undefined }));
                  }}
                  disabled={isSubmitting}
                  className={`w-full h-12 bg-white dark:bg-slate-800 border-2 rounded-lg px-4 text-base font-medium transition-colors ${
                    errors.fullName
                      ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="Enter your full name"
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5" role="alert">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="schoolName" className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  School Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="schoolName"
                  name="schoolName"
                  type="text"
                  required
                  value={formData.schoolName}
                  onChange={handleChange}
                  onBlur={(e) => {
                    const error = validateField("schoolName", e.target.value);
                    setErrors(prev => ({ ...prev, schoolName: error || undefined }));
                  }}
                  disabled={isSubmitting}
                  className={`w-full h-12 bg-white dark:bg-slate-800 border-2 rounded-lg px-4 text-base font-medium transition-colors ${
                    errors.schoolName
                      ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="Enter your school name"
                  aria-invalid={!!errors.schoolName}
                  aria-describedby={errors.schoolName ? "schoolName-error" : undefined}
                />
                {errors.schoolName && (
                  <p id="schoolName-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5" role="alert">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.schoolName}
                  </p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="role" className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange("role", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="role"
                    className={`w-full h-12 bg-white dark:bg-slate-800 border-2 rounded-lg px-4 text-base font-medium touch-manipulation transition-colors ${
                      errors.role
                        ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20"
                        : "border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    } data-[placeholder]:text-slate-500 dark:data-[placeholder]:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-required="true"
                    aria-invalid={!!errors.role}
                    aria-describedby={errors.role ? "role-error" : undefined}
                  >
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-[100] w-[var(--radix-select-trigger-width)] max-h-[min(200px,calc(100vh-8rem))] overflow-y-auto overflow-x-hidden sm:max-h-[200px]"
                    position="popper"
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    avoidCollisions={false}
                  >
                    <SelectItem value="proprietor" className="cursor-pointer focus:bg-primary/10 dark:focus:bg-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 touch-manipulation py-2.5 px-3 text-sm sm:text-base min-h-[2.5rem] sm:min-h-[2.25rem]">Proprietor</SelectItem>
                    <SelectItem value="principal" className="cursor-pointer focus:bg-primary/10 dark:focus:bg-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 touch-manipulation py-2.5 px-3 text-sm sm:text-base min-h-[2.5rem] sm:min-h-[2.25rem]">Principal</SelectItem>
                    <SelectItem value="it-admin" className="cursor-pointer focus:bg-primary/10 dark:focus:bg-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 touch-manipulation py-2.5 px-3 text-sm sm:text-base min-h-[2.5rem] sm:min-h-[2.25rem]">IT Admin</SelectItem>
                    <SelectItem value="other" className="cursor-pointer focus:bg-primary/10 dark:focus:bg-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 touch-manipulation py-2.5 px-3 text-sm sm:text-base min-h-[2.5rem] sm:min-h-[2.25rem]">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p id="role-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5" role="alert">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.role}
                  </p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="schoolSize" className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  School Size <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.schoolSize}
                  onValueChange={(value) => handleSelectChange("schoolSize", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="schoolSize"
                    className={`w-full h-12 bg-white dark:bg-slate-800 border-2 rounded-lg px-4 text-base font-medium touch-manipulation transition-colors ${
                      errors.schoolSize
                        ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20"
                        : "border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    } data-[placeholder]:text-slate-500 dark:data-[placeholder]:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-required="true"
                    aria-invalid={!!errors.schoolSize}
                    aria-describedby={errors.schoolSize ? "schoolSize-error" : undefined}
                  >
                    <SelectValue placeholder="Select school size" />
                  </SelectTrigger>
                  <SelectContent
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-[100] w-[var(--radix-select-trigger-width)] max-h-[min(200px,calc(100vh-8rem))] overflow-y-auto overflow-x-hidden sm:max-h-[200px]"
                    position="popper"
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    avoidCollisions={false}
                  >
                    <SelectItem value="<100" className="cursor-pointer focus:bg-primary/10 dark:focus:bg-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 touch-manipulation py-2.5 px-3 text-sm sm:text-base min-h-[2.5rem] sm:min-h-[2.25rem]">&lt;100</SelectItem>
                    <SelectItem value="100-500" className="cursor-pointer focus:bg-primary/10 dark:focus:bg-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 touch-manipulation py-2.5 px-3 text-sm sm:text-base min-h-[2.5rem] sm:min-h-[2.25rem]">100-500</SelectItem>
                    <SelectItem value="500+" className="cursor-pointer focus:bg-primary/10 dark:focus:bg-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 touch-manipulation py-2.5 px-3 text-sm sm:text-base min-h-[2.5rem] sm:min-h-[2.25rem]">500+</SelectItem>
                  </SelectContent>
                </Select>
                {errors.schoolSize && (
                  <p id="schoolSize-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5" role="alert">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.schoolSize}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Message (How can we assist you?) <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={(e) => {
                    const error = validateField("message", e.target.value);
                    setErrors(prev => ({ ...prev, message: error || undefined }));
                  }}
                  disabled={isSubmitting}
                  className={`w-full min-h-32 bg-white dark:bg-slate-800 border-2 rounded-lg px-4 py-3 text-base font-medium transition-colors resize-y ${
                    errors.message
                      ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="Tell us how we can help you... (minimum 10 characters)"
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                />
                <div className="mt-1.5 flex items-center justify-between">
                  {errors.message ? (
                    <p id="message-error" className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5" role="alert">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {errors.message}
                    </p>
                  ) : (
                    <div />
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formData.message.length}/1000
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || isSubmitted}
                className="w-full h-12 sm:h-14 md:h-14 rounded-2xl text-sm sm:text-base md:text-base font-black shadow-md shadow-primary/30 transition-all duration-300 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 hover:from-purple-600 hover:via-indigo-600 hover:to-primary relative overflow-hidden group touch-manipulation active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-primary disabled:hover:via-purple-600 disabled:hover:to-indigo-600"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : isSubmitted ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Message Sent!
                    </>
                  ) : (
                    <>
                      Send Message
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </Button>
            </form>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              className="mt-4"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* Office Location Section */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-12 md:py-16 lg:py-20 relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900/50 dark:to-slate-900">
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <ScrollReveal animation="reveal" delay="0s">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-indigo-600/10 rounded-3xl blur-xl transform rotate-3" />
              <div className="relative bg-white dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-3xl p-6 md:p-8 shadow-lg">
                <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary via-purple-600 to-indigo-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-3">
                  Office Location
                </h2>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-2">
                Port Harcourt, Rivers State, Nigeria
                </p>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-500 italic">
                  Visits by appointment only.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </LandingLayout>
  );
};

export default ContactPage;
