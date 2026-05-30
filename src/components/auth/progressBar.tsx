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
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all"
                style={{
                  background: s.n <= step ? "var(--violet-ink)" : "var(--surface-muted)",
                  color: s.n <= step ? "white" : "var(--foreground-muted)",
                  boxShadow: s.n <= step ? "var(--shadow-card)" : "none",
                }}
              >
                {s.n}
              </div>
              <span
                className="text-[10px] font-medium sm:text-xs"
                style={{ color: s.n <= step ? "var(--foreground)" : "var(--foreground-muted)" }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="mx-1 h-0.5 flex-1 rounded sm:mx-2"
                style={{ background: s.n < step ? "var(--violet-ink)" : "var(--border-medium)" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="flex items-center justify-between text-xs" style={{ color: "var(--foreground-muted)" }}>
        <span>Step {step} of 3</span>
        <span>{percent}% complete</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--border-medium)" }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%`, background: "var(--violet-ink)" }}
        />
      </div>
    </div>
  );
}
