import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini safely
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Gemini API:", error);
  }
} else {
  console.warn("GEMINI_API_KEY is not set. Running in simulation fallback mode.");
}

// Basic Rate Limiting check to secure endpoints (satisfies Section 4 ownership protection)
const ipHits = new Map<string, { count: number; resetAt: number }>();
const rateLimiter = (req: any, res: any, next: any) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'anonymous';
  const now = Date.now();
  const limitWindow = 60 * 1000; // 1 minute
  const maxRequests = 30; // 30 requests per minute

  const record = ipHits.get(ip);
  if (!record || now > record.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + limitWindow });
    return next();
  }

  if (record.count >= maxRequests) {
    return res.status(429).json({ 
      error: "Rate limit reached. PersonaIQ API gateway limits sandboxes to 30 requests/min to protect endpoint ownership." 
    });
  }

  record.count += 1;
  next();
};

// Watermark and verification meta-payload
const ownershipMetadata = {
  platform: "PersonaIQ",
  version: "2.4",
  license: "Competition Judge Sandbox",
  sdgGoal: "UN Sustainable Development Goal 8 (Decent Work & Growth)",
  environment: "Production Secure Node Container",
  verifiedOwnerEmail: "domfrankil33@gmail.com"
};

// Generate fallback content for when AI key is missing or fails for Profile Analysis
function getSimulationResponse(inputText: string, inputType: string) {
  const words = inputText.trim().split(/\s+/);
  const wordCount = words.length;

  let atsScore = 65;
  let brandAuthorityScore = 58;

  if (wordCount > 50) {
    atsScore = Math.min(88, 65 + Math.floor((wordCount - 50) / 4));
    brandAuthorityScore = Math.min(84, 58 + Math.floor(wordCount / 8));
  } else if (wordCount > 10) {
    atsScore = Math.max(40, 50 + Math.floor(wordCount / 2));
    brandAuthorityScore = Math.max(35, 45 + Math.floor(wordCount / 3));
  }

  // Identity diagnostics
  const lower = inputText.toLowerCase();
  
  // 1. Gender Indicators Detection
  let detectedGender: "male" | "female" | "neutral" = "neutral";
  const femaleScores = (lower.match(/\b(she|her|hers|ms|female|woman|girl|lady|mrs)\b/g) || []).length;
  const maleScores = (lower.match(/\b(he|him|his|mr|male|man|boy|gentleman)\b/g) || []).length;
  if (femaleScores > maleScores) {
    detectedGender = "female";
  } else if (maleScores > femaleScores) {
    detectedGender = "male";
  } else {
    detectedGender = "neutral";
  }

  // 2. Career Specialization Detection
  let detectedField: "developer" | "designer" | "marketing" | "management" | "mechanical" | "general" = "general";
  let specialization = "Professional Developer";
  let rewrittenBio = "Collaborative developer experienced in streamlining technical tasks, improving team operations, and supporting key milestones through structured project coordination.";
  let readinessInsight = "While your technical capabilities are apparent, presenting your experience through the lens of active team partnership and continuous skill alignment will significantly increase your overall visibility.";
  
  let detectedSkills = ["Project Coordination", "Agile Operations", "Information Architecture", "Data Validation"];
  let detectedTools = ["Jira", "MS Office", "Google Workspace", "Slack"];
  let education = "Bachelor's Degree / Professional Bootcamp";
  let certifications = ["SDG 8 Workplace Ethics Standards", "Fundamentals of Agile Management"];
  let yearsOfExperience = "2 to 4 Years";

  if (lower.includes("design") || lower.includes("ux") || lower.includes("ui") || lower.includes("creative") || lower.includes("figma") || lower.includes("portfolio")) {
    detectedField = "designer";
    specialization = "Product Designer";
    rewrittenBio = "Product designer experienced in crafting clean user flows, coordinating research initiatives, and collaborating with development teams to deliver intuitive product interfaces.";
    readinessInsight = "Your profile highlights solid aesthetic execution, but articulating how you integrate customer feedback into architectural design shifts could improve recruiter resonance and interview confidence.";
    detectedSkills = ["User-Centered Design", "Interaction Architectures", "Figma Token Systems", "User Interviews", "Visual Communication"];
    detectedTools = ["Figma", "Miro", "Adobe CC", "InVision", "GitHub"];
    education = "B.F.A. in Graphic Design & Digital Media";
    certifications = ["Certified UX Professional (CXUP)", "Google UX Design Professional Certificate"];
  } else if (lower.includes("manager") || lower.includes("pm") || lower.includes("lead") || lower.includes("scrum") || lower.includes("operations") || lower.includes("owner")) {
    detectedField = "management";
    specialization = "Product Leader";
    rewrittenBio = "Product leader skilled in coordinating cross-functional milestones, aligning stakeholder criteria, and leading user-centered design reviews to guide products from ideation to launch.";
    readinessInsight = "Your bio indicates strong logistical competence, but elevating how you define and measure product success will build greater trust with growth-oriented hiring partners.";
    detectedSkills = ["Agile Roadmapping", "Scrum Master Coordination", "Stakeholder Synchronization", "Product Discovery", "RICE Prioritization"];
    detectedTools = ["Jira", "Confluence", "Notion", "Linear", "Amplitude"];
    education = "B.S. in Business Administration & Tech Management";
    certifications = ["Certified Scrum Product Owner (CSPO)", "Professional Scrum Master I (PSM I)"];
  } else if (lower.includes("marketing") || lower.includes("growth") || lower.includes("sales") || lower.includes("campaign") || lower.includes("analytics") || lower.includes("brand")) {
    detectedField = "marketing";
    specialization = "Growth Strategist";
    rewrittenBio = "Growth strategist experienced in designing organic content campaigns, analyzing multi-channel performance data, and partnering with design teams to expand brand visibility.";
    readinessInsight = "You clearly understand tactical campaign elements, yet introducing structured communication about conversion lifecycles and brand health will boost your strategic leadership authority.";
    detectedSkills = ["Search Engine Optimization (SEO)", "Conversion Rate Optimization (CRO)", "Multi-Channel Budgeting", "Audience Segmentation", "Brand Narratives"];
    detectedTools = ["Google Analytics 4", "SEMrush", "HubSpot", "Meta Ads Manager", "SQL"];
    education = "B.A. in Communications & Growth Marketing";
    certifications = ["Google Ads Measurement Certification", "HubSpot Inbound Marketing Certificate"];
  } else if (lower.includes("mechanical") || lower.includes("cad") || lower.includes("solidworks") || lower.includes("manufacturing") || lower.includes("aerospace") || lower.includes("robotics") || lower.includes("thermodynamics") || lower.includes("fluids") || lower.includes("manufacturing")) {
    detectedField = "mechanical";
    specialization = "Mechanical Design Engineer";
    rewrittenBio = "Detail-driven Mechanical Engineer skilled in optimizing thermal-fluid systems, coordinating manufacturing designs in SOLIDWORKS, and analyzing process tolerances to ensure maximum lifecycle safety and efficiency.";
    readinessInsight = "Your profile highlights strong analytical CAD skills, but clarifying how you align process testing with physical manufacturing constraints inside team feedback cycles will instantly elevate your authority.";
    detectedSkills = ["Computer-Aided Design (CAD)", "Stress & Thermal Analysis", "DFM (Design for Manufacturing)", "Geometric Dimensioning & Tolerancing (GD&T)", "Pneumatic Systems design"];
    detectedTools = ["SolidWorks", "ANSYS", "MATLAB", "AutoCAD", "LabVIEW"];
    education = "B.S. in Mechanical Engineering";
    certifications = ["Certified SolidWorks Professional (CSWP)", "Fundamentals of Engineering (FE) Passed"];
  } else if (lower.includes("engineer") || lower.includes("react") || lower.includes("software") || lower.includes("code") || lower.includes("developer") || lower.includes("frontend") || lower.includes("backend") || lower.includes("typescript")) {
    detectedField = "developer";
    specialization = "Software Engineer";
    rewrittenBio = "Software Developer experienced in improving operational efficiency, solving technical challenges, and supporting scalable product development through collaborative teamwork.";
    readinessInsight = "Your profile demonstrates strong technical capability, but clearer communication of measurable impact could improve recruiter confidence and interview conversion potential.";
    detectedSkills = ["React.js", "TypeScript", "Node.js Express", "Asynchronous Systems Routing", "Schema Implementations"];
    detectedTools = ["VS Code", "Git / GitHub Actions", "Docker", "PostgreSQL", "Vite"];
    education = "B.S. in Computer Science / Software Engineering";
    certifications = ["AWS Certified Cloud Practitioner", "Professional Scrum Developer"];
    yearsOfExperience = "2 to 4 Years";
  }

  // 3. Career Level Detection
  let detectedLevel: "entry" | "experienced" | "senior" = "experienced";
  yearsOfExperience = "2 to 4 Years";
  if (lower.includes("student") || lower.includes("graduate") || lower.includes("junior") || lower.includes("intern") || lower.includes("entry") || lower.includes("looking for roles") || lower.includes("bootcamp")) {
    detectedLevel = "entry";
    yearsOfExperience = "Developing (0 to 1 Year)";
  } else if (lower.includes("senior") || lower.includes("lead") || lower.includes("principal") || lower.includes("architect") || lower.includes("director") || lower.includes("expert") || lower.includes("years of experience")) {
    detectedLevel = "senior";
    yearsOfExperience = "Established (5+ Years)";
  }

  // 4. Custom Role Name mapping
  let levelPrefix = detectedLevel === "entry" ? "Junior " : detectedLevel === "senior" ? "Senior " : "";
  let detectedRoleName = `${levelPrefix}${specialization}`;

  // Count quantifiable achievements
  const quantifiedAchievementsCount = (lower.match(/\b(percent|%|\b\d+%\b|\b\d+\s?x\b|millions?|\d+\s?k\b|hours|days|speedup|optimized|reduced)\b/g) || []).length;

  // 5. Customize Career Alignment Mapping
  let careerMap: { sector: string; score: number }[] = [];
  if (detectedField === "developer") {
    careerMap = [
      { sector: "Asynchronous Systems Engineering", score: Math.round(atsScore * 1.05) },
      { sector: "Distributed Product Operations", score: Math.round(atsScore * 0.94) },
      { sector: "Database Infrastructure Integrity", score: Math.round(atsScore * 0.88) },
      { sector: "Creative UI Integrations", score: Math.round(atsScore * 0.79) }
    ];
  } else if (detectedField === "designer") {
    careerMap = [
      { sector: "UX Architecture Research", score: Math.round(atsScore * 1.04) },
      { sector: "Responsive UI Visual Blueprinting", score: Math.round(atsScore * 0.95) },
      { sector: "Cross-Platform Token Style Systems", score: Math.round(atsScore * 0.86) },
      { sector: "Strategic Product Ideation Labs", score: Math.round(atsScore * 0.77) }
    ];
  } else if (detectedField === "marketing") {
    careerMap = [
      { sector: "Metric Performance Marketing", score: Math.round(atsScore * 1.03) },
      { sector: "Client Funnel Retention Operations", score: Math.round(atsScore * 0.93) },
      { sector: "Organic SEO/CRO Growth Strategy", score: Math.round(atsScore * 0.84) },
      { sector: "Regional Brand Exposure Campaigning", score: Math.round(atsScore * 0.78) }
    ];
  } else if (detectedField === "management") {
    careerMap = [
      { sector: "Agile Cross-Functional Roadmapping", score: Math.round(atsScore * 1.06) },
      { sector: "High-Volume Release Cycle Risk Mitigation", score: Math.round(atsScore * 0.92) },
      { sector: "Product Feature Discovery Research", score: Math.round(atsScore * 0.85) },
      { sector: "Technical Resource Pipeline Staffing", score: Math.round(atsScore * 0.75) }
    ];
  } else if (detectedField === "mechanical") {
    careerMap = [
      { sector: "Thermal Fluids & Aerodynamic Modeling", score: Math.round(atsScore * 1.03) },
      { sector: "SOLIDWORKS Modular Assembly Prototyping", score: Math.round(atsScore * 0.94) },
      { sector: "Process Optimization & Lifecycles Testing", score: Math.round(atsScore * 0.88) },
      { sector: "High-Tolerance Manufacturing Safety Standards", score: Math.round(atsScore * 0.81) }
    ];
  } else {
    careerMap = [
      { sector: "Strategic Communications", score: Math.round(atsScore * 1.01) },
      { sector: "Workflow Operations", score: Math.round(atsScore * 0.91) },
      { sector: "Resource Project Coordination", score: Math.round(atsScore * 0.85) },
      { sector: "Professional Relations", score: Math.round(atsScore * 0.76) }
    ];
  }

  // Ensure scores cap out at 100 max
  careerMap = careerMap.map(entry => ({
    sector: entry.sector,
    score: Math.min(100, Math.max(10, entry.score))
  }));

  let perceptionGap = "Your summary is rich in standard tools and processes, but it can sometimes mask your real contribution to the team's velocity and outcomes. Employers will perceive you as an executor rather than a self-directed problem solver.";
  if (inputType === "cv") {
    perceptionGap = "Your summary is rich in standard tools and processes, but it can sometimes mask your real contribution to the team's velocity and outcomes. Employers will perceive you as an executor rather than a self-directed problem solver.";
  } else if (inputType === "bio") {
    perceptionGap = "You possess deep specialized expertise, but your current wording presents a list of historic duties. This creates a gap where employers struggle to see your active vision or forward-looking potential.";
  }

  // Extra alignment markers (SDG 8 Focus)
  const industryAlignment = Math.min(100, Math.max(45, atsScore + 3));
  const communicationFit = Math.min(100, Math.max(50, brandAuthorityScore + 6));
  const technicalFit = Math.min(100, Math.max(40, detectedField === "developer" ? atsScore + 7 : atsScore - 2));
  const leadershipFit = Math.min(100, Math.max(35, detectedLevel === "senior" ? brandAuthorityScore + 12 : brandAuthorityScore - 6));
  const alignmentExplanation = `Your profile demonstrates robust vocational alignment through clear foundational competencies in ${specialization.toLowerCase()} architectures. To secure decent, sustainable work under SDG 8 criteria, strengthening your declarative task ownership is critical. Your technical fit score is anchored by your parsed knowledge of ${detectedSkills[0]} and ${detectedSkills[1]}, whereas your leadership and brand fit will improve significantly once quantitative milestones are clearly labeled.`;

  return {
    isSimulated: true,
    atsScore: atsScore,
    brandAuthorityScore: brandAuthorityScore,
    recruiterPerception: `Demonstrates reliable functional competence as a ${detectedRoleName}. While the profile conveys dedication and domain knowledge, it currently undersells major achievements as ongoing duties. Improving this framing can immediately unlock deeper professional opportunities.`,
    strengths: [
      `Demonstrated subject-matter expertise in ${specialization} principles`,
      "Authentic, straightforward personal voice and orientation",
      "Clear descriptions of core responsibilities and team coordination support"
    ],
    weaknesses: [
      "Inconsistently quantified outcomes and scale indicators",
      "Emphasis on historical duties rather than forward-looking team contributions",
      "Terminology does not fully align with modern self-directed leadership criteria"
    ],
    rewrittenBio: rewrittenBio,
    opportunitySuggestions: [
      "Quantify your primary contributions with direct human or business impact metrics.",
      "Re-frame duty statements into proactive, initiative-taking achievements.",
      "Align key terminology with modern industry expectations of self-directed leadership."
    ],
    perceptionGap: perceptionGap,
    opportunityReadinessInsight: readinessInsight,
    detectedGender: detectedGender,
    detectedField: detectedField,
    detectedLevel: detectedLevel,
    detectedRoleName: detectedRoleName,
    careerMap: careerMap,
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
    alignmentExplanation
  };
}

