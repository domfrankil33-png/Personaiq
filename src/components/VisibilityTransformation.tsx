import { useState, useEffect } from "react";
import { Sparkles, CheckCircle, Clock, Eye, ShieldCheck, XCircle, ArrowRight } from "lucide-react";

const TRANSFORMATION_STEPS = [
  {
    seconds: "1-2s",
    phase: "First Glance: Headline Presence",
    insight: "Does your narrative state your actual impact or just list active tasks?",
    original: "Software developer at mid-size retail company looking for next challenge.",
    upgraded: "Platform Engineer | Collaborative Tech Lead & Distributed Systems Builder",
    critique: "A generic title reduces immediate clarity and leads to typical task-executor classification.",
    benefit: "An outcome-focused anchor establishes trust and signals leadership readiness."
  },
  {
    seconds: "3-4s",
    phase: "Active Ownership & Achievements",
    insight: "Do you quantify team value or focus purely on historic duties?",
    original: "Responsible for writing unit tests, maintaining codebases, and implementing frontend screens.",
    upgraded: "Spearheaded the performance optimization of core APIs supporting 12M+ monthly queries, improving response speeds by 42%.",
    critique: "Unquantified list of responsibilities obscures your actual scale and accountability.",
    benefit: "Direct, metric-driven achievements prove you take ownership of real product outcomes."
  },
  {
    seconds: "5-6s",
    phase: "Professional Narrative Harmony",
    insight: "Does your overall summary showcase team growth or isolated tasks?",
    original: "Have 5 years of experience coding. Team coordination support.",
    upgraded: "Championed collaborative code reviews, co-led junior engineering sprints, and streamlined delivery timelines.",
    critique: "Vague support mentions leave reviewers guessing about your collaborative value.",
    benefit: "Explicitly framed partnership highlights human-ready leadership and cultural fit."
  }
];

export default function VisibilityTransformation() {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-play the 6-second interaction carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % TRANSFORMATION_STEPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const current = TRANSFORMATION_STEPS[activeStep];

  return (
    <section id="transformation" className="py-32 bg-zinc-950 relative border-t border-zinc-900 overflow-hidden text-zinc-100">
      {/* Soft cinematic spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-indigo-500/5 blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-505 border-indigo-500/20 text-indigo-300 font-sans text-xs">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            6-Second Rule Simulation
          </div>
          
          <h2 className="font-display font-medium text-4xl sm:text-5xl text-white tracking-tight leading-tight">
            Visibility{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent italic font-serif">
              Transformation
            </span>
          </h2>
          
          <p className="text-zinc-400 font-sans font-light text-sm sm:text-base leading-relaxed">
            See exactly how recruiter perception shifts in real-time. This interactive simulation demonstrates how simple structural adjustments turn task descriptions into high-impact career assets.
          </p>
        </div>

        {/* Unified Transformation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left Column: Timeline Selectors (Cognitive Clarity) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="text-[11px] font-sans text-zinc-500 uppercase tracking-widest font-semibold pb-1 border-b border-white/5 flex justify-between items-center">
                <span>Evaluation Timeline</span>
                <span className="text-indigo-400 font-bold">Chronos Mode ACTV</span>
              </div>

              {TRANSFORMATION_STEPS.map((step, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 cursor-pointer relative overflow-hidden ${
                    activeStep === idx 
                      ? "bg-zinc-900 border-indigo-500/30 text-white shadow-xl shadow-indigo-500/5 -translate-y-0.5" 
                      : "bg-zinc-950/40 border-zinc-900 text-zinc-400 opacity-60 hover:opacity-100 hover:bg-zinc-900/10"
                  }`}
                >
                  {activeStep === idx && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-blue-500 to-indigo-500" />
                  )}

                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-xs transition-all duration-300 shrink-0 ${
                    activeStep === idx 
                      ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                      : "bg-zinc-900 text-zinc-500"
                  }`}>
                    {step.seconds}
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className={`font-display font-medium text-sm block ${activeStep === idx ? "text-white font-semibold" : "text-zinc-400"}`}>
                      {step.phase}
                    </span>
                    <span className="text-zinc-500 font-sans text-[10px] block font-light">
                      {step.insight}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Sim Indicator */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/10 to-indigo-950/10 border border-indigo-500/10 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
              <p className="text-[11px] font-sans text-zinc-400 font-light leading-relaxed">
                <strong className="text-indigo-300 font-semibold">The 6-Second Reality:</strong> Recruiter scanning dynamics prioritize structural hierarchy over massive paragraphs. Clean outcomes build immediate trust.
              </p>
            </div>
          </div>

          {/* Right Column: Contrast Card (Sarah Jenkins Transformation Case) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Split Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch flex-1">
              
              {/* Draft Format Card (Negative Aspect) */}
              <div className="rounded-2xl border border-zinc-900/80 bg-zinc-950/40 p-6 flex flex-col justify-between relative overflow-hidden group hover:border-zinc-800 transition-colors duration-300">
                <div className="space-y-5">
                  <div className="flex justify-between items-center text-[10px] uppercase font-sans tracking-wider font-semibold text-zinc-500">
                    <span>Draft Representation</span>
                    <span className="flex items-center gap-1 text-red-400/80">
                      <XCircle className="w-3 h-3 text-red-400" />
                      Task Focus
                    </span>
                  </div>

                  <p className="text-zinc-400 text-xs font-sans leading-relaxed italic border-l border-zinc-900 pl-3">
                    "{current.original}"
                  </p>

                  <div className="space-y-1 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-905 border-zinc-900">
                    <span className="text-[9.5px] uppercase font-sans text-zinc-500 font-medium tracking-wider">Perception Critique</span>
                    <p className="text-zinc-400 text-xs font-light leading-relaxed">
                      "{current.critique}"
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-900/60 flex items-center justify-between text-[10px] text-zinc-550 font-sans">
                  <span>ATS Draft Scoring</span>
                  <span className="font-semibold text-zinc-400">Low Compatibility</span>
                </div>
              </div>

              {/* Upgraded Format Card (Premium Positive Aspect) */}
              <div className="rounded-2xl border border-indigo-500/15 bg-zinc-950/60 p-6 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/25 transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-indigo-500/[0.03] to-transparent pointer-events-none" />
                
                <div className="space-y-5 relative z-10">
                  <div className="flex justify-between items-center text-[10px] uppercase font-sans tracking-wider font-semibold text-indigo-300">
                    <span>Reframed Impact</span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Impact Focus
                    </span>
                  </div>

                  <p className="text-indigo-100 text-xs font-sans leading-relaxed font-medium pl-3 border-l border-indigo-500/40">
                    "{current.upgraded}"
                  </p>

                  <div className="space-y-1 bg-indigo-950/10 p-3.5 rounded-xl border border-indigo-500/10 backdrop-blur-sm">
                    <span className="text-[9.5px] uppercase font-sans text-indigo-350 font-medium tracking-wider">Hiring Partner Review</span>
                    <p className="text-indigo-200 text-xs font-light leading-relaxed">
                      "{current.benefit}"
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-indigo-350 font-sans relative z-10">
                  <span>ATS Enhanced Score</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    Optimal Fit
                  </span>
                </div>
              </div>

            </div>

            {/* Interactive watermark / callout */}
            <div className="text-[10.5px] font-sans text-zinc-500 bg-zinc-900/10 p-3 rounded-xl border border-white/5 flex justify-between items-center">
              <span>Interactive Profile: <strong>Sarah Jenkins</strong> (Platform Engineer upgrade)</span>
              <span className="text-indigo-400 flex items-center gap-1">
                Explore in Playground <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
