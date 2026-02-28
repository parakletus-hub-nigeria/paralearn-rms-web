export default function ProgressBar({ step }: { step: number }) {
  const percent = step === 1 ? 30 : step === 2 ? 60 : 100;
  const steps = [
    { n: 1, label: "School" },
    { n: 2, label: "Admin" },
    { n: 3, label: "Contact" },
  ];

  return (
    <div className="w-full space-y-3">
      {/* Step indicators */}
      <div className="flex items-center">
        {steps.map((s, i) => (
          <div key={s.n} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  s.n <= step
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {s.n}
              </div>
              <span
                className={`text-[10px] font-medium sm:text-xs ${
                  s.n <= step ? "text-slate-700" : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 rounded sm:mx-2 ${
                  s.n < step ? "bg-primary/60" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Step {step} of 3</span>
        <span>{percent}% complete</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-purple-600 to-primary/90 shadow-sm transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
