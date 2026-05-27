import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";

interface CtaSectionProps {
  onCtaClick: () => void;
}

export default function CtaSection({ onCtaClick }: CtaSectionProps) {
  return (
    <section className="py-24 bg-black relative border-t border-zinc-900 overflow-hidden text-zinc-100">
      {/* Soft spotlight backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Rounded Glass Box Wrapper */}
        <div className="relative rounded-2xl border border-white/5 bg-zinc-950 p-8 sm:p-12 text-center overflow-hidden shadow-2xl">
          
          {/* Subtle gradient border line */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-sans text-xs w-fit mx-auto">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Start Your Career Alignment
            </div>

            <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
              Honest representation. Secure{" "}
              <span className="bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-400 bg-clip-text text-transparent italic font-serif">
                career advancement.
              </span>
            </h2>

            <p className="text-zinc-400 font-sans font-light text-sm sm:text-base leading-relaxed">
              Unlock your premium clarity index, align your professional profile with employer criteria, and build confidence before stepping into potential-growth interviews.
            </p>

            {/* Main Action trigger */}
            <div className="pt-6">
              <button
                type="button"
                onClick={onCtaClick}
                className="px-8 py-4 font-semibold text-white uppercase text-xs tracking-wider rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 group mx-auto cursor-pointer"
              >
                Analyze My Profile
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-xl mx-auto text-[10px] font-sans text-zinc-500 uppercase tracking-wider font-semibold">
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Layout Compatible</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>LinkedIn Aligned</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>SDG 8 Focus</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Guided Feedback</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
