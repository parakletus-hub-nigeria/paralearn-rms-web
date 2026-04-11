"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/mainLogo.svg";
import { routespath } from "@/lib/routepath";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { generateLesson } from "@/reduxToolKit/lessonGenerator/lessonGeneratorThunks";
import { clearCurrentLesson } from "@/reduxToolKit/lessonGenerator/lessonGeneratorSlice";
import { useState } from "react";
import { Sparkles, X, CheckCircle, Zap, Brain, Clock } from "lucide-react";

const SabiNoteLanding = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { generating, currentLesson } = useSelector((s: RootState) => s.lessonGenerator);
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({ subject: "Mathematics", grade: "JSS 1", topic: "", term: "First" as const, week: 1 });

  const handleDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(generateLesson({ ...demoForm, curriculum: "NERDC" }));
  };

  const closeDemo = () => {
    setDemoOpen(false);
    dispatch(clearCurrentLesson());
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#fdfdff", color: "#0f172a", fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #f1f0fb", position: "sticky", top: 0, zIndex: 40 }}>
        <nav className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          {/* Logo + SabiNote by ParaLearn */}
          <div className="flex items-center gap-3">
            <Link href="/" className="relative block h-10 aspect-[930/479]">
              <Image src={logo} fill className="object-contain object-left" alt="ParaLearn logo" priority sizes="180px" />
            </Link>
            <div className="flex flex-col leading-tight">
              <span className="font-black text-lg" style={{ color: "#641bc4", fontFamily: "'Outfit', sans-serif" }}>SabiNote</span>
              <span className="text-xs font-medium" style={{ color: "#ad8ed6" }}>by ParaLearn</span>
            </div>
          </div>

          {/* CTA Group */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href={routespath.SABINOTE_LOGIN}
              className="text-sm font-bold transition-all hover:text-[#641bc4]"
              style={{ color: "#64748b" }}
            >
              Log in
            </Link>
            <Link
              href={routespath.SABINOTE_REGISTER}
              className="rounded-full px-6 py-2.5 text-sm font-black text-white transition-all hover:opacity-90 hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #641bc4 0%, #9747ff 100%)" }}
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-20 pb-28 overflow-hidden">
          {/* background blobs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[120px]" style={{ backgroundColor: "rgba(100,27,196,0.08)" }} />
          <div className="absolute bottom-0 -left-32 w-72 h-72 rounded-full blur-[100px]" style={{ backgroundColor: "rgba(151,71,255,0.06)" }} />

          <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="z-10">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-bold mb-7"
                style={{ backgroundColor: "rgba(100,27,196,0.08)", color: "#641bc4" }}
              >
                <CheckCircle className="w-4 h-4" />
                Built for the Sovereign Scholar
              </div>

              <h1
                className="font-black text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight mb-6"
                style={{ color: "#0f172a" }}
              >
                NERDC-Compliant Lesson Notes{" "}
                <span style={{ background: "linear-gradient(135deg, #641bc4, #9747ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Generated in Seconds
                </span>
              </h1>

              <p className="text-lg md:text-xl leading-relaxed mb-8 max-w-xl" style={{ color: "#64748b" }}>
                Eliminate hours of manual planning. Create highly structured, curriculum-aligned lesson notes tailored for Nigerian schools instantly using SabiNote AI.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={routespath.SABINOTE_REGISTER}
                  className="w-full sm:w-auto text-center px-8 py-4 rounded-full font-black text-white text-base transition-all hover:opacity-90 hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #641bc4 0%, #9747ff 100%)", boxShadow: "0 8px 32px rgba(100,27,196,0.25)" }}
                >
                  Start Generating for Free
                </Link>
                <button
                  onClick={() => setDemoOpen(true)}
                  className="w-full sm:w-auto px-8 py-4 rounded-full font-black text-base transition-all hover:opacity-90"
                  style={{ backgroundColor: "#f0e5ff", color: "#641bc4" }}
                >
                  Try Demo First
                </button>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex -space-x-3">
                  {[
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuAgE6R9fAGJzfnjmgyefWSSHiMwzA2vE4WP3b5Cj7iyYYgnj5kD95Zpjq7fFFGLn-d9D2piOZclPgZ15zlDPR8FtWPk5ljBo2CCQDarPG3sW-cHiBDhEUpDDii3f0aoMfnxwDDTUFXhcumeirbyrR6l9n7mFHSIvn6UlxQsemKmzqXX6gVCsmDHXMEc-JhGRiD5jP9mwmpExz8n5od5pEgJjP9kVlkNG6ksktqoGimGVdopijc6fcw_TeFGyaBHaezJ8ZA15AtrsUGY",
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuCONcZ7idDdJaU6WVrcxsLg7TcpyiX2skjcRYdQteQINPafwuNeEODWGUE41BfypYeuumseDIFuIHLdqq4EcVBQRpJgpqwyX0PkzvNi6a8VfvBWImzjZzVo8GvlkfGQDaM6OMoYqq7K34Mrdw4mEkXnDLGd-m8NhewjzahMmdezIY8SeYpMiS6L3B67UN-TrvLEnN9pHEMA8s0VvFnD1jggbdDQKQZ9YJG4kl5Hb1OQvTUnzo3rUgyUAtw6n05qJsZIkE9C8jvPtWae",
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuBMWa1_l52grNxbiqbh11cIvS9KFuHuw0vsZU6GPbxxazyXcEoky-C-dplWTc7cvtY9urGUx24-eSHHytFPpbFOYKG16NMPFqHjKNBKfO0kY6ndExiFaRJTCPAHmwejHt5ybKOD-1eO6dhipOU6vXjAEdWNmSVf6NByvnT8mk60Baq9KT0Vkbv_9lswKOutwOJ0NhrrpayaKP2Orep5SrpoBB5biS6JnLx_LW5_iP2XSWSG5BGUu3ucUb76wmKBDjbGkRjpTvxtz12C",
                  ].map((src, i) => (
                    <img key={i} src={src} alt="educator" className="w-10 h-10 rounded-full border-4 border-white object-cover" />
                  ))}
                </div>
                <p className="text-sm font-medium" style={{ color: "#64748b" }}>Join 1,200+ Educators transforming their classrooms</p>
              </div>
            </div>

            {/* Editor Mockup */}
            <div className="relative hidden lg:flex h-[560px] items-center">
              <div className="absolute inset-0 rounded-[40px] -rotate-2 translate-x-4 translate-y-4" style={{ background: "linear-gradient(135deg, rgba(100,27,196,0.08), rgba(151,71,255,0.04))" }} />
              <div className="w-full bg-white rounded-2xl shadow-2xl border p-8 relative overflow-hidden" style={{ borderColor: "#f1f0fb" }}>
                {/* AI bar */}
                <div className="absolute top-6 left-6 right-6 p-3 rounded-xl flex items-center gap-3 border z-20" style={{ backgroundColor: "rgba(253,253,255,0.85)", backdropFilter: "blur(12px)", borderColor: "#f0e5ff" }}>
                  <Sparkles className="w-5 h-5" style={{ color: "#641bc4" }} />
                  <span className="text-sm font-medium italic" style={{ color: "#64748b" }}>Generating Mathematics: Quadratic Equations...</span>
                  <div className="ml-auto flex gap-1">
                    {[0, 75, 150].map((d) => (
                      <div key={d} className="w-1 h-4 rounded-full animate-pulse" style={{ backgroundColor: `rgba(100,27,196,${0.3 + d / 300})`, animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>

                <div className="mt-20 space-y-7">
                  {[
                    { label: "Objectives", icon: "🎯" },
                    { label: "Introduction", icon: "📖" },
                    { label: "Body", icon: "📝" },
                    { label: "Evaluation", icon: "✅" },
                  ].map(({ label, icon }) => (
                    <div key={label} className="space-y-2">
                      <h4 className="font-bold text-sm flex items-center gap-2" style={{ color: "#641bc4" }}>
                        <span>{icon}</span> {label}
                      </h4>
                      <div className="h-3 rounded-full w-full" style={{ backgroundColor: "#f0e5ff" }} />
                      <div className="h-3 rounded-full w-4/5" style={{ backgroundColor: "#f0e5ff" }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento */}
        <section className="py-20" style={{ backgroundColor: "#f8f6ff" }}>
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="mb-14">
              <h2 className="font-black text-3xl md:text-4xl mb-3" style={{ color: "#0f172a" }}>Designed for the Nigerian Classroom</h2>
              <p className="text-lg max-w-2xl" style={{ color: "#64748b" }}>High-precision tools tailored for the modern educator, combining NERDC standards with world-class AI.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Big card */}
              <div className="md:col-span-8 bg-white rounded-2xl p-10 border flex flex-col justify-between relative overflow-hidden group" style={{ borderColor: "#f1f0fb", minHeight: 280 }}>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(100,27,196,0.1)" }}>
                    <CheckCircle className="w-6 h-6" style={{ color: "#641bc4" }} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-3" style={{ color: "#0f172a" }}>100% NERDC Compliant</h3>
                  <p className="text-base max-w-md" style={{ color: "#64748b" }}>Our AI is meticulously trained on the Nigerian National Curriculum, ensuring every lesson note meets ministry standards instantly.</p>
                </div>
                <div className="absolute right-4 bottom-4 opacity-5 group-hover:opacity-10 transition-opacity text-[9rem] select-none">📋</div>
              </div>

              {/* Gradient card */}
              <div className="md:col-span-4 rounded-2xl p-10 flex flex-col justify-between text-white" style={{ background: "linear-gradient(135deg, #641bc4 0%, #9747ff 100%)", minHeight: 280 }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black mb-2">Save Hours of Prep</h3>
                  <p className="text-white/80 text-sm">Generate a comprehensive, ready-to-use lesson note in under a minute.</p>
                </div>
              </div>

              {/* Small card */}
              <div className="md:col-span-4 rounded-2xl p-10 border flex flex-col justify-between group" style={{ backgroundColor: "#ede8f8", borderColor: "#f1f0fb", minHeight: 280 }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110" style={{ backgroundColor: "rgba(100,27,196,0.1)" }}>
                  <Brain className="w-6 h-6" style={{ color: "#641bc4" }} />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black mb-2" style={{ color: "#0f172a" }}>Intelligent Adaptation</h3>
                  <p className="text-sm" style={{ color: "#64748b" }}>Modify sections to match your specific teaching style with a single click.</p>
                </div>
              </div>

              {/* Wide card */}
              <div className="md:col-span-8 bg-white rounded-2xl p-10 border flex flex-col md:flex-row items-center gap-8 group" style={{ borderColor: "#f1f0fb", minHeight: 280 }}>
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(100,27,196,0.1)" }}>
                    <Clock className="w-6 h-6" style={{ color: "#641bc4" }} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-3" style={{ color: "#0f172a" }}>Your Teaching Assistant, Available 24/7</h3>
                  <p className="text-base" style={{ color: "#64748b" }}>Never face planning burnout again. SabiNote is ready whenever inspiration—or a deadline—strikes.</p>
                </div>
                <div className="hidden lg:flex w-40 h-40 rounded-full items-center justify-center border-8 border-white shrink-0 text-5xl" style={{ backgroundColor: "#f0e5ff" }}>⚡</div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20" style={{ backgroundColor: "#fdfdff" }}>
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center gap-14">
            <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-2xl relative">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJZozms85nChJj6qV6EnL1Xa6dLUMVdwAIlMJi9kpzrqVWjgscGdcseufoZH7yjvgpGfyJTDOOg0zD_qdRj6sxlQt71gGnNKmyC5EqqVwHP-PTjr4QGnIudIbF29w1ildSH6-Zez85aGQEpCXYZqMmUJoTUfIUVWjK80UVNVB9iI9tDCjvJiCOnox3DN11yoYf0po84r17vpW405cYI4k70DQdSAhS7eZ-GMElUyQfyahE3pRhxNIvEmwrHIdfOzvrQ4z7uyuCOi2W"
                alt="professor"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(100,27,196,0.7), transparent)" }} />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#ad8ed6" }}>ParaLearn Philosophy</div>
                <p className="text-base md:text-lg font-semibold">"Technology should empower the educator, not replace them. SabiNote is the quill for the modern sovereign scholar."</p>
              </div>
            </div>

            <div className="w-full lg:w-1/2 space-y-7">
              <h2 className="font-black text-3xl md:text-4xl leading-tight" style={{ color: "#0f172a" }}>
                Built for the{" "}
                <span style={{ background: "linear-gradient(135deg, #641bc4, #9747ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Sovereign Scholar
                </span>
              </h2>
              <p className="text-base md:text-lg leading-relaxed" style={{ color: "#64748b" }}>
                In an era of generic AI, SabiNote stands apart. We believe in the sovereignty of the individual educator—tools designed to amplify your expertise while you focus on the human connection of teaching.
              </p>
              <ul className="space-y-4">
                {[
                  "Data privacy that respects academic intellectual property.",
                  "Curated datasets excluding non-compliant pedagogical frameworks.",
                  "Exportable formats ready for school administration portals.",
                ].map((text) => (
                  <li key={text} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#641bc4" }} />
                    <span className="text-sm md:text-base font-medium" style={{ color: "#0f172a" }}>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-14 px-4 md:px-8">
          <div className="max-w-5xl mx-auto rounded-3xl relative overflow-hidden py-16 px-8 md:px-14 text-center text-white" style={{ background: "linear-gradient(135deg, #641bc4 0%, #9747ff 100%)" }}>
            <div className="absolute top-0 right-0 p-10 opacity-10 select-none text-[14rem]">✨</div>
            <h2 className="text-3xl md:text-5xl font-black mb-6 relative z-10">Ready to reclaim your time?</h2>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto relative z-10" style={{ color: "rgba(255,255,255,0.85)" }}>
              Join thousands of Nigerian educators using SabiNote to deliver excellence in the classroom without the burnout.
            </p>
            <Link
              href={routespath.SABINOTE_REGISTER}
              className="inline-block px-12 py-4 rounded-full font-black text-lg md:text-xl transition-transform hover:scale-105"
              style={{ backgroundColor: "#ffffff", color: "#641bc4" }}
            >
              Get Started Now
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t" style={{ backgroundColor: "#f8f6ff", borderColor: "#f1f0fb" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1">
            <div className="font-black text-xl mb-3" style={{ color: "#641bc4", fontFamily: "'Outfit', sans-serif" }}>SabiNote</div>
            <p className="text-sm" style={{ color: "#64748b" }}>Empowering the Sovereign Scholar with AI-driven academic tools.</p>
          </div>
          <div>
            <h4 className="font-black mb-4 text-sm" style={{ color: "#0f172a" }}>Solutions</h4>
            <ul className="space-y-3 text-sm" style={{ color: "#64748b" }}>
              <li>Academic Support</li>
              <li>NERDC Standards</li>
              <li>School Branding</li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-4 text-sm" style={{ color: "#0f172a" }}>Legal</h4>
            <ul className="space-y-3 text-sm" style={{ color: "#64748b" }}>
              <li>Privacy Policy</li>
              <li>Contact Support</li>
            </ul>
          </div>
          <div className="col-span-1 md:col-span-4 border-t pt-8 text-center text-sm" style={{ borderColor: "#e9e3f4", color: "#94a3b8" }}>
            © {new Date().getFullYear()} ParaLearn. Empowering the Sovereign Scholar.
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {demoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black" style={{ color: "#0f172a" }}>Try SabiNote Free</h3>
                <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>No account needed · Note not saved</p>
              </div>
              <button onClick={closeDemo} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" style={{ color: "#64748b" }} />
              </button>
            </div>

            {currentLesson && !generating ? (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl border" style={{ backgroundColor: "#f8f6ff", borderColor: "#e9e3f4" }}>
                  <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: "#641bc4" }}>Topic Generated</p>
                  <p className="font-black text-lg" style={{ color: "#0f172a" }}>{currentLesson.topic}</p>
                  <p className="text-sm mt-1" style={{ color: "#64748b" }}>{currentLesson.subject} · {currentLesson.grade} · {currentLesson.term} Term</p>
                </div>
                <div className="p-4 rounded-xl border text-sm space-y-1.5" style={{ backgroundColor: "#fdfdff", borderColor: "#e9e3f4", color: "#64748b" }}>
                  <p className="font-black text-xs uppercase tracking-wider mb-2" style={{ color: "#0f172a" }}>Preview (Demo Mode)</p>
                  <p>✅ Full lesson note generated successfully</p>
                  <p>✅ Objectives, teaching points & assessments</p>
                  <p className="font-black mt-2" style={{ color: "#641bc4" }}>Sign up to save & access full content</p>
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={closeDemo} className="flex-1 py-3 rounded-xl font-black text-sm hover:bg-slate-100 transition-colors border" style={{ color: "#64748b", borderColor: "#e2e8f0" }}>Close</button>
                  <Link href={routespath.SABINOTE_REGISTER} className="flex-[2] flex items-center justify-center py-3 rounded-xl font-black text-sm text-white text-center" style={{ background: "linear-gradient(135deg, #641bc4, #9747ff)" }}>
                    Create Free Account
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDemo} className="space-y-4">
                {[
                  { label: "Subject", field: "subject", placeholder: "e.g. Mathematics" },
                  { label: "Grade Level", field: "grade", placeholder: "e.g. JSS 1" },
                  { label: "Topic", field: "topic", placeholder: "e.g. Algebraic Equations" },
                ].map(({ label, field, placeholder }) => (
                  <div key={field} className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider" style={{ color: "#641bc4" }}>{label}</label>
                    <input
                      required placeholder={placeholder}
                      value={(demoForm as any)[field]}
                      onChange={(e) => setDemoForm({ ...demoForm, [field]: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border outline-none text-sm font-medium transition-all"
                      style={{ backgroundColor: "#fdfdff", borderColor: "#e9e3f4", color: "#0f172a" }}
                      onFocus={(e) => e.target.style.borderColor = "#641bc4"}
                      onBlur={(e) => e.target.style.borderColor = "#e9e3f4"}
                    />
                  </div>
                ))}
                <div className="pt-2">
                  <button
                    type="submit" disabled={generating}
                    className="w-full py-3.5 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #641bc4, #9747ff)" }}
                  >
                    {generating
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</>
                      : <><Sparkles className="w-4 h-4" />Generate Demo Note</>}
                  </button>
                </div>
                <p className="text-center text-xs font-medium" style={{ color: "#94a3b8" }}>No credits required. Note is not saved.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SabiNoteLanding;
