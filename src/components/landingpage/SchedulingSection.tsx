import MobilePreview from "./MobilePreview";

const SchedulingSection = () => {
  const studentsData = [
    { id: "S-101", name: "John Doe", class: "1 South", date: "01/01/2001" },
    { id: "S-101", name: "John Doe", class: "1 South", date: "01/01/2001" },
    { id: "S-101", name: "John Doe", class: "1 South", date: "01/01/2001" },
    { id: "S-101", name: "John Doe", class: "1 East", date: "01/01/2001" },
    { id: "S-101", name: "John Doe", class: "1 South", date: "01/01/2001" },
  ];

  const teachersData = [
    {
      id: "T-101",
      name: "Jane Doe",
      email: "jane@email.com",
      date: "234567890",
    },
    {
      id: "T-101",
      name: "Jane Doe",
      email: "jane@email.com",
      date: "234567890",
    },
    {
      id: "T-101",
      name: "Jane Doe",
      email: "jane@email.com",
      date: "234567890",
    },
    {
      id: "T-101",
      name: "Jane Doe",
      email: "jane@email.com",
      date: "234567890",
    },
    {
      id: "T-101",
      name: "Jane Doe",
      email: "jane@email.com",
      date: "234567890",
    },
  ];

  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-24 md:py-40 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-32">
          {/* Left - Mobile Previews */}
          <div className="flex-1 flex justify-center lg:justify-start">
            <div className="relative flex items-start gap-6 md:gap-12">
              <div className="absolute -inset-10 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
              
              {/* Students Phone */}
              <div
                className="animate-fade-in relative z-10 transform hover:-translate-y-2 transition-transform duration-500"
                style={{ animationDelay: "0.1s" }}
              >
                <MobilePreview
                  title="Students"
                  count={58}
                  data={studentsData}
                  variant="students"
                />
              </div>

              {/* Teachers Phone - offset */}
              <div
                className="mt-16 animate-fade-in relative z-10 transform hover:-translate-y-2 transition-transform duration-500"
                style={{ animationDelay: "0.2s" }}
              >
                <MobilePreview
                  title="Teachers"
                  count={30}
                  data={teachersData}
                  variant="teachers"
                />
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 text-center lg:text-right space-y-10">
            <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-widest">
              Efficient Logistics
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight animate-fade-in">
              <span className="text-hero italic">Easy Scheduling</span> &
              Attendance Tracking
            </h2>
            <p
              className="text-slate-600 dark:text-slate-400 text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto lg:ml-auto lg:mr-0 animate-fade-in font-medium"
              style={{ animationDelay: "0.1s" }}
            >
              Schedule and reserve classrooms at one campus or multiple
              campuses. Keep detailed records of student attendance with ease.
            </p>
            <div className="pt-4 flex justify-center lg:justify-end">
               <button className="group flex items-center gap-3 text-primary font-bold text-xl hover:gap-5 transition-all">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                     <svg className="w-5 h-5 text-primary group-hover:text-white transition-colors rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                     </svg>
                  </div>
                  See how it works
               </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default SchedulingSection;
