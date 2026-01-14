const WhatYouCanDo = () => {
  return (
    <section className="min-h-[600px] py-20 px-4 md:min-h-[700px]">
      <div className="px-6 md:px-12 container mx-auto py-12 md:py-16">
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
          {/* Left content */}
          <div className="flex-1 space-y-6 max-w-lg">
            <h1 className="text-3xl md:text-4xl lg:text-[42px] font-bold leading-tight text-foreground">
              Everything you can do in a physical classroom,{" "}
              <span className="text-primary">you can do with Paralearn</span>
            </h1>
            <p className="text-foreground/80 text-base md:text-lg leading-relaxed">
              Paralearn's school management software enables both traditional
              and online schools to seamlessly handle scheduling, attendance,
              payments, and virtual classrooms—all within one secure,
              cloud-based system.
            </p>
          </div>

          {/* Right image with custom shape */}
          <div className="flex-1 flex justify-center lg:justify-end w-full">
            <div className="relative w-full max-w-md lg:max-w-lg">
              {/* Custom shaped container */}
              <div className="relative">
                {/* Purple accent bar on bottom */}
                <div className="absolute -bottom-2 left-4 right-0 h-4 bg-primary rounded-full"></div>

                {/* Image container with custom border radius */}
                <div
                  className="relative overflow-hidden rounded-[40px] rounded-tl-[80px] shadow-2xl"
                  style={{
                    borderRadius: "80px 40px 40px 40px",
                  }}
                >
                  <img
                    // src={teacherImage}
                    alt="Teacher in classroom with students"
                    className="w-full h-[300px] md:h-[380px] object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatYouCanDo;
