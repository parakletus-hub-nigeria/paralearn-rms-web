"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/reduxToolKit/store";
import { useGetAdminStatsQuery } from "@/reduxToolKit/uniFeatures/adminApi";
import { Header } from "@/components/RMS/header";
import {
  Building2,
  MapPin,
  BookOpen,
  Users,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Activity,
  Zap,
  LayoutDashboard,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const DEFAULT_PRIMARY = "#641BC4";

export function AdminDashboard() {
  const { user, tenantInfo } = useSelector((state: RootState) => state.user);
  const primaryColor = DEFAULT_PRIMARY;

  const { data: statsData, isLoading } = useGetAdminStatsQuery();

  const stats = [
    {
      title: "Faculties",
      label: "Institutional Units",
      value: statsData?.faculties ?? statsData?.data?.faculties ?? 0,
      icon: <Building2 className="w-5 h-5" />,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
      trend: "+2% this month",
    },
    {
      title: "Departments",
      label: "Academic Domains",
      value: statsData?.departments ?? statsData?.data?.departments ?? 0,
      icon: <MapPin className="w-5 h-5" />,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      trend: "Stable",
    },
    {
      title: "Courses",
      label: "Curriculum Strength",
      value: statsData?.courses ?? statsData?.data?.courses ?? 0,
      icon: <BookOpen className="w-5 h-5" />,
      color: "bg-amber-500",
      lightColor: "bg-amber-50",
      textColor: "text-amber-600",
      trend: "+12 new added",
    },
    {
      title: "Registered Users",
      label: "Total Community",
      value: statsData?.users ?? statsData?.data?.users ?? 0,
      icon: <Users className="w-5 h-5" />,
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
      textColor: "text-purple-600",
      trend: "+48 new students",
    },
  ];

  return (
    <div className="w-full pb-10">
      <Header
        schoolLogo={tenantInfo?.logoUrl}
        schoolName={tenantInfo?.name || "ParaLearn University"}
      />

      <div className="space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#641BC4] to-[#45108A] rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-purple-500/20"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span className="text-xs font-black uppercase tracking-widest">
                  Global University Admin
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black font-coolvetica leading-tight">
                Welcome back,
                <br />
                <span>
                  {user?.firstName} {user?.lastName}
                </span>
              </h1>
              <p className="text-purple-100/80 font-medium max-w-md">
                The {tenantInfo?.name || "ParaLearn"} ecosystem is performing
                optimally. You have some pending approvals for new course
                registrations.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold">System Load: 24%</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                  <Clock className="w-4 h-4 text-blue-300" />
                  <span className="text-sm font-bold">
                    {format(new Date(), "hh:mm a")}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block shrink-0">
              <div className="w-64 h-64 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-[3rem] transition-all group-hover:scale-95" />
                <LayoutDashboard className="w-32 h-32 text-white/20 group-hover:text-white/40 transition-colors" />
                {/* Floating Cards Mockup */}
                <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 text-slate-900 animate-bounce">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-2xl ${stat.lightColor} ${stat.textColor} transition-colors group-hover:bg-opacity-80`}
                >
                  {stat.icon}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-500">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.trend.split(" ")[0]}
                </div>
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-black text-slate-900 mt-1 font-coolvetica">
                  {isLoading ? "..." : stat.value}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-2">
                  {stat.trend}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts & Analytics Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 font-coolvetica">
                User Growth Analytics
              </h2>
              <div className="flex gap-2">
                <Badge className="bg-[#641BC4]/10 text-[#641BC4] hover:bg-[#641BC4]/20 border-none font-bold">
                  Monthly
                </Badge>
                <Badge
                  variant="outline"
                  className="border-slate-100 text-slate-400 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Yearly
                </Badge>
              </div>
            </div>

            {/* SVG Chart Mockup */}
            <div className="h-64 w-full relative group">
              <svg viewBox="0 0 400 150" className="w-full h-full">
                {/* Gridlines */}
                <line
                  x1="0"
                  y1="140"
                  x2="400"
                  y2="140"
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1="100"
                  x2="400"
                  y2="100"
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1="60"
                  x2="400"
                  y2="60"
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />

                {/* Line Chart Path */}
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  d="M0 130 C 50 120, 100 80, 150 90 S 250 40, 300 50 S 350 10, 400 20"
                  fill="none"
                  stroke={primaryColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                <motion.path
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.1 }}
                  transition={{ delay: 1 }}
                  d="M0 130 C 50 120, 100 80, 150 90 S 250 40, 300 50 S 350 10, 400 20 L 400 150 L 0 150 Z"
                  fill={primaryColor}
                />

                {/* Points */}
                <circle
                  cx="150"
                  cy="90"
                  r="4"
                  fill="white"
                  stroke={primaryColor}
                  strokeWidth="2"
                />
                <circle
                  cx="300"
                  cy="50"
                  r="4"
                  fill="white"
                  stroke={primaryColor}
                  strokeWidth="2"
                />
              </svg>

              <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                <span>JAN</span>
                <span>MAR</span>
                <span>MAY</span>
                <span>JUL</span>
                <span>SEP</span>
                <span>NOV</span>
              </div>
            </div>
          </div>

          <div className="bg-[#fbfaff] rounded-[2.5rem] border border-purple-50 p-8">
            <h2 className="text-xl font-black text-slate-900 font-coolvetica mb-6">
              Recent Activity
            </h2>
            <div className="space-y-6">
              {[
                {
                  icon: <GraduationCap className="w-4 h-4" />,
                  user: "L. Obinna",
                  action: "Active in CBT",
                  time: "2 min ago",
                  color: "bg-blue-100 text-blue-600",
                },
                {
                  icon: <BookOpen className="w-4 h-4" />,
                  user: "A. Chiemela",
                  action: "Updated CSC401",
                  time: "15 min ago",
                  color: "bg-purple-100 text-[#641BC4]",
                },
                {
                  icon: <Calendar className="w-4 h-4" />,
                  user: "Registrar",
                  action: "Activated Session",
                  time: "1 hour ago",
                  color: "bg-emerald-100 text-emerald-600",
                },
                {
                  icon: <Users className="w-4 h-4" />,
                  user: "Dr. Smith",
                  action: "Imported Lecturers",
                  time: "3 hours ago",
                  color: "bg-amber-100 text-amber-600",
                },
              ].map((act, i) => (
                <div key={act.user} className="flex gap-4">
                  <div
                    className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${act.color}`}
                  >
                    {act.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 tracking-tight">
                      <span className="text-[#641BC4]">{act.user}</span>{" "}
                      {act.action}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5">
                      {act.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-8 rounded-2xl border-purple-100 border text-xs font-black text-[#641BC4] hover:bg-white"
            >
              View Systematic Audit Logs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
