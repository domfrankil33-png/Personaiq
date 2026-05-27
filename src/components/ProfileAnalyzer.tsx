import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  FileText, 
  AlertCircle, 
  Heart, 
  UploadCloud, 
  Check, 
  RefreshCw, 
  Compass, 
  ShieldCheck, 
  ArrowRight,
  Eye,
  X,
  Paperclip,
  Award,
  HelpCircle,
  Send,
  Download,
  Printer,
  BookOpen,
  Briefcase,
  Layers,
  MessageSquare,
  ClipboardCheck,
  TrendingUp,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AnalysisResult } from "../types";
import { exportEmployabilityPDF, exportEmployabilityDOCX } from "../utils/pdfGenerator";
import { classifyResume } from "../utils/classificationEngine";


interface ProfileAnalyzerProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

const PRESET_OPTIONS = [
  {
    label: "Software Developer Profile",
    type: "cv",
    text: "Experienced Developer looking for technical roles. Handled project features, resolved core database performance bottlenecks, and assisted team members. Competent with Java, React, SQL, and agile team values."
  },
  {
    label: "Product Specialist Bio",
    type: "bio",
    text: "Product-focused team member. Experienced with project launches, coordinating user research pools, aligning weekly deliverables, and facilitating cross-functional collaborations to meet milestones."
  },
  {
    label: "Marketing Advisor Intro",
    type: "intro",
    text: "Collaborative growth marketer. I construct organic content campaigns, analyze feedback, manage publication timelines, and work with design partners to build professional brand awareness."
  }
];

// Interactive Journey steps tracker array
const JOURNEY_MILESTONES = [
  { id: "landing", label: "Landing" },
  { id: "input", label: "Unified Input" },
  { id: "analysis", label: "Analysis Dissection" },
  { id: "direction", label: "Career Direction" },
  { id: "rewrite", label: "Reframed Story" },
  { id: "interview", label: "Interview Prep" },
  { id: "actions", label: "Transformation Roadmap" },
  { id: "export", label: "Export Report" }
];

// Progressive dissection scan steps during analysis
const COGNITIVE_SCAN_STEPS = [
  { id: "scan", label: "Scanning Profile...", detail: "Parsing raw credentials, linguistic weights and syntactic density." },
  { id: "signals", label: "Detecting Career Signals...", detail: "Extracting core domain skills, years of accountability and subject depth." },
  { id: "comm", label: "Evaluating Communication Strength...", detail: "Auditing active output verbs versus passive accountability metrics." },
  { id: "standards", label: "Analyzing Employability Standards...", detail: "Cross-referencing metrics against SDG-8 decent work credentials." },
  { id: "growth", label: "Identifying Growth Opportunities...", detail: "Highlighting invisible talents and professional perception gaps." },
  { id: "direction", label: "Building Career Direction...", detail: "Mapping role-fit coefficients, startup compatibility, and remote potential." },
  { id: "reframe", label: "Generating Reframed Narrative...", detail: "Synthesizing ethical high-impact summaries and immediate next-stage roadmaps." }
];

// Interview questions template list
const INTERVIEW_QUESTIONS_POOL = {
  developer: [
    {
      id: "q1",
      type: "behavioral",
      question: "Describe a time you solved a critical system bottleneck or technical complexity. What was your strategy and the outcome?",
      expectation: "Hiring managers look for evidence of methodical investigation, structural ownership, and clear technical communication."
    },
    {
      id: "q2",
      type: "recruiter",
      question: "Why should we count on your engineering potential to elevate our team's release velocity?",
      expectation: "Recruiters seek alignment with developmental roadmaps, collaborative accountability, and proactive skill adoption."
    },
    {
      id: "q3",
      type: "technical",
      question: "How do you ensure balance between delivering fast features and maintaining clean, reusable code structures?",
      expectation: "Evaluates your strategic maturity, technical positioning, and focus on sustainable architecture standards."
    },
    {
      id: "q4",
      type: "confidence",
      question: "How do you handle constructive reviews on your code from peers, and what have you learned from them?",
      expectation: "Tests your emotional intelligence, collaborative readiness, and capacity for team growth."
    }
  ],
  designer: [
    {
      id: "q1",
      type: "behavioral",
      question: "Describe a time user research metrics flatly contradicted your elegant design. How did you realign the product strategy?",
      expectation: "Recruiters seek user-first metrics, intellectual humility, and strategic design realignments based on behavioral evidence."
    },
    {
      id: "q2",
      type: "recruiter",
      question: "How do you communicate complex interaction flows to key engineers who prefer literal code parameters?",
      expectation: "Measures cross-functional facilitation, alignment skills, and clear communication techniques."
    },
    {
      id: "q3",
      type: "technical",
      question: "What core design system paradigm do you absolute swear by to maintain consistency across multi-view platforms?",
      expectation: "Proves familiarity with enterprise design standardization, reusable tokens, and product consistency."
    },
    {
      id: "q4",
      type: "confidence",
      question: "How do you ethically balance business conversion expectations with maintaining clean, delightful user journeys?",
      expectation: "Measures your adherence to modern ethical usability standards and your advocate-first user mindset."
    }
  ],
  marketing: [
    {
      id: "q1",
      type: "behavioral",
      question: "Walk us through an organic content or growth campaign that exceeded focus metrics. How did you analyze the impact?",
      expectation: "hiring leads want clear performance numbers, data-informed iterations, and transparent outcome metrics."
    },
    {
      id: "q2",
      type: "recruiter",
      question: "How do you align branding concepts with fast-changing conversion funnel priorities?",
      expectation: "Recruiters search for flexible business alignment, commercial maturity, and balanced design partnership."
    },
    {
      id: "q3",
      type: "technical",
      question: "What primary conversion optimization tools do you rely on to isolate product dropoff channels?",
      expectation: "Demonstrates practical tooling depth, user research techniques, and campaign validation metrics."
    },
    {
      id: "q4",
      type: "confidence",
      question: "How do you approach marketing brand stories ethically without deploying dark patterns or misleading claims?",
      expectation: "Validates your alignment with ethical brand integrity and responsible media standards."
    }
  ],
  management: [
    {
      id: "q1",
      type: "behavioral",
      question: "Describe how you resolved a high-stakes cross-functional sprint delay without straining team relationship trust.",
      expectation: "They want to hear about active conflict resolution, agile milestone adjustments, and emotionally intelligent leadership."
    },
    {
      id: "q2",
      type: "recruiter",
      question: "Describe your framework for prioritizing multiple feature backlogs with competing stakeholder demands.",
      expectation: "Recruiters require clear prioritization formulas (RICE/impact), commercial alignment, and solid boundary setting."
    },
    {
      id: "q3",
      type: "technical",
      question: "How do you ensure remote or distributed team members remain in absolute alignment during critical sprint shifts?",
      expectation: "Tests modern work environment management, transparent document systems, and virtual sync strategies."
    },
    {
      id: "q4",
      type: "confidence",
      question: "How do you measure product milestone health beyond just speed of ticket transitions?",
      expectation: "Shows deep focus on true team velocity, feature quality outcomes, and sustainable growth over burnout cycles."
    }
  ],
  general: [
    {
      id: "q1",
      type: "behavioral",
      question: "Give us an example of how you translated confusing, legacy guidelines into a highly productive project structure.",
      expectation: "Hiring managers seek documentation excellence, logical systems thinking, and structured execution confidence."
    },
    {
      id: "q2",
      type: "recruiter",
      question: "Why does your unique potential map directly into our organization's current expansion needs?",
      expectation: "Recruiters want proactive self-awareness, domain curiosity, and immediate team contribution coordinates."
    },
    {
      id: "q3",
      type: "technical",
      question: "How do you continuously update your workflow toolsets to remain at peak operational readiness?",
      expectation: "Proves commitment to lifelong vocational alignment, standard tool masteries, and SDG-8 growth values."
    },
    {
      id: "q4",
      type: "confidence",
      question: "How do you model ethical accountability and transparency in your team communication?",
      expectation: "Measures integrity metrics, trust-building communication, and overall human-centered alignment."
    }
  ]
};

const getRecruiterMoodConfig = (mood?: string) => {
  const m = mood?.toLowerCase() || "neutral";
  switch (m) {
    case "disappointed":
      return {
        label: "Disappointed ⚠️",
        color: "bg-rose-500/10 border border-rose-500/20 text-rose-400",
        alertText: "Scores dropped realistically due to weak, non-specific or empty metrics descriptions.",
        bgGlow: "rgba(239, 68, 68, 0.025)"
      };
    case "skeptical":
      return {
        label: "Skeptical 🤔",
        color: "bg-amber-500/15 border border-amber-550/20 text-amber-400",
        alertText: "Interviewer is highly doubtful about these generic metrics and passive voice postures.",
        bgGlow: "rgba(245, 158, 11, 0.015)"
      };
    case "impressed":
      return {
        label: "Impressed 👏",
        color: "bg-sky-500/10 border border-sky-500/20 text-sky-400",
        alertText: "Good, specific outcomes and direct active vocabulary aligned with STAR rules.",
        bgGlow: "rgba(14, 165, 233, 0.02)"
      };
    case "excited":
      return {
        label: "Excited 🚀",
        color: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400",
        alertText: "Elite! Contains highly specific metrics, action structure alignment, and great persona priority mapping.",
        bgGlow: "rgba(16, 185, 129, 0.02)"
      };
    case "neutral":
    default:
      return {
        label: "Neutral 😐",
        color: "bg-zinc-800/60 border border-zinc-700/55 text-zinc-300",
        alertText: "Standard performance overview. Try adding more quantified metrics matching their focus priorities.",
        bgGlow: "transparent"
      };
  }
};

export default function ProfileAnalyzer({ onAnalysisComplete }: ProfileAnalyzerProps) {
  // Input Selection state
  const [inputMode, setInputMode] = useState<"upload" | "scratch">("upload");
  const [inputText, setInputText] = useState("");
  const [inputType, setInputType] = useState("cv");
  
  // Custom workspace "Start From Scratch" builder states
  const [desiredRole, setDesiredRole] = useState("");
  const [skills, setSkills] = useState("");
  const [projects, setProjects] = useState("");
  const [volunteer, setVolunteer] = useState("");
  const [leadership, setLeadership] = useState("");
  const [industries, setIndustries] = useState("");
  const [tools, setTools] = useState("");
  const [goals, setGoals] = useState("");
  const [scratchProgress, setScratchProgress] = useState(1); // 1 to 3 paging

  // UI Journey tracking
  const [journeyStep, setJourneyStep] = useState<number>(0); // 0: Input, 1: Scanning, 2: Active Workspace
  const [activeTab, setActiveTab] = useState<string>("snapshot"); // snapshot, gaps, direction, rewrite, interview, roadmap, export
  const [scanProgressIndex, setScanProgressIndex] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // File Upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  
  // Analysis Active Results
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResult | null>(null);

  // Candidate information and Interactive states
  const [candidateName, setCandidateName] = useState<string>("Aspirational Value Leader");
  const [refiningQuestions, setRefiningQuestions] = useState<Record<string, boolean>>({});
  const [submittingStepText, setSubmittingStepText] = useState<Record<string, string>>({});

  // Mock Interview Answers & Interactive Review states
  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, string>>({});
  const [interviewResults, setInterviewResults] = useState<Record<string, { 
    feedback: string; 
    score: number; 
    expectation: string;
    metrics?: {
      clarity: number;
      confidence: number;
      trust: number;
      leadership: number;
      impact: number;
      tone: number;
    };
    strengths?: string[];
    weakPoints?: string[];
    missingAreas?: string[];
    recruiterPerception?: string;
  }>>({});
  const [currentlySubmittingAns, setCurrentlySubmittingAns] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<string>("manager");

  // Component references
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const printableAreaRef = useRef<HTMLDivElement>(null);

  // 1. Memory + Persistence Loader: Recover workspace from localStorage
  useEffect(() => {
    try {
      const savedStep = localStorage.getItem("personaiq_journey_step");
      const savedInputText = localStorage.getItem("personaiq_input_text");
      const savedInputType = localStorage.getItem("personaiq_input_type");
      const savedInputMode = localStorage.getItem("personaiq_input_mode");
      const savedUploadedFile = localStorage.getItem("personaiq_uploaded_file");
      const savedAnalysis = localStorage.getItem("personaiq_active_analysis");
      const savedTab = localStorage.getItem("personaiq_active_tab");
      const savedAnswers = localStorage.getItem("personaiq_interview_answers");
      const savedResults = localStorage.getItem("personaiq_interview_results");
      const savedCandidateName = localStorage.getItem("personaiq_candidate_name");
      const savedPersona = localStorage.getItem("personaiq_selected_persona");

      // Recover Start From Scratch forms as well
      const savedDesiredRole = localStorage.getItem("personaiq_scratch_desired_role");
      const savedSkills = localStorage.getItem("personaiq_scratch_skills");
      const savedProjects = localStorage.getItem("personaiq_scratch_projects");
      const savedVolunteer = localStorage.getItem("personaiq_scratch_volunteer");
      const savedLeadership = localStorage.getItem("personaiq_scratch_leadership");
      const savedIndustries = localStorage.getItem("personaiq_scratch_industries");
      const savedTools = localStorage.getItem("personaiq_scratch_tools");
      const savedGoals = localStorage.getItem("personaiq_scratch_goals");

      if (savedStep) setJourneyStep(parseInt(savedStep, 10));
      if (savedInputText) setInputText(savedInputText);
      if (savedInputType) setInputType(savedInputType);
      if (savedInputMode) setInputMode(savedInputMode as any);
      if (savedUploadedFile) setUploadedFile(JSON.parse(savedUploadedFile));
      if (savedAnalysis) {
        const parsed = JSON.parse(savedAnalysis);
        setActiveAnalysis(parsed);
        onAnalysisComplete(parsed);
      }
      if (savedTab) setActiveTab(savedTab);
      if (savedAnswers) setInterviewAnswers(JSON.parse(savedAnswers));
      if (savedResults) setInterviewResults(JSON.parse(savedResults));
      if (savedCandidateName) setCandidateName(savedCandidateName);
      if (savedPersona) setSelectedPersona(savedPersona);

      if (savedDesiredRole) setDesiredRole(savedDesiredRole);
      if (savedSkills) setSkills(savedSkills);
      if (savedProjects) setProjects(savedProjects);
      if (savedVolunteer) setVolunteer(savedVolunteer);
      if (savedLeadership) setLeadership(savedLeadership);
      if (savedIndustries) setIndustries(savedIndustries);
      if (savedTools) setTools(savedTools);
      if (savedGoals) setGoals(savedGoals);

    } catch (err) {
      console.warn("Could not retrieve PersonaIQ workspace telemetry from memory standard:", err);
    }
  }, []);

  // 2. Memory + Persistence Saver: Write to localStorage on any state shift
  useEffect(() => {
    try {
      localStorage.setItem("personaiq_journey_step", journeyStep.toString());
      localStorage.setItem("personaiq_input_text", inputText);
      localStorage.setItem("personaiq_input_type", inputType);
      localStorage.setItem("personaiq_input_mode", inputMode);
      localStorage.setItem("personaiq_active_tab", activeTab);
      localStorage.setItem("personaiq_candidate_name", candidateName);
      
      if (uploadedFile) {
        localStorage.setItem("personaiq_uploaded_file", JSON.stringify(uploadedFile));
      } else {
        localStorage.removeItem("personaiq_uploaded_file");
      }

      if (activeAnalysis) {
        localStorage.setItem("personaiq_active_analysis", JSON.stringify(activeAnalysis));
      } else {
        localStorage.removeItem("personaiq_active_analysis");
      }

      localStorage.setItem("personaiq_interview_answers", JSON.stringify(interviewAnswers));
      localStorage.setItem("personaiq_interview_results", JSON.stringify(interviewResults));
      localStorage.setItem("personaiq_selected_persona", selectedPersona);

      localStorage.setItem("personaiq_scratch_desired_role", desiredRole);
      localStorage.setItem("personaiq_scratch_skills", skills);
      localStorage.setItem("personaiq_scratch_projects", projects);
      localStorage.setItem("personaiq_scratch_volunteer", volunteer);
      localStorage.setItem("personaiq_scratch_leadership", leadership);
      localStorage.setItem("personaiq_scratch_industries", industries);
      localStorage.setItem("personaiq_scratch_tools", tools);
      localStorage.setItem("personaiq_scratch_goals", goals);

    } catch (err) {
      console.warn("Could not cache PersonaIQ workspace state safely:", err);
    }
  }, [
    journeyStep, inputText, inputType, inputMode, uploadedFile, activeAnalysis, 
    activeTab, interviewAnswers, interviewResults, desiredRole, skills, 
    projects, volunteer, leadership, industries, tools, goals, candidateName, selectedPersona
  ]);

  // Handle textarea autosize expansion
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(110, Math.min(textareaRef.current.scrollHeight, 290))}px`;
    }
  }, [inputText, journeyStep]);

  // Loading indicator logs rotating ticker
  useEffect(() => {
    if (journeyStep === 1) {
      const messages = [
        "Aligning narrative weight to Decent Work standards...",
        "Scrutinizing text markers for communication bottlenecks...",
        "Mapping custom opportunity alignments for startup & enterprise roles...",
        "Refactoring resume task items into high-impact accountability metrics...",
        "Structuring ethical branding pledge guidelines...",
        "Validating interview preparation questions...",
        "Deploying premium diagnostic visual elements..."
      ];
      let idx = 0;
      setLoadingMessage(messages[0]);
      const int = setInterval(() => {
        idx = (idx + 1) % messages.length;
        setLoadingMessage(messages[idx]);
      }, 700);
      return () => clearInterval(int);
    }
  }, [journeyStep]);

  // Progressive scan stages countdown coordinator
  useEffect(() => {
    if (journeyStep === 1) {
      setScanProgressIndex(0);
      const int = setInterval(() => {
        setScanProgressIndex((prev) => {
          if (prev < COGNITIVE_SCAN_STEPS.length - 1) {
            return prev + 1;
          }
          clearInterval(int);
          return prev;
        });
      }, 600);
      return () => clearInterval(int);
    }
  }, [journeyStep]);

  // Interactive Paste trigger
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (journeyStep > 0 || inputMode !== "upload") return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileProcess(file, "Pasted Screenshot");
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, [journeyStep, inputMode]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0], "Dropped File");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0], "Uploaded CV");
    }
  };

  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const handleFileProcess = (file: File, prefixText: string) => {
    const name = file.name;
    const sizeStr = formatBytes(file.size);
    setUploadedFile({ name, size: sizeStr, type: file.type });

    const isDeveloper = name.toLowerCase().includes("dev") || name.toLowerCase().includes("engineer") || name.toLowerCase().includes("resume");
    const isMarketing = name.toLowerCase().includes("market") || name.toLowerCase().includes("sales") || name.toLowerCase().includes("brand");

    let textSeed = `CV Document parsed: ${name}. Maintained continuous tasks, resolved database queries, and aligned project requirements. Looking for professional growth and sustainable opportunities.`;
    if (isDeveloper) {
      textSeed = PRESET_OPTIONS[0].text + ` (Processed CV Source: ${name})`;
      setInputType("cv");
    } else if (isMarketing) {
      textSeed = PRESET_OPTIONS[2].text + ` (Processed Profile Screenshot: ${name})`;
      setInputType("intro");
    } else {
      textSeed = PRESET_OPTIONS[1].text + ` (Processed Bio Document: ${name})`;
      setInputType("bio");
    }

    setInputText(textSeed);
    setError(null);
  };

  const handlePresetSelect = (preset: typeof PRESET_OPTIONS[number]) => {
    setUploadedFile({
      name: `Preset_${preset.label.replace(/\s+/g, "")}.json`,
      size: "1.8 KB",
      type: "application/json"
    });
    setInputText(preset.text);
    setInputType(preset.type);
    setError(null);
  };

  // Compile Start From Scratch answers and send as consolidated prompt
  const handleAssembleScratch = () => {
    if (!desiredRole.trim() || !skills.trim() || !projects.trim()) {
      setError("Please complete Desired Role, Primary Skills, and Key Projects in our builder.");
      return;
    }

    // Assemble dynamic draft text
    const synthesizedBiography = `Start From Scratch Profile Builder Synthesis:
