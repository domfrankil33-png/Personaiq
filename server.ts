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
  let detectedField: "developer" | "designer" | "marketing" | "management" | "general" = "general";
  let specialization = "Professional Developer";
  let rewrittenBio = "Collaborative developer experienced in streamlining technical tasks, improving team operations, and supporting key milestones through structured project coordination.";
  let readinessInsight = "While your technical capabilities are apparent, presenting your experience through the lens of active team partnership and continuous skill alignment will significantly increase your overall visibility.";
  
  let detectedSkills = ["Project Coordination", "Agile Operations", "Information Architecture", "Data Validation"];
  let detectedTools = ["Jira", "MS Office", "Google Workspace", "Slack"];
  let education = "Bachelor's Degree / Professional Bootcamp";
  let certifications = ["SDG 8 Workplace Ethics Standards", "Fundamentals of Agile Management"];

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
  } else if (lower.includes("engineer") || lower.includes("react") || lower.includes("software") || lower.includes("code") || lower.includes("developer") || lower.includes("frontend") || lower.includes("backend") || lower.includes("typescript")) {
    detectedField = "developer";
    specialization = "Software Engineer";
    rewrittenBio = "Software Developer experienced in improving operational efficiency, solving technical challenges, and supporting scalable product development through collaborative teamwork.";
    readinessInsight = "Your profile demonstrates strong technical capability, but clearer communication of measurable impact could improve recruiter confidence and interview conversion potential.";
    detectedSkills = ["React.js", "TypeScript", "Node.js Express", "Asynchronous Systems Routing", "Schema Implementations"];
    detectedTools = ["VS Code", "Git / GitHub Actions", "Docker", "PostgreSQL", "Vite"];
    education = "B.S. in Computer Science / Software Engineering";
    certifications = ["AWS Certified Cloud Practitioner", "Professional Scrum Developer"];
  }

  // 3. Career Level Detection
  let detectedLevel: "entry" | "experienced" | "senior" = "experienced";
  let yearsOfExperience = "2 to 4 Years";
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
      { sector: "Creative Technical UI Integrations", score: Math.round(atsScore * 0.79) }
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
function getInterviewSimulationResponse(question: string, userAnswer: string, expectation: string, role: string, type: string) {
  const lower = userAnswer.toLowerCase();
  const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length;
  const charCount = userAnswer.trim().length;

  const isHopelessAnswer = lower.includes("don't know") || 
                            lower.includes("no idea") || 
                            lower.includes("not sure") || 
                            lower.includes("no clue") || 
                            lower.includes("dunno") || 
                            lower.includes("no experience") || 
                            lower.includes("can't say") || 
                            lower.includes("cannot say") || 
                            lower.trim() === "i don't have experience" ||
                            lower.trim() === "sorry" ||
                            wordCount < 6;

  // Keyword scans
  const asserts = ["led", "orchestrated", "established", "spearheaded", "architected", "successfully", "impact", "delivered", "managed"];
  const fillers = ["think", "probably", "just", "kind of", "sort of", "maybe", "whatever", "like", "actually"];
  const hasMetrics = /[0-9]+|%|\$|k\b|million/g.test(lower);

  const assertFound = asserts.filter(w => lower.includes(w)).length;
  const fillFound = fillers.filter(w => lower.includes(w)).length;

  // High-value unique scoring criteria per category dimension
  let clarityScore = isHopelessAnswer ? 30 : Math.min(100, Math.max(20, 50 + Math.min(40, wordCount * 0.4)));
  if (!isHopelessAnswer && fillFound > 0) clarityScore -= (fillFound * 4);
  clarityScore = Math.max(15, clarityScore);

  let confidenceScore = isHopelessAnswer ? 15 : 60 + (assertFound * 6) - (fillFound * 5);
  if (!isHopelessAnswer && charCount < 50) confidenceScore -= 20;
  confidenceScore = Math.max(10, Math.min(100, confidenceScore));

  let trustScore = isHopelessAnswer ? 10 : 55;
  if (!isHopelessAnswer && hasMetrics) trustScore += 25;
  if (!isHopelessAnswer && (lower.includes("resolved") || lower.includes("result") || lower.includes("because"))) trustScore += 15;
  trustScore = Math.max(10, Math.min(100, trustScore));

  let leadershipScore = isHopelessAnswer ? 10 : 50;
  const leadWords = ["team", "mentor", "peer", "collaborat", "aligned", "facilitat", "ownership", "led"];
  const leadFound = leadWords.filter(w => lower.includes(w)).length;
  if (!isHopelessAnswer) {
    leadershipScore += (leadFound * 10);
  }
  leadershipScore = Math.max(10, Math.min(100, leadershipScore));

  let impactScore = isHopelessAnswer ? 10 : 45;
  if (!isHopelessAnswer) {
    if (hasMetrics) impactScore += 45;
    else if (charCount > 120) impactScore += 15;
  }
  impactScore = Math.max(10, Math.min(100, impactScore));

  let toneScore = isHopelessAnswer ? 35 : 60;
  if (!isHopelessAnswer) {
    if (!lower.includes("stuff") && !lower.includes("cool") && !lower.includes("okay")) toneScore += 25;
    if (userAnswer[0] === userAnswer[0].toUpperCase()) toneScore += 10;
  }
  toneScore = Math.max(15, Math.min(100, toneScore));

  const compositeScore = Math.round((clarityScore + confidenceScore + trustScore + leadershipScore + impactScore + toneScore) / 6);

  // Custom feedback strings based strictly on role field and question type limits
  let feedback = "";
  let strengths: string[] = [];
  let weakPoints: string[] = [];
  let missingAreas: string[] = [];
  let recruiterPerception = "";
  let refinedAnswer = "";

  if (isHopelessAnswer) {
    feedback = "Critical placement challenge parsed. Simply conceding 'I don't know' or 'not sure' during high-stakes evaluations represents a severe structural failure. Real recruiters will terminate consideration immediately because you leave them with zero evidence of active problem solving.";
    strengths = ["Honesty and straightforward delivery language."];
    weakPoints = [
      "Fosters a zero-evidence impression of capability or proactive inquiry.",
      "Lacks any attempt to bridge knowledge gaps or reference relatable foundations."
    ];
    missingAreas = ["Core technical/task ownership", "Linguistic persistence buffers", "Transferable vocational experience statements"];
    recruiterPerception = "The candidate's response suggests a lack of hands-on experience or a reluctance to engage with unfamiliar scenarios. In professional settings, this is interpreted as a severe readiness gap.";
    refinedAnswer = `While my hands-on exposure in this precise framework is initially developing, I possess strong foundational concepts. On similar occasions, I proactively cross-reference documentation and consult with senior architects, solving core delivery roadblocks in under 48 hours.`;
  } else if (charCount < 35) {
    feedback = "Your answer is extremely brief and lacks structural depth. Traditional recruiters will assume you lack hands-on experience. Build a direct, detailed story showcasing your metrics.";
    strengths = ["Structured basic sentences using proper tone words."];
    weakPoints = ["Severely lacks context, scaling parameters, and results evidence.", "Fails to isolate personal project accountabilities."];
    missingAreas = ["Outcome-backed metrics", "Situation context parameters", "The STAR-based storytelling framework"];
    recruiterPerception = "The candidate's brief reply suggests a lack of hands-on experience or general conversation fatigue.";
    refinedAnswer = `When managing similar challenges as a ${role || "Specialist"}, I initiated high-impact workflow optimizations, resolving timeline blockages and yielding a 15% increase in team delivery speed.`;
  } else if (type.includes("behavior") || type.includes("teamwork") || type.includes("adaptability")) {
    feedback = "You established standard compliance, highlighting your collaboration values. To stand out, clarify conflict resolution structures and quantify the scale of team outcomes.";
    strengths = [
      "Highlights high-quality team coordination alignments.",
      "Clear indicators of emotional intelligence and professional adaptabilities."
    ];
    weakPoints = [
      "Tentative filler terms slightly dilute your professional poise guidelines.",
      "Could tie peer review learnings directly to quantified project improvements."
    ];
    missingAreas = ["Vocational learning trackers", "Outcome corrections frequency", "Declarative executive summaries styling"];
    recruiterPerception = "Possesses high self-awareness and emotional composure; fits into growth-minded engineering cultures.";
    refinedAnswer = "I treat constructive critiques as high-value velocity anchors. After receiving critical feedback on code caching, I documented modular refactoring guidelines, which halved future merge delays across our team.";
  } else {
    feedback = "Standard solution outlined successfully. Your language features basic process nouns, but recruiters expect direct ownership and quantifiable metrics. Avoid stating what you 'usually' do, and talk about a real situation instead.";
    strengths = [
      "Mentions clean operational terms aligned with target field needs.",
      "Simple grammatically standard explanation blocks."
    ];
    weakPoints = [
      "Heavily relies on passive duty expressions (e.g., 'responsible for' or 'involved in').",
      "Omits the critical 'T' and 'A' checkpoints of the STAR narrative structure."
    ];
    missingAreas = ["Specific numeric achievements (throughput, hours saved)", "Explicit project scope limitations", "Clear personal accountability metrics"];
    recruiterPerception = "Shows satisfactory capability to execute tasks under support, but lacks the self-directed metric representation preferred for elite roles.";
    refinedAnswer = `While leading similar challenges as a ${role || "Specialist"}, I audited our process bottlenecks, refactored active schedules, and established a modular schema that successfully saved the project over 40-hours of manual sprint delays.`;
  }

  // Final score realistic variation constraints:
  // poor: 15-50
  // average: 51-72
  // strong: 73-90
  let realScore = compositeScore;
  if (isHopelessAnswer) {
    realScore = Math.max(15, Math.min(35, realScore));
  } else if (wordCount < 10) {
    realScore = Math.max(30, Math.min(48, realScore));
  } else if (!hasMetrics) {
    realScore = Math.max(50, Math.min(71, realScore));
  } else {
    realScore = Math.max(73, Math.min(95, realScore));
  }

  return {
    isSimulated: true,
    score: realScore,
    feedback,
    metrics: {
      clarity: Math.round(clarityScore),
      confidence: Math.round(confidenceScore),
      trust: Math.round(trustScore),
      leadership: Math.round(leadershipScore),
      impact: Math.round(impactScore),
      tone: Math.round(toneScore)
    },
    strengths,
    weakPoints,
    missingAreas,
    recruiterPerception,
    refinedAnswer
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
2. The core professional career domain from text, e.g., "developer" for software/tech engineers, "designer" for UI/UX/creative designers, "marketing" for growth/sales specialists, "management" for products managers/team leads/ scrum masters, and "general" for other roles. Choose strictly from: "developer", "designer", "marketing", "management", "general".
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
- detectedField: Strictly one of: "developer", "designer", "marketing", "management", "general".
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
  const { question, userAnswer, expectation, role = "Value Contributor", type = "behavioral" } = req.body;

  if (!userAnswer || userAnswer.trim() === "") {
    return res.status(400).json({ error: "No student interview response was provided for validation." });
  }

  // Fallback if Gemini key is missing
  if (!ai) {
    return res.json({
      ...getInterviewSimulationResponse(question, userAnswer, expectation, role, type),
      ownershipMetadata
    });
  }

  try {
    const prompt = `You are an elite, highly professional interview evaluator and corporate career placement coach.
Analyze the candidate's answer beneath standard talent selection criteria.

Target Role Career: ${role}
Question Type: ${type}
Question Proposed: "${question}"
Hiring Intent Expectation: "${expectation}"
Candidate's Custom Drafted Reply: "${userAnswer}"

CRITICAL RIGOROUS EVALUATING DIRECTIVE:
Traditional interviews demand direct, quantified, metric-oriented storytelling (STAR method).
- Check if they answered "I don't know", "no idea", "not sure", or conceded failure without showcasing active search for a solution. If they conceded failure or avoided answering, score them aggressively down to the 15-35 range.
- Check if their reply is extremely short (under 7 words). If so, score them aggressively down to the 15-35 range.
- Be constructively candid—never fake high scores (like 80+) if the response lacks quantifiable metrics or is extremely brief.

Evaluate these 6 core dimensions from 10 to 100:
- Clarity: communication structure, sentence pacing
- Confidence: declarative power verbs, lack of filler words
- Trust: evidence of the STAR structure and genuine detail resolution
- Leadership: evidence of mentoring, collaborative initiatives
- Impact: presence of quantifiable metric density (%, $, ratios)
- Tone: mature, professional corporate vocabulary

Format and structure instructions:
- refinedAnswer: Re-write their raw answer into a stunning, elite STAR-based executive summary matching this role. Direct, outcome-quantified, under 4 sentences.

Return strictly valid JSON matching this schema:
- score: Math.round(weighted average of the 6 metrics)
- feedback: 2-3 sentences of highly customized confidence coaching, identifying how they can reframe their words professionally.
- metrics: { clarity: integer, confidence: integer, trust: integer, leadership: integer, impact: integer, tone: integer }
- strengths: array of exactly 2 specific capabilities displayed in their wording.
- weakPoints: array of exactly 2 developmental areas they can polish.
- missingAreas: array of exactly 2-3 specific outcome metrics or technical descriptions that were left empty.
- recruiterPerception: 1-2 sentences of realistic recruiter mental summary on the response's authority levels.
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
      ...getInterviewSimulationResponse(question, userAnswer, expectation, role, type),
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