// Highly adaptive and realistic interview simulated evaluation fallback (Section 1 & 2)
function getInterviewSimulationResponse(question: string, userAnswer: string, expectation: string, role: string, type: string, persona: string = "manager") {
  const lower = userAnswer.toLowerCase();
  const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length;
  const charCount = userAnswer.trim().length;

  const isHopelessAnswer = lower.trim() === "" ||
                            lower.includes("don't know") || 
                            lower.includes("no idea") || 
                            lower.includes("no clue") || 
                            lower.includes("dunno") || 
                            lower.includes("not sure") || 
                            lower.includes("maybe") || 
                            lower.includes("can't say") || 
                            lower.includes("no experience") || 
                            wordCount < 6;

  // Persona specifications and priority filters
  const personaMeta: Record<string, { label: string; activeTone: string; prioritize: string; moodFactor: number }> = {
    technical: { label: "Technical Recruiter", activeTone: "skeptical, performance-focused, metrics-sensitive", prioritize: "technical/efficiency metrics, code optimization, debugging depth", moodFactor: 0.95 },
    founder: { label: "Startup Founder", activeTone: "high-velocity, outcome-agnostic, survival-oriented", prioritize: "raw ownership, extreme speed/results, multi-hat resourcefulness", moodFactor: 0.9 },
    hr: { label: "Corporate HR", activeTone: "collaborative, procedural, growth-aligned", prioritize: "emotional intelligence, standard communication maturity, SDG 8 values", moodFactor: 1.0 },
    manager: { label: "Hiring Manager", activeTone: "architectural, system-oriented, trade-off conscious", prioritize: "systems thinking, structural ownership, STAR methodology excellence", moodFactor: 1.0 },
    creative: { label: "Creative Director", activeTone: "aesthetic, UX-empathy, validation-conscious", prioritize: "user delight, token system accessibility, design validation", moodFactor: 1.05 },
    operations: { label: "Operations Lead", activeTone: "disciplined, logistics-heavy, timeline-structured", prioritize: "process optimization, bottleneck resolving, roadmap scheduling", moodFactor: 0.98 }
  };

  const currPersona = personaMeta[persona] || personaMeta.manager;

  // Rigid scoring checks
  const asserts = ["led", "orchestrated", "established", "spearheaded", "architected", "successfully", "impact", "delivered", "managed", "resolved", "solved", "designed", "optimized", "scaled"];
  const fillers = ["think", "probably", "just", "kind of", "sort of", "maybe", "whatever", "like", "actually", "guess", "stuff"];
  const hasMetrics = /[0-9]+|%|\$|k\b|million/g.test(lower);

  const assertFound = asserts.filter(w => lower.includes(w)).length;
  const fillFound = fillers.filter(w => lower.includes(w)).length;

  // Let's implement rigorous recycler scoring logic:
  let clarityScore = 0;
  let confidenceScore = 0;
  let trustScore = 0;
  let leadershipScore = 0;
  let impactScore = 0;
  let toneScore = 0;

  if (isHopelessAnswer) {
    // Aggressive realism constraints for hopeless responses ("I don't know")
    clarityScore = Math.floor(Math.random() * 16) + 15; // 15 - 30%
    confidenceScore = Math.floor(Math.random() * 16) + 10; // 10 - 25%
    trustScore = Math.floor(Math.random() * 11) + 10; // 10 - 20%
    leadershipScore = Math.floor(Math.random() * 16) + 0; // 0 - 15%
    impactScore = Math.floor(Math.random() * 11) + 0; // 0 - 10%
    toneScore = Math.floor(Math.random() * 21) + 15; // 15 - 35%
  } else {
    // Dynamic score generation based on linguistic parameters
    
    // 1. Clarity Check (sentence structure, word count depth)
    clarityScore = Math.min(100, Math.max(30, 45 + Math.min(45, wordCount * 0.45)));
    if (fillFound > 0) clarityScore -= (fillFound * 4.5);
    
    // 2. Confidence Check (active verbs vs. fillers and hedge language)
    confidenceScore = 55 + (assertFound * 6.5) - (fillFound * 6.0);
    if (charCount < 80) confidenceScore -= 18;
    
    // 3. Recruiter Trust (STAR structure indicators)
    const starSituation = /when|at my|intern|project|role|job|company/i.test(lower);
    const starAction = /solved|implemented|developed|built|managed|optimized|analyzed/i.test(lower);
    const starOutcome = /resulting in|outcome|as a result|saved|led to|reduced/i.test(lower);
    let starCount = 0;
    if (starSituation) starCount += 15;
    if (starAction) starCount += 15;
    if (starOutcome) starCount += 20;
    trustScore = 30 + starCount + (hasMetrics ? 20 : 0);

    // 4. Leadership / SDG 8 Collaborative Evidence
    const leadWords = ["team", "mentor", "peer", "collaborat", "aligned", "facilitat", "ownership", "agile", "growth", "sdg-8", "shared"];
    const leadFound = leadWords.filter(w => lower.includes(w)).length;
    leadershipScore = 40 + (leadFound * 11);

    // 5. Impact Densities (strict check on outcome evidence)
    if (hasMetrics) {
      impactScore = Math.min(100, 70 + (lower.match(/[0-9]+/g) || []).length * 8);
    } else {
      // Hard cap if no metrics exist
      impactScore = Math.min(40, 15 + Math.floor(wordCount / 4));
    }

    // 6. Professional Maturity (Tone & special industry terms)
    let domainMatches = 0;
    const devDict = ["react", "typescript", "architecture", "scalability", "debugging", "api", "query", "optimize"];
    const desDict = ["figma", "usability", "prototype", "accessibility", "delight", "user flow", "tokens"];
    const mktDict = ["conversion", "cro", "funnel", "analytics", "campaign", "search", "ctr"];
    const mgtDict = ["agile", "sprint", "stakeholder", "priorit", "rice", "roadmap", "velocity"];
    const mecDict = ["manufacturing", "cad", "solidworks", "optimization", "stress", "tolerances"];

    const dict = type === "developer" ? devDict : type === "designer" ? desDict : type === "marketing" ? mktDict : type === "management" ? mgtDict : type === "mechanical" ? mecDict : [];
    domainMatches = dict.filter(w => lower.includes(w)).length;
    toneScore = 55 + (domainMatches * 8) - (fillFound * 3);
    if (userAnswer[0] === userAnswer[0].toUpperCase()) toneScore += 8;
  }

  // Cap and bound metrics securely
  clarityScore = Math.max(15, Math.min(100, Math.round(clarityScore)));
  confidenceScore = Math.max(10, Math.min(100, Math.round(confidenceScore)));
  trustScore = Math.max(10, Math.min(100, Math.round(trustScore)));
  leadershipScore = Math.max(0, Math.min(100, Math.round(leadershipScore)));
  impactScore = Math.max(0, Math.min(100, Math.round(impactScore)));
  toneScore = Math.max(15, Math.min(100, Math.round(toneScore)));

  // Weighted score based on Recruiters persona focus values
  let compositeScore = 0;
  if (persona === "technical") {
    // Prioritizes heavy impact (metrics) & tone (domain terms)
    compositeScore = Math.round((clarityScore * 0.15) + (confidenceScore * 0.1) + (trustScore * 0.15) + (leadershipScore * 0.1) + (impactScore * 0.3) + (toneScore * 0.2));
  } else if (persona === "founder") {
    // Prioritizes confidence & raw impact (speed outcome)
    compositeScore = Math.round((clarityScore * 0.1) + (confidenceScore * 0.35) + (trustScore * 0.1) + (leadershipScore * 0.1) + (impactScore * 0.25) + (toneScore * 0.1));
  } else if (persona === "hr") {
    // Prioritizes leadership (EQ/collaboration) & clarity
    compositeScore = Math.round((clarityScore * 0.25) + (confidenceScore * 0.15) + (trustScore * 0.1) + (leadershipScore * 0.3) + (impactScore * 0.05) + (toneScore * 0.15));
  } else if (persona === "creative") {
    // Prioritizes tone (empathy) & trust (use UX systems)
    compositeScore = Math.round((clarityScore * 0.2) + (confidenceScore * 0.1) + (trustScore * 0.25) + (leadershipScore * 0.1) + (impactScore * 0.1) + (toneScore * 0.25));
  } else if (persona === "operations") {
    // Prioritizes clarity (scheduling) & impact
    compositeScore = Math.round((clarityScore * 0.25) + (confidenceScore * 0.1) + (trustScore * 0.15) + (leadershipScore * 0.1) + (impactScore * 0.25) + (toneScore * 0.15));
  } else {
    // Hiring Manager (default) prioritizes STAR structure trust & confidence
    compositeScore = Math.round((clarityScore * 0.15) + (confidenceScore * 0.2) + (trustScore * 0.3) + (leadershipScore * 0.1) + (impactScore * 0.1) + (toneScore * 0.15));
  }

  // Fine-tuned caps for realism
  if (isHopelessAnswer) {
    compositeScore = Math.max(10, Math.min(25, compositeScore));
  } else if (wordCount < 12) {
    compositeScore = Math.min(48, compositeScore);
  } else if (!hasMetrics) {
    compositeScore = Math.min(71, compositeScore);
  }

  // Recruiter Mood calculation based on candidate score
  let recruiterMood: "disappointed" | "skeptical" | "neutral" | "impressed" | "excited" = "neutral";
  if (isHopelessAnswer || compositeScore < 35) {
    recruiterMood = "disappointed";
  } else if (compositeScore < 55) {
    recruiterMood = "skeptical";
  } else if (compositeScore < 76) {
    recruiterMood = "neutral";
  } else if (compositeScore < 88) {
    recruiterMood = "impressed";
  } else {
    recruiterMood = "excited";
  }

  // Generate highly customized feedback strings
  let feedback = "";
  let strengths: string[] = [];
  let weakPoints: string[] = [];
  let missingAreas: string[] = [];
  let recruiterPerception = "";
  let refinedAnswer = "";

  if (isHopelessAnswer) {
    feedback = `[Recruiter: ${currPersona.label}] Severe evaluation breakdown. Explicitly conceding 'I don't know' or providing non-substantial vague words during competitive selection immediately terminates your candidacy. Employers look for operational persistence and the ability to articulate relational foundations.`;
    strengths = ["Candid transparency regarding experience limits."];
    weakPoints = [
      "No effort was made to bridge knowledge gaps or relate current workflows.",
      "Vague response provides recruiters with zero evidence of professional accountability."
    ];
    missingAreas = ["Core professional accountability indicators", "Transferable systems problem solving", "Linguistic persistence filters"];
    recruiterPerception = `${currPersona.label} Impression: The candidate failed to engage. In professional roles, declining to tackle the issue signals low resilience or severe capability lack.`;
    refinedAnswer = `While my direct exposure is newly developing in this exact framework, my engineering fundamentals are highly responsive. In past situations, I researched the specific guidelines, consulted senior coordinators, and solved the delivery blocker within 24 hours.`;
  } else {
    // Setup feedback tailored strictly to recruiter type and candidate performance parameters
    if (compositeScore < 50) {
      feedback = `[Recruiter: ${currPersona.label}] Highly vulnerable answer. Your description lacks clarity and drops the scale-evidence necessary to assert competency in ${role}. Real recruiters need to hear actual parameters, not sweeping generalizations.`;
      strengths = ["Indicates high-level conceptual familiarity with the topic area."];
      weakPoints = [
        "Wording is excessively brief or reliant on passive duty words like 'responsible for'.",
        "Failed to provide any numerical scale or validated result metric."
      ];
      missingAreas = ["Quantifiable outcome metrics (%, hours, $) to prove scale", "STAR Situation contextual constraints", "Specific software toolchains referenced"];
      recruiterPerception = `${currPersona.label} Impression: Weak, unproven performance narrative. This candidate presents chores instead of proactive initiative ownership.`;
      refinedAnswer = `When timeline delays threatened our release schedules as a ${role}, I audited active timelines, implemented a modular pipeline, and resolved the critical bottleneck, preserving our roadmap speed and reclaiming 15% team velocity.`;
    } else {
      // Good or excellent response
      feedback = `[Recruiter: ${currPersona.label}] Acceptable operational context. You successfully outlined your process, alignment, and collaborative steps. To elevate this answer to executive-ready tier, clarify the exact tool parameters and lock down the quantitative metrics.`;
      strengths = [
        "Aclares your personal task ownership in a structured delivery.",
        "Clear professional maturity markers and structured syntax pacing."
      ];
      weakPoints = [
        hasMetrics ? "Some minor filler terms dilute your vocal authority slightly." : "Lacks quantified metrics details which slightly limits the factual weight of your achievements.",
        "Could strengthen the connection between action steps and ultimate team velocity goals."
      ];
      missingAreas = hasMetrics ? ["Specific system limitations parameters", "Strategic resource budgets details"] : ["Direct percentage throughput or manual hours saved", "Factual impact scaling benchmarks"];
      recruiterPerception = `${currPersona.label} Impression: Capable and articulate contributor. They show self-direction and emotional intelligence, making them an attractive asset for Decent Work SDG-8 pipelines.`;
      refinedAnswer = `In resolving high-stakes timeline boundaries as a ${role}, I orchestrated a modular audit system. By integrating our tracker systems with cross-functional tools, we cleared 4 distinct process blocks, reducing support drop-offs by 24% over a 4-week cycle.`;
    }
  }

  return {
    isSimulated: true,
    score: compositeScore,
    feedback,
    metrics: {
      clarity: clarityScore,
      confidence: confidenceScore,
      trust: trustScore,
      leadership: leadershipScore,
      impact: impactScore,
      tone: toneScore
    },
    strengths,
    weakPoints,
    missingAreas,
    recruiterPerception,
    refinedAnswer,
    recruiterMood,
    personaLabel: currPersona.label
  };
}

