import { Clock, Check } from "lucide-react";

const TestCard = ({ 
  subject, 
  level, 
  category, 
  date, 
  time, 
  duration, 
  status 
}: { 
  subject: string;
  level: string;
  category: string;
  date: string;
  time: string;
  duration?: string;
  status?: "scheduled" | "entry";
}) => (
  <div className="bg-white rounded-xl shadow-lg p-4 min-w-[200px] border border-gray-100">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h4 className="font-semibold text-gray-900 text-sm">{subject}</h4>
        <p className="text-xs text-gray-500">{level} | {category}</p>
      </div>
      {status === "scheduled" && (
        <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded">
          Scheduled
        </span>
      )}
    </div>
    <div className="flex items-center justify-between text-xs text-gray-600 mt-3">
      <span>{date}, {time}</span>
      {duration && (
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {duration}
        </span>
      )}
    </div>
  </div>
);

const ScoreEntryCard = () => (
  <div className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 border border-gray-100">
    <span className="text-sm font-medium text-gray-700">Score Entry</span>
    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
      <Check className="w-4 h-4 text-white" />
    </div>
  </div>
);

const CBTSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/20 relative overflow-hidden">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
              Computer-Based Testing{" "}
              <span className="text-primary">(CBT):</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              The platform allows educators to run CBT tests seamlessly, with the built-in system handling delivery to the target student groups.
            </p>
          </div>

          {/* Right - Floating Cards */}
          <div className="relative h-[300px] flex items-center justify-center">
            {/* Background decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-primary/10 rounded-3xl" />
            
            {/* Test Cards */}
            <div className="relative">
              {/* Maths Card - Back */}
              <div className="absolute -left-4 top-8 transform -rotate-3 opacity-90">
                <TestCard
                  subject="Maths - Algebra"
                  level="SS3"
                  category="Mathematics"
                  date="22 Dec 2025"
                  time="8:30 AM"
                />
              </div>
              
              {/* English Card - Front */}
              <div className="relative z-10 transform rotate-2 translate-x-12 -translate-y-4">
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
              <div className="absolute bottom-0 right-0 transform translate-y-16 translate-x-8">
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
