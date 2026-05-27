import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle, Compass, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AnalysisResult } from "../types";

interface HeroProps {
  onCtaClick: () => void;
  activeResult: AnalysisResult | null;
}

interface SlideItem {
  image: string;
  leftLabel: string;
  rightLabel: string;
  recruiterPerception: string;
  tabText: {
    recruiter: string;
    ats: string;
    growth: string;
  };
  gender: "male" | "female" | "neutral";
  field: "developer" | "designer" | "marketing" | "management" | "general";
  level: "entry" | "experienced" | "senior";
  roleName: string;
  scoreBoost: number;
}

const SLIDES: SlideItem[] = [
  {
    image: "/src/assets/images/female_developer_split_1779635078522.png",
    leftLabel: "Uncertain Junior",
    rightLabel: "Systems Architect",
    recruiterPerception: "Technical ownership maps directly to modern engineering velocity metrics. Removing task list descriptions increases profile trust and strategic visibility.",
    tabText: {
      recruiter: "Constructing scalable system narratives instead of passive code reviews lifts recruiter perception.",
      ats: "Standardized technical frameworks optimize parsing density for core engineering profiles.",
      growth: "Positioning leadership milestones moves technical profiles into engineering sponsorship tiers."
    },
    gender: "female",
    field: "developer",
    level: "entry",
    roleName: "Technical Systems Engineer",
    scoreBoost: 22
  },
  {
    image: "/src/assets/images/male_leader_split_1779635118718.png",
    leftLabel: "Task Operator",
    rightLabel: "Growth Director",
    recruiterPerception: "Relational metrics elevate leadership presence for enterprise recruiters, re-anchoring historical tasks into active business team growth sponsorship.",
    tabText: {
      recruiter: "Highlighting collaborative velocity guides recruiter assessment toward active team leadership.",
      ats: "Focusing content on delivery metrics secures high relevance within enterprise applicant trackers.",
      growth: "Re-framing passive duties as active commercial expansion yields strong career acceleration."
    },
    gender: "male",
    field: "marketing",
    level: "senior",
    roleName: "Growth Strategy Partner",
    scoreBoost: 18
  },
  {
    image: "/src/assets/images/female_designer_split_1779635098841.png",
    leftLabel: "Aesthetic Executor",
    rightLabel: "Lead Architect",
    recruiterPerception: "Strategic design summaries elevate creative oversight and cross-functional leadership, replacing task-centric listings with product ownership metrics.",
    tabText: {
      recruiter: "Shifting focus from tool listings to visual product strategies builds instant design credibility.",
      ats: "Structured interaction layouts establish perfect parsing alignment on core creative platforms.",
      growth: "Converting interface updates into measurable product metrics reveals true leadership capacity."
    },
    gender: "female",
    field: "designer",
    level: "experienced",
    roleName: "Product Interface Designer",
    scoreBoost: 24
  },
  {
    image: "/src/assets/images/professional_split_portrait_1779515079465.png",
    leftLabel: "Executor Draft",
    rightLabel: "Strategic Sponsor",
    recruiterPerception: "Presenting accomplishments with quiet confidence removes immediate reading fatigue, elevating your perception from local 'Executor' to 'Strategic Sponsor'.",
    tabText: {
      recruiter: "Expresses dependable technical capabilities, prioritizing team contribution metrics and system deliverables.",
      ats: "Unlocks high search density filters on modern tech recruiter grids and parser parameters.",
      growth: "Elevates role accountability from simple task contributor to autonomous product owner."
    },
    gender: "neutral",
    field: "general",
    level: "experienced",
    roleName: "Strategic Developer Partner",
    scoreBoost: 16
  }
];

