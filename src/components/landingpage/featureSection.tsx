const FeaturesSection = () => {
  return (
    <section className="py-20 px-6 md:px-12">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-16">
          A <span className="text-primary">user interface</span> designed for
          the classroom
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto">
          {/* Card 1 - Grid/Podium */}
          <div className="border-2 border-primary/30 rounded-3xl p-12 hover:border-primary/60 transition-all duration-300 bg-transparent min-h-[320px] flex flex-col items-center justify-center">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="flex gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="w-7 h-7 bg-primary rounded-md"></div>
                  <div className="w-7 h-7 bg-primary rounded-md"></div>
                  <div className="w-7 h-7 bg-primary rounded-md"></div>
                  <div className="w-7 h-7 bg-primary rounded-md"></div>
                </div>
              </div>
              <p className="text-foreground leading-relaxed text-base">
                Teachers don&apos;t get lost in the grid view and have a
                dedicated Podium space.
              </p>
            </div>
          </div>

          {/* Card 2 - Presenter */}
          <div className="border-2 border-primary/30 rounded-3xl p-12 hover:border-primary/60 transition-all duration-300 bg-transparent min-h-[320px] flex flex-col items-center justify-center">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary rounded-md"></div>
                <div className="w-9 h-9 bg-primary rounded-md"></div>
              </div>
              <p className="text-foreground leading-relaxed text-base">
                TA&apos;s and presenters can be moved to the front of the class.
              </p>
            </div>
          </div>

          {/* Card 3 - Students View */}
          <div className="border-2 border-primary/30 rounded-3xl p-12 hover:border-primary/60 transition-all duration-300 bg-transparent min-h-[320px] flex flex-col items-center justify-center">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 bg-primary rounded-full"></div>
                <div className="w-8 h-8 bg-primary rounded-full"></div>
                <div className="w-8 h-8 bg-primary/50 rounded-full"></div>
              </div>
              <p className="text-foreground leading-relaxed text-base">
                Teachers can easily see all students and class data at one time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
