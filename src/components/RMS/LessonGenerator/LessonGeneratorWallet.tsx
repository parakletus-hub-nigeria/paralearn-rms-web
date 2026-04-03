"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  fetchWallet,
  fetchTransactions,
  topUpWallet,
} from "@/reduxToolKit/lessonGenerator/lessonGeneratorThunks";
import { useRouter } from "next/navigation";
import { routespath } from "@/lib/routepath";
import { toast } from "sonner";
import {
  ArrowLeft, Wallet, Zap, TrendingUp, TrendingDown, RefreshCw,
  AlertCircle, Clock, Plus, CheckCircle, Info,
} from "lucide-react";
import { format } from "date-fns";

const TX_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; amountColor: string }> = {
  PURCHASE:  { label: "Top Up",    icon: Plus,         color: "bg-green-100 text-green-700",  amountColor: "text-green-600" },
  DEDUCTION: { label: "Used",      icon: TrendingDown, color: "bg-red-100 text-red-600",      amountColor: "text-red-500"   },
  REFUND:    { label: "Refunded",  icon: RefreshCw,    color: "bg-blue-100 text-blue-700",    amountColor: "text-blue-600"  },
};

const TOPUP_PRESETS = [10, 20, 50, 100];

export function LessonGeneratorWallet() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { wallet } = useSelector((s: RootState) => s.lessonGenerator);

  const [topupAmount, setTopupAmount] = useState<number | "">("");
  const [topupConfirmed, setTopupConfirmed] = useState(false);

  useEffect(() => {
    dispatch(fetchWallet());
    dispatch(fetchTransactions(undefined));
  }, [dispatch]);

  const handleTopUp = async () => {
    if (!topupAmount || Number(topupAmount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!topupConfirmed) {
      toast.error("Please confirm that payment has been completed before topping up");
      return;
    }
    try {
      const result = await dispatch(topUpWallet(Number(topupAmount))).unwrap();
      toast.success(`Wallet topped up! New balance: ${result.balance} Parats`);
      setTopupAmount("");
      setTopupConfirmed(false);
      dispatch(fetchTransactions(undefined));
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Top up failed. Please try again.");
    }
  };

  const isZeroBalance = wallet.balance !== null && wallet.balance === 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Back nav */}
      <button
        onClick={() => router.push(routespath.LESSON_GENERATOR)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Parats Wallet</h1>
        <p className="text-slate-500 mt-1 text-sm">Manage your $Parats balance and transaction history.</p>
      </div>

      {/* Balance + Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Current Balance */}
        <div className={`sm:col-span-1 rounded-2xl p-6 flex flex-col justify-between ${
          isZeroBalance ? "bg-red-50 border border-red-200" :
          wallet.isLowBalance ? "bg-amber-50 border border-amber-200" :
          "bg-slate-900 text-white"
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <Wallet className={`w-5 h-5 ${isZeroBalance || wallet.isLowBalance ? "text-slate-500" : "text-purple-400"}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${isZeroBalance || wallet.isLowBalance ? "text-slate-500" : "text-slate-400"}`}>
              Balance
            </span>
          </div>
          <div>
            <p className={`text-5xl font-black tabular-nums ${
              isZeroBalance ? "text-red-500" : wallet.isLowBalance ? "text-amber-600" : "text-white"
            }`}>
              {wallet.balance ?? "—"}
            </p>
            <p className={`text-sm mt-1 font-medium ${isZeroBalance || wallet.isLowBalance ? "text-slate-500" : "text-slate-400"}`}>
              Parats
            </p>
          </div>
          {wallet.remainingGenerations !== null && (
            <div className={`mt-4 flex items-center gap-1.5 text-xs font-bold ${
              isZeroBalance || wallet.isLowBalance ? "text-slate-500" : "text-slate-400"
            }`}>
              <Zap className="w-3.5 h-3.5" />
              {wallet.remainingGenerations} generation{wallet.remainingGenerations !== 1 ? "s" : ""} remaining
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="sm:col-span-2 grid grid-cols-3 gap-3">
          {[
            { label: "Total Purchased", value: wallet.totalPurchased, icon: TrendingUp,   color: "text-green-600",  bg: "bg-green-50" },
            { label: "Total Spent",     value: wallet.totalSpent,     icon: TrendingDown, color: "text-red-500",    bg: "bg-red-50"   },
            { label: "Total Refunded",  value: wallet.totalRefunded,  icon: RefreshCw,    color: "text-blue-600",   bg: "bg-blue-50"  },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-2xl bg-white border border-slate-100 p-4 flex flex-col gap-2 shadow-sm">
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-2xl font-black tabular-nums ${color}`}>{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Low balance / zero balance alert */}
      {wallet.alert && (
        <div className={`flex items-start gap-3 p-4 rounded-xl text-sm font-medium ${
          isZeroBalance ? "bg-red-50 border border-red-200 text-red-700" : "bg-amber-50 border border-amber-200 text-amber-700"
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {wallet.alert}
        </div>
      )}

      {/* Top Up Panel */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Top Up Wallet</h2>
          <p className="text-slate-500 text-sm mt-0.5">Add more $Parats to your wallet to generate lesson notes.</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Payment note */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-700">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
            <p>
              Complete payment through your school's payment portal or contact admin first, then enter the amount below to credit your wallet.
            </p>
          </div>

          {/* Preset amounts */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Quick Select</p>
            <div className="flex flex-wrap gap-2">
              {TOPUP_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setTopupAmount(preset)}
                  className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                    topupAmount === preset
                      ? "border-purple-600 bg-purple-50 text-purple-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-purple-200 hover:bg-purple-50"
                  }`}
                >
                  {preset} Parats
                  <span className="ml-1.5 text-[10px] font-medium text-slate-400">
                    ({Math.floor(preset / 5)} gen{Math.floor(preset / 5) !== 1 ? "s" : ""})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Custom Amount</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₦</span>
              <input
                type="number"
                min="1"
                placeholder="Enter amount (Parats)"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border-2 border-transparent focus:border-purple-600 focus:bg-white rounded-2xl outline-none transition-all font-medium text-slate-900 text-sm"
              />
            </div>
          </div>

          {/* Confirmation checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={topupConfirmed}
                onChange={(e) => setTopupConfirmed(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                topupConfirmed ? "bg-purple-600 border-purple-600" : "border-slate-300 bg-white group-hover:border-purple-400"
              }`}>
                {topupConfirmed && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
            </div>
            <span className="text-sm text-slate-600 leading-snug">
              I confirm that payment of <strong>{topupAmount || "—"} Parats</strong> has been completed and I am authorised to credit this wallet.
            </span>
          </label>

          <button
            onClick={handleTopUp}
            disabled={!topupAmount || !topupConfirmed || wallet.toppingUp}
            className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {wallet.toppingUp ? (
              <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Processing…</>
            ) : (
              <><Plus className="w-4 h-4" />Top Up {topupAmount ? `${topupAmount} Parats` : "Wallet"}</>
            )}
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Transaction History</h2>
            <p className="text-slate-500 text-sm mt-0.5">Your recent Parats activity</p>
          </div>
          <button
            onClick={() => dispatch(fetchTransactions(undefined))}
            disabled={wallet.loadingTransactions}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${wallet.loadingTransactions ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {wallet.loadingTransactions ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-slate-100 border-t-purple-500 animate-spin" />
          </div>
        ) : wallet.transactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-sm">No transactions yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {wallet.transactions.map((tx: any) => {
              const cfg = TX_TYPE_CONFIG[tx.type] ?? TX_TYPE_CONFIG.DEDUCTION;
              const Icon = cfg.icon;
              const sign = tx.type === "DEDUCTION" ? "-" : "+";
              return (
                <li key={tx.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">{tx.description || cfg.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {tx.createdAt ? format(new Date(tx.createdAt), "MMM d, yyyy · h:mm a") : "—"}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-black tabular-nums shrink-0 ml-4 ${cfg.amountColor}`}>
                    {sign}{tx.amount} ⚡
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
