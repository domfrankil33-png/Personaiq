import { Sparkles, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-zinc-400 border-t border-zinc-900 py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
        
        {/* Dynamic upper grid links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 pb-12 border-b border-zinc-900">
          
          {/* Column 1: Brand details */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Persona<span className="text-indigo-400">IQ</span>
              </span>
            </div>
            
            <p className="text-xs text-zinc-500 font-light leading-relaxed max-w-xs">
              PersonaIQ is an AI-powered career positioning platform. We help young professionals and students refine their professional representation to align with sustainable, high-quality job opportunities.
            </p>
          </div>

          {/* Column 2: Engine */}
          <div className="space-y-3">
            <h4 className="text-white text-xs uppercase tracking-wider font-semibold">Analysis Suite</h4>
            <ul className="space-y-2 text-xs font-light">
              <li><a href="#showcase" className="hover:text-white transition-colors">Profile Readiness</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">ATS Clarity Index</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">LinkedIn Visibility</a></li>
              <li><a href="#simulation" className="hover:text-white transition-colors">6-Second Timeline</a></li>
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div className="space-y-3">
            <h4 className="text-white text-xs uppercase tracking-wider font-semibold">Platform</h4>
            <ul className="space-y-2 text-xs font-light">
              <li><a href="#pricing" className="hover:text-white transition-colors">Plan Options</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Capabilities Map</a></li>
              <li><a href="#transformation" className="hover:text-white transition-colors">Transformations</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors">Success Stories</a></li>
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div className="space-y-3">
            <h4 className="text-white text-xs uppercase tracking-wider font-semibold">Resources</h4>
            <ul className="space-y-2 text-xs font-light">
              <li><span className="text-zinc-650 cursor-not-allowed text-zinc-600 select-none">Clean Layouts</span></li>
              <li><span className="text-zinc-650 cursor-not-allowed text-zinc-600 select-none">AI Profile Tips</span></li>
              <li><span className="text-zinc-650 cursor-not-allowed text-zinc-600 select-none">Fair Wage Guides</span></li>
              <li><span className="text-zinc-650 cursor-not-allowed text-zinc-600 select-none">Interview Tips</span></li>
            </ul>
          </div>

          {/* Column 5: Compliance */}
          <div className="space-y-3">
            <h4 className="text-white text-xs uppercase tracking-wider font-semibold">Compliance</h4>
            <ul className="space-y-2 text-xs font-light">
              <li><span className="text-zinc-600">Privacy Policy</span></li>
              <li><span className="text-zinc-600">Terms of Use</span></li>
              <li><span className="text-zinc-600">Data Protection</span></li>
              <li><span className="text-zinc-600">Employment Rights</span></li>
            </ul>
          </div>

        </div>

        {/* Legal & copyright footer block */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <div>
            &copy; {currentYear} PersonaIQ Inc. Supporting United Nations SDG 8 for Decent Work and Economic Growth.
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-2xs uppercase tracking-wider font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Aligned with global indicators
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
