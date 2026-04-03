"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { fetchHistory, fetchWallet } from "@/reduxToolKit/lessonGenerator/lessonGeneratorThunks";
import { routespath } from "@/lib/routepath";
import Link from "next/link";
import {
  Sparkles, History, Plus, FileText, ChevronRight,
  BookOpen, Clock, AlertCircle, Wallet, Zap, TrendingUp,
} from "lucide-react";
import { format } from "date-fns";

export function LessonGeneratorDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { history, loading, error, wallet } = useSelector((s: RootState) => s.lessonGenerator);

  useEffect(() => {
    dispatch(fetchHistory(undefined));
    dispatch(fetchWallet());
  }, [dispatch]);

  const isZeroBalance = wallet.balance !== null && wallet.balance === 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero + Wallet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-10 text-white">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-600/20 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold mb-6">
              <Sparkles className="w-3 h-3" />
              AI-POWERED
            </div>
            <h1 className="text-2xl md:text-4xl font-bold font-coolvetica mb-3 leading-tight">
              NERDC-Compliant Lesson Notes<br />
              <span className="text-purple-400">Generated in Seconds</span>
            </h1>
            <p className="text-slate-400 text-sm mb-6 max-w-md">
              Save hours of planning. Create structured, curriculum-aligned lesson notes using SabiNote AI.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={routespath.LESSON_GENERATOR_NEW}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-xl ${
                  isZeroBalance
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed pointer-events-none"
                    : "bg-white text-slate-900 hover:bg-slate-100 shadow-white/5"
                }`}
              >
                <Plus className="w-5 h-5" />
                Create New Note
              </Link>
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 text-slate-300 rounded-xl font-medium border border-slate-700 text-sm">
                <Zap className="w-4 h-4 text-purple-400 fill-purple-400" />
                <span className="text-purple-400 font-bold">5 Parats</span>
                <span className="text-slate-500">per generation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm font-bold text-slate-700">Parats Wallet</p>
            </div>
          </div>

          {wallet.balance === null ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 rounded-full border-2 border-slate-100 border-t-purple-500 animate-spin" />
            </div>
          ) : (
            <>
              <div>
                <p className={`text-4xl font-black ${isZeroBalance ? "text-red-500" : wallet.isLowBalance ? "text-amber-500" : "text-slate-900"}`}>
                  {wallet.balance}
                </p>
                <p className="text-slate-500 text-sm mt-0.5">Parats available</p>
              </div>

              {wallet.remainingGenerations !== null && (
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <TrendingUp className="w-4 h-4" />
                  {wallet.remainingGenerations} generation{wallet.remainingGenerations !== 1 ? "s" : ""} remaining
                </div>
              )}

              {wallet.alert && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {wallet.alert}
                </div>
              )}

              {isZeroBalance && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  Balance is 0. Top up to generate lesson notes.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <History className="w-5 h-5 text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Generation History</h2>
          </div>
          {history.length > 0 && (
            <span className="text-sm font-medium text-slate-500">{history.length} notes</span>
          )}
        </div>

        {loading && history.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-red-50 border border-red-100 text-center space-y-3">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <p className="text-red-600 font-medium">
              {typeof error === "string" ? error : "An unexpected error occurred"}
            </p>
            <button
              onClick={() => dispatch(fetchHistory(undefined))}
              className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-bold shadow-sm"
            >
              Try Again
            </button>
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100 space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-10 h-10 text-slate-300" />
            </div>
            <div className="max-w-sm mx-auto">
              <h3 className="text-lg font-bold text-slate-900">No lesson notes yet</h3>
              <p className="text-slate-500 text-sm mt-1">
                Your AI-generated lesson notes will appear here.
              </p>
            </div>
            <Link
              href={routespath.LESSON_GENERATOR_NEW}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold mt-2"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((item: any) => {
              const dateStr = item.generatedAt ?? item.createdAt;
              return (
                <Link
                  key={item.id}
                  href={routespath.LESSON_GENERATOR_DETAILS.replace(":id", item.id)}
                  className="group p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        {item.grade}
                      </span>
                      {dateStr && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          {format(new Date(dateStr), "MMM d, yyyy")}
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 line-clamp-2 mb-1">{item.topic}</h3>
                  <p className="text-sm text-slate-500 font-medium mb-4">{item.subject}</p>

                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="px-2 py-1 rounded bg-slate-50 text-[10px] font-bold text-slate-500">
                      Week {item.week} • {item.term} Term
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
