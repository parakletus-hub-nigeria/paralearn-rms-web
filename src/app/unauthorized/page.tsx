"use client";

import Link from "next/link";
import { routespath } from "@/lib/routepath";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-6">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900">Unauthorized</h1>
        <p className="mt-2 text-slate-600">
          You don’t have access to this page with your current account.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href={routespath.SIGNIN}
            className="h-11 inline-flex items-center justify-center rounded-xl bg-[#641BC4] text-white font-semibold px-5 hover:bg-[#641BC4]/90"
          >
            Go to Sign In
          </Link>
          <Link
            href="/"
            className="h-11 inline-flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 font-semibold px-5 hover:bg-slate-50"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