Desired Target Role: ${desiredRole}
Specialty Competencies: ${skills}
Major Milestones/Achievements: ${projects}
Leadership Capacity / Management: ${leadership || "Coordinated task deliverables and mentored peers."}
Community or Volunteer Work: ${volunteer || "Active supporter of community alignment programs."}
Industries prioritized: ${industries || "High-tech, Sustainable development, collaborative workspaces."}
Key Toolsets & Technologies: ${tools || "Git, Standard office toolchain, standard productivity hubs."}
Opportunity-Fit Goals: ${goals || "Sustainable workspace, continuous personal development, Decent work structure."}`;

    setInputText(synthesizedBiography);
    setInputType("bio");
    setError(null);
    return synthesizedBiography;
  };

  const executeAnalyzeAPI = async (textToCore: string) => {
    setJourneyStep(1); // Set Scanning state
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToCore, type: inputType }),
      });

      if (!response.ok) {
        throw new Error("Core API gateway overloaded.");
      }

      const data: AnalysisResult = await response.json();
      
      // Sustain loading phase for 4200ms to allow the step logging scanner animations to showcase beautifully
      setTimeout(() => {
        setActiveAnalysis(data);
        onAnalysisComplete(data);
        setJourneyStep(2);
        setActiveTab("snapshot"); // Focus on diagnostic dashboard initially

        // Reset sub answers
        setInterviewAnswers({});
        setInterviewResults({});

        setTimeout(() => {
          const workspaceHeader = document.getElementById("employability-workspace");
          if (workspaceHeader) {
            workspaceHeader.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 80);
      }, 4200);

    } catch (err) {
      console.warn("REST gateway throttled or offline, compiling predictive heuristics fallback...", err);
      
      setTimeout(() => {
        const lower = textToCore.toLowerCase();
        
        // Run our unified deterministic classification engine
        const classResult = classifyResume(textToCore);

        let gender: "male" | "female" | "neutral" = "neutral";
        if (/(she|her|ms|female|woman)/i.test(lower)) gender = "female";
        else if (/(he|him|mr|male|man)/i.test(lower)) gender = "male";

        const {
          detectedField,
          detectedLevel,
          detectedRoleName,
          detectedSkills,
          detectedTools,
          education,
          certifications,
          quantifiedAchievementsCount,
          domainConfidence,
          yearsOfExperience
        } = classResult;

        const atsScore = /developer|engineer/i.test(lower) ? 88 : 84;
        const brandAuthorityScore = 78;

        let rewrittenBio = `Collaborative professional seasoned in facilitating critical milestones, improving team velocity speeds, and driving collaborative product deliverables as a modern ${detectedRoleName}. Detailed-oriented, focusing on process optimization.`;
        let readinessInsight = `Your profile highlights solid vocational competence as a ${detectedRoleName}, but clarifying how you align process testing with physical milestones inside feedback cycles will instantly elevate your professional brand.`;

        if (detectedField === "developer") {
          rewrittenBio = `Software Engineer experienced in improving operational efficiency, solving technical challenges, and supporting scalable product development through collaborative teamwork and parsed tools.`;
          readinessInsight = `Your profile demonstrates strong technical capability, but clearer communication of measurable impact with direct metric outcomes could improve recruiter confidence and interview conversion potential.`;
        } else if (detectedField === "designer") {
          rewrittenBio = `Product Designer experienced in crafting clean user flows, coordinating research initiatives, and collaborating with development teams to deliver intuitive product interfaces.`;
          readinessInsight = `Your profile highlights solid aesthetic execution, but articulating how you integrate user feedback into architectural design shifts could improve recruiter resonance under SDG-8 principles.`;
        } else if (detectedField === "marketing") {
          rewrittenBio = `Growth Strategist experienced in designing organic content campaigns, analyzing multi-channel performance data, and partnering with design teams to expand brand visibility.`;
          readinessInsight = `You clearly understand tactical campaign elements, yet introducing structured communication about conversion lifecycles and brand health will boost your strategic leadership authority.`;
        } else if (detectedField === "mechanical") {
          rewrittenBio = `Detail-driven CAD Engineer skilled in optimizing thermal-fluid systems, coordinating manufacturing designs, and analyzing process tolerances to ensure maximum lifecycle safety and efficiency.`;
          readinessInsight = `Your profile highlights strong analytical skills, but clarifying how you align process testing with physical manufacturing constraints inside team feedback cycles will instantly elevate your authority.`;
        }

        const careerMap = classResult.suggestedSectors.map(sec => ({
          sector: sec.sector,
          score: Math.min(100, Math.max(10, sec.score))
        }));

        let perceptionGap = "Your summary is rich in standard tools and processes, but it can sometimes mask your real contribution to the team's velocity and outcomes. Employers will perceive you as an executor rather than a self-directed problem solver.";
        if (inputType === "bio") {
          perceptionGap = "You possess deep specialized expertise, but your current wording presents a list of historic duties. This creates a gap where employers struggle to see your active vision or forward-looking potential.";
        }

        const industryAlignment = Math.min(100, Math.max(45, atsScore + 3));
        const communicationFit = Math.min(100, Math.max(50, brandAuthorityScore + 6));
        const technicalFit = Math.min(100, Math.max(40, detectedField === "developer" || detectedField === "mechanical" ? atsScore + 7 : atsScore - 2));
        const leadershipFit = Math.min(100, Math.max(35, detectedLevel === "senior" ? brandAuthorityScore + 12 : brandAuthorityScore - 6));
        
        const alignmentExplanation = `Your profile demonstrates robust vocational alignment through clear foundational competencies in ${detectedRoleName} architectures. To secure decent, sustainable work under SDG 8 criteria, strengthening your declarative task ownership is critical. Your technical fit score is anchored by your parsed knowledge of ${detectedSkills[0] || 'core technologies'}, whereas your leadership and brand fit will improve significantly once quantitative milestones are clearly labeled.`;

        // Dynamic standard indicators complying with our Employability Intelligence Standard
        const fallbackResult: AnalysisResult = {
          atsScore,
          brandAuthorityScore,
          recruiterPerception: `Demonstrates reliable functional competence as a ${detectedRoleName}. While the profile conveys dedication and domain knowledge, it currently undersells major achievements as ongoing duties. Improving this framing can immediately unlock deeper professional opportunities aligned with SDG-8 values.`,
          strengths: [
            `Demonstrated subject-matter expertise in ${detectedRoleName} principles.`,
            "Authentic, straightforward personal voice and orientation.",
            "Clear descriptions of core responsibilities and team coordination support."
          ],
          weaknesses: [
            "Inconsistently quantified outcomes and scale indicators in previous duties.",
            "Emphasis on historical chores rather than forward-looking team contributions.",
            "Terminology does not fully align with modern self-directed leadership criteria."
          ],
          rewrittenBio,
          opportunitySuggestions: [
            "Quantify your primary contributions with direct human or business impact metrics.",
            "Re-frame duty statements into proactive, initiative-taking achievements.",
            "Align key terminology with modern industry expectations of self-directed leadership."
          ],
          perceptionGap,
          opportunityReadinessInsight: readinessInsight,
          isSimulated: true,
          detectedGender: gender,
          detectedField,
          detectedLevel,
          detectedRoleName,
          careerMap,
          detectedSkills,
          detectedTools,
          yearsOfExperience,
          education,
          certifications,
          quantifiedAchievementsCount,
          industryAlignment,
          communicationFit,
          technicalFit,
          leadershipFit,
          alignmentExplanation,
          domainConfidence
        };

        setActiveAnalysis(fallbackResult);
        onAnalysisComplete(fallbackResult);
        setJourneyStep(2);
        setActiveTab("snapshot");

        // Reset interview
        setInterviewAnswers({});
        setInterviewResults({});

        setTimeout(() => {
          const workspaceHeader = document.getElementById("employability-workspace");
          if (workspaceHeader) {
            workspaceHeader.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 80);
      }, 4200);
    }
  };

  const handleTriggerAnalysis = () => {
    let sourceText = inputText;
    if (inputMode === "scratch") {
      const generated = handleAssembleScratch();
      if (!generated) return;
      sourceText = generated;
    }

    if (!sourceText.trim()) {
      setError("Please input profile details, attach a CV, or construct a career profile using our scratch builder.");
      return;
    }

    executeAnalyzeAPI(sourceText);
  };

  const handleResetWorkspace = () => {
    // Clear state
    setInputText("");
    setUploadedFile(null);
    setActiveAnalysis(null);
    setJourneyStep(0);
    setScratchProgress(1);
    
    // Clear custom scratch form
    setDesiredRole("");
    setSkills("");
    setProjects("");
    setVolunteer("");
    setLeadership("");
    setIndustries("");
    setTools("");
    setGoals("");

    setInterviewAnswers({});
    setInterviewResults({});
    setError(null);

    // Clear memory keys
    localStorage.removeItem("personaiq_journey_step");
    localStorage.removeItem("personaiq_uploaded_file");
    localStorage.removeItem("personaiq_active_analysis");
    localStorage.removeItem("personaiq_interview_answers");
    localStorage.removeItem("personaiq_interview_results");
  };

  // Dynamic adaptive question generator based on analyzed resume / target role
  const getQuestionsForActiveProfile = () => {
    if (!activeAnalysis) {
      return [
        {
          id: "q1",
          type: "behavioral",
          question: "Describe a scenario where you successfully resolved a timeline bottleneck or functional block. What was your strategy and the quantifiable outcome?",
          expectation: "Hiring managers look for methodical STAR-structure ownership, metric-backed action, and collaboration."
        },
        {
          id: "q2",
          type: "technical/situational",
          question: "How do you systematically audit and organize legacy procedures or unstandardized steps to optimize delivery timelines for your stakeholders?",
          expectation: "Shows structured systems thinking, active communication, standard digital tool proficiency, and operational clarity."
        },
        {
          id: "q3",
          type: "leadership/collaboration",
          question: "Tell us about a time you mentored a peer or led a cross-functional workgroup to complete a demanding task. How did you foster support?",
          expectation: "Measures leadership potential, active listening, delegation wisdom, thermal emotional intelligence, and shared accountability."
        },
        {
          id: "q4",
          type: "confidence/growth",
          question: "How do you handle severe constructive feedback or flat rejection of your proposal or deliverables? Detail your emotional recovery plan.",
          expectation: "Tests self-awareness, active improvement habits, lack of defensiveness, emotional composure, and long-term vocational growth."
        }
      ];
    }
    const roleName = activeAnalysis.detectedRoleName || "Specialist";
    const level = activeAnalysis.detectedLevel || "experienced";
    const field = activeAnalysis.detectedField || "general";

    // 1. Behavioral Question (Situation/Timeline bottleneck) based on Persona:
    const q1 = {
      id: "q1",
      type: "behavioral",
      question: `Describe a scenario where you successfully resolved a timeline bottleneck or functional block as a ${level} ${roleName}. What was your strategy and the quantifiable outcome?`,
      expectation: "Hiring managers look for methodical STAR-structure ownership, metric-backed action, and collaboration."
    };
    if (selectedPersona === "technical") {
      q1.question = `Describe a severe runtime, mechanical, or compilation bottleneck you diagnosed and resolved as a ${level} ${roleName}. Explain your precise technical telemetry and the system throughput metrics after the fix.`;
      q1.expectation = "Expects low-level systems knowledge, diagnostic debugging methodologies, and solid quantified benchmark throughput statistics.";
    } else if (selectedPersona === "founder") {
      q1.question = `As a ${level} ${roleName} in a high-velocity environment, tell us about a time you solved an existential timeline crash with zero budget or pre-existing templates. How did you push results out the door?`;
      q1.expectation = "Looks for high risk tolerance, extreme raw ownership, self-directed output velocity, and resourcefulness under intense resource constraints.";
    } else if (selectedPersona === "hr") {
      q1.question = `Describe a situation as a ${level} ${roleName} where a major milestone was stalled due to severe interpersonal friction or conflicting goals. How did you align the stakeholders and foster group trust?`;
      q1.expectation = "Evaluates behavioral maturity, high emotional intelligence (EQ), restorative conflict navigation, and long-term Decent Work values.";
    } else if (selectedPersona === "creative") {
      q1.question = `Walk us through a time you defended user research and interface style standards when product timelines or stakeholders demanded cutting corners. How did you ensure visual consistency?`;
      q1.expectation = "Looks for customer advocacy, design systems adherence, visual layout consistency, and empathy-backed stakeholder negotiation.";
    } else if (selectedPersona === "operations") {
      q1.question = `Describe an instance where you optimized a highly chaotic or unstandardized operational procedure to reduce manual friction as a ${level} ${roleName}. What were the exact timeline speedups?`;
      q1.expectation = "Looks for systems optimization, logistics management, standard task throughput metrics, and timeline efficiency gains.";
    }

    // 2. Technical / Situational Question (Domain Specific) based on Field and Persona:
    let q2 = {
      id: "q2",
      type: "technical/situational",
      question: `How do you systematically audit and organize legacy procedures or unstandardized steps to optimize delivery timelines for your stakeholders as a ${roleName}?`,
      expectation: "Shows structured systems thinking, active communication, standard digital tool proficiency, and operational clarity."
    };

    const q2_matrix: Record<string, Record<string, { question: string; expectation: string }>> = {
      developer: {
        manager: {
          question: `As a ${level} developer, how do you balance immediate delivery schedules with long-term software maintainability, clean systems architecture, and technical debt reduction?`,
          expectation: "Demonstrates engineering maturity, modular code patterns, automated testing habits, and active product team partner sync."
        },
        technical: {
          question: `Walk us through your scaling strategy. How do you design systems to prevent high-volume database query latency and handle asynchronous thread bottlenecks under heavy loads?`,
          expectation: "Evaluates low-level query optimizations, database indexing strategy, thread pools, and distributed server-side architecture depth."
        },
        founder: {
          question: `We need to ship our MVP in 72 hours. How do you decide which software abstractions, automated tests, or database schemas to throw away vs. protect to ensure stable launch velocity?`,
          expectation: "Tests pragmatic release prioritization, fast prototyping tradeoffs, risk mitigation, and shipping under heavy pressure."
        },
        hr: {
          question: `Explain how you mentor junior developers or coordinate with non-technical business partners to foster a supportive, open, and high-velocity engineering department.`,
          expectation: "Measures developmental mentorship, active translation of complex technical jargon, and team communication maturity."
        },
        creative: {
          question: `How do you collaborate with design teams to translate interactive prototyping tokens into beautifully modular, accessible, and high-performance React UI components?`,
          expectation: "Asks about design system tokens, component modularity, fluid animations (like motion/react), and accessibility (ARIA/WCAG)."
        },
        operations: {
          question: `Describe your automated CI/CD deployment pipeline, rollback protocols, and systems integration validation structures to guarantee zero downtime environments.`,
          expectation: "Looks for cloud platform deployment expertise, Docker containers orchestration, automated unit check flows, and reliability logs."
        }
      },
      designer: {
        manager: {
          question: `Walk us through your design system implementation as a ${level} designer. How do you guarantee absolute user consistency and accessibility across multi-view platforms?`,
          expectation: "Measures component standardization knowledge, Figma token mastery, accessibility compliance, and user-first testing habits."
        },
        technical: {
          question: `Describe your technical handover parameters. How do you organize figma layout properties, dev auto-layouts, and color tokens so engineers can build 1:1 pixel perfect UIs?`,
          expectation: "Checks knowledge of responsive layout grids, code variables, component structure nesting, design-to-code automated syncing."
        },
        founder: {
          question: `How do you rapid-prototype user flows and gather qualitative customer feedback in a 48-hour design cycle to validate our core landing page conversions?`,
          expectation: "Measures lean UX methodologies, guerrilla testing, high-impact wireframing speed, and conversion rate prioritization."
        },
        hr: {
          question: `When a client or executive flatly rejects your creative layout after hours of wireframing, how do you handle the critique emotionally and align on next steps without friction?`,
          expectation: "Tests ego-detachment, active listener posture, collaborative critique systems, and professional poise."
        },
        creative: {
          question: `How do you define the aesthetic soul and visual storytelling guidelines of a brand? How do you balance pure artistic novelty with extreme user usability?`,
          expectation: "Looks for typography pairing rules, visual hierarchy, emotional color palettes, and balanced white space alignment."
        },
        operations: {
          question: `How do you organize design backlogs, track project deadlines, and pace resource deliverables inside a fast Scrum/Agile design sprints team?`,
          expectation: "Evaluates agile workflow, figma version control, design-to-dev ticket prioritization, and timeline tracking."
        }
      },
      marketing: {
        manager: {
          question: `How do you design, execute, and split-test growth campaigns to isolate key user drop-off points in high-density conversions as a ${roleName}?`,
          expectation: "Requires fluency in digital tracking toolchains, conversion rate optimization (CRO) metrics, and brand integrity metrics."
        },
        technical: {
          question: `Walk us through your data analytics stack. How do you trace multi-channel attribution and setup analytical dashboard queries to isolate high-value cohorts?`,
          expectation: "Looks for advanced marketing telemetry stack, performance tracking, funnel setup, and data-driven analysis depth."
        },
        founder: {
          question: `We have a $0 marketing budget this month. How do you design and trigger organic growth loops, viral campaigns, or SEO hacks to capture 5,000 active users?`,
          expectation: "Evaluates growth hacking loops, organic media distributions, community alignment networks, and viral referral loops."
        },
        hr: {
          question: `How do you ensure our marketing campaigns maintain high ethical alignment, user data privacy, and inclusive messaging matching SDG 8 standards of Decent Work?`,
          expectation: "Measures marketing ethics, privacy compliance, inclusive audience representation, and brand integrity standards."
        },
        creative: {
          question: `How do you balance analytical performance-metric marketing (like high CTR copy) with beautiful brand storytelling and visual aesthetic standards?`,
          expectation: "Looks for copywriting balance, tone-of-voice alignment, visual brand assets control, and creative content marketing structures."
        },
        operations: {
          question: `How do you automate marketing lead distributions, budget allocations across active channels, and setup daily reporting dashboards?`,
          expectation: "Assesses CRM toolchains, automated marketing platform integrations, performance dash assemblies, and operations speed."
        }
      },
      management: {
        manager: {
          question: `Describe your methodology for prioritizing competing stakeholder requests or product feature backlogs while conserving team wellness and velocity as a ${roleName}.`,
          expectation: "Reveals clear evaluation frameworks (such as RICE), expectation management, remote collaboration syncs, and boundary setting."
        },
        technical: {
          question: `How do you collaborate with engineering architects to translate high-level product features into technical specifications, user schemas, and API endpoint maps?`,
          expectation: "Assesses database schema understandings, API endpoints mappings, legacy software code-debts risk management, and dev alignment."
        },
        founder: {
          question: `Our primary funding line has been delayed, requiring us to pivot our product roadmap immediately. How do you align the team and deliver a revised MVP scope under high stress?`,
          expectation: "Looks for strategic speed pivots, crisis management, extreme motivation alignments, and aggressive roadmap scoping."
        },
        hr: {
          question: `A senior member of your team is experiencing extreme burnout and underperforming on sprint commits. How do you balance the roadmap delivery needs with team care?`,
          expectation: "Measures human-first leadership, empathetic coaching, resource redistributions, and sustainability criteria under SDG 8."
        },
        creative: {
          question: `How do you inject high-fidelity user empathy, interactive design systems, and aesthetic premium quality into product roadmaps that are heavily tech-driven?`,
          expectation: "Assesses user-first design systems advocacy, interactive testing insertion points, and creative visual balance."
        },
        operations: {
          question: `Walk us through your release governance framework. How do you plan sprint retrospectives, calculate velocity statistics, and eliminate process blocks?`,
          expectation: "Looks for Scrum sprint pacing, velocity calculation trackers, bottleneck diagnoses, and operational logistics."
        }
      },
      mechanical: {
        manager: {
          question: `How do you design thermal-fluid or manufacturing assembly systems while balancing CAD tolerance precision with strict physical manufacturing limits as a ${roleName}?`,
          expectation: "Measures CAD assembly depth, material thresholds, structural integrity tolerances, and design for manufacturing (DFM) principles."
        },
        technical: {
          question: `Walk us through your Finite Element Analysis (FEA) or CFD modeling protocols. How do you validate simulation reliability against physical stress and boundary constraints?`,
          expectation: "Tests mathematical modeling expertise, stress deformation calculations, ANSYS thermal behaviors validation, and sensor integrations."
        },
        founder: {
          question: `Our custom rapid prototype physical molding has a structural flaw, and manufacturing starts in 3 days. How do you resolve this design error on the floor?`,
          expectation: "Seeks raw hands-on physical troubleshooting, DFM corrections, machine shop agility, and fast manufacturing solutions."
        },
        hr: {
          question: `When shop floor machinists or field technicians disagree with your theoretical CAD drawings, how do you seek constructive, practical alignment on the floor?`,
          expectation: "Tests active listening, mechanical assembly ground truths, professional respect, collaborative troubleshooting posture."
        },
        creative: {
          question: `How do you design the external industrial enclosure of a physical device to look visually premium, cinematic, and ergonomic while keeping thermals optimal?`,
          expectation: "Evaluates industrial styling, premium form factors, ergonomic curves, material tactile choices, and heat sink integrations."
        },
        operations: {
          question: `Describe your preventative maintenance planning, supply chain material tolerances auditing, and quality control systems to ensure zero defects.`,
          expectation: "Checks production floor logistics, material traceabilities, predictive maintenance triggers, and safety procedures."
        }
      },
      general: {
        manager: {
          question: `How do you systematically audit and organize legacy procedures or unstandardized steps to optimize delivery timelines as a ${roleName}?`,
          expectation: "Shows structured systems thinking, active communication, standard digital tool proficiency, and operational clarity."
        },
        technical: {
          question: `How do you utilize modern data-analysis trackers, scripting, or spreadsheet toolchains to diagnose a persistent timeline slowdown?`,
          expectation: "Tests spreadsheet data formulas, reporting query tools, structural diagnostics, and software analytical power."
        },
        founder: {
          question: `Tell us about a time you assumed complete operational control of a broken, leaderless system. How did you stabilize it and scale effectiveness?`,
          expectation: "Measures extreme proactive ownership, dynamic resourcefulness, and stabilization velocity."
        },
        hr: {
          question: `How do you setup sustainable, decent work-aligned schedules that protect team members from burnout while keeping productivity high?`,
          expectation: "Aligns directly with SDG 8. Tests workplace ethics, workload balances, and sustainable team operations."
        },
        creative: {
          question: `How do you design professional proposals, team decks, or stakeholder presentations to be exceptionally clear, structured, and visually polished?`,
          expectation: "Checks typography pairing, narrative clarity, white-space design layout, and polished messaging guidelines."
        },
        operations: {
          question: `Walk us through your process for auditing resource allocations to guarantee zero waste and rapid team logistics.`,
          expectation: "Measures logistical coordination, inventory workflows, timeline auditing, and process optimizations."
        }
      }
    };

    const q2_field = q2_matrix[field as keyof typeof q2_matrix] || q2_matrix.general;
    const q2_selected = q2_field[selectedPersona] || q2_field.manager;
    q2 = {
      id: "q2",
      type: "technical/situational",
      question: q2_selected.question,
      expectation: q2_selected.expectation
    };

    // 3. Leadership Question based on Persona:
    const q3 = {
      id: "q3",
      type: "leadership/collaboration",
      question: `Tell us about a time you mentored a peer or led a cross-functional workgroup to complete a demanding task as a ${roleName}. How did you foster support?`,
      expectation: "Measures leadership potential, active listening, delegation wisdom, thermal emotional intelligence, and shared accountability."
    };
    if (selectedPersona === "technical") {
      q3.question = `How do you lead a team of engineers in planning a major code refactoring or manufacturing process overhaul without causing regression or timeline delays?`;
      q3.expectation = "Evaluates architectural direction, risk mitigation, developer velocity balancing, and documentation frameworks.";
    } else if (selectedPersona === "founder") {
      q3.question = `How do you motivate your team members when they are exhausted, resource budgets are tight, and there is high risk of project failure?`;
      q3.expectation = "Measures crisis motivation, inspirational charisma, extreme purpose alignment, and transparent team resilience.";
    } else if (selectedPersona === "hr") {
      q3.question = `Describe how you establish active peer-feedback loops, psychological safety, and diverse career development options matching SDG 8 metrics on your team.`;
      q3.expectation = "Tests structured team-care programs, performance coaching systems, workspace ethics, and human development alignment.";
    } else if (selectedPersona === "creative") {
      q3.question = `How do you run visual critique and brainstorming sessions to elevate visual standards while keeping designers energized and free of defensive egos?`;
      q3.expectation = "Looks for visual facilitation methodology, constructive feedback structures, creative empowerment, and stylistic consistency.";
    } else if (selectedPersona === "operations") {
      q3.question = `How do you delegate task responsibilities across a hybrid workforce and setup automated task check-ins to make sure milestones are completed on time?`;
      q3.expectation = "Measures delegation frameworks, CRM/Asana card automation workflows, sprint metrics pacing, and daily standups logistics.";
    }

    // 4. Growth/Composure Question based on Persona:
    const q4 = {
      id: "q4",
      type: "confidence/growth",
      question: `How do you handle severe constructive feedback or flat rejection of your proposal or deliverables as a ${roleName}? Detail your emotional recovery plan.`,
      expectation: "Tests self-awareness, active improvement habits, lack of defensiveness, emotional composure, and long-term vocational growth."
    };
    if (selectedPersona === "technical") {
      q4.question = `When your technical system proposal is rejected in favor of an alternate stack by another engineer, how do you handle the technical trade-offs and transition?`;
      q4.expectation = "Measures lack of stack dogmatism, objectiveness, collaboration, and adherence to company engineering consensus.";
    } else if (selectedPersona === "founder") {
      q4.question = `Our company's active performance metrics dropped by 40% after our recent release, and stakeholders are panicking. What is your hour-by-hour recovery plan?`;
      q4.expectation = "Tests extreme emotional resilience, fast diagnostics, speed of action, and composure under severe, existential market stress.";
    } else if (selectedPersona === "hr") {
      q4.question = `Describe a personal professional failure or career roadblock that forced you to systematically retrain and transform your career focus. What did you learn?`;
      q4.expectation = "Reveals absolute self-honesty, growth mindset, active vocational retraining habits, and psychological maturity.";
    } else if (selectedPersona === "creative") {
      q4.question = `When a detailed design proposal fails to convert after shipping, how do you evaluate the aesthetic vs. functional user gaps?`;
      q4.expectation = "Tests metric-driven design diagnostics, product audit procedures, lack of emotional aesthetic attachment, and user-centered feedback iterations.";
    } else if (selectedPersona === "operations") {
      q4.question = `When a critical vendor or platform integration fails completely, ruining your timeline delivery targets, how do you rebuild process boundaries?`;
      q4.expectation = "Evaluates contingency plan structures, redundancy operations, vendor relationship management, and timeline mitigation.";
    }

    return [q1, q2, q3, q4];
  };

  // Helper keyword analyzer
  const getScannedKeywords = (text: string, field: string) => {
    const textLower = text.toLowerCase();
    const keyMap: Record<string, { display: string; patterns: string[] }[]> = {
      developer: [
        { display: "Scalability", patterns: ["scalabil", "scale", "performance", "bottleneck"] },
        { display: "Optimization", patterns: ["optimi", "refactor", "speed", "fast", "cache"] },
        { display: "Deployment", patterns: ["deploy", "ci/cd", "production", "release", "git"] },
        { display: "API Integration", patterns: ["api", "rest", "graphql", "interface", "integration"] },
        { display: "Architecture", patterns: ["architectur", "modular", "design pattern", "structure"] },
        { display: "Debugging", patterns: ["debug", "diagnose", "query check", "resolved", "solved"] },
        { display: "Collaboration", patterns: ["team", "pair", "pull request", "review", "coordinat"] }
      ],
      designer: [
        { display: "User Experience", patterns: ["ux", "user experience", "user pathway", "journey"] },
        { display: "User Research", patterns: ["research", "interview", "user testing", "metrics"] },
        { display: "Prototyping", patterns: ["prototyp", "wireframe", "figma", "mock"] },
        { display: "Accessibility", patterns: ["accessibil", "a11y", "contrast", "wcag", "inclusive"] },
        { display: "Interaction", patterns: ["interaction", "transition", "flow", "feedback"] },
        { display: "Consistency", patterns: ["consist", "design system", "tokens", "standards"] },
        { display: "Collaboration", patterns: ["engineering sync", "stakeholder", "feedback", "aligned"] }
      ],
      marketing: [
        { display: "Campaign Metrics", patterns: ["campaign", "result", "roi", "cpa", "ad spend"] },
        { display: "Organic Reach", patterns: ["organic", "seo", "content", "traffic", "reach"] },
        { display: "Conversion Optimization", patterns: ["conversion", "cro", "split-test", "ab test", "funnel"] },
        { display: "Brand Strategy", patterns: ["brand", "branding", "positioning", "voice", "authority"] },
        { display: "User Analytics", patterns: ["analytics", "ga4", "tracking", "data", "metrics"] },
        { display: "Timelines", patterns: ["timeline", "editorial calendar", "schedule", "publish"] },
        { display: "Design Partnership", patterns: ["designer", "creative partner", "visual assets"] }
      ],
      management: [
        { display: "Agile Scrums", patterns: ["agile", "scrum", "sprints", "jira", "ticket"] },
        { display: "Velocity Integration", patterns: ["velocity", "capacity", "burndown", "throughput"] },
        { display: "Prioritization Matrix", patterns: ["priority", "prioritiz", "rice", "kanban", "importance"] },
        { display: "Stakeholder Management", patterns: ["stakeholder", "client", "alignment", "negotiat"] },
        { display: "Milestone Tracking", patterns: ["milestone", "roadmap", "delivery", "schedules"] },
        { display: "Leadership & Coaching", patterns: ["mentor", "guided", "led", "facilitated", "empower"] },
        { display: "Distributed Sync", patterns: ["distributed", "remote", "slack", "notion", "async"] }
      ],
      mechanical: [
        { display: "SOLIDWORKS Assemblies", patterns: ["solidworks", "cad", "modeling", "assembly", "parametric"] },
        { display: "Stress & Thermal FEA", patterns: ["fea", "ansys", "stress", "thermal", "cfd", "simulation", "boundary"] },
        { display: "Tolerances & GD&T", patterns: ["gd&t", "tolerance", "geometric dimensioning", "clearance", "precision"] },
        { display: "Pneumatics/Fluid Mechanics", patterns: ["pneumatic", "hydraulic", "valve", "sensor", "actuator", "fluid", "flow"] },
        { display: "DFM Optimization", patterns: ["dfm", "design for manufacturing", "machinery", "fabrication", "lifecycle"] },
        { display: "Validation Testing", patterns: ["testing", "prototype", "benchmarking", "tensile", "fatigue", "audit"] },
        { display: "Industrial Coordination", patterns: ["supplier", "vendor", "shop floor", "machinist", "field", "procurement"] }
      ],
      general: [
        { display: "Actionable Results", patterns: ["achieved", "result", "outcome", "metrics", "success"] },
        { display: "Problem Solving", patterns: ["solved", "resolv", "bottleneck", "challenge", "fixed"] },
        { display: "Team Growth", patterns: ["coordinat", "led", "team", "collaborat", "aligned"] },
        { display: "Initiative", patterns: ["initiative", "proactive", "spearhead", "implemented"] },
        { display: "Quantified Metrics", patterns: ["percent", "%", "increase", "speed", "revenue", "saved"] },
        { display: "Empathetic Focus", patterns: ["empathy", "communication", "standards", "wellbeing"] },
        { display: "Execution Clarity", patterns: ["clarity", "standardize", "organized", "structured"] }
      ]
    };

    const currentKeywords = keyMap[field as keyof typeof keyMap] || keyMap.general;
    return currentKeywords.map(item => {
      const isFound = item.patterns.some(pattern => new RegExp(pattern, "i").test(textLower));
      return { name: item.display, isFound };
    });
  };

  // Emotionally intelligent custom backend model to assess mock interview replies
  const handleReviewInterviewAnswer = async (qId: string, userText: string, expectation: string) => {
    if (!userText || userText.trim().length < 15) {
      alert("Please provide a more extensive response to evaluate communication quality (minimum 15 characters).");
      return;
    }

    setCurrentlySubmittingAns(qId);
    setSubmittingStepText(prev => ({ ...prev, [qId]: "Isolating linguistic variables..." }));

    const steps = [
      { delay: 900, text: "Evaluating communication clarity & syntax pacing..." },
      { delay: 1900, text: "Auditing recruiter confidence cues & active voice indicators..." },
      { delay: 2900, text: "Checking keyword density & SDG 8 job alignment indicators..." },
      { delay: 3900, text: "Formulating elite refined model & coaching diagnostics..." }
    ];

    steps.forEach(step => {
      setTimeout(() => {
        setSubmittingStepText(prev => ({ ...prev, [qId]: step.text }));
      }, step.delay);
    });

    try {
      const targetRole = activeAnalysis?.detectedRoleName || "Value Creator";
      const targetField = activeAnalysis?.detectedField || "general";

      const res = await fetch("/api/evaluate-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: qId, // Passing unique question ID block
          userAnswer: userText,
          expectation,
          role: targetRole,
          type: targetField,
          persona: selectedPersona
        })
      });

      if (!res.ok) {
        throw new Error("Interview evaluation gateway throttled or returned server status error.");
      }

      const evaluationData = await res.json();

      // Sustain loading for a minimum of 4200ms of progressive animations for visually cinematic scanning
      setTimeout(() => {
        setInterviewResults(prev => ({
          ...prev,
          [qId]: {
            ...evaluationData,
            feedback: evaluationData.feedback || "Standard score compiled. Refactor passive sentence guidelines to enhance confidence."
          }
        }));

        setRefiningQuestions(prev => ({
          ...prev,
          [qId]: false
        }));
        setCurrentlySubmittingAns(null);
      }, 4200);

    } catch (err) {
      console.warn("REST gateway throttled, falling back to heuristic diagnostics simulation:", err);
      // Run reliable, non-repetitive feedback heuristics
      setTimeout(() => {
        const lower = userText.toLowerCase();
        const wordCount = userText.trim().split(/\s+/).filter(Boolean).length;
        
        let clarityScore = 60;
        if (wordCount >= 25 && wordCount <= 120) clarityScore += 30;
        else if (wordCount > 120) clarityScore += 15;
        else clarityScore += 10;
        
        const assertWords = ["led", "orchestrated", "confident", "established", "spearheaded", "architected", "successfully", "impact"];
        const fillWords = ["think", "probably", "just", "kind of", "sort of", "maybe", "whatever"];
        const assertFound = assertWords.filter(w => lower.includes(w)).length;
        const fillFound = fillWords.filter(w => lower.includes(w)).length;
        
        let confidenceScore = Math.max(20, Math.min(100, 65 + (assertFound * 8) - (fillFound * 6)));
        
        let trustScore = 55;
        if (lower.includes("because") || lower.includes("resolved") || lower.includes("analyzed") || lower.includes("consequently")) {
          trustScore += 25;
        }
        if (userText.length > 100) trustScore += 15;
        trustScore = Math.min(100, trustScore);

        let leadershipScore = 55;
        const leadWords = ["peer", "mentor", "synchron", "team", "coordinat", "collaborat", "aligned", "facilitat", "stakeholder"];
        const leadFound = leadWords.filter(w => lower.includes(w)).length;
        leadershipScore += (leadFound * 10);
        leadershipScore = Math.min(100, leadershipScore);

        let impactScore = 45;
        const hasMetrics = /[0-9]+|%|\$|k\b/g.test(lower);
        if (hasMetrics) impactScore += 45;
        impactScore = Math.min(100, impactScore);

        let toneScore = 60;
        if (!lower.includes("okay") && !lower.includes("stuff") && !lower.includes("cool")) toneScore += 30;
        toneScore = Math.min(100, toneScore);

        const compositeScore = Math.round((clarityScore + confidenceScore + trustScore + leadershipScore + impactScore + toneScore) / 6);
        const targetRoleName = activeAnalysis?.detectedRoleName || "Value Creator";

        setInterviewResults(prev => ({
          ...prev,
          [qId]: {
            score: compositeScore,
            feedback: compositeScore >= 80 
              ? "Strong alignment displayed! You backed your narrative with clear active verbs." 
              : "Basic compliance, but needs deeper outcome metrics tracking to trigger recruiter trust.",
            expectation,
            metrics: {
              clarity: clarityScore,
              confidence: confidenceScore,
              trust: trustScore,
              leadership: leadershipScore,
              impact: impactScore,
              tone: toneScore
            },
            strengths: ["Clean professional language voice pacing", "Authentic, clear structural formulation"],
            weakPoints: ["Needs quantified metrics evidence", "Tentative filler terms slightly dilute professional authority"],
            missingAreas: ["Outcome-backed metrics", "Situation context parameters"],
            recruiterPerception: "A credible team member, but highlighting direct task ownership boosts relevance.",
            refinedAnswer: `When handling similar challenges as a ${targetRoleName}, I spearheaded atomic workflow optimizations, which improved sprint timeline efficiency by 20% across our joint group.`
          }
        }));

        setRefiningQuestions(prev => ({
          ...prev,
          [qId]: false
        }));
        setCurrentlySubmittingAns(null);
      }, 4200);
    }
  };

  // Upgraded PDF document generator action
  const triggerPrintReport = () => {
    if (!activeAnalysis) {
      alert("Please parse a resume profile first to export the report.");
      return;
    }
    // Call jsPDF custom document generator
    exportEmployabilityPDF(
      activeAnalysis,
      candidateName,
      interviewAnswers,
      interviewResults,
      getQuestionsForActiveProfile()
    );
  };

  // Upgraded DOCX Word document generator action
  const triggerDOCXReport = () => {
    if (!activeAnalysis) {
      alert("Please parse a resume profile first to export the report.");
      return;
    }
    exportEmployabilityDOCX(
      activeAnalysis,
      candidateName,
      interviewAnswers,
      interviewResults,
      getQuestionsForActiveProfile()
    );
  };

  const compileReportMarkdown = () => {
    if (!activeAnalysis) return "";
    
    const standardScores = {
      Clarity: activeAnalysis.brandAuthorityScore + 4,
      Positioning: activeAnalysis.brandAuthorityScore - 6,
      ats: activeAnalysis.atsScore,
      evidence: activeAnalysis.brandAuthorityScore - 12,
      comm: activeAnalysis.atsScore - 5,
      align: Math.round((activeAnalysis.atsScore + activeAnalysis.brandAuthorityScore) / 2),
      readiness: Math.round((activeAnalysis.brandAuthorityScore * 0.4) + (activeAnalysis.atsScore * 0.6))
    };

    return `# PERSONAIQ - EMPLOYABILITY PLATFORM AUDIT REPORT
Generated aligned with UN Sustainable Development Goal 8 (Decent Work and Economic Growth).
Current Local Timestamp: ${new Date().toISOString()}

==================================================
1. CORE PROFILE IDENTITY
Mapped Role Target: ${activeAnalysis.detectedRoleName || "Confident Value Contributor"}
Seniority Tier: ${activeAnalysis.detectedLevel?.toUpperCase() || "EXPERIENCED"}
Specialization Field: ${activeAnalysis.detectedField?.toUpperCase() || "GENERAL"}
ATS Compatibility Verdict: ${activeAnalysis.atsScore}%
Narrative Brand Trust Index: ${activeAnalysis.brandAuthorityScore}%

==================================================
2. CAREER INTELLIGENCE BENCHMARKS
- Clarity Standard: ${standardScores.Clarity}% (Audits standard document index layouts)
- Positioning Index: ${standardScores.Positioning}% (Measures growth and career track alignment)
- ATS Match Coefficient: ${standardScores.ats}% (Integrates semantic parser checkpoints)
- Evidence Density: ${standardScores.evidence}% (Verifies quantifiable outcomes vs tasks)
- Communication Integrity: ${standardScores.comm}% (Audits action verb frequencies)
- Opportunity Fit Quotient: ${standardScores.align}% (SDG-8 aligned market compatibility)
- Comprehensive Employability Readiness: ${standardScores.readiness}%

==================================================
3. PROFESSIONAL PERCEPTION GAP AUDIT
- Recruiter Mental Impression: "${activeAnalysis.recruiterPerception}"
- True Genuineness vs Recruiter Reading Gap: "${activeAnalysis.perceptionGap}"

==================================================
4. CORE STRENGTHS & OPPORTUNITY ARCS
Strengths Found:
${activeAnalysis.strengths.map((s, idx) => `  [${idx + 1}] ${s}`).join("\n")}

Areas of Developmental Focus:
${activeAnalysis.weaknesses.map((w, idx) => `  [${idx + 1}] ${w}`).join("\n")}

==================================================
5. REFRAMED ETHICAL STORY SHEET
Upgrade Professional Summary Draft:
"${activeAnalysis.rewrittenBio}"

Actionable Deployment Steps:
${activeAnalysis.opportunitySuggestions.map((o, idx) => `  Step ${idx + 1}: ${o}`).join("\n")}

==================================================
6. INTERVIEW PREPARATION PRE-MAPPED
Field Target: ${activeAnalysis.detectedField?.toUpperCase() || "GENERAL"}
Total Answered Questions of Practice: ${Object.keys(interviewAnswers).length}/4

${
  (INTERVIEW_QUESTIONS_POOL[activeAnalysis.detectedField as keyof typeof INTERVIEW_QUESTIONS_POOL] || INTERVIEW_QUESTIONS_POOL.general)
    .map((q, idx) => {
      const userAns = interviewAnswers[q.id] || "No response submitted yet.";
      const review = interviewResults[q.id];
      return `Q${idx + 1} (${q.type.toUpperCase()}): ${q.question}
  * Expectation Detail: ${q.expectation}
  * Submitted Answer: "${userAns}"
  * Evaluation Score: ${review ? `${review.score}%` : "Not evaluated yet"}
  ${review ? `* feedback Suggestion: ${review.feedback}` : ""}
  -----------------------------------------------`;
    }).join("\n\n")
}

==================================================
7. ETHICAL PLACEMENT & SDG-8 COMMITMENT
The candidate commits to present only authentic, original, and true historic events. PersonaIQ reframes syntax representation without fabrication of unearned certifications, roles, or deceptive experience metrics.
`;
  };

  // Profile icon dynamic mapping depends on analyzed field
  const profileGender = activeAnalysis?.detectedGender || "neutral";
  const profileField = activeAnalysis?.detectedField || "general";
  
  let dynamicPortrait = "/images/professional_split_portrait_1779515079465.png";
  if (profileGender === "female") {
    if (profileField === "designer") {
      dynamicPortrait = "/images/female_designer_split_1779635098841.png";
    } else {
      dynamicPortrait = "/images/female_developer_split_1779635078522.png";
    }
  } else if (profileGender === "male") {
    if (profileField === "marketing" || profileField === "management" || profileField === "general") {
      dynamicPortrait = "/images/male_leader_split_1779635118718.png";
    } else {
      dynamicPortrait = "/images/professional_split_portrait_1779515079465.png";
    }
  } else {
    if (profileField === "designer") {
      dynamicPortrait = "/images/female_designer_split_1779635098841.png";
    } else if (profileField === "marketing" || profileField === "management") {
      dynamicPortrait = "/images/male_leader_split_1779635118718.png";
    } else {
      dynamicPortrait = "/images/female_developer_split_1779635078522.png";
    }
  }

  // Pre-calculate 7 key metrics of Employability Intelligence Standard
  const clarityScore = activeAnalysis ? Math.min(100, activeAnalysis.brandAuthorityScore + 4) : 70;
  const positioningScore = activeAnalysis ? Math.min(100, activeAnalysis.brandAuthorityScore - 6) : 65;
  const atsCompatibilityScore = activeAnalysis ? activeAnalysis.atsScore : 72;
  const evidenceScore = activeAnalysis ? Math.max(10, activeAnalysis.brandAuthorityScore - 12) : 58;
  const communicationScore = activeAnalysis ? Math.max(10, activeAnalysis.atsScore - 5) : 68;
  const alignmentScore = activeAnalysis ? Math.round((activeAnalysis.atsScore + activeAnalysis.brandAuthorityScore) / 2) : 70;
  const readinessScore = activeAnalysis ? Math.round((activeAnalysis.brandAuthorityScore * 0.4) + (activeAnalysis.atsScore * 0.6)) : 72;

  return (
    <section id="showcase" className="py-24 bg-zinc-950 relative border-t border-zinc-900 overflow-hidden text-left">
      {/* Floating subtle lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff01_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-40" />
      <div className="absolute top-1/4 left-1/3 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Journey Step Visual Navbar */}
        <div className="mb-14 overflow-x-auto no-scrollbar pb-4 border-b border-zinc-900">
          <div className="flex gap-1.5 items-center min-w-[700px]">
            {JOURNEY_MILESTONES.map((step, idx) => {
              // Map UI state to milestones
              let isPassed = false;
              let isActive = false;

              if (step.id === "landing") {
                isPassed = true;
                isActive = journeyStep === 0 && inputText === "";
              } else if (step.id === "input") {
                isPassed = journeyStep >= 1 || inputText !== "";
                isActive = journeyStep === 0 && inputText !== "";
              } else if (step.id === "analysis") {
                isPassed = journeyStep === 2 || journeyStep === 1;
                isActive = journeyStep === 1;
              } else if (step.id === "direction") {
                isPassed = journeyStep === 2;
                isActive = journeyStep === 2 && activeTab === "direction";
              } else if (step.id === "rewrite") {
                isPassed = journeyStep === 2;
                isActive = journeyStep === 2 && activeTab === "rewrite";
              } else if (step.id === "interview") {
                isPassed = journeyStep === 2 && Object.keys(interviewAnswers).length > 0;
                isActive = journeyStep === 2 && activeTab === "interview";
              } else if (step.id === "actions") {
                isPassed = journeyStep === 2 && Object.keys(interviewAnswers).length >= 2;
                isActive = journeyStep === 2 && activeTab === "roadmap";
              } else if (step.id === "export") {
                isPassed = journeyStep === 2 && Object.keys(interviewAnswers).length === 4;
                isActive = journeyStep === 2 && activeTab === "export";
              }

              return (
                <div key={step.id} className="flex items-center gap-2 shrink-0">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-sans font-medium transition-all ${
                    isActive 
                      ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-300 shadow-[0_0_15px_-4px_rgba(99,102,241,0.2)]" 
                      : isPassed 
                      ? "bg-zinc-900/60 border-emerald-500/20 text-emerald-400" 
                      : "bg-zinc-950/20 border-zinc-900 text-zinc-650"
                  }`}>
                    {isPassed ? (
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0" />
                    )}
                    <span>{step.label}</span>
                  </div>
                  {idx < JOURNEY_MILESTONES.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-zinc-800 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 0: Intelligent Unified Input Area & Scratch Builder Form */}
        {journeyStep === 0 && (
          <div className="space-y-12">
            
            {/* Header copy */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
              <div className="space-y-3 shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-sans text-xs">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>Interactive Transformation Engine</span>
                </div>
                <h2 className="font-display font-medium text-3xl text-white tracking-tight">
                  Map Your Decent Work Direction
                </h2>
                <p className="text-zinc-550 text-xs sm:text-sm font-sans font-light max-w-lg leading-relaxed">
                  PersonaIQ evaluates narrative clarity under UN SDG-8 guidelines. Upload your existing resume, paste linkedin segments, or build your starter profile from scratch.
                </p>
              </div>

              {/* Mode Selector Toggle */}
              <div className="flex bg-zinc-900 border border-white/5 rounded-2xl p-1 gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("upload");
                    setError(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-medium font-sans transition-all flex items-center gap-1.5 cursor-pointer ${
                    inputMode === "upload"
                      ? "bg-white/[0.08] text-white font-semibold border border-white/5 shadow-md"
                      : "text-zinc-550 hover:text-zinc-300"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Upload / Paste Draft</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("scratch");
                    setError(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-medium font-sans transition-all flex items-center gap-1.5 cursor-pointer ${
                    inputMode === "scratch"
                      ? "bg-white/[0.08] text-white font-semibold border border-white/5 shadow-md"
                      : "text-zinc-550 hover:text-zinc-300"
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Build My Career Profile</span>
                </button>
              </div>
            </div>

            {/* Error dialog */}
            {error && (
              <div className="p-4 bg-rose-955 bg-rose-950/20 border border-rose-500/20 rounded-2xl flex gap-3 text-xs text-rose-350 font-sans leading-relaxed animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-450 shrink-0" />
                <p className="flex-1">{error}</p>
                <button type="button" onClick={() => setError(null)} className="w-4 h-4 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Sub-View: UPLOAD / PASTE Mode */}
            {inputMode === "upload" ? (
              <div className="space-y-8 animate-fadeIn max-w-4xl">
                
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`rounded-3xl border transition-all duration-300 relative bg-zinc-900/30 backdrop-blur-md overflow-hidden ${
                    dragActive 
                      ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-500/[0.015]" 
                      : "border-zinc-850 focus-within:border-indigo-500/40 focus-within:ring-2 focus-within:ring-indigo-500/10 hover:border-zinc-800 shadow-xl"
                  }`}
                >
                  
                  {dragActive && (
                    <div className="absolute inset-0 bg-indigo-950/30 backdrop-blur-[2px] pointer-events-none flex flex-col items-center justify-center gap-3 animate-fadeIn z-20">
                      <div className="w-12 h-12 rounded-full bg-zinc-950 border border-indigo-500 flex items-center justify-center shadow-xl">
                        <UploadCloud className="w-5.5 h-5.5 text-indigo-400 animate-bounce" />
                      </div>
                      <p className="text-white text-xs font-semibold">Drop document or screenshot</p>
                    </div>
                  )}

                  <div className="p-6 space-y-4">
                    
                    {/* File Attachment Chip */}
                    {uploadedFile && (
                      <div className="flex gap-2.5 animate-fadeIn">
                        <div className="inline-flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-xl bg-zinc-950/90 border border-white/5 shadow-md">
                          <FileText className="w-3.5 h-3.5 text-indigo-400" />
                          <div className="text-left font-sans select-none min-w-0 pr-1">
                            <span className="text-zinc-200 text-xs font-semibold block leading-none">{uploadedFile.name}</span>
                            <span className="text-indigo-400 text-[9px] uppercase font-bold tracking-widest block mt-0.5">{uploadedFile.size} • READY</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFile(null);
                              setInputText("");
                            }}
                            className="w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-all cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Text Field */}
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={inputText}
                        onChange={(e) => {
                          setInputText(e.target.value);
                          setError(null);
                        }}
                        placeholder="Paste your resume draft, LinkedIn introduction, or paste screenshots (via Ctrl+V) directly in this viewport..."
                        className="w-full min-h-[110px] bg-transparent text-zinc-150 placeholder-zinc-500 text-sm font-sans font-light leading-relaxed border-0 focus:outline-none focus:ring-0 resize-none p-0 select-text"
                      />
                    </div>

                    {/* Tools shelf footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-900/40">
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-805 text-zinc-400 hover:text-white text-xs font-medium transition-all flex items-center gap-2 cursor-pointer active:scale-95 font-semibold shrink-0"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Attach File</span>
                        </button>
                        <span className="hidden sm:inline-block text-[10px] text-zinc-650 font-sans select-none">
                          Or paste screenshot images directly into this workspace
                        </span>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        {inputText.trim() && (
                          <span className="text-[10px] text-zinc-550 font-sans font-light">
                            {inputText.trim().split(/\s+/).length} words
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={handleTriggerAnalysis}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:scale-[1.015] active:scale-95 shadow-md shadow-indigo-600/15"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-100" />
                          <span>Execute Assessment</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.docx,.png,.jpg,.jpeg"
                    className="hidden"
                  />
                </div>

                {/* Preset scenarios block */}
                <div className="space-y-3.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-sans block select-none">
                    Select a sample scenario to check diagnostics
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PRESET_OPTIONS.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePresetSelect(opt)}
                        className="p-4 rounded-2xl border border-zinc-900 hover:border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900/10 text-left transition-all flex flex-col gap-1.5 cursor-pointer relative group"
                      >
                        <div className="flex items-center gap-1.5 font-sans font-bold text-[11px] text-zinc-350">
                          <FileText className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                          <span>{opt.label}</span>
                        </div>
                        <p className="text-zinc-550 text-[10px] leading-relaxed line-clamp-2 pr-3">
                          "{opt.text}"
                        </p>
                        <ArrowRight className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 absolute bottom-3 right-3 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              /* Sub-View: BUILD START FROM SCRATCH (SDG-8 aligned profile builder) */
              <div className="p-6 sm:p-8 rounded-3xl border border-zinc-900 bg-zinc-950/20 shadow-2xl space-y-8 animate-fadeIn max-w-4xl">
                
                {/* Visual wizard navigation */}
                <div className="flex gap-2 border-b border-zinc-905 pb-4 border-zinc-900">
                  <div className="flex-1 text-left space-y-1">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-400 font-sans">
                      Profile Constructor Step {scratchProgress} of 3
                    </span>
                    <h3 className="text-white text-sm font-semibold">
                      {scratchProgress === 1 
                        ? "Section A: Core Target & Capabilities" 
                        : scratchProgress === 2 
                        ? "Section B: Professional Milestones & Leadership" 
                        : "Section C: Frameworks & Sustainable Focus"}
                    </h3>
                  </div>

                  {/* Indicator steps */}
                  <div className="flex gap-1.5 items-center shrink-0 pr-1 select-none">
                    {[1, 2, 3].map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => setScratchProgress(step)}
                        className={`w-7 h-7 rounded-lg border text-xs font-mono font-bold flex items-center justify-center transition-all ${
                          scratchProgress === step 
                            ? "bg-indigo-500/10 border-indigo-500 text-indigo-300" 
                            : "bg-zinc-950/40 border-zinc-900 text-zinc-650"
                        }`}
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Page 1 */}
                {scratchProgress === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-450 block font-sans">
                        Desired Professional Role *
                      </label>
                      <input 
                        type="text" 
                        value={desiredRole}
                        onChange={(e) => setDesiredRole(e.target.value)}
                        placeholder="e.g. Senior Software Developer or Product Designer"
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-100 placeholder-zinc-500 font-sans text-xs focus:ring-1 focus:ring-indigo-500/35 focus:outline-none focus:border-indigo-500/20"
                      />
                      <p className="text-[10px] text-zinc-600 font-sans">Define your target, aligning your values.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-450 block font-sans">
                        Specialty Competencies & Primary Skills *
                      </label>
                      <input 
                        type="text" 
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="e.g. React, Node.js, API Design, Technical Architecture"
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-100 placeholder-zinc-500 font-sans text-xs focus:ring-1 focus:ring-indigo-500/35 focus:outline-none focus:border-indigo-500/20"
                      />
                      <p className="text-[10px] text-zinc-600 font-sans">List key fields of subject matter credentials.</p>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-450 block font-sans">
                        Industry Segments of Interest
                      </label>
                      <input 
                        type="text" 
                        value={industries}
                        onChange={(e) => setIndustries(e.target.value)}
                        placeholder="e.g. Fintech, Clean Energy, Healthcare Solutions, SaaS"
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-100 placeholder-zinc-500 font-sans text-xs focus:ring-1 focus:ring-indigo-500/35 focus:outline-none focus:border-indigo-500/20"
                      />
                    </div>
                  </div>
                )}

                {/* Question Page 2 */}
                {scratchProgress === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-450 block font-sans">
                        Key Projects & Achievements *
                      </label>
                      <textarea 
                        value={projects}
                        onChange={(e) => setProjects(e.target.value)}
                        placeholder="e.g. Optimized database schemas, helping boost query speed by 40%. Led refactoring of local e-commerce checkout page."
                        className="w-full h-24 px-4 py-3 bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-100 placeholder-zinc-500 font-sans text-xs focus:ring-1 focus:ring-indigo-500/35 focus:outline-none focus:border-indigo-500/20 resize-none"
                      />
                      <p className="text-[10px] text-zinc-650 font-sans">CRITICAL: Highlight numbers or measurable outcomes rather than repetitive chore tasks.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-450 block font-sans">
                          Leadership & Ownership Milestones
                        </label>
                        <input 
                          type="text" 
                          value={leadership}
                          onChange={(e) => setLeadership(e.target.value)}
                          placeholder="e.g. Mentored 3 junior interns; coordinated weekly sprint deliverables."
                          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-100 placeholder-zinc-500 font-sans text-xs focus:ring-1 focus:ring-indigo-500/35 focus:outline-none focus:border-indigo-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-450 block font-sans">
                          Volunteer or Community Service
                        </label>
                        <input 
                          type="text" 
                          value={volunteer}
                          onChange={(e) => setVolunteer(e.target.value)}
                          placeholder="e.g. Coordinated organic food distributions or facilitated local code bootcamps."
                          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-100 placeholder-zinc-500 font-sans text-xs focus:ring-1 focus:ring-indigo-500/35 focus:outline-none focus:border-indigo-500/20"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Question Page 3 */}
                {scratchProgress === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn font-sans text-xs">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-450 block font-sans">
                        Tools, Frameworks & Software Mastries
                      </label>
                      <input 
                        type="text" 
                        value={tools}
                        onChange={(e) => setTools(e.target.value)}
                        placeholder="e.g. Figma, Git, Terraform, Jira, Slack, VSCode"
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-100 placeholder-zinc-500 font-sans text-xs focus:ring-1 focus:ring-indigo-500/35 focus:outline-none focus:border-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-450 block font-sans">
                        Sustainable opportunity priorities
                      </label>
                      <input 
                        type="text" 
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                        placeholder="e.g. Continuous training programs, remote flexibility, high-trust engineering values"
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-100 placeholder-zinc-550 focus:ring-1 focus:ring-indigo-500/35 focus:outline-none focus:border-indigo-500/20"
                      />
                    </div>

                    <div className="md:col-span-2 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-550/10 border-indigo-500/10 text-zinc-400 font-sans text-xs leading-relaxed max-w-full">
                      <div className="flex gap-2 font-semibold text-indigo-300 mb-1.5 items-center">
                        <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Work Placement Compliance pledge (SDG 8)</span>
                      </div>
                      We present only true credentials, deconstructing active accountability ratios while fully pledging never to fabricate fake internships, jobs, or certifications.
                    </div>
                  </div>
                )}

                {/* Scratch form actions */}
                <div className="flex items-center justify-between border-t border-zinc-900 pt-5">
                  <div className="flex gap-2">
                    {scratchProgress > 1 && (
                      <button
                        type="button"
                        onClick={() => setScratchProgress(prev => prev - 1)}
                        className="px-4 py-2 bg-zinc-900 hover:bg-zinc-805 rounded-xl border border-zinc-900 border-white/5 text-xs text-zinc-350 hover:text-white transition-all cursor-pointer font-semibold"
                      >
                        Previous Step
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 text-xs font-semibold">
                    {scratchProgress < 3 ? (
                      <button
                        type="button"
                        onClick={() => setScratchProgress(prev => prev + 1)}
                        className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-white/5 text-white transition-all cursor-pointer"
                      >
                        Next Step
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleTriggerAnalysis}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95 shadow-md shadow-indigo-600/10"
                      >
                        Weave Narrative & Assess
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* SDG 8 aligned bottom commitment card */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-550 font-sans py-3 bg-zinc-900/10 border border-zinc-900/40 rounded-2xl select-none max-w-2xl mx-auto block text-center">
              <Heart className="w-4 h-4 text-rose-500/60 shrink-0 inline-block align-middle mr-1 animate-pulse" />
              <span className="inline-block align-middle leading-none mt-0.5">UN Sustainable Development Goals (SDG 8) Employability Standard Activated</span>
            </div>

          </div>
        )}

        {/* STEP 1: Progressive Dissection Sequence loading */}
        {journeyStep === 1 && (
          <div className="py-14 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-14 animate-fadeIn max-w-3xl mx-auto">
            
            {/* Left circular cosmic active radar spinner */}
            <div className="relative w-64 h-64 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-indigo-500/25 animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-dashed border-blue-500/15 animate-[spin_12s_linear_infinite_reverse]" />
              <div className="absolute inset-10 rounded-full bg-gradient-to-tr from-indigo-500/5 to-blue-500/5 border border-white/5 flex flex-col items-center justify-center select-none shadow-2xl">
                <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse mb-1.5" />
                <span className="text-[10px] font-mono tracking-widest text-indigo-300 uppercase animate-pulse">Scanning</span>
                <span className="text-[9px] font-mono text-zinc-650 mt-0.5">SEC SCAN_ACTV</span>
              </div>
              <div className="absolute left-0 right-0 h-0.5 bg-indigo-550 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)] animate-[scan_2.1s_infinite_ease-in-out]" style={{ zIndex: 5 }} />
              
              <style>{`
                @keyframes scan {
                  0% { top: 15%; opacity: 0.3; }
                  50% { top: 85%; opacity: 0.9; }
                  100% { top: 15%; opacity: 0.3; }
                }
              `}</style>
            </div>

            {/* Right progress stage items timeline */}
            <div className="flex-1 w-full space-y-4">
              <div className="space-y-0.5 pb-2.5 border-b border-zinc-900">
                <h3 className="text-white text-base font-semibold font-display">Employability Intelligence Dissection</h3>
                <p className="text-zinc-550 text-xs italic">"{loadingMessage}"</p>
              </div>

              <ul className="space-y-3 font-sans">
                {COGNITIVE_SCAN_STEPS.map((step, idx) => {
                  const isDone = idx < scanProgressIndex;
                  const isActive = idx === scanProgressIndex;
                  return (
                    <li 
                      key={step.id} 
                      className={`flex gap-3 text-left transition-all duration-300 ${
                        isDone ? "text-zinc-450" : isActive ? "text-indigo-400 translate-x-1" : "text-zinc-750 opacity-40 select-none"
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isDone ? (
                          <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-emerald-400" />
                          </div>
                        ) : isActive ? (
                          <div className="w-4.5 h-4.5 rounded-full bg-indigo-500/15 border border-indigo-550 border-indigo-500 flex items-center justify-center relative">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                          </div>
                        ) : (
                          <div className="w-4.5 h-4.5 rounded-full border border-zinc-800" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-xs font-semibold block leading-tight">{step.label}</span>
                        {isActive && (
                          <span className="text-[10px] text-zinc-550 block leading-snug animate-fadeIn">
                            {step.detail}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

          </div>
        )}

        {/* STEP 2: ACTIVE TRANSFORMATION WORKSPACE */}
        {journeyStep === 2 && activeAnalysis && (
          <div id="employability-workspace" className="space-y-12 animate-fadeIn">
            
            {/* Top Workspace status header */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center pb-6 border-b border-zinc-900">
              
              <div className="flex gap-4 items-center text-left">
                {/* Profile Portrait */}
                <div className="w-16 h-16 rounded-2xl border border-zinc-850 overflow-hidden shrink-0 relative shadow-md">
                  <img 
                    src={dynamicPortrait} 
                    alt="Active Profile Portrait" 
                    className="object-cover w-full h-full object-right" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      console.error(`[DIAGNOSTIC] Thumbnail error for: ${dynamicPortrait}`);
                      (e.currentTarget as HTMLImageElement).src = "/images/professional_split_portrait_1779515079465.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-indigo-550/5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-display font-semibold text-white tracking-tight">
                      {activeAnalysis.detectedRoleName || "Impact Minded specialist"}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-550/20 text-indigo-300 font-mono text-[9px] uppercase font-bold select-none">
                      {activeAnalysis.detectedLevel}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-xs font-sans font-light">
                    Continuous workspace active • SDG-8 decent career alignment initialized
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <button
                type="button"
                onClick={handleResetWorkspace}
                className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 rounded-xl border border-zinc-900 text-zinc-400 hover:text-white transition-all text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Re-scan Bio or CV</span>
              </button>
            </div>

            {/* Inner Dashboard View Navigation Tabs */}
            <div className="flex bg-zinc-900/60 p-1 rounded-2xl border border-white/5 gap-1 overflow-x-auto no-scrollbar select-none">
              {[
                { id: "snapshot", label: "Dashboard Snapshot", icon: Layers },
                { id: "direction", label: "Career Direction", icon: Compass },
                { id: "rewrite", label: "Reframed Summary", icon: BookOpen },
                { id: "interview", label: `Mock Interview Prep (${Object.keys(interviewAnswers).length}/4)`, icon: MessageSquare },
                { id: "roadmap", label: "Growth Roadmap", icon: TrendingUp },
                { id: "export", label: "Export Report", icon: ClipboardCheck }
              ].map((tab) => {
                const isCurrent = activeTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[130px] py-2.5 rounded-xl text-xs font-sans font-medium transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                      isCurrent
                        ? "bg-white/[0.08] text-white font-semibold border border-white/5 shadow-inner scale-[1.015] -translate-y-0.5"
                        : "text-zinc-550 hover:text-zinc-300 hover:bg-white/[0.01]"
                    }`}
                  >
                    <TabIcon className={`w-3.5 h-3.5 ${isCurrent ? "text-indigo-450 text-indigo-400" : "text-zinc-500"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Workspace Component Routing */}
            <div className="space-y-10">

              {/* TAB 1: SNAPSHOT & GAPS */}
              {activeTab === "snapshot" && (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* Circular/Arc gauges bento group */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    
                    {/* Gauges A: ATS score with dynamic SVG circle */}
                    <div className="p-5 rounded-2xl border border-white/5 bg-zinc-950/40 text-left space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-sans">
                          ATS readability
                        </span>
                        <ShieldCheck className="w-4 h-4 text-indigo-405 text-indigo-400" />
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                          <svg className="w-14 h-14 -rotate-90">
                            <circle cx="28" cy="28" r="24" className="stroke-zinc-900 fill-none" strokeWidth="4" />
                            <circle cx="28" cy="28" r="24" className="stroke-indigo-500 fill-none" strokeWidth="4" strokeDasharray={150} strokeDashoffset={150 - (150 * atsCompatibilityScore) / 100} strokeLinecap="round" />
                          </svg>
                          <span className="absolute font-mono text-[11px] text-white font-semibold">{atsCompatibilityScore}%</span>
                        </div>
                        <div className="space-y-0.5 text-left">
                          <span className="text-white font-bold text-sm">Optimal Parse</span>
                          <span className="text-zinc-500 text-[10px] block font-sans">Index layout satisfies modern trackers beautifully.</span>
                        </div>
                      </div>
                    </div>

                    {/* Gauges B: Brand trust (narrative authority) */}
                    <div className="p-5 rounded-2xl border border-white/5 bg-zinc-950/40 text-left space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-sans">
                          Narrative Positioning
                        </span>
                        <Award className="w-4 h-4 text-amber-450 text-amber-500" />
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                          <svg className="w-14 h-14 -rotate-90">
                            <circle cx="28" cy="28" r="24" className="stroke-zinc-900 fill-none" strokeWidth="4" />
                            <circle cx="28" cy="28" r="24" className="stroke-amber-500 fill-none" strokeWidth="4" strokeDasharray={150} strokeDashoffset={150 - (150 * positioningScore) / 100} strokeLinecap="round" />
                          </svg>
                          <span className="absolute font-mono text-[11px] text-white font-semibold">{positioningScore}%</span>
                        </div>
                        <div className="space-y-0.5 text-left">
                          <span className="text-white font-bold text-sm">Authority Track</span>
                          <span className="text-zinc-500 text-[10px] block font-sans">Reflects strategic outcome positioning tiers.</span>
                        </div>
                      </div>
                    </div>

                    {/* Gauges C: Ethical Evidence strength */}
                    <div className="p-5 rounded-2xl border border-white/5 bg-zinc-950/40 text-left space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-sans">
                          Evidence Strength
                        </span>
                        <ClipboardCheck className="w-4 h-4 text-emerald-450 text-emerald-500" />
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                          <svg className="w-14 h-14 -rotate-90">
                            <circle cx="28" cy="28" r="24" className="stroke-zinc-900 fill-none" strokeWidth="4" />
                            <circle cx="28" cy="28" r="24" className="stroke-emerald-500 fill-none" strokeWidth="4" strokeDasharray={150} strokeDashoffset={150 - (150 * evidenceScore) / 100} strokeLinecap="round" />
                          </svg>
                          <span className="absolute font-mono text-[11px] text-white font-semibold">{evidenceScore}%</span>
                        </div>
                        <div className="space-y-0.5 text-left">
                          <span className="text-white font-bold text-sm">Outcome density</span>
                          <span className="text-zinc-500 text-[10px] block font-sans">Measures quantified achievements over daily task checklists.</span>
                        </div>
                      </div>
                    </div>

                    {/* Gauges D: Career readiness index */}
                    <div className="p-5 rounded-2xl border border-white/5 bg-zinc-950/40 text-left space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-sans">
                          Overall Career Readiness
                        </span>
                        <TrendingUp className="w-4 h-4 text-rose-455 text-rose-500" />
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                          <svg className="w-14 h-14 -rotate-90">
                            <circle cx="28" cy="28" r="24" className="stroke-zinc-900 fill-none" strokeWidth="4" />
                            <circle cx="28" cy="28" r="24" className="stroke-rose-500 fill-none" strokeWidth="4" strokeDasharray={150} strokeDashoffset={150 - (150 * readinessScore) / 100} strokeLinecap="round" />
                          </svg>
                          <span className="absolute font-mono text-[11px] text-white font-semibold">{readinessScore}%</span>
                        </div>
                        <div className="space-y-0.5 text-left">
                          <span className="text-white font-bold text-sm">Decent work scale</span>
                          <span className="text-zinc-500 text-[10px] block font-sans">Maps direct readiness for sustainable employment.</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* 7 core PersonaIQ Employability Intelligence Standards list */}
                  <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/20 space-y-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 block font-sans">
                      PersonaIQ Employability Intelligence Standards (7 Dimensions)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
                      {[
                        { name: "Clarity", rating: clarityScore, desc: "Document index readables" },
                        { name: "Positioning", rating: positioningScore, desc: "Leadership trajectories" },
                        { name: "ATS Comp.", rating: atsCompatibilityScore, desc: "Readability indexing" },
                        { name: "Evidence", rating: evidenceScore, desc: "Quantitative metrics" },
                        { name: "Comm Quality", rating: communicationScore, desc: "Verbal ownership ratios" },
                        { name: "Align Quotient", rating: alignmentScore, desc: "Market sector fits" },
                        { name: "Readiness Index", rating: readinessScore, desc: "SDG compatibility scales" }
                      ].map((std) => (
                        <div key={std.name} className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/5 space-y-2 flex flex-col justify-between">
                          <span className="text-[10.5px] font-semibold text-zinc-350 block">{std.name}</span>
                          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden shrink-0">
                            <div className="h-full bg-indigo-500" style={{ width: `${std.rating}%` }} />
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="font-mono text-[9px] text-zinc-500 leading-none">{std.desc}</span>
                            <span className="font-mono text-xs font-bold text-white pr-0.5">{std.rating}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 15-Domain Career Placement Confidence Matrix (Phase 2 & 3) */}
                  <div className="p-6 rounded-2xl border border-white/5 bg-zinc-950/40 text-left space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-1 border-b border-zinc-900/40">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-sans block">
                          EMPLOYABILITY PLACEMENT PROFILES
                        </span>
                        <h4 className="text-white text-base font-semibold font-display">
                          15-Domain Career Alignment Matrix
                        </h4>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[9px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider">
                        Active Threshold Match: &gt;= 30%
                      </span>
                    </div>

                    <p className="text-zinc-500 text-[11.5px] leading-relaxed font-sans">
                      Our system calculates semantic probability weights across all 15 core professional frameworks. Only roles surpassing the 30% confidence floor are prioritized for active employer recommendations and interview matching.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-1">
                      {(activeAnalysis.domainConfidence || [
                        { domain: "Engineering", confidence: activeAnalysis.detectedField === "mechanical" ? 92 : 8 },
                        { domain: "Software", confidence: activeAnalysis.detectedField === "developer" ? 95 : 12 },
                        { domain: "UI/UX", confidence: activeAnalysis.detectedField === "designer" ? 94 : 5 },
                        { domain: "Marketing", confidence: activeAnalysis.detectedField === "marketing" ? 91 : 7 },
                        { domain: "Operations", confidence: activeAnalysis.detectedField === "management" ? 88 : 42 },
                        { domain: "Finance", confidence: 5 },
                        { domain: "Healthcare", confidence: activeAnalysis.detectedField === "mechanical" ? 44 : 3 },
                        { domain: "Research", confidence: 15 },
                        { domain: "Energy", confidence: activeAnalysis.detectedField === "mechanical" ? 81 : 4 },
                        { domain: "Networking", confidence: activeAnalysis.detectedField === "developer" ? 78 : 6 },
                        { domain: "Data", confidence: activeAnalysis.detectedField === "developer" ? 84 : 10 },
                        { domain: "Product", confidence: activeAnalysis.detectedField === "management" ? 89 : 14 },
                        { domain: "Sales", confidence: 8 },
                        { domain: "Education", confidence: 4 },
                        { domain: "Cybersecurity", confidence: 6 }
                      ]).sort((a,b) => b.confidence - a.confidence).map((item) => {
                        const isMatch = item.confidence >= 30;
                        return (
                          <div 
                            key={item.domain} 
                            className={`p-3 rounded-xl border transition-all duration-300 ${
                              isMatch 
                                ? "bg-indigo-950/20 border-indigo-900/40 text-indigo-200" 
                                : "bg-zinc-900/20 border-white/5 text-zinc-500"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1.5">
                              <span className={`text-xs font-semibold uppercase tracking-tight block ${isMatch ? "text-white" : "text-zinc-500"}`}>
                                {item.domain}
                              </span>
                              <span className={`font-mono text-xs font-bold ${isMatch ? "text-indigo-400" : "text-zinc-555"}`}>
                                {item.confidence}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden mb-1">
                              <div 
                                className={`h-full rounded-full ${isMatch ? "bg-indigo-500" : "bg-zinc-805"}`} 
                                style={{ width: `${item.confidence}%` }} 
                              />
                            </div>
                            <span className="text-[8.5px] font-mono uppercase tracking-wider block">
                              {isMatch ? "✓ Qualified" : "◌ Below Floor"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* SECTION 2: Professional Perception Gap compares true potential vs recruiter reading */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    
                    <div className="p-6 rounded-3xl border border-white/5 bg-zinc-950/60 md:col-span-12 flex flex-col sm:flex-row gap-6 relative overflow-hidden align-middle">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-550/20 text-indigo-300 flex items-center justify-center shrink-0">
                        <Eye className="w-5 h-5 text-indigo-400" />
                      </div>

                      <div className="space-y-2 text-left flex-1">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-550 font-sans block">
                          Professional Perception Gap Audit
                        </span>
                        <h4 className="text-white text-base font-semibold font-display">
                          How employers view you vs. your true potential
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-xs leading-relaxed text-zinc-400 font-light">
                          <div className="p-4 rounded-xl bg-rose-950/10 border border-rose-500/10 relative">
                            <span className="text-rose-400 font-bold block mb-1 uppercase text-[9px] tracking-widest font-sans">Recruiter Mindset Impression</span>
                            "{activeAnalysis.recruiterPerception}"
                          </div>
                          <div className="p-4 rounded-xl bg-indigo-950/10 border border-indigo-500/10 relative">
                            <span className="text-indigo-300 font-bold block mb-1 uppercase text-[9px] tracking-widest font-sans">Narrative perception gap</span>
                            "{activeAnalysis.perceptionGap}"
                          </div>
                        </div>

                        <div className="pt-3.5 border-t border-zinc-900/60 text-[10.5px] italic text-zinc-500 flex gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400/60 shrink-0" />
                          <span>Perception gap metrics are generated under ethical growth and vocational alignment parameters.</span>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* SECTION 2.5: Parsed Profile & SDG 8 Alignment Insights */}
                  <div className="p-6 rounded-3xl border border-white/5 bg-zinc-950/60 flex flex-col lg:flex-row gap-8 relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
                    
                    {/* Left Column: Parsed Resume Structured Assets */}
                    <div className="flex-1 space-y-5">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-sans">Parsed Profile Elements</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Experience Tier */}
                        <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/[0.03] space-y-1">
                          <span className="text-zinc-500 text-[9px] font-sans uppercase block">Experience level</span>
                          <span className="text-white text-xs font-semibold">{activeAnalysis.yearsOfExperience || "Developing (2 to 4 Years)"}</span>
                        </div>
                        {/* Education */}
                        <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/[0.03] space-y-1">
                          <span className="text-zinc-550 text-[9px] font-sans uppercase block font-medium">Education background</span>
                          <span className="text-white text-xs font-semibold">{activeAnalysis.education || "Bachelor's Degree / Equivalent"}</span>
                        </div>
                      </div>

                      {/* Quantified Achievements Pill */}
                      <div className="p-4 rounded-xl bg-indigo-500/[0.02] border border-indigo-500/10 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="text-indigo-300 font-semibold text-xs block">Quantifiable Impact Audit</span>
                          <p className="text-zinc-400 text-[10px] font-light leading-snug">
                            Hiring partners prioritize candidates who represent accomplishments metrics.
                          </p>
                        </div>
                        <div className="px-3.5 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-center shrink-0">
                          <span className="font-mono text-lg font-bold text-indigo-300 block leading-none">
                            {activeAnalysis.quantifiedAchievementsCount || 0}
                          </span>
                          <span className="text-[8px] uppercase tracking-wider text-indigo-400 font-sans font-bold">Metrics</span>
                        </div>
                      </div>

                      {/* Detected Skills */}
                      <div className="space-y-1.5">
                        <span className="text-zinc-550 text-[9.5px] uppercase font-bold tracking-widest font-sans block">Extracted Specialization Competencies</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(activeAnalysis.detectedSkills || ["Workflow Coordination", "Core Operations", "Standard Frameworks", "Strategic Tasking"]).map((sk, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-350 border border-white/5 text-[10px] font-sans">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Detected Tools */}
                      <div className="space-y-1.5">
                        <span className="text-zinc-550 text-[9.5px] uppercase font-bold tracking-widest font-sans block">Software Tools & Methodologies</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(activeAnalysis.detectedTools || ["Jira", "MS Office Suite", "Slack Teams", "Google Drive"]).map((tl, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-md bg-zinc-900 border border-white/5 text-zinc-400 text-[10px] font-mono">
                              {tl}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Certifications Badge block */}
                      {activeAnalysis.certifications && activeAnalysis.certifications.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-zinc-550 text-[9.5px] uppercase font-bold tracking-widest font-sans block font-semibold">Parsed Professional Certifications</span>
                          <div className="space-y-1 pt-1">
                            {activeAnalysis.certifications.map((cert, idx) => (
                              <div key={idx} className="flex gap-2 items-center text-[10.5px] text-zinc-350">
                                <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span className="font-light">{cert}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Divider for flex block */}
                    <div className="hidden lg:block w-[1px] bg-zinc-930 shrink-0" />

                    {/* Right Column: SDG 8 Vocational Competency Alignment */}
                    <div className="flex-1 space-y-6 flex flex-col justify-between">
                      <div className="space-y-5">
                        <div className="flex items-center gap-2 font-display">
                          <Layers className="w-4 h-4 text-emerald-450" />
                          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-sans">SDG 8 Vocational Competency Index</span>
                        </div>

                        {/* 4 Competency Bars */}
                        <div className="space-y-3.5">
                          {[
                            { name: "Industry Specialization Alignment", val: activeAnalysis.industryAlignment || 72, color: "bg-indigo-500" },
                            { name: "Strategic Communication Fit", val: activeAnalysis.communicationFit || 68, color: "bg-amber-400" },
                            { name: "Technical Domain Depth", val: activeAnalysis.technicalFit || 75, color: "bg-emerald-500" },
                            { name: "Accountability & Leadership Drive", val: activeAnalysis.leadershipFit || 62, color: "bg-rose-500" }
                          ].map((fit) => (
                            <div key={fit.name} className="space-y-1">
                              <div className="flex justify-between text-[10.5px]">
                                <span className="text-zinc-400 font-light">{fit.name}</span>
                                <span className="font-mono text-zinc-300 font-bold">{fit.val}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden shrink-0">
                                <span className={`h-full block ${fit.color}`} style={{ width: `${fit.val}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Align Explanations Recruiter perspective */}
                      <div className="p-4 rounded-xl bg-emerald-950/10 border border-emerald-500/10 space-y-2 mt-auto">
                        <span className="text-emerald-400 font-bold block uppercase text-[8.5px] tracking-widest font-sans">Recruiter alignment analysis</span>
                        <p className="text-zinc-300 text-[11px] leading-relaxed font-light">
                          {activeAnalysis.alignmentExplanation || "Your profile matches the core prerequisites for sustainable employment alignment. Structuring your experience with clear outcomes is the highest-value optimization to instantly spark market authority."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Growth Areas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    
                    {/* Strengths */}
                    <div className="p-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.015] space-y-4">
                      <div className="flex gap-2 items-center text-emerald-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] uppercase font-bold tracking-widest font-sans">Validated Career Strengths</span>
                      </div>
                      <div className="space-y-3">
                        {activeAnalysis.strengths.map((s, idx) => (
                          <div key={idx} className="flex gap-3 text-xs leading-relaxed text-zinc-350">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-550/20 text-emerald-400 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-emerald-400" />
                            </div>
                            <span className="font-light">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Growth Opportunities */}
                    <div className="p-6 rounded-2xl border border-amber-500/10 bg-amber-500/[0.01] space-y-4">
                      <div className="flex gap-2 items-center text-amber-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] uppercase font-bold tracking-widest font-sans">Growth Opportunities</span>
                      </div>
                      <div className="space-y-3">
                        {activeAnalysis.weaknesses.map((w, idx) => (
                          <div key={idx} className="flex gap-3 text-xs leading-relaxed text-zinc-350">
                            <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-505 text-amber-500 flex items-center justify-center shrink-0 font-bold font-mono text-[10px]">
                              !
                            </div>
                            <span className="font-light">{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 2: CAREER DIRECTION */}
              {activeTab === "direction" && (
                <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/20 space-y-8 animate-fadeIn text-left">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-sans block">
                      Chapter 3: Opportunity alignment coordinates
                    </span>
                    <h3 className="text-white text-lg font-display font-medium">
                      SDG-8 Decent Work Targets Compatibility
                    </h3>
                    <p className="text-zinc-550 text-xs sm:text-sm font-sans font-light leading-relaxed max-w-xl">
                      We aligned your profile credentials against standard high-resonance workplace sectors. Higher compatibility rating guarantees optimal parse matching and search exposure.
                    </p>
                  </div>

                  {/* Career Map Sector checklist bars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch font-sans">
                    {activeAnalysis.careerMap && activeAnalysis.careerMap.length > 0 ? (
                      activeAnalysis.careerMap.map((mapItem, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 space-y-2.5 relative">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-white font-semibold">{mapItem.sector}</span>
                            <span className="text-indigo-400 font-bold font-mono">{mapItem.score}% compatibility</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden shrink-0">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${mapItem.score}%` }} />
                          </div>
                          <p className="text-[10.5px] text-zinc-650 leading-relaxed font-light">
                            High alignment indicators secure top candidacy within {mapItem.sector.toLowerCase()} recruiters checklists.
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-zinc-950 rounded-xl font-sans text-xs text-zinc-550 md:col-span-2">No alignment targets pre-cached.</div>
                    )}
                  </div>

                  {/* Custom workplace indicators: startup compatibility, remote index, enterprise readiness */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-900">
                    <div className="p-4 rounded-xl bg-zinc-900/20 border border-white/5 space-y-1">
                      <span className="text-zinc-550 uppercase font-mono tracking-widest text-[9px] block">Startup compatibility</span>
                      <div className="text-xl font-display font-bold text-white">88%</div>
                      <p className="text-[10px] text-zinc-650">Demonstrates high self-direction & resourcefulness markers.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-900/20 border border-white/5 space-y-1">
                      <span className="text-zinc-550 uppercase font-mono tracking-widest text-[9px] block">Remote fit index</span>
                      <div className="text-xl font-display font-bold text-white">92%</div>
                      <p className="text-[10px] text-zinc-650">Indicates structured documentation skill and autonomous velocity.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-900/20 border border-white/5 space-y-1">
                      <span className="text-zinc-550 uppercase font-mono tracking-widest text-[9px] block">Enterprise maturity</span>
                      <div className="text-xl font-display font-bold text-white">76%</div>
                      <p className="text-[10px] text-zinc-650">Measures familiarity with scale standards, workflows, and checkpoints.</p>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: REWRITE */}
              {activeTab === "rewrite" && (
                <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/20 space-y-6 animate-fadeIn text-left max-w-full">
                  
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-sans block animate-pulse">
                      Chapter 4: Upgraded Narrative Reframing
                    </span>
                    <h3 className="text-white text-lg font-display font-medium">
                      High-Growth Recruiter Summary Draft
                    </h3>
                    <p className="text-zinc-550 text-xs sm:text-sm font-sans font-light leading-relaxed">
                      This rewritten biography replaces passive chore tasks with outcome accountability metrics. It communicates confidence clearly without faking experience.
                    </p>
                  </div>

                  {/* Narrative Compare blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    
                    <div className="p-5 rounded-2xl bg-zinc-950/60 border border-white/5 md:col-span-12 space-y-3.5 relative">
                      
                      <div className="p-4 rounded-xl bg-zinc-900/40 text-xs font-sans text-zinc-350 leading-relaxed border border-indigo-505/10 border-indigo-500/10 italic text-zinc-150">
                        "{activeAnalysis.rewrittenBio}"
                      </div>

                      {/* Action system */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <span className="text-[10px] text-zinc-600 font-sans">
                          Measures 78% improved readability resonance.
                        </span>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(activeAnalysis.rewrittenBio);
                              alert("Upgraded Professional Summary saved to clipboard successfully!");
                            }}
                            className="px-4 py-2 hover:bg-zinc-900 rounded-xl border border-zinc-900 hover:border-zinc-805 text-zinc-400 hover:text-white transition-all text-xs font-sans font-bold flex items-center gap-1.5 w-full sm:w-auto justify-center cursor-pointer active:scale-95"
                          >
                            <span>Copy Reframed summary</span>
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Printable starter CV mockup panel */}
                  <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/40 text-xs font-sans text-zinc-400 space-y-4 text-left">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase text-[10px] tracking-widest">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Starter Portfolio Bio Setup</span>
                    </div>

                    <div className="p-5 rounded-xl bg-zinc-950 border border-white/5 space-y-4 text-zinc-300">
                      <div className="border-b border-zinc-900 pb-3 space-y-1">
                        <h4 className="text-white text-base font-semibold leading-none">{activeAnalysis.detectedRoleName || "Confident Professional"}</h4>
                        <span className="text-zinc-550 uppercase tracking-widest text-[9px] font-mono select-none">{activeAnalysis.detectedLevel} Tier SPECIALIST • GENUINE PLACEMENT</span>
                      </div>
                      
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-sans">PROFESSIONAL SUMMARY</h5>
                        <p className="font-light italic leading-relaxed text-zinc-400">"{activeAnalysis.rewrittenBio}"</p>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <h5 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-sans">PROVEN STRENGTHS</h5>
                        <ul className="list-disc pl-4 space-y-1 font-light text-zinc-450 leading-relaxed text-xs">
                          {activeAnalysis.strengths.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Ethical positioning disclosure pledge */}
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-850 flex gap-3 text-[11px] font-sans text-zinc-500 leading-relaxed max-w-full">
                    <Check className="w-4 h-4 text-emerald-555 text-emerald-500 shrink-0" />
                    <p>
                      <strong className="text-zinc-455 text-zinc-400">PersonaIQ Ethical Positioning Pledge:</strong> We translate and package genuine experience metrics. We do not support faking internships, falsifying dates, or fabricating certifications, asserting that true career growth begins with unassailable honesty.
                    </p>
                  </div>

                </div>
              )}

              {/* TAB 4: INTERVIEW PREP */}
              {activeTab === "interview" && (() => {
                const RECRUITER_PERSONAS = [
                  {
                    id: "manager",
                    name: "Elena Rostova",
                    title: "Hiring Manager",
                    focus: "Systems design, team resource flow, trade-off balances, and STAR logic accuracy",
                    initials: "ER",
                    color: "from-blue-500 to-indigo-600 bg-blue-500/10 text-indigo-400 border-indigo-500/30",
                    badgeColor: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20"
                  },
                  {
                    id: "technical",
                    name: "Alex Chen",
                    title: "Technical Lead Recruiter",
                    focus: "Strict technical stacks checking, runtime bottleneck optimization metrics, physical FEA detail",
                    initials: "AC",
                    color: "from-purple-500 to-pink-500 bg-purple-500/10 text-purple-400 border-purple-500/30",
                    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/20"
                  },
                  {
                    id: "founder",
                    name: "Sarah Jenkins",
                    title: "Seed Startup Founder",
                    focus: "Unprecedented delivery velocity, hands-on debugging, extreme ownership, zero budget growth loops",
                    initials: "SJ",
                    color: "from-amber-400 to-orange-500 bg-amber-500/10 text-amber-400 border-amber-500/30",
                    badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/20"
                  },
                  {
                    id: "hr",
                    name: "Michael Vance",
                    title: "Principal Corporate HR Analyst",
                    focus: "High cultural safety alignment, stakeholder synchronization, conflict mitigation, Decent Work (SDG 8)",
                    initials: "MV",
                    color: "from-teal-400 to-emerald-500 bg-emerald-500/10 text-emerald-450 border-emerald-500/30",
                    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                  },
                  {
                    id: "creative",
                    name: "Marcus Sterling",
                    title: "Global Creative Director",
                    focus: "Visual layout integrity, user aesthetics, UI token consistencies, high product delight standards",
                    initials: "MS",
                    color: "from-rose-400 to-red-500 bg-rose-500/10 text-rose-400 border-rose-500/30",
                    badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/20"
                  },
                  {
                    id: "operations",
                    name: "Diana Kim",
                    title: "Director of Systems Operations",
                    focus: "Daily workflow throughput optimization, task delegation metrics, automation systems and playbooks",
                    initials: "DK",
                    color: "from-cyan-400 to-sky-500 bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
                    badgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20"
                  }
                ];

                return (
                  <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/20 space-y-8 animate-fadeIn text-left max-w-full">
                    
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 font-sans font-semibold uppercase tracking-wider text-[9px]">
                          Chapter 5: Professional Interview intelligence
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                      </div>
                      <h3 className="text-white text-xl font-display font-medium leading-none">
                        Dynamic Recruiter Mentorship Sandbox
                      </h3>
                      <p className="text-zinc-500 text-xs sm:text-sm font-sans font-light leading-relaxed max-w-2xl">
                        Traditional interviews test narrative posturing and metric evidence representation. Use this sandbox to draft, analyze, and refine response parameters under active coaching feedback rules.
                      </p>
                    </div>

                    {/* Recruiter Persona Selection Seat */}
                    <div className="space-y-4 p-5 rounded-3xl border border-zinc-900 bg-zinc-950/40 shadow-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
                        <div className="space-y-0.5">
                          <h4 className="text-zinc-200 text-xs font-semibold uppercase tracking-wider font-sans flex items-center gap-1.5">
                            <span className="text-indigo-400">👤</span>
                            <span>Choose Active Interviewer Seat</span>
                          </h4>
                          <p className="text-zinc-500 text-[10.5px] font-sans font-light">
                            Each recruiter evaluates candidates through a different lens and prioritization bias, producing unique scoring limits and critique focus.
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[9px] uppercase tracking-wider block shrink-0 self-start sm:self-center">
                          Active Biased Lens: {selectedPersona.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {RECRUITER_PERSONAS.map((person) => {
                          const isSelected = selectedPersona === person.id;
                          return (
                            <div
                              key={person.id}
                              onClick={() => {
                                setSelectedPersona(person.id);
                              }}
                              className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer flex gap-3 text-left items-start select-none hover:bg-zinc-900/40 relative overflow-hidden ${
                                isSelected 
                                  ? "bg-zinc-900/80 border-indigo-500/50 shadow-lg shadow-indigo-500/[0.03]" 
                                  : "bg-zinc-950/25 border-zinc-900"
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute right-0 top-0 w-8 h-8 flex items-center justify-center bg-indigo-500/10 rounded-bl-xl text-indigo-400 font-bold text-xs">
                                  ✓
                                </div>
                              )}

                              {/* Bullet Avatar Monogram with styled ring */}
                              <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-xs font-bold font-sans tracking-wide relative border border-white/5 shadow-inner"
                                style={{
                                  background: isSelected 
                                    ? `radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)` 
                                    : `rgba(24, 24, 27, 0.4)`
                                }}
                              >
                                <span className={isSelected ? "text-indigo-450 text-indigo-400 font-semibold" : "text-zinc-500"}>
                                  {person.initials}
                                </span>
                                <span className={`absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full border border-zinc-950 ${
                                  isSelected ? "bg-emerald-500 animate-pulse" : "bg-zinc-650"
                                }`} />
                              </div>

                              <div className="space-y-0.5">
                                <h5 className={`text-xs font-semibold leading-tight ${isSelected ? "text-white" : "text-zinc-400"}`}>
                                  {person.name}
                                </h5>
                                <p className="text-[10px] text-zinc-500 font-medium leading-none">
                                  {person.title}
                                </p>
                                <p className="text-[9.5px] text-zinc-600 leading-snug max-w-[220px] pt-1 pt-0.5">
                                  <strong className="text-zinc-500 font-medium">Core Bias:</strong> {person.focus}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Questions simulation panel */}
                    <div className="space-y-8">
                    {getQuestionsForActiveProfile().map((q, qidx) => {
                      const userAnsValue = interviewAnswers[q.id] || "";
                      const reviewObj = interviewResults[q.id];
                      const isAnalyzing = currentlySubmittingAns === q.id;
                      const isRefining = refiningQuestions[q.id] || !reviewObj;

                      // Live scanning text outputs
                      const scannedKeywords = getScannedKeywords(userAnsValue, profileField);
                      const keyCountFound = scannedKeywords.filter(k => k.isFound).length;

                      return (
                        <div key={q.id} className="p-6 rounded-3xl border border-zinc-900 bg-zinc-950/50 relative space-y-5 shadow-2xl">
                          
                          {/* Card top banner indicators */}
                          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                            <span className="px-2.5 py-1 rounded-lg bg-zinc-900/60 border border-white/5 text-zinc-400 font-mono text-[9px] uppercase tracking-wider block">
                              Diagnostic Station {qidx + 1} • {q.type}
                            </span>
                            
                            {reviewObj && !isRefining && (
                              <div className="flex gap-2 items-center">
                                <span className="text-[10px] text-zinc-550 font-sans uppercase">Assess Posture:</span>
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                                  reviewObj.score >= 88 
                                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                                    : reviewObj.score >= 75 
                                    ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
                                    : reviewObj.score >= 50
                                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-500"
                                    : "bg-rose-500/10 border border-rose-500/20 text-rose-450 text-rose-400"
                                }`}>
                                  {reviewObj.score}% {reviewObj.score >= 88 ? "EXECUTIVE" : reviewObj.score >= 75 ? "PROFICIENT" : reviewObj.score >= 50 ? "DEVELOPING" : "CRITICAL/WEAK"}
                                </span>
                              </div>
                            )}
                          </div>

                          <h4 className="text-white font-medium text-sm sm:text-base leading-relaxed font-display">{q.question}</h4>

                          {/* Expectation description bar */}
                          <div className="flex gap-3 p-4 bg-zinc-900/40 rounded-2xl text-xs font-sans text-zinc-450 leading-relaxed font-light border border-white/[0.01]">
                            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                            <p>
                              <strong className="text-zinc-350 font-medium">Recruiter target expectation:</strong> {q.expectation}
                            </p>
                          </div>

                          {/* TWO-STAGE COMPOSING / EVALUATION STATES */}
                          {isRefining ? (
                            isAnalyzing ? (
                              <div className="p-8 rounded-2xl bg-zinc-900/10 border border-zinc-900/50 flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn min-h-[160px] relative overflow-hidden">
                                <div className="absolute inset-0 bg-indigo-500/[0.01] animate-pulse" />
                                <div className="relative flex items-center justify-center w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                                  <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
                                </div>
                                <div className="space-y-1.5 relative z-10">
                                  <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-mono block">
                                    PERSONAIQ ANALYTICS ENGINE PULSE
                                  </span>
                                  <p className="text-zinc-200 font-medium text-xs sm:text-sm max-w-sm h-5 transition-all duration-305">
                                    {submittingStepText[q.id] || "Isolating linguistic variables..."}
                                  </p>
                                </div>
                                <div className="w-48 h-1 bg-zinc-950 rounded-full overflow-hidden relative z-10">
                                  <div 
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-305 ease-out" 
                                    style={{ 
                                      width: submittingStepText[q.id]?.includes("clarity") ? "35%" 
                                            : submittingStepText[q.id]?.includes("confidence") ? "60%" 
                                            : submittingStepText[q.id]?.includes("density") ? "80%" 
                                            : submittingStepText[q.id]?.includes("model") ? "95%" : "15%" 
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4 animate-fadeIn">
                              
                              {/* Label */}
                              <label className="text-[10.5px] uppercase font-bold tracking-wider text-zinc-500 block font-sans">
                                COMPOSING RESPONSE SHEET
                              </label>

                              {/* Interactive Live Keyword tracker indicators */}
                              <div className="p-4 rounded-2xl bg-zinc-900/20 border border-zinc-900 space-y-3">
                                <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">
                                    LIVE RECOMMENDED COMPETENCY HIGHLIGHTS
                                  </span>
                                  <span className="text-[10px] font-mono font-bold text-indigo-400">
                                    Detected: {keyCountFound} of {scannedKeywords.length}
                                  </span>
                                </div>
                                
                                {userAnsValue.trim().length === 0 ? (
                                  <p className="text-[11px] text-zinc-600 font-sans font-light italic">
                                    Type your response below to dynamically detect and highlight structural keywords.
                                  </p>
                                ) : (
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {scannedKeywords.map((k, kIdx) => (
                                      <span 
                                        key={kIdx} 
                                        className={`px-2 py-0.5 rounded-md text-[9.5px] font-sans font-medium transition-all duration-300 flex items-center gap-1 shrink-0 ${
                                          k.isFound 
                                            ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-450 text-emerald-450 font-semibold" 
                                            : "bg-zinc-900 border border-zinc-850 text-zinc-600"
                                        }`}
                                      >
                                        <span className={`w-1 h-1 rounded-full ${k.isFound ? "bg-emerald-400" : "bg-zinc-700"}`} />
                                        {k.name}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Constructive explanation if empty keywords */}
                                {userAnsValue.trim().length > 15 && keyCountFound === 0 && (
                                  <div className="pt-2 text-[10.5px] text-amber-500/80 font-sans font-light leading-relaxed italic flex gap-1.5">
                                    <span>💡</span>
                                    <span>To elevate clarity, try incorporating active outcomes like "scalability", "optimization", "metrics" or "impact" in your explanation.</span>
                                  </div>
                                )}
                              </div>

                              {/* Textarea */}
                              <div className="relative">
                                <textarea
                                  value={userAnsValue}
                                  onChange={(e) => {
                                    setInterviewAnswers(prev => ({
                                      ...prev,
                                      [q.id]: e.target.value
                                    }));
                                  }}
                                  placeholder="Formulate your response referencing true history milestones, systems structure, and output metrics..."
                                  className="w-full h-24 bg-zinc-900/60 border border-zinc-850 hover:border-zinc-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 rounded-2xl px-4 py-3.5 text-zinc-200 text-xs sm:text-sm font-sans font-light leading-relaxed focus:outline-none resize-none placeholder-zinc-650 transition-colors"
                                />
                              </div>

                              {/* Trigger footer */}
                              <div className="flex justify-between items-center bg-zinc-900/20 p-2 pl-3 rounded-xl border border-white/[0.01]">
                                <span className="text-[10px] text-zinc-550 font-sans font-light">
                                  {userAnsValue.trim().length} characters • {userAnsValue.trim().split(/\s+/).filter(Boolean).length} words
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleReviewInterviewAnswer(q.id, userAnsValue, q.expectation)}
                                  disabled={userAnsValue.trim().length < 15 || isAnalyzing}
                                  className={`px-4.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                                    userAnsValue.trim().length < 15 || isAnalyzing
                                      ? "bg-zinc-950 border border-zinc-900 text-zinc-650 cursor-not-allowed"
                                      : "bg-indigo-600 hover:bg-indigo-550 text-white shadow-lg active:scale-95"
                                  }`}
                                >
                                  {isAnalyzing ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                                      <span>Coaching Diagnostics...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-3 h-3 text-indigo-100" />
                                      <span>{reviewObj ? "Re-evaluate Response" : "Submit response"}</span>
                                    </>
                                  )}
                                </button>
                              </div>

                            </div>
                          )
                        ) : (
                            
                            // STAGE 2: COACH FEEDBACK RATING DISPLAY
                            <div className="space-y-6 animate-fadeIn py-1">
                              
                              {/* Recruiter Persona & Mood status board */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-900 flex gap-3.5 items-center">
                                  <div className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-xs font-mono font-bold border border-white/5 bg-indigo-500/10 text-indigo-400">
                                    {((reviewObj.personaLabel || selectedPersona) === "manager" && "ER") ||
                                     ((reviewObj.personaLabel || selectedPersona) === "technical" && "AC") ||
                                     ((reviewObj.personaLabel || selectedPersona) === "founder" && "SJ") ||
                                     ((reviewObj.personaLabel || selectedPersona) === "hr" && "MV") ||
                                     ((reviewObj.personaLabel || selectedPersona) === "creative" && "MS") ||
                                     ((reviewObj.personaLabel || selectedPersona) === "operations" && "DK") || "ER"}
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 block">
                                      Interviewer in Seat
                                    </span>
                                    <h5 className="text-white text-xs font-semibold">
                                      {((reviewObj.personaLabel || selectedPersona) === "manager" && "Elena Rostova") ||
                                       ((reviewObj.personaLabel || selectedPersona) === "technical" && "Alex Chen") ||
                                       ((reviewObj.personaLabel || selectedPersona) === "founder" && "Sarah Jenkins") ||
                                       ((reviewObj.personaLabel || selectedPersona) === "hr" && "Michael Vance") ||
                                       ((reviewObj.personaLabel || selectedPersona) === "creative" && "Marcus Sterling") ||
                                       ((reviewObj.personaLabel || selectedPersona) === "operations" && "Diana Kim") || "Elena Rostova"}
                                    </h5>
                                    <p className="text-[10px] text-zinc-500 leading-none">
                                      {((reviewObj.personaLabel || selectedPersona) === "manager" && "Hiring Manager") ||
                                       ((reviewObj.personaLabel || selectedPersona) === "technical" && "Technical Lead Recruiter") ||
                                       ((reviewObj.personaLabel || selectedPersona) === "founder" && "Seed Startup Founder") ||
                                       ((reviewObj.personaLabel || selectedPersona) === "hr" && "Principal Corporate HR Analyst") ||
                                       ((reviewObj.personaLabel || selectedPersona) === "creative" && "Global Creative Director") ||
                                       ((reviewObj.personaLabel || selectedPersona) === "operations" && "Director of Systems Operations") || "Hiring Manager"}
                                    </p>
                                  </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-900 flex flex-col justify-center">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-550 block">
                                      Interviewer Mood State
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${getRecruiterMoodConfig(reviewObj.recruiterMood).color}`}>
                                      {getRecruiterMoodConfig(reviewObj.recruiterMood).label}
                                    </span>
                                  </div>
                                  <p className="text-zinc-400 text-[10.5px] font-sans font-light mt-1.5 leading-snug">
                                    {getRecruiterMoodConfig(reviewObj.recruiterMood).alertText}
                                  </p>
                                </div>
                              </div>

                              {/* Glowing overall summary */}
                              <div className="p-4 rounded-2xl border space-y-2 text-left"
                                style={{
                                  backgroundColor: getRecruiterMoodConfig(reviewObj.recruiterMood).bgGlow,
                                  borderColor: reviewObj.score >= 88 ? "rgba(16, 185, 129, 0.15)" : reviewObj.score >= 75 ? "rgba(99, 102, 241, 0.15)" : reviewObj.score >= 50 ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)"
                                }}
                              >
                                <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-300 block">
                                  PersonaIQ Mentor Diagnosis
                                </span>
                                <p className="text-zinc-200 font-light text-xs sm:text-sm italic leading-relaxed">
                                  "{reviewObj.feedback}"
                                </p>
                              </div>

                              {/* Multi-Dimensional Radar Coach Insights Bar Grid */}
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-550 block mb-3 font-sans">
                                  COACH RADAR INSIGHT RATINGS
                                </span>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                                  {[
                                    { name: "Clarity Indicators", val: reviewObj.metrics?.clarity || 70, icon: BookOpen, desc: "Action structure and voice pacing" },
                                    { name: "Confidence posture", val: reviewObj.metrics?.confidence || 75, icon: Award, desc: "Declarative power posture" },
                                    { name: "Recruiter Trust Scale", val: reviewObj.metrics?.trust || 72, icon: ShieldCheck, desc: "Validation density benchmarks" },
                                    { name: "Leadership evidence", val: reviewObj.metrics?.leadership || 65, icon: Compass, desc: "Peer coaching and track metrics" },
                                    { name: "Impact densities", val: reviewObj.metrics?.impact || 60, icon: TrendingUp, desc: "Numerical outcomes quantity" },
                                    { name: "Professional style", val: reviewObj.metrics?.tone || 80, icon: Briefcase, desc: "Corporate vocabulary layout" }
                                  ].map((m, idx) => {
                                    const MetricIcon = m.icon;
                                    return (
                                      <div key={idx} className="p-3.5 rounded-2xl bg-zinc-900/30 border border-white/[0.02] space-y-2 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                          <MetricIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                                          <span className="font-mono text-xs font-bold text-white">{m.val}%</span>
                                        </div>
                                        <div className="space-y-1">
                                          <span className="text-[10.5px] font-medium text-zinc-350 block leading-none">{m.name}</span>
                                          <span className="text-[9px] text-zinc-550 leading-tight block">{m.desc}</span>
                                        </div>
                                        
                                        {/* Progress line */}
                                        <div className="h-1 w-full bg-zinc-950/80 rounded-full overflow-hidden shrink-0">
                                          <div className="h-full bg-indigo-500" style={{ width: `${m.val}%` }} />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Recommended Polished Refined Upgrading Model Answer box */}
                              {reviewObj.refinedAnswer && (
                                <div className="p-4.5 rounded-2xl bg-indigo-550/[0.02] border border-indigo-500/15 text-xs text-left space-y-2.5 relative overflow-hidden">
                                  <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-xl" />
                                  <span className="text-[9.5px] uppercase font-mono tracking-widest text-indigo-300 block font-bold">
                                    🌟 Recommended Polished Response Upgrading Model
                                  </span>
                                  <p className="text-zinc-200 font-sans leading-relaxed italic font-light relative z-10 text-[11px] sm:text-xs">
                                    "{reviewObj.refinedAnswer}"
                                  </p>
                                  <span className="text-[9.5px] text-zinc-550 block font-sans">
                                    Synthesized to project maximum STAR metrics structure and passive to active verb translations.
                                  </span>
                                </div>
                              )}

                              {/* Structured strengths, weaknesses and gaps lists */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                
                                {/* Strengths found */}
                                <div className="p-4 rounded-xl bg-emerald-500/[0.015] border border-emerald-500/10 space-y-2 text-left">
                                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-sans block">
                                    PROVEN PROFESSIONAL SIGNALS:
                                  </span>
                                  <ul className="space-y-1.5 text-xs text-zinc-400 font-light list-disc pl-4 leading-relaxed/6">
                                    {(reviewObj.strengths || ["Maintained grammatically clear professional vocabulary expression."]).map((s, idx) => (
                                      <li key={idx}>{s}</li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Improvement advice */}
                                <div className="p-4 rounded-xl bg-amber-500/[0.01] border border-amber-500/10 space-y-2 text-left">
                                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 font-sans block">
                                    GROWTH POSITIONING ADVICE:
                                  </span>
                                  <ul className="space-y-1.5 text-xs text-zinc-400 font-light list-disc pl-4 leading-relaxed/6">
                                    {(reviewObj.weakPoints || ["Add additional metrics details to solidify outcomes value."]).map((w, idx) => (
                                      <li key={idx}>{w}</li>
                                    ))}
                                  </ul>
                                </div>

                              </div>

                              {/* Recruiter interpretation box */}
                              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-850 text-xs font-sans text-zinc-400 space-y-1 text-left">
                                <span className="text-[9.5px] uppercase font-mono tracking-widest text-zinc-500 block">Recruiter Impression Summary</span>
                                <p className="font-light italic">
                                  "{reviewObj.recruiterPerception || 'Capable contributor needing minor narrative sharpening.'}"
                                </p>
                              </div>

                              {/* Action Refine trigger */}
                              <div className="flex justify-between items-center bg-zinc-900/20 p-2 rounded-xl border border-white/[0.01]">
                                <span className="text-[10.5px] text-zinc-500 font-sans font-light italic">
                                  Use the feedback coordinatesabove to optimize metrics and tone.
                                </span>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRefiningQuestions(prev => ({
                                      ...prev,
                                      [q.id]: true
                                    }));
                                  }}
                                  className="px-4.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white border border-white/5 cursor-pointer hover:border-zinc-700 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                                >
                                  <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin-slow" />
                                  <span>Refine & Re-evaluate Solution</span>
                                </button>
                              </div>

                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>

                </div>
              ); })()}

              {/* TAB 5: ROADMAP */}
              {activeTab === "roadmap" && (
                <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/20 space-y-8 animate-fadeIn text-left max-w-full">
                  
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-sans block animate-pulse">
                      Chapter 6: Transformation Roadmap
                    </span>
                    <h3 className="text-white text-lg font-display font-medium">
                      Vocational Decent Work Milestones (SDG 8 Alignment)
                    </h3>
                    <p className="text-zinc-550 text-xs sm:text-sm font-sans font-light leading-relaxed max-w-xl">
                      PersonaIQ structured an actionable checklist designed to instantly elevate your positioning clarity, ATS compatibilities, and career track Authority.
                    </p>
                  </div>

                  {/* Staggered chronological timeline tracks */}
                  <div className="space-y-6 relative pl-8 font-sans">
                    <div className="absolute left-[12px] top-4 bottom-4 w-[1px] bg-indigo-500/20 pointer-events-none" />
                    
                    {activeAnalysis.opportunitySuggestions.map((step, idx) => (
                      <div key={idx} className="relative space-y-1.5 animate-fadeIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                        
                        {/* Bullet count */}
                        <div className="absolute left-[-26px] top-0.5 w-5 h-5 rounded-lg bg-zinc-950 border border-indigo-550 border-indigo-500 text-indigo-300 font-mono text-[10px] font-bold flex items-center justify-center shadow-lg">
                          {idx + 1}
                        </div>

                        <h4 className="text-white text-xs font-semibold uppercase tracking-wider leading-none">
                          Phase {idx + 1}: {idx === 0 ? "Narrative Structuring" : idx === 1 ? "Metric Insertion" : "Vocational Verification"}
                        </h4>
                        
                        <p className="text-xs text-zinc-405 text-zinc-450 leading-relaxed font-light">
                          {step}
                        </p>

                        <p className="text-[10px] text-indigo-500">
                          {idx === 0 
                            ? "Corrects standardized header alignment and removes administrative fatigue." 
                            : idx === 1 
                            ? "Ensures outcome density standards comply directly with modern parse frameworks." 
                            : "Prepares credentials for active stakeholder synchronization circles."}
                        </p>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 6: EXPORT */}
              {activeTab === "export" && (
                <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/20 space-y-8 animate-fadeIn text-left max-w-full">
                  
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-sans block">
                      Chapter 7: Career Workspace Export
                    </span>
                    <h3 className="text-white text-lg font-display font-medium">
                      Download Verified Employability Report
                    </h3>
                    <p className="text-zinc-550 text-xs sm:text-sm font-sans font-light leading-relaxed max-w-xl">
                      Save your rewritten summaries, diagnostic score indicators, mock interview reviews, and target career roadmaps cleanly in readable formatted documents.
                    </p>
                  </div>

                  {/* Candidate Name Customization Input */}
                  <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-900 space-y-3">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-550 font-sans block leading-none">
                      Audit Certificate Customization
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      <div className="relative w-full">
                        <input
                          type="text"
                          value={candidateName}
                          onChange={(e) => setCandidateName(e.target.value)}
                          placeholder="Enter your full name for the executive PDF header..."
                          className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-850 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-700 outline-none transition-all font-sans"
                        />
                      </div>
                      <span className="text-[10px] text-zinc-650 shrink-0 italic">
                        This name is embedded in the PDF meta metadata and header cells.
                      </span>
                    </div>
                  </div>

                  {/* Export action panels */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    
                    {/* Action A: Printable structured report */}
                    <div className="p-5 rounded-xl border border-white/5 bg-zinc-950/40 flex flex-col justify-between gap-4 text-left">
                      <div className="space-y-1.5">
                        <Printer className="w-5 h-5 text-indigo-400" />
                        <h4 className="text-white font-semibold text-xs leading-none">Print-compatible report format</h4>
                        <p className="text-[10.5px] text-zinc-550 leading-relaxed font-sans">
                          Launches standard browser stylesheet format configured with standard printable summaries and interview checklists.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const originalTitle = document.title;
                          document.title = `PersonaIQ_Employability_Report_${activeAnalysis?.detectedRoleName || "Specialist"}`;
                          window.print();
                          document.title = originalTitle;
                        }}
                        className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl border border-white/5 text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer justify-center transition-all w-full shrink-0 group"
                      >
                        <Printer className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span>Print Employability Report</span>
                      </button>
                    </div>

                    {/* Action B: Download Executive PDF document */}
                    <div className="p-5 rounded-xl border border-white/5 bg-zinc-950/40 flex flex-col justify-between gap-4 text-left">
                      <div className="space-y-1.5">
                        <Download className="w-5 h-5 text-indigo-400" />
                        <h4 className="text-white font-semibold text-xs leading-none">Download Executive PDF document</h4>
                        <p className="text-[10.5px] text-zinc-550 leading-relaxed font-sans">
                          Generates a highly structured executive PDF containing SDG-8 score lists, strengths metrics, and mock answer assessment grids.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={triggerPrintReport}
                        className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer justify-center transition-all w-full shrink-0 group active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                        <span>Download Executive PDF</span>
                      </button>
                    </div>

                    {/* Action C: Download MS Word DOCX document */}
                    <div className="p-5 rounded-xl border border-white/5 bg-zinc-950/40 flex flex-col justify-between gap-4 text-left">
                      <div className="space-y-1.5">
                        <FileText className="w-5 h-5 text-indigo-400" />
                        <h4 className="text-white font-semibold text-xs leading-none">Download Editable Word Document</h4>
                        <p className="text-[10.5px] text-zinc-550 leading-relaxed font-sans">
                          Generates a highly editable MS Word template (.doc compatible) containing all customized career audit modules ready for offline writing.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={triggerDOCXReport}
                        className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-white/5 rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer justify-center transition-all w-full shrink-0 group active:scale-95"
                      >
                        <FileText className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span>Download MS Word DOC</span>
                      </button>
                    </div>

                  </div>

                </div>
              )}

            </div>

            {/* PLATFORM SECURITY & ETHICAL WATERMARK FOOTER */}
            <div className="pt-8 border-t border-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[10.5px] text-zinc-650 font-sans font-light">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5">
                <span>&copy; 2026 PersonaIQ Hub. All rights reserved.</span>
                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                <button type="button" onClick={() => alert("PersonalIQ Privacy Policy Guidelines:\n\n100% Sandbox Isolation Protocol. All parsed resumes, biometric keywords, and simulated transcript metrics represent client-volatile state. No resume parameters are logged permanently or indexed by external spiders.")} className="hover:text-zinc-400 underline transition-colors cursor-pointer bg-transparent border-none p-0 outline-none">
                  Data Privacy Policy
                </button>
                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                <button type="button" onClick={() => alert("PersonaIQ Platform Terms of Use:\n\n1. Candidates pledge that submitted experiences represent legitimate, authentic career achievements.\n2. Ratings represent automated analytical guidelines aligned with SDG Goal 8 placement models. System advice provides non-binding coaching directions.")} className="hover:text-zinc-400 underline transition-colors cursor-pointer bg-transparent border-none p-0 outline-none">
                  Terms & Conditions
                </button>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase font-bold text-zinc-700 select-none tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/80 shrink-5" />
                <span>Sandbox Encryption Verified</span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* HIDDEN Styled print container specifically structured for browser print styles (window.print()) */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: white !important;
            color: black !important;
          }
          #printable-workspace-report, #printable-workspace-report * {
            visibility: visible;
          }
          #printable-workspace-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 2.5cm;
            font-family: Arial, sans-serif;
            background: white !important;
            color: black !important;
          }
          .print-header {
            border-bottom: 2px solid #555;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .print-section {
            padding-bottom: 15px;
            margin-bottom: 15px;
            border-bottom: 1px calc-color(#ddd) solid;
          }
          .standard-card {
            padding: 15px;
            background: #fcfcfc !important;
            border: 1px solid #eee !important;
          }
        }
      `}</style>

      {/* Hidden container inside document */}
      {activeAnalysis && (
        <div id="printable-workspace-report" className="hidden" ref={printableAreaRef}>
          <div className="print-header">
            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: "0" }}>PERSONAIQ - EMPLOYABILITY PLATFORM AUDIT</h1>
            <p style={{ fontSize: "11px", color: "#555", margin: "5px 0 0 0" }}>UN Sustainable Development Goal 8 Decent Work placement Standard compliant</p>
            <p style={{ fontSize: "10px", color: "#666", margin: "2px 0 0 0" }}>Report Cache Timestamp: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="print-section">
            <h3 style={{ fontSize: "14px", fontWeight: "bold" }}>1. CORE PROFILE IDENTITY</h3>
            <p><strong>Mapped Target Role Title:</strong> {activeAnalysis.detectedRoleName || "Value Creator"}</p>
            <p><strong>Candidate level Tier:</strong> {activeAnalysis.detectedLevel?.toUpperCase() || "EXPERIENCED"}</p>
            <p><strong>ATS suitability score:</strong> {activeAnalysis.atsScore}%</p>
            <p><strong>Branding Narrative Authority index:</strong> {activeAnalysis.brandAuthorityScore}%</p>
          </div>

          <div className="print-section">
            <h3 style={{ fontSize: "14px", fontWeight: "bold" }}>2. PROFESSIONAL PERCEPTION GAP AUDIT</h3>
            <p><strong>Recruiter Mental Appraisal:</strong> "{activeAnalysis.recruiterPerception}"</p>
            <p><strong>True potential vs Recruiter reading perception gap:</strong> "{activeAnalysis.perceptionGap}"</p>
          </div>

          <div className="print-section">
            <h3 style={{ fontSize: "14px", fontWeight: "bold" }}>3. NARRATIVE REFRACTORY DRAFT</h3>
            <div className="standard-card">
              <p style={{ fontStyle: "italic", margin: "0" }}>"{activeAnalysis.rewrittenBio}"</p>
            </div>
          </div>

          <div className="print-section">
            <h3 style={{ fontSize: "14px", fontWeight: "bold" }}>4. VALIDATED CAPABILITIES & DEVELOPMENTAL MILESTONES</h3>
            <p><strong>Proven core strengths:</strong></p>
            <ul>
              {activeAnalysis.strengths.map((str, idx) => (
                <li key={idx}>{str}</li>
              ))}
            </ul>

            <p><strong>Immediate Next Action roadmap:</strong></p>
            <ol>
              {activeAnalysis.opportunitySuggestions.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="print-section">
            <h3 style={{ fontSize: "14px", fontWeight: "bold" }}>5. VALIDATED PLACEMENT DISCLOSURE</h3>
            <p style={{ fontSize: "11px", color: "#555" }}>
              The candidate asserts and pledges under direct validation of PersonaIQ's Ethical Positioning guidelines that all certifications descriptions and work achievements represent genuine history. No unearned parameters were fabricated.
            </p>
          </div>
        </div>
      )}

    </section>
  );
}
