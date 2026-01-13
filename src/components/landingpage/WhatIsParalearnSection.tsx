import Image from "next/image";

const WhatIsParalearnSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container  mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-6">
            What is <span className="text-primary">Paralearn</span>?
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Paralearn empowers educators to effortlessly create online classes,
            organize course materials, manage assignments, quizzes, and exams,
            track deadlines, grade results, and provide timely feedback—all from
            one centralized platform.
          </p>
        </div>

        {/* Images Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Left Image - with decorative corner */}
          <div className="relative">
            {/* Purple decorative element - top left */}
            <div className="absolute -top-3 -left-3 w-16 h-24 bg-primary rounded-tl-3xl rounded-br-3xl z-0" />
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-lg">
              <img
                // src={studentsLearning1}
                alt="image1"
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
          </div>

          {/* Right Image - with decorative corner */}
          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-lg">
              <img
                // src={studentsLearning2}
                alt="image2"
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
            {/* Purple decorative element - bottom right */}
            <div className="absolute -bottom-3 -right-3 w-16 h-24 bg-primary rounded-br-3xl rounded-tl-3xl z-0" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatIsParalearnSection;
