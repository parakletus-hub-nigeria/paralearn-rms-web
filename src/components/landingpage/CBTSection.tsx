import { Clock, Check } from "lucide-react";
import { Button } from "../ui/button";
const TestCard = ({
  subject,
  level,
  category,
  date,
  time,
  duration,
  status,
}: {
  subject: string;
  level: string;
  category: string;
  date: string;
  time: string;
  duration?: string;
  status?: "scheduled" | "entry";
}) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 min-w-[260px] border border-slate-100 dark:border-slate-800 transition-all hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)] group">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-1">
        <h4 className="font-black text-slate-800 dark:text-white text-lg tracking-tight group-hover:text-primary transition-colors">{subject}</h4>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {level} <span className="mx-1">•</span> {category}
        </p>
      </div>
      {status === "scheduled" && (
        <span className="text-[10px] uppercase tracking-widest text-emerald-600 font-black bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/50">
          Live
        </span>
      )}
    </div>
    <div className="flex items-center justify-between text-sm font-medium text-slate-500 dark:text-slate-400 mt-6 pt-4 border-t border-slate-50 dark:border-slate-800">
      <span className="flex items-center gap-2">
         <Clock className="w-4 h-4 text-primary" />
         {date}
      </span>
      {duration && (
        <span className="text-primary font-bold">
          {duration}
        </span>
      )}
    </div>
  </div>
);

const ScoreEntryCard = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-5 flex items-center gap-4 border border-slate-100 dark:border-slate-800 animate-bounce-subtle">
    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
      <Check className="w-6 h-6 text-white" />
    </div>
    <div>
       <p className="text-sm font-black text-slate-800 dark:text-white">Score Entry</p>
       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Validated</p>
    </div>
  </div>
);

const CBTSection = () => {
  return (
    <section className="py-24 md:py-48 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-24 lg:gap-32 items-center">
          {/* Left Content */}
          <div className="space-y-10 order-2 lg:order-1">
            <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-widest">
              Digital Assessments
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              Computer-Based <br />
              <span className="text-hero italic">Testing (CBT)</span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl font-medium">
              The platform allows educators to run CBT tests seamlessly, with
              the built-in system handling delivery to the target student
              groups with military precision.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
               <Button size="lg" className="rounded-2xl h-14 px-8 font-bold text-lg shadow-xl shadow-primary/20">Get Started</Button>
               <Button variant="outline" size="lg" className="rounded-2xl h-14 px-8 font-bold text-lg border-2">Learn More</Button>
            </div>
          </div>

          {/* Right - Floating Cards */}
          <div className="relative h-[400px] md:h-[600px] flex items-center justify-center order-1 lg:order-2">
            {/* Background decorative gradient and spheres */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-purple-500/5 to-transparent rounded-[3rem] blur-3xl opacity-50" />
            <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-primary/20 blur-3xl rounded-full animate-float-slow" />
            <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full animate-float-slower" />

            {/* Test Cards */}
            <div className="relative w-full max-w-lg">
              {/* Maths Card - Back */}
              <div className="absolute left-0 top-0 transform -rotate-6 transition-all group-hover:-rotate-12 group-hover:-translate-x-4 duration-500">
                <TestCard
                  subject="Maths - Algebra"
                  level="SS3"
                  category="Mathematics"
                  date="22 Dec 2025"
                  time="8:30 AM"
                />
              </div>

              {/* English Card - Front */}
              <div className="relative z-10 transform rotate-3 translate-x-16 md:translate-x-24 translate-y-12 transition-all group-hover:rotate-6 group-hover:translate-y-8 duration-500">
                <TestCard
                  subject="Eng - Essay"
                  level="SS3"
                  category="English"
                  date="14 Dec 2025"
                  time="9:30 AM"
                  duration="60 mins"
                  status="scheduled"
                />
              </div>

              {/* Score Entry Card */}
              <div className="absolute -bottom-16 right-0 md:right-8 z-20 transition-all group-hover:translate-x-4 duration-500">
                <ScoreEntryCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default CBTSection;
