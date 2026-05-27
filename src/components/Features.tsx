import { FileSpreadsheet, Sparkles, Eye } from "lucide-react";

const CORE_CAPABILITIES = [
  {
    icon: <FileSpreadsheet className="w-5 h-5 text-indigo-400" />,
    tag: "Ats Readiness",
    title: "ATS Layout Optimization",
    description: "Align technical schemas, layout hierarchies, and semantic headers. This guarantees modern applicant systems interpret your honest achievements flawlessly."
  },
  {
    icon: <Sparkles className="w-5 h-5 text-indigo-400" />,
    tag: "Narrative Clarity",
    title: "Professional Story reframing",
    description: "Translate daily developer, designer, or marketer duties into outcomes of collaborative ownership, proactive teamwork, and human impact."
  },
  {
    icon: <Eye className="w-5 h-5 text-indigo-400" />,
    tag: "Recruiter Perception",
    title: "Employer Alignment Review",
    description: "Unlock immediate visual audits from an industry expert perspective. Discover potential communication gaps and present values with ultimate clarity."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-32 bg-black relative border-t border-zinc-900 overflow-hidden text-zinc-100">
      {/* Background radial atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-505 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full font-sans text-xs">
            Core Capability Ecosystem
          </div>
          
          <h2 className="font-display font-medium text-4xl sm:text-5xl text-white tracking-tight leading-tight">
            Articulate your value{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent italic font-serif">
              with absolute confidence.
            </span>
          </h2>
          
          <p className="text-zinc-400 font-sans font-light text-sm sm:text-base leading-relaxed">
            PersonaIQ focuses entirely on bridging the gap between talent and modern opportunity filters. We elevate how you describe your work, helping sustainable teams recognize your genuine potential.
          </p>
        </div>

        {/* 3 Core feature cards - beautifully spaced and visually lightweight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CORE_CAPABILITIES.map((capability, idx) => (
            <div 
              key={idx}
              className="group relative rounded-2xl border border-zinc-900 bg-zinc-950/40 p-8 flex flex-col justify-between hover:border-indigo-500/25 hover:bg-zinc-950/60 transition-all duration-300 overflow-hidden"
            >
              {/* Soft lighting overlay */}
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-gradient-to-tr from-indigo-500/3 to-transparent blur-xl group-hover:from-indigo-500/8 transition-all pointer-events-none" />

              <div className="space-y-6">
                {/* Header aspect */}
                <div className="flex justify-between items-center">
                  <div className="w-11 h-11 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center group-hover:border-indigo-505 group-hover:border-indigo-500/20 transition-all">
                    {capability.icon}
                  </div>
                  <span className="text-[9.5px] uppercase font-sans font-bold tracking-widest text-zinc-500 hover:text-zinc-400 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-900">
                    {capability.tag}
                  </span>
                </div>

                {/* Core title */}
                <h3 className="font-display font-medium text-lg text-white group-hover:text-indigo-200 transition-colors">
                  {capability.title}
                </h3>

                {/* Clear description with beautiful tracking and spacing */}
                <p className="text-zinc-400 text-xs sm:text-sm font-sans font-light leading-relaxed">
                  {capability.description}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
