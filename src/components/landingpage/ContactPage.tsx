"use client";

import { useState } from "react";
import { ScrollReveal } from "./ScrollReveal";
import { 
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Building2,
  HeadphonesIcon
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

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    schoolName: "",
    role: "",
    schoolSize: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Reset form
    setFormData({
      fullName: "",
      schoolName: "",
      role: "",
      schoolSize: "",
      message: ""
    });
    alert("Thank you for your inquiry! We'll get back to you soon.");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
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
            {/* New Schools Section */}
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
                      <a href="mailto:growth@paralearn.ng" className="text-sm md:text-base text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium">
                        growth@paralearn.ng
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                      <a href="tel:+234123456789" className="text-sm md:text-base text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium">
                        +234 [Insert Number]
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Existing Users Section */}
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
                    For the fastest response regarding account issues, bug reports, or "How-to" questions, please contact our support desk directly or visit the Knowledge Base.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                      <a href="mailto:help@paralearn.ng" className="text-sm md:text-base text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium">
                        help@paralearn.ng
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                      <a href="#" className="text-sm md:text-base text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium">
                        Support Ticket: [Link to Support Portal]
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
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-primary to-primary rounded-full" />
                <div className="w-1 h-1 rounded-full bg-primary" />
                <div className="w-16 h-0.5 bg-gradient-to-r from-primary via-purple-500 to-indigo-600 rounded-full" />
                <div className="w-1 h-1 rounded-full bg-indigo-600" />
                <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-transparent rounded-full" />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="reveal" delay="0.2s">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full h-12 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-primary rounded-lg px-4 text-base font-medium"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="schoolName" className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  School Name
                </label>
                <Input
                  id="schoolName"
                  name="schoolName"
                  type="text"
                  required
                  value={formData.schoolName}
                  onChange={handleChange}
                  className="w-full h-12 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-primary rounded-lg px-4 text-base font-medium"
                  placeholder="Enter your school name"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Role
                </label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                  required
                >
                  <SelectTrigger className="w-full h-12 !bg-white dark:!bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-primary rounded-lg px-4 text-base font-medium">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="!bg-white dark:!bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <SelectItem value="proprietor">Proprietor</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                    <SelectItem value="it-admin">IT Admin</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="schoolSize" className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  School Size
                </label>
                <Select
                  value={formData.schoolSize}
                  onValueChange={(value) => setFormData({ ...formData, schoolSize: value })}
                  required
                >
                  <SelectTrigger className="w-full h-12 !bg-white dark:!bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-primary rounded-lg px-4 text-base font-medium">
                    <SelectValue placeholder="Select school size" />
                  </SelectTrigger>
                  <SelectContent className="!bg-white dark:!bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <SelectItem value="<100">&lt;100</SelectItem>
                    <SelectItem value="100-500">100-500</SelectItem>
                    <SelectItem value="500+">500+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Message (How can we assist you?)
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full min-h-32 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-primary rounded-lg px-4 py-3 text-base font-medium"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 sm:h-14 md:h-14 rounded-2xl text-sm sm:text-base md:text-base font-black shadow-2xl shadow-primary/50 transition-all duration-300 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 relative overflow-hidden group touch-manipulation active:scale-95"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Send Message
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 group-active:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </form>
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
                  [Insert Physical Address Here]
                </p>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-500 italic">
                  Visits by appointment only.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