// REST API endpoints
// 1. Analyze profile
app.post("/api/analyze", rateLimiter, async (req, res) => {
  const { text, type = "profile" } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "No input profile text was provided for validation." });
  }

  // If Gemini client is not initialized, return simulation fallback directly
  if (!ai) {
    return res.json({
      ...getSimulationResponse(text, type),
      ownershipMetadata
    });
  }

  try {
    const prompt = `You are a supportive, high-end career development advisor and expert talent strategist specializing in employability readiness, professional branding, and opportunity navigation under SDG 8 (Decent Work and Economic Growth).
Analyze the following professional text input (which represents a ${type === 'cv' ? 'Resume segment' : type === 'bio' ? 'Professional Bio' : 'self-introduction'}):

"""
${text}
"""

Provide an expert, constructive, and empowering professional positioning analysis. Keep the language realistic, encouraging, and human-centered. 

Identify and extract:
1. The likely gender of the candidate based on pronouns, names, or general stylistic cues. If not discernable or multiple, output "neutral". Choose strictly from: "male", "female", "neutral".
2. The core professional career domain from text, e.g., "developer" for software/tech engineers, "designer" for UI/UX/creative designers, "marketing" for growth/sales specialists, "management" for products managers/team leads/ scrum masters, "mechanical" for mechanical or manufacturing engineering, and "general" for other roles. Choose strictly from: "developer", "designer", "marketing", "management", "mechanical", "general".
3. The seniority or career level based on phrases like junior, senior, student, intern, director, lead. Choose strictly from: "entry", "experienced", "senior".
4. A highly specific professional role title mapping their primary context (e.g. "Brand Operations Coordinator", "Senior Full-Stack Developer", or "Junior UX Specialist").
5. A list of 4 specific opportunity sectors of alignment tailored to their skills, each with an estimated career-fit score matching their ATS suitability (e.g., sector: "UX Design", score: 84).
6. detectedSkills: Array of up to 5 core parsed professional skills or competencies.
7. detectedTools: Array of up to 5 software tools, platforms, or methodologies.
8. yearsOfExperience: A short string summarizing their estimated experience tier.
9. education: A parsed/summarized high-level credential or degree.
10. certifications: Array of professional certifications or training badges parsed or highly relatable.
11. quantifiedAchievementsCount: The count of individual numerical metrics or business milestones (like "20% speedup", "saved 15 hours", "$2k") found.
12. industryAlignment: Integer from 10 to 100 capturing their sector maturity.
13. communicationFit: Integer from 10 to 100 capturing branding and self-governing tone.
14. technicalFit: Integer from 10 to 100 measuring technical specialized density.
15. leadershipFit: Integer from 10 to 100 measuring accountability structure.
16. alignmentExplanation: A 2-3 sentence Recruiter perspective career alignment explanation detailing their strengths and specific growth trajectories mapped under SDG 8 Decent Work guidelines.

CRITICAL WRITING INSTRUCTION: Your rewritten bio must sound highly recruiter-realistic, professional, modern, and credible, avoiding typical over-the-top AI corporate buzzwords. DO NOT use formulas like "Empowered [Role]", or generic phrases like "driving human-centered outcomes", "strategic execution alignment", or "passionate about synergy". Write simple, active summaries representing true accountability and platform ownership.

Return strictly valid JSON that strictly adheres to the schema provided.

The parameters to return are:
- atsScore: An integer from 10 to 100 capturing Applicant Tracking System readability and core skill alignment density.
- brandAuthorityScore: An integer from 10 to 100 representing narrative brand trust and career positioning maturity (Professional Clarity).
- recruiterPerception: A 2-3 sentence realistic, encouraging evaluation from a hiring manager's perspective, emphasizing constructive, realistic opportunities.
- strengths: An array of exactly 3 specific, outstanding professional capabilities evident in the text (Professional Strengths).
- weaknesses: An array of exactly 3 clear areas of improvement or detail oversights (Growth Opportunities).
- rewrittenBio: A 2-3 sentence clean, supportive professional narrative that sounds believable and describes standard, high-quality hiring summaries (Improved Professional Summary).
- opportunitySuggestions: An array of exactly 3 actionable, empathetic steps to boost employability and career visibility immediately.
- perceptionGap: A 2-3 sentence psychologically intelligent, supportive comparison highlighting how the user's authentic skills might be currently hidden or misperceived.
- opportunityReadinessInsight: A 1-2 sentence psychologically intelligent, highly professional and realistic summary comment about the individual's employability readiness, interview readiness, communication quality, or professional visibility.
- detectedGender: Strictly one of: "male", "female", "neutral".
- detectedField: Strictly one of: "developer", "designer", "marketing", "management", "mechanical", "general".
- detectedLevel: Strictly one of: "entry", "experienced", "senior".
- detectedRoleName: A professional and recruiter-ready title.
- careerMap: An array of exactly 4 objects containing 'sector' (string) and 'score' (integer between 10 and 100) representing career directions of best alignment.
- detectedSkills: Array of strings.
- detectedTools: Array of strings.
- yearsOfExperience: String.
- education: String.
- certifications: Array of strings.
- quantifiedAchievementsCount: Integer.
- industryAlignment: Integer.
- communicationFit: Integer.
- technicalFit: Integer.
- leadershipFit: Integer.
- alignmentExplanation: String.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "atsScore", 
            "brandAuthorityScore", 
            "recruiterPerception", 
            "strengths", 
            "weaknesses", 
            "rewrittenBio", 
            "opportunitySuggestions", 
            "perceptionGap", 
            "opportunityReadinessInsight",
            "detectedGender",
            "detectedField",
            "detectedLevel",
            "detectedRoleName",
            "careerMap",
            "detectedSkills",
            "detectedTools",
            "yearsOfExperience",
            "education",
            "certifications",
            "quantifiedAchievementsCount",
            "industryAlignment",
            "communicationFit",
            "technicalFit",
            "leadershipFit",
            "alignmentExplanation"
          ],
          properties: {
            atsScore: { type: Type.INTEGER },
            brandAuthorityScore: { type: Type.INTEGER },
            recruiterPerception: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            rewrittenBio: { type: Type.STRING },
            opportunitySuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            perceptionGap: { type: Type.STRING },
            opportunityReadinessInsight: { type: Type.STRING },
            detectedGender: { type: Type.STRING },
            detectedField: { type: Type.STRING },
            detectedLevel: { type: Type.STRING },
            detectedRoleName: { type: Type.STRING },
            careerMap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["sector", "score"],
                properties: {
                  sector: { type: Type.STRING },
                  score: { type: Type.INTEGER }
                }
              }
            },
            detectedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            detectedTools: { type: Type.ARRAY, items: { type: Type.STRING } },
            yearsOfExperience: { type: Type.STRING },
            education: { type: Type.STRING },
            certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
            quantifiedAchievementsCount: { type: Type.INTEGER },
            industryAlignment: { type: Type.INTEGER },
            communicationFit: { type: Type.INTEGER },
            technicalFit: { type: Type.INTEGER },
            leadershipFit: { type: Type.INTEGER },
            alignmentExplanation: { type: Type.STRING }
          }
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    const result = JSON.parse(responseText.trim());
    return res.json({
      isSimulated: false,
      ...result,
      ownershipMetadata
    });

  } catch (error) {
    console.error("Gemini analysis error, falling back to heuristic simulation:", error);
    return res.json({
      ...getSimulationResponse(text, type),
      ownershipMetadata
    });
  }
});

// 2. Evaluate interview answer (Section 1)
app.post("/api/evaluate-interview", rateLimiter, async (req, res) => {
  const { question, userAnswer, expectation, role = "Value Contributor", type = "behavioral", persona = "manager" } = req.body;

  if (!userAnswer || userAnswer.trim() === "") {
    return res.status(400).json({ error: "No student interview response was provided for validation." });
  }

  // Fallback if Gemini key is missing
  if (!ai) {
    return res.json({
      ...getInterviewSimulationResponse(question, userAnswer, expectation, role, type, persona),
      ownershipMetadata
    });
  }

  try {
    const prompt = `You are an elite, highly professional interview evaluator and corporate career placement coach.
You are evaluating the candidate's answer acting under the Persona of a "${persona}" interviewer.

Persona specifications:
- 'technical' (Technical Recruiter): skeptical, performance-focused, metrics-sensitive. Checks for tech stack terms and optimization numbers.
- 'founder' (Startup Founder): direct, values raw self-direction, velocity, multi-hat resourcefulness, and massive speed of execution.
- 'hr' (Corporate HR): collaborative, procedural, structured. Prioritizes emotional intelligence, communication maturity, and alignment with Decent Work SDG-8 standards.
- 'manager' (Hiring Manager - default): analytical, trade-off conscious. Prioritizes systems thinking, structural design, and STAR methodology alignment.
- 'creative' (Creative Director): visionary, validation-conscious, empathetic. Focuses on design consistency, aesthetics, accessibility compliance, and user delight.
- 'operations' (Operations Lead): disciplined, logistics-heavy. Prioritizes workflow throughput, bottleneck resolution, and process efficiency metrics.

Analyze the candidate's answer beneath standard talent selection criteria:

Target Role Career: ${role}
Interviewer Persona: ${persona}
Question Proposed: "${question}"
Hiring Intent Expectation: "${expectation}"
Candidate's Custom Drafted Reply: "${userAnswer}"

CRITICAL RIGOROUS EVALUATING DIRECTIVE (NO MOTIVATIONAL CHATBOT BIAS):
- Traditional recruiters demand direct, quantified, metric-oriented storytelling (STAR method).
- Check if they answered "I don't know", "no idea", "not sure", "maybe", gave an empty response, an irrelevant reply, or failed to outline any system solving. If so, they receive severe scores in the 10-30 range.
- Specifically: "I don't know" or similar hopeless answers must score Clarity: 15–30%, Confidence: 10–25%, Recruiter Trust: 10–20%, Leadership: 0–15%, and overall score: 10–25%.
- Do NOT inflate scores. If the response is short (under 25 words) or vague without metrics or specific facts, limit the overall score to under 50%.
- To earn over 75% score, the response MUST have explicit STAR logical sequence, include measurable metrics/durations/outcomes (%, $, hours), and align with the interviewer's specific persona focus.
- Avoid repeating default generic comments like "needs better communication" or "needs quantified metrics". Specifically explain what was weak, what was missing, what this recruiter persona expected, and exactly how the candidate can polish the actual wording.

Evaluate these 6 core dimensions from 10 to 100 based on the candidate's quality:
- clarity: communication structure, sentence pacing (extremely poor/hopeless answers get 15-30%)
- confidence: declarative power verbs, lack of filler words (extremely poor/hopeless answers get 10-25%)
- trust: evidence of the STAR structure and genuine detail resolution (extremely poor/hopeless answers get 10-20%)
- leadership: evidence of mentoring, collaborative initiatives (extremely poor/hopeless answers get 0-15%)
- impact: presence of quantifiable metric density (%, $, ratios) (extremely poor/hopeless/non-metric answers get under 35%)
- tone: mature, professional corporate vocabulary (extremely poor/hopeless answers get 15-35%)

Return strictly valid JSON matching this schema:
- score: Math.round(weighted average matching this persona's priorities)
- feedback: 2-3 sentences of highly customized confidence coaching explaining exactly what went wrong and how this specific recruiter persona analyzed their words.
- metrics: { clarity: integer, confidence: integer, trust: integer, leadership: integer, impact: integer, tone: integer }
- strengths: array of exactly 2 specific capabilities displayed in their wording.
- weakPoints: array of exactly 2 developmental areas they can polish.
- missingAreas: array of exactly 2-3 specific outcome metrics, tools, or descriptions that were left empty.
- recruiterPerception: 1-2 sentences of realistic recruiter mental summary on the response's authority levels.
- recruiterMood: string, strictly one of: "disappointed", "skeptical", "neutral", "impressed", "excited" matching the score quality.
- refinedAnswer: A perfect, polished model answer tracking the profile background details. Keep under 4 sentences.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "score",
            "feedback",
            "metrics",
            "strengths",
            "weakPoints",
            "missingAreas",
            "recruiterPerception",
            "recruiterMood",
            "refinedAnswer"
          ],
          properties: {
            score: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
            metrics: {
              type: Type.OBJECT,
              required: ["clarity", "confidence", "trust", "leadership", "impact", "tone"],
              properties: {
                clarity: { type: Type.INTEGER },
                confidence: { type: Type.INTEGER },
                trust: { type: Type.INTEGER },
                leadership: { type: Type.INTEGER },
                impact: { type: Type.INTEGER },
                tone: { type: Type.INTEGER }
              }
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weakPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            recruiterPerception: { type: Type.STRING },
            recruiterMood: { type: Type.STRING },
            refinedAnswer: { type: Type.STRING }
          }
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from interview evaluator model.");
    }

    const result = JSON.parse(responseText.trim());
    return res.json({
      isSimulated: false,
      ...result,
      ownershipMetadata
    });

  } catch (error) {
    console.error("Gemini interview assessment error, compiling heuristic simulation fallback:", error);
    return res.json({
      ...getInterviewSimulationResponse(question, userAnswer, expectation, role, type, persona),
      ownershipMetadata
    });
  }
});

// Setup Vite middleware or static files serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PersonaIQ Server booted successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
