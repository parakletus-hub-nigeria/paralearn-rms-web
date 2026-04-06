"use client";

import Link from "next/link";
import { routespath } from "@/lib/routepath";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import { generateLesson } from "@/reduxToolKit/lessonGenerator/lessonGeneratorThunks";
import { clearCurrentLesson } from "@/reduxToolKit/lessonGenerator/lessonGeneratorSlice";
import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="bg-sabi-surface font-body text-sabi-on-surface selection:bg-sabi-primary-fixed selection:text-sabi-on-primary-fixed min-h-screen flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .glass-panel { background: rgba(251, 248, 255, 0.8); backdrop-filter: blur(20px); }
        .text-gradient { background: linear-gradient(to right, #004ac6, #2563eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}} />

      {/* TopNavBar */}
      <header className="bg-[#fbf8ff] w-full top-0 z-40 sticky transition-all border-b border-sabi-outline-variant/10">
        <nav className="flex justify-between items-center max-w-7xl mx-auto px-4 md:px-8 h-20">
          <Link href="/" className="text-2xl font-extrabold text-[#004ac6] flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">account_tree</span>
            SabiNote
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <Link className="text-[#004ac6] border-b-2 border-[#004ac6] pb-1 font-headline font-bold tracking-tight text-base transition-colors duration-300" href="#">How it Works</Link>
            <Link className="text-[#434655] font-medium font-headline tracking-tight text-base hover:text-[#2563eb] transition-colors duration-300" href="#">Curriculum Coverage</Link>
            <Link className="text-[#434655] font-medium font-headline tracking-tight text-base hover:text-[#2563eb] transition-colors duration-300" href="#">Features</Link>
          </div>
          <Link href={routespath.SABINOTE_LOGIN}>
            <button className="bg-gradient-to-r from-sabi-primary to-sabi-primary-container text-sabi-on-primary px-6 md:px-8 py-2 md:py-3 rounded-xl font-headline font-bold text-sm md:text-lg scale-95 active:opacity-80 transition-all hover:shadow-lg hover:shadow-sabi-primary/20">
              Log in
            </button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-16 md:pt-24 pb-20 md:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sabi-tertiary-fixed-dim/20 text-sabi-tertiary font-bold text-xs md:text-sm mb-6 md:mb-8">
                <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                Built for the Sovereign Scholar
              </div>
              <h1 className="font-headline font-extrabold text-4xl md:text-5xl lg:text-7xl leading-[1.1] mb-6 md:mb-8 text-sabi-on-surface tracking-tight">
                NERDC-Compliant Lesson Notes <span className="text-gradient">Generated in Seconds</span>
              </h1>
              <p className="text-lg md:text-xl text-sabi-on-surface-variant leading-relaxed mb-8 md:mb-10 max-w-xl">
                Eliminate hours of manual planning. Create highly structured, curriculum-aligned lesson notes tailored for Nigerian schools instantly using SabiNote AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={routespath.SABINOTE_REGISTER}>
                  <button className="w-full sm:w-auto bg-gradient-to-r from-sabi-primary to-sabi-primary-container text-sabi-on-primary px-8 md:px-10 py-4 md:py-5 rounded-xl font-headline font-bold text-lg md:text-xl transition-all hover:scale-[1.02] shadow-xl shadow-sabi-primary/10">
                    Start Generating for Free
                  </button>
                </Link>
                <button onClick={() => setDemoOpen(true)} className="w-full sm:w-auto bg-sabi-surface-container-high text-sabi-on-primary-fixed-variant px-8 md:px-10 py-4 md:py-5 rounded-xl font-headline font-bold text-lg md:text-xl transition-all hover:bg-sabi-surface-container-highest">
                  Try Demo First
                </button>
              </div>
              
              <div className="mt-10 md:mt-12 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex -space-x-3">
                  <img className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-sabi-surface" alt="educator" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgE6R9fAGJzfnjmgyefWSSHiMwzA2vE4WP3b5Cj7iyYYgnj5kD95Zpjq7fFFGLn-d9D2piOZclPgZ15zlDPR8FtWPk5ljBo2CCQDarPG3sW-cHiBDhEUpDDii3f0aoMfnxwDDTUFXhcumeirbyrR6l9n7mFHSIvn6UlxQsemKmzqXX6gVCsmDHXMEc-JhGRiD5jP9mwmpExz8n5od5pEgJjP9kVlkNG6ksktqoGimGVdopijc6fcw_TeFGyaBHaezJ8ZA15AtrsUGY"/>
                  <img className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-sabi-surface" alt="educator" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCONcZ7idDdJaU6WVrcxsLg7TcpyiX2skjcRYdQteQINPafwuNeEODWGUE41BfypYeuumseDIFuIHLdqq4EcVBQRpJgpqwyX0PkzvNi6a8VfvBWImzjZzVo8GvlkfGQDaM6OMoYqq7K34Mrdw4mEkXnDLGd-m8NhewjzahMmdezIY8SeYpMiS6L3B67UN-TrvLEnN9pHEMA8s0VvFnD1jggbdDQKQZ9YJG4kl5Hb1OQvTUnzo3rUgyUAtw6n05qJsZIkE9C8jvPtWae"/>
                  <img className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-sabi-surface" alt="educator" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMWa1_l52grNxbiqbh11cIvS9KFuHuw0vsZU6GPbxxazyXcEoky-C-dplWTc7cvtY9urGUx24-eSHHytFPpbFOYKG16NMPFqHjKNBKfO0kY6ndExiFaRJTCPAHmwejHt5ybKOD-1eO6dhipOU6vXjAEdWNmSVf6NByvnT8mk60Baq9KT0Vkbv_9lswKOutwOJ0NhrrpayaKP2Orep5SrpoBB5biS6JnLx_LW5_iP2XSWSG5BGUu3ucUb76wmKBDjbGkRjpTvxtz12C"/>
                </div>
                <p className="text-sabi-on-surface-variant font-medium text-sm md:text-base">Join 1,200+ Educators transforming their classrooms</p>
              </div>
            </div>

            {/* Editor Mockup */}
            <div className="relative h-[400px] lg:h-[600px] flex items-center mt-10 lg:mt-0 hidden sm:flex">
              <div className="absolute inset-0 bg-gradient-to-tr from-sabi-primary/10 via-sabi-secondary/5 to-transparent rounded-[40px] -rotate-3 translate-x-4 translate-y-4"></div>
              <div className="w-full h-full lg:h-auto bg-sabi-surface-container-lowest rounded-xl shadow-2xl border border-sabi-outline-variant/10 p-4 md:p-8 relative overflow-hidden">
                <div className="glass-panel absolute top-4 md:top-6 left-4 md:left-6 right-4 md:right-6 p-4 rounded-lg flex items-center gap-4 border border-white/40 shadow-sm z-20">
                  <span className="material-symbols-outlined text-sabi-primary" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                  <span className="text-sabi-on-surface-variant font-medium italic text-sm md:text-base line-clamp-1">Generating Mathematics: Quadratic Equations...</span>
                  <div className="ml-auto flex gap-1">
                    <div className="w-1 h-4 bg-sabi-primary/20 rounded-full animate-pulse"></div>
                    <div className="w-1 h-4 bg-sabi-primary/40 rounded-full animate-pulse delay-75"></div>
                    <div className="w-1 h-4 bg-sabi-primary/60 rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
                <div className="mt-20 space-y-6 md:space-y-8">
                  <div className="space-y-3">
                    <h4 className="font-headline font-bold text-sabi-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">target</span> Objectives
                    </h4>
                    <div className="h-4 bg-sabi-surface-container-low rounded-full w-full"></div>
                    <div className="h-4 bg-sabi-surface-container-low rounded-full w-[85%]"></div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-headline font-bold text-sabi-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">menu_book</span> Introduction
                    </h4>
                    <div className="h-4 bg-sabi-surface-container-low rounded-full w-[95%]"></div>
                    <div className="h-4 bg-sabi-surface-container-low rounded-full w-[90%]"></div>
                    <div className="h-4 bg-sabi-surface-container-low rounded-full w-[40%]"></div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-headline font-bold text-sabi-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">description</span> Body
                    </h4>
                    <div className="p-4 md:p-6 bg-sabi-surface rounded-lg border border-sabi-outline-variant/10 space-y-4">
                      <div className="h-4 bg-sabi-surface-container-highest/50 rounded-full w-full"></div>
                      <div className="h-4 bg-sabi-surface-container-highest/50 rounded-full w-[70%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-sabi-primary/5 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/4 -right-24 w-64 h-64 bg-sabi-secondary/5 rounded-full blur-[80px]"></div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-16 md:py-24 bg-sabi-surface-container-low relative">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="mb-12 md:mb-16">
              <h2 className="font-headline font-extrabold text-3xl md:text-4xl mb-4 text-sabi-on-surface">Designed for the Nigerian Classroom</h2>
              <p className="text-sabi-on-surface-variant text-base md:text-lg max-w-2xl">High-precision tools tailored for the modern educator, combining NERDC standards with world-class AI capability.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:auto-rows-[280px]">
              <div className="md:col-span-8 bg-sabi-surface-container-lowest p-8 md:p-10 rounded-xl flex flex-col justify-between group overflow-hidden relative">
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-sabi-tertiary/10 text-sabi-tertiary flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>verified_user</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-headline font-bold mb-4">100% NERDC Compliant</h3>
                  <p className="text-sabi-on-surface-variant text-base md:text-lg max-w-md">Our AI is meticulously trained on the Nigerian National Curriculum, ensuring every lesson note meets ministry standards instantly.</p>
                </div>
                <div className="absolute -right-8 -bottom-8 w-1/3 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                  <span className="material-symbols-outlined text-[10rem] md:text-[12rem]">account_tree</span>
                </div>
              </div>
              
              <div className="md:col-span-4 bg-gradient-to-br from-sabi-primary to-sabi-secondary p-8 md:p-10 rounded-xl flex flex-col justify-between text-sabi-on-primary">
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-headline font-bold mb-2">Save Hours of Prep</h3>
                  <p className="text-sabi-on-primary/80 text-sm md:text-base">Generate a comprehensive, ready-to-use lesson note in under a minute.</p>
                </div>
              </div>
              
              <div className="md:col-span-4 bg-sabi-surface-container-highest p-8 md:p-10 rounded-xl flex flex-col justify-between group">
                <div className="w-12 h-12 rounded-lg bg-sabi-primary/10 text-sabi-primary flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>psychology</span>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-headline font-bold mb-2">Intelligent Adaptation</h3>
                  <p className="text-sabi-on-surface-variant text-sm md:text-base">Modify sections to match your specific teaching style with a single click.</p>
                </div>
              </div>
              
              <div className="md:col-span-8 bg-sabi-surface-container-lowest p-8 md:p-10 rounded-xl flex flex-col md:flex-row items-center gap-8 md:gap-12 group">
                <div className="flex-1 text-center md:text-left">
                  <div className="w-12 h-12 rounded-lg bg-sabi-secondary/10 text-sabi-secondary flex items-center justify-center mb-6 mx-auto md:mx-0">
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>support_agent</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-headline font-bold mb-4">Your Teaching Assistant, Available 24/7</h3>
                  <p className="text-sabi-on-surface-variant text-base md:text-lg">Never face planning burnout again. SabiNote is ready whenever inspiration—or a deadline—strikes.</p>
                </div>
                <div className="hidden lg:flex w-48 h-48 bg-sabi-surface-container-low rounded-full items-center justify-center border-8 border-sabi-surface-container-lowest shrink-0">
                  <span className="material-symbols-outlined text-6xl text-sabi-primary/40 group-hover:text-sabi-primary transition-colors">auto_mode</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sovereign Scholar Trust Section */}
        <section className="py-16 md:py-24 bg-sabi-surface border-t-0">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="w-full lg:w-1/2 justify-center rounded-xl overflow-hidden shadow-2xl relative">
              <img className="w-full h-[400px] md:h-[500px] object-cover" alt="professor" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJZozms85nChJj6qV6EnL1Xa6dLUMVdwAIlMJi9kpzrqVWjgscGdcseufoZH7yjvgpGfyJTDOOg0zD_qdRj6sxlQt71gGnNKmyC5EqqVwHP-PTjr4QGnIudIbF29w1ildSH6-Zez85aGQEpCXYZqMmUJoTUfIUVWjK80UVNVB9iI9tDCjvJiCOnox3DN11yoYf0po84r17vpW405cYI4k70DQdSAhS7eZ-GMElUyQfyahE3pRhxNIvEmwrHIdfOzvrQ4z7uyuCOi2W"/>
              <div className="absolute inset-0 bg-gradient-to-t from-sabi-on-surface/80 to-transparent"></div>
              <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8 right-6 md:right-8 text-sabi-on-primary">
                <div className="text-sabi-tertiary-fixed-dim font-bold tracking-widest uppercase text-xs mb-2">ParaLearn Philosophy</div>
                <p className="text-lg md:text-xl font-headline font-semibold">"Technology should empower the educator, not replace them. SabiNote is the quill for the modern sovereign scholar."</p>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 space-y-6 md:space-y-8">
              <h2 className="font-headline font-extrabold text-3xl md:text-4xl leading-tight">Built for the <span className="text-sabi-primary">Sovereign Scholar</span></h2>
              <p className="text-base md:text-lg text-sabi-on-surface-variant leading-relaxed">
                In an era of generic AI, SabiNote stands apart. We believe in the sovereignty of the individual educator. Our tools are designed to amplify your expertise, allowing you to focus on the human connection of teaching while we handle the structural rigor.
              </p>
              <ul className="space-y-4">
                {[
                  "Data privacy that respects academic intellectual property.",
                  "Curated datasets excluding non-compliant pedagogical frameworks.",
                  "Exportable formats ready for school administration portals."
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-sabi-tertiary mt-1 shrink-0">check_circle</span>
                    <span className="text-sabi-on-surface font-medium text-sm md:text-base">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-20 px-4 md:px-8">
          <div className="max-w-5xl mx-auto rounded-[32px] bg-sabi-primary overflow-hidden relative py-16 md:py-20 px-6 md:px-12 text-center text-sabi-on-primary">
            <div className="absolute top-0 right-0 p-8 md:p-12 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[15rem] md:text-[20rem]">auto_awesome</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-headline font-black mb-6 md:mb-8 relative z-10">Ready to reclaim your time?</h2>
            <p className="text-lg md:text-xl text-sabi-primary-fixed mb-8 md:mb-12 max-w-2xl mx-auto relative z-10">Join thousands of Nigerian educators using SabiNote to deliver excellence in the classroom without the burnout.</p>
            <div className="flex justify-center gap-4 relative z-10">
              <Link href={routespath.SABINOTE_REGISTER}>
                <button className="bg-sabi-surface text-sabi-primary px-10 md:px-12 py-4 md:py-5 rounded-full font-headline font-bold text-lg md:text-xl hover:scale-105 transition-transform shadow-xl">
                  Get Started Now
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Demo Modal overlay */}
      {demoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-headline">Try SabiNote Free</h3>
                <p className="text-sm text-slate-500 mt-0.5">No account needed · Note not saved</p>
              </div>
              <button onClick={closeDemo} className="p-2 hover:bg-slate-100 rounded-xl transition-colors shrink-0">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {currentLesson && !generating ? (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-sabi-surface-container-highest border border-sabi-primary-fixed">
                  <p className="text-xs font-bold text-sabi-primary uppercase mb-2 tracking-wider">Topic Generated</p>
                  <p className="font-bold text-sabi-on-surface text-lg font-headline">{currentLesson.topic}</p>
                  <p className="text-sm text-sabi-on-surface-variant mt-1">{currentLesson.subject} · {currentLesson.grade} · {currentLesson.term} Term</p>
                </div>
                <div className="p-4 rounded-xl bg-sabi-surface border border-sabi-outline-variant/30 text-sm text-sabi-on-surface-variant space-y-1.5">
                  <p className="font-bold text-sabi-on-surface text-xs uppercase tracking-wider mb-2">Preview (Demo Mode)</p>
                  <p>✅ Full lesson note generated successfully</p>
                  <p>✅ Objectives, teaching points & assessments</p>
                  <p className="text-sabi-primary font-bold mt-2">Sign up to save & access full content</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={closeDemo} className="flex-1 py-3.5 bg-sabi-outline-variant/10 text-sabi-on-surface-variant rounded-xl font-bold text-sm hover:bg-sabi-outline-variant/20 transition-colors">Close</button>
                  <Link href={routespath.SABINOTE_REGISTER} className="flex-[2]">
                    <Button className="w-full py-3.5 h-auto bg-sabi-primary hover:bg-sabi-primary/90 text-white rounded-xl font-bold text-sm">Create Free Account</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDemo} className="space-y-5">
                {[
                  { label: "Subject", field: "subject", placeholder: "e.g. Mathematics" },
                  { label: "Grade Level", field: "grade", placeholder: "e.g. JSS 1" },
                  { label: "Topic", field: "topic", placeholder: "e.g. Algebraic Equations" },
                ].map(({ label, field, placeholder }) => (
                  <div key={field} className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-sabi-outline">{label}</label>
                    <input required placeholder={placeholder}
                      value={(demoForm as any)[field]}
                      onChange={(e) => setDemoForm({ ...demoForm, [field]: e.target.value })}
                      className="w-full px-4 py-3 bg-sabi-surface border border-sabi-outline-variant/30 focus:border-sabi-primary focus:ring-1 focus:ring-sabi-primary rounded-xl outline-none transition-all text-sm font-medium text-sabi-on-surface placeholder:text-sabi-outline-variant"
                    />
                  </div>
                ))}
                <div className="pt-2">
                  <Button type="submit" disabled={generating}
                    className="w-full py-6 bg-gradient-to-r from-sabi-primary to-sabi-primary-container hover:from-sabi-primary/90 hover:to-sabi-primary-container/90 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                    {generating
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</>
                      : <><Sparkles className="w-4 h-4" />Generate Demo Note</>}
                  </Button>
                </div>
                <p className="text-center text-xs text-sabi-outline font-medium">No credits required. Note is not saved.</p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-sabi-surface-container-low w-full py-12 md:py-16 mt-auto border-t border-sabi-outline-variant/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 max-w-7xl mx-auto px-4 md:px-8">
          <div className="col-span-1 md:col-span-1">
            <div className="font-headline font-black text-sabi-primary text-2xl mb-4">SabiNote</div>
            <p className="font-body text-sm text-sabi-on-surface-variant leading-relaxed">Empowering the Sovereign Scholar with AI-driven academic tools.</p>
          </div>
          <div>
            <h4 className="font-headline font-bold text-sabi-on-surface mb-4">Solutions</h4>
            <ul className="space-y-3">
              <li><Link className="font-body text-sm text-sabi-on-surface-variant hover:text-sabi-primary transition-all" href="#">Academic Support</Link></li>
              <li><Link className="font-body text-sm text-sabi-on-surface-variant hover:text-sabi-primary transition-all" href="#">NERDC Standards</Link></li>
              <li><Link className="font-body text-sm text-sabi-on-surface-variant hover:text-sabi-primary transition-all" href="#">School Branding</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold text-sabi-on-surface mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link className="font-body text-sm text-sabi-on-surface-variant hover:text-sabi-primary transition-all" href="#">Privacy Policy</Link></li>
              <li><Link className="font-body text-sm text-sabi-on-surface-variant hover:text-sabi-primary transition-all" href="#">Contact Support</Link></li>
            </ul>
          </div>
          <div className="col-span-1 md:col-span-4 border-t border-sabi-outline-variant/20 pt-8 mt-4 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-body text-sm text-sabi-on-surface-variant">© 2024 ParaLearn. Empowering the Sovereign Scholar.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SabiNoteLanding;
