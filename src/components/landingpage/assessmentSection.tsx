import { Check, X } from "lucide-react";
const AssessmentsSection = () => {
  return (
    <section className="min-h-[600px] py-20 px-4 md:min-h-[700px] overflow-hidden">
      <div className="px-6 md:px-12 container mx-auto py-12 md:py-16">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-24 lg:gap-48">
          {/* Quiz Card */}
          <div className="flex-1 flex justify-center relative w-full max-w-sm order-2 lg:order-1">
            {/* Decorative dots */}
            <div className="absolute top-0 left-8 w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-emerald-500"></div>
            <div className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-pink-500"></div>

            {/* Purple blob behind card */}
            <div className="absolute -left-8 top-4 w-24 h-24 bg-primary/30 rounded-full blur-sm"></div>

            <div className="relative bg-card rounded-3xl shadow-2xl p-6 max-w-sm w-full">
              {/* Answer buttons */}
              <div className="absolute -top-4 right-8 flex gap-2">
                <button className="w-10 h-10 rounded-full bg-card border-2 border-red-400 flex items-center justify-center shadow-md">
                  <X className="w-5 h-5 text-red-500" />
                </button>
                <button className="w-10 h-10 rounded-full bg-card border-2 border-emerald-400 flex items-center justify-center shadow-md">
                  <Check className="w-5 h-5 text-emerald-500" />
                </button>
              </div>

              <div className="space-y-4">
                <span className="inline-block px-4 py-1.5 bg-secondary text-secondary-foreground text-sm font-medium rounded-full">
                  Question 1
                </span>
                <h3 className="text-xl font-bold text-primary">
                  True or false? This play takes place in Italy
                </h3>
                <img
                  //   src={veniceImage}
                  alt="Venice, Italy"
                  className="rounded-xl w-full h-40 object-cover"
                />
              </div>

              {/* Success notification */}
              <div className="absolute -bottom-6 right-0 flex items-center gap-2 bg-card shadow-lg px-4 py-3 rounded-xl">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="text-sm">
                  <p className="text-emerald-500 font-medium">
                    Your answer was
                  </p>
                  <p className="text-emerald-500 font-medium">
                    sent successfully
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6 max-w-sm text-center order-1 lg:order-2">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-foreground">
              Assessments, <span className="text-primary">Quizzes,</span>
              <br />
              Tests
            </h2>
            <p className="text-foreground/80 text-sm md:text-base leading-relaxed">
              Class offers a dynamic suite of teaching tools designed for
              real-time use during lessons. Educators can distribute assignments
              instantly, allowing students to complete and submit them
              seamlessly within the platform.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AssessmentsSection;
