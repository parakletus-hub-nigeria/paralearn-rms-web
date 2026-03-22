"use client";

import { useState } from "react";
import { Header } from "@/components/RMS/header";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Shield,
  Mail,
  Phone,
  Calendar,
  Edit3,
  Trash2,
  BookOpen,
  GraduationCap,
  Briefcase,
  ExternalLink,
  History,
  AlertTriangle,
  CheckCircle2,
  MoreVertical,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEFAULT_PRIMARY = "#641BC4";

export function AdminUserDetailPage({ userId }: { userId: string }) {
  const router = useRouter();
  const { tenantInfo } = useSelector((s: RootState) => s.user);

  // Scaffolding: In a real app, useGetUserInfoQuery
  const isLoading = false;
  const user: any = {
    id: userId,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@university.edu",
    role: "STUDENT",
    statusId: "ACTIVE",
    createdAt: "2024-01-15T08:00:00Z",
    studentProfile: {
      studentId: "RSU/2024/0042",
      matricNumber: "2024CS001",
      level: 400,
      department: "Computer Science",
    },
  };

  return (
    <div className="w-full pb-20">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="h-12 w-12 rounded-2xl border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-slate-500" />
            </Button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 font-coolvetica tracking-tight">
                User Profile
              </h1>
              <p className="text-slate-500 text-sm font-bold flex items-center gap-1.5 mt-0.5">
                Viewing records for{" "}
                <span className="text-[#641BC4]">
                  {user.firstName} {user.lastName}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-12 px-6 rounded-2xl border-slate-200 font-bold text-slate-600 gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-2xl border-slate-200"
                >
                  <MoreVertical className="w-5 h-5 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="rounded-2xl border-slate-100 shadow-xl"
                align="end"
              >
                <DropdownMenuItem className="p-3 font-bold text-red-600 focus:text-red-700 focus:bg-red-50 gap-2 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                  Suspend Account
                </DropdownMenuItem>
                <DropdownMenuItem className="p-3 font-bold text-slate-600 gap-2 cursor-pointer">
                  <AlertTriangle className="w-4 h-4" />
                  Reset Credentials
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 md:p-12 relative group">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl translate-x-32 -translate-y-32" />

          <div className="relative z-10 flex flex-col md:flex-row items-start gap-12">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#641BC4] to-blue-500 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <Avatar className="h-40 w-40 rounded-[3rem] border-4 border-white shadow-2xl relative">
                <AvatarImage src={user.profileImage} />
                <AvatarFallback className="bg-gradient-to-br from-purple-100 to-indigo-100 text-[#641BC4] text-5xl font-black">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2.5 rounded-2xl border-4 border-white shadow-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <Badge className="bg-[#641BC4] text-white hover:bg-[#641BC4] border-none font-black px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
                    {user.role}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-emerald-100 bg-emerald-50 text-emerald-700 font-black px-4 py-1 rounded-full uppercase tracking-widest text-[10px]"
                  >
                    {user.statusId}
                  </Badge>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 font-coolvetica tracking-tight">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-slate-500 font-bold text-lg mt-1">
                  {user.studentProfile?.matricNumber || "Staff-ID"} •{" "}
                  {user.studentProfile?.department || "Office of Admin"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                      Email
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                      Joined
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                      Level
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {user.studentProfile?.level || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="academic" className="w-full">
          <TabsList className="bg-slate-100/50 p-1.5 rounded-[2rem] h-auto border border-slate-100 mb-8 inline-flex">
            <TabsTrigger
              value="academic"
              className="rounded-[1.5rem] px-8 py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#641BC4] data-[state=active]:shadow-sm transition-all"
            >
              Academic
            </TabsTrigger>
            <TabsTrigger
              value="log"
              className="rounded-[1.5rem] px-8 py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#641BC4] data-[state=active]:shadow-sm transition-all"
            >
              Engagement
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="rounded-[1.5rem] px-8 py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#641BC4] data-[state=active]:shadow-sm transition-all"
            >
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="academic" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 px-8 py-6">
                  <CardTitle className="text-lg font-black text-slate-900 font-coolvetica flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#641BC4]" />
                    Course Enrollment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="px-8 py-5 flex items-center justify-between group hover:bg-slate-50/30 transition-colors"
                      >
                        <div>
                          <p className="font-bold text-slate-900">
                            CSC{400 + i} — Advanced Algorithms
                          </p>
                          <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5">
                            Enrolled: Jan 20, 2024
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-300 hover:text-[#641BC4]"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 bg-slate-50/20 text-center">
                    <Button
                      variant="link"
                      className="text-[#641BC4] font-black text-xs uppercase tracking-widest"
                    >
                      View Complete Transcript
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border-slate-100 shadow-sm">
                <CardHeader className="bg-slate-50/50 px-8 py-6">
                  <CardTitle className="text-lg font-black text-slate-900 font-coolvetica flex items-center gap-2">
                    <History className="w-5 h-5 text-emerald-500" />
                    Recent Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="h-48 flex items-end justify-between gap-2 px-2">
                    {[65, 82, 45, 90, 75, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-3 group"
                      >
                        <div className="w-full bg-slate-50 rounded-lg relative overflow-hidden h-full">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            className="absolute bottom-0 left-0 right-0 bg-[#641BC4] opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                          SEM {i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="log">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-12 text-center">
              <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto mb-6">
                <Activity className="w-10 h-10 text-slate-200" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 font-coolvetica mb-2">
                Usage Telemetry
              </h2>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">
                Access real-time logs of student check-ins, CBT heartbeats, and
                system logins for audit compliance.
              </p>
              <Button className="mt-8 h-12 px-8 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
                Request Full Audit Export
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-amber-50/50 border border-amber-100 rounded-[2.5rem] p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-amber-500" />
                  <h3 className="font-black text-amber-900 font-coolvetica text-lg">
                    Identity Verification
                  </h3>
                </div>
                <p className="text-sm font-bold text-amber-800/70 mb-6">
                  Device binding is currently active. User can only sign in from
                  their registered primary device.
                </p>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white border-none rounded-2xl h-11 px-6 font-black text-[10px] uppercase tracking-widest transition-all">
                  Reset Device Binding
                </Button>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-[2.5rem] p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-6 h-6 text-blue-500" />
                  <h3 className="font-black text-blue-900 font-coolvetica text-lg">
                    Multi-Factor Status
                  </h3>
                </div>
                <p className="text-sm font-bold text-blue-800/70 mb-6">
                  WebAuthn / Biometric login is configured. This user has 2
                  registered hardware keys.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white border-none rounded-2xl h-11 px-6 font-black text-[10px] uppercase tracking-widest transition-all">
                  Manage MFA Keys
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