export default function Hero({ onCtaClick, activeResult }: HeroProps) {
  const [activeMockTab, setActiveMockTab] = useState<"recruiter" | "ats" | "growth">("recruiter");
  const [sliderVal, setSliderVal] = useState<number>(50);
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const autoRotateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Manage auto-rotation of slides
  useEffect(() => {
    if (activeResult) {
      if (autoRotateTimerRef.current) {
        clearInterval(autoRotateTimerRef.current);
      }
      return;
    }

    autoRotateTimerRef.current = setInterval(() => {
      setCurrentSlideIdx((prev) => (prev + 1) % SLIDES.length);
    }, 4500);

    return () => {
      if (autoRotateTimerRef.current) {
        clearInterval(autoRotateTimerRef.current);
      }
    };
  }, [activeResult]);

  // Handle manual interaction tracking
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderVal(Number(e.target.value));
    setHasInteracted(true);
  };

  // Extract variables depending on selection state
  const isAnalyzed = !!activeResult;
  
  // Choose or compute active slide asset
  let currentSlide: SlideItem;
  if (isAnalyzed && activeResult) {
    // Map dynamically based on parsed factors
    const gender = activeResult.detectedGender || "neutral";
    const field = activeResult.detectedField || "general";
    const level = activeResult.detectedLevel || "experienced";
    const roleName = activeResult.detectedRoleName || "Impact Aligned Professional";

    // Matching locator
    let matchedImg = "/src/assets/images/professional_split_portrait_1779515079465.png";
    let leftLabel = "Draft Form";
    let rightLabel = "Reframed Mastery";

    if (gender === "female") {
      if (field === "designer") {
        matchedImg = "/src/assets/images/female_designer_split_1779635098841.png";
        leftLabel = "Casual Creator";
        rightLabel = "Product Designer";
      } else {
        matchedImg = "/src/assets/images/female_developer_split_1779635078522.png";
        leftLabel = "Task Assistant";
        rightLabel = "Systems Builder";
      }
    } else if (gender === "male") {
      if (field === "marketing" || field === "management" || field === "general") {
        matchedImg = "/src/assets/images/male_leader_split_1779635118718.png";
        leftLabel = "Task operator";
        rightLabel = "Tactical Strategist";
      } else {
        matchedImg = "/src/assets/images/professional_split_portrait_1779515079465.png";
        leftLabel = "Local Executor";
        rightLabel = "Engineering Lead";
      }
    } else {
      // neutral defaults
      if (field === "designer") {
        matchedImg = "/src/assets/images/female_designer_split_1779635098841.png";
        leftLabel = "Aesthetic Executor";
        rightLabel = "Interface Architect";
      } else if (field === "marketing" || field === "management") {
        matchedImg = "/src/assets/images/male_leader_split_1779635118718.png";
        leftLabel = "Task Operator";
        rightLabel = "Core Manager";
      } else {
        matchedImg = "/src/assets/images/female_developer_split_1779635078522.png";
        leftLabel = "Standard Dev";
        rightLabel = "Technical Lead";
      }
    }

    currentSlide = {
      image: matchedImg,
      leftLabel: leftLabel,
      rightLabel: rightLabel,
      recruiterPerception: activeResult.recruiterPerception,
      tabText: {
        recruiter: activeResult.recruiterPerception,
        ats: "Parsing integrity secures standard index metrics, placing you in top recruiter candidate buckets cleanly.",
        growth: activeResult.perceptionGap
      },
      gender: gender as any,
      field: field as any,
      level: level as any,
      roleName: roleName,
      scoreBoost: 20
    };
  } else {
    currentSlide = SLIDES[currentSlideIdx];
  }

  // Active resonance score
  const baseScore = isAnalyzed && activeResult ? activeResult.brandAuthorityScore : 68;
  const computedResonance = Math.min(100, Math.max(10, baseScore - 12 + Math.floor(sliderVal / 4.2)));

  // Specific dynamic outcomes text based on tab selection
  let activeTabText = "";
  if (activeMockTab === "recruiter") {
    activeTabText = currentSlide.tabText.recruiter;
  } else if (activeMockTab === "ats") {
    activeTabText = currentSlide.tabText.ats;
  } else {
    activeTabText = currentSlide.tabText.growth;
  }

  return (
    <section id="root" className="relative pt-32 pb-24 md:pt-40 md:pb-36 overflow-hidden bg-black text-white">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-indigo-500/5 blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff01_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none opacity-80" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
          
          {/* Left: Text and Positioning Copy */}
          <div className="lg:col-span-5 text-left space-y-8 pr-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-white/5 text-zinc-400 font-sans text-xs w-fit">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] font-medium tracking-wide">
                {isAnalyzed ? "Verified Transformation Model" : "Narrative Intelligence Engine"}
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="font-display font-medium text-4xl sm:text-5xl lg:text-5xl xl:text-6xl tracking-tight leading-[1.1] text-white">
                Translate potential <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent italic font-serif font-light">
                  into opportunity.
                </span>
              </h1>
              
              <p className="text-zinc-400 text-[14px] sm:text-[15px] leading-relaxed font-sans max-w-sm font-light">
                Present your potential with quiet confidence. PersonaIQ aligns your raw experience narratives into metrics-driven stories that premium hiring teams recognize and trust.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={onCtaClick}
                className="px-6 py-3 rounded-full font-medium text-white text-xs uppercase tracking-wider bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:brightness-110 active:scale-[0.98] transition-all font-sans shadow-[0_4px_20px_rgba(99,102,241,0.25)] border border-indigo-400/20 flex items-center justify-center gap-2 group cursor-pointer"
              >
                {isAnalyzed ? "Analyze New Profile" : "Transform Draft Now"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#showcase"
                className="px-6 py-3 rounded-full font-medium text-zinc-300 text-xs uppercase tracking-wider bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.01] border border-white/10 hover:border-white/20 hover:text-white transition-all text-center flex items-center justify-center font-sans"
              >
                Explore Benchmarks
              </a>
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center gap-2 font-sans text-[11px] text-zinc-500">
              <CheckCircle className="w-4 h-4 text-indigo-400/60 shrink-0" />
              <span>Aligned with Sustainable Employability Standards (UN SDG 8)</span>
            </div>
          </div>

          {/* Right: Embedded Interactive Split Portrait Card */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-3xl border border-white/15 bg-zinc-950/80 shadow-[0_0_50px_rgba(99,102,241,0.06)] overflow-hidden backdrop-blur-md transition-all duration-300 p-6 sm:p-8 flex flex-col gap-6">
              
              {/* TOP: Identity banner mapping context */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 text-left">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-sans block">
                    {isAnalyzed ? "Identity Aligned Module" : "Profile Case Study"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white text-sm font-semibold tracking-tight">{currentSlide.roleName}</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 font-mono text-[9px] uppercase font-bold">
                      {currentSlide.level}
                    </span>
                  </div>
                </div>
                {!isAnalyzed && (
                  <div className="px-2 py-1 rounded bg-zinc-900 border border-white/5 text-zinc-500 text-[9px] font-mono tracking-wider uppercase animate-pulse">
                    Live Rotation
                  </div>
                )}
              </div>

              {/* Navigation Tabs */}
              <div className="flex bg-zinc-900/45 p-1 rounded-2xl border border-white/5 gap-1 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveMockTab("recruiter")}
                  className={`flex-1 min-w-[100px] py-2.5 rounded-xl text-xs font-sans font-medium transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    activeMockTab === "recruiter"
                      ? "bg-white/[0.08] text-white font-semibold border border-white/5 shadow-[0_1px_15px_rgba(255,255,255,0.02)] scale-[1.02] -translate-y-[0.5px]"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.01]"
                  }`}
                >
                  <Compass className={`w-3.5 h-3.5 ${activeMockTab === "recruiter" ? "text-rose-400" : "text-zinc-500"}`} />
                  <span>Recruiter Review</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMockTab("ats")}
                  className={`flex-1 min-w-[100px] py-2.5 rounded-xl text-xs font-sans font-medium transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    activeMockTab === "ats"
                      ? "bg-white/[0.08] text-white font-semibold border border-white/5 shadow-[0_1px_15px_rgba(255,255,255,0.02)] scale-[1.02] -translate-y-[0.5px]"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.01]"
                  }`}
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${activeMockTab === "ats" ? "text-emerald-400" : "text-zinc-500"}`} />
                  <span>ATS Match</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMockTab("growth")}
                  className={`flex-1 min-w-[100px] py-2.5 rounded-xl text-xs font-sans font-medium transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    activeMockTab === "growth"
                      ? "bg-white/[0.08] text-white font-semibold border border-white/5 shadow-[0_1px_15px_rgba(255,255,255,0.02)] scale-[1.02] -translate-y-[0.5px]"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.01]"
                  }`}
                >
                  <Lightbulb className={`w-3.5 h-3.5 ${activeMockTab === "growth" ? "text-amber-400" : "text-zinc-500"}`} />
                  <span>Growth Index</span>
                </button>
              </div>

              {/* Cinematic Split Portrait Display */}
              <div className="relative w-full aspect-[21/10] sm:aspect-[16/8] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 group">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={currentSlide.image}
                    initial={{ opacity: 0, scale: 0.98, filter: "blur(10px) saturate(0.5)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px) saturate(1)" }}
                    exit={{ opacity: 0, scale: 1.02, filter: "blur(10px) saturate(0.5)" }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <img 
                      src={currentSlide.image} 
                      alt="Aspirational Professional Transformation split screen view" 
                      className="w-full h-full object-cover select-none"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Subdued overlay label boxes */}
                <div className="absolute inset-x-0 bottom-4 px-4 flex justify-between pointer-events-none select-none z-10 font-sans">
                  <span className="px-2.5 py-1 rounded-lg bg-black/85 border border-white/5 text-[9px] uppercase tracking-wider font-mono text-zinc-450 text-zinc-350 backdrop-blur-sm shadow-md">
                    {currentSlide.leftLabel}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-950/90 border border-indigo-500/20 text-[9px] uppercase tracking-wider font-mono text-indigo-300 backdrop-blur-sm shadow-md">
                    {currentSlide.rightLabel}
                  </span>
                </div>

                {/* Vertical Swipe Divider Handle */}
                <div 
                  className="absolute inset-y-0 right-0 bg-indigo-500/[0.015] border-l border-white/10 backdrop-blur-[0.2px] pointer-events-none transition-all duration-300" 
                  style={{ left: `${sliderVal}%` }}
                />

                <div 
                  className="absolute inset-y-0 w-[1px] bg-gradient-to-b from-indigo-300/40 via-indigo-500/80 to-indigo-300/40 pointer-events-none z-10"
                  style={{ left: `${sliderVal}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-zinc-950 border border-indigo-400/40 shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  </div>
                </div>

                <input 
                  type="range" 
                  min="5" 
                  max="95" 
                  value={sliderVal} 
                  onChange={handleSliderChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                />
              </div>

              {/* Dynamic Insight text box */}
              <div className="flex flex-col gap-4 text-left">
                <div className="min-h-[60px] flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={`${currentSlide.image}_${activeMockTab}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="text-zinc-400 text-xs sm:text-[13px] leading-relaxed font-sans font-light w-full"
                    >
                      "{activeTabText}"
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Score tracker index */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-zinc-500 font-sans font-light tracking-wide">
                    {activeMockTab === "recruiter" ? "Strategic Employer Alignment" : activeMockTab === "ats" ? "Parser Indexing Readiness" : "Narrative Transform Resonance"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isAnalyzed && activeResult && (
                      <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider pr-1">
                        Parsed Match
                      </span>
                    )}
                    <span className="text-[13px] font-semibold text-indigo-300 font-mono bg-indigo-500/[0.04] px-3 py-1 rounded-full border border-indigo-500/15">
                      {activeMockTab === "recruiter" 
                        ? `${isAnalyzed ? currentSlide.scoreBoost + 68 : computedResonance}%` 
                        : activeMockTab === "ats" 
                        ? `${isAnalyzed && activeResult ? activeResult.atsScore : 78}%` 
                        : `${computedResonance}%`}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
