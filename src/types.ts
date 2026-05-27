export interface AnalysisResult {
  atsScore: number;
  brandAuthorityScore: number;
  recruiterPerception: string;
  strengths: string[];
  weaknesses: string[];
  rewrittenBio: string;
  opportunitySuggestions: string[];
  perceptionGap: string;
  opportunityReadinessInsight?: string; // Emotionally intelligent AI commentary about employability readiness
  isSimulated: boolean;
  detectedGender?: "male" | "female" | "neutral";
  detectedField?: "developer" | "designer" | "marketing" | "management" | "general";
  detectedLevel?: "entry" | "experienced" | "senior";
  detectedRoleName?: string;
  careerMap?: { sector: string; score: number }[];
  detectedSkills?: string[];
  detectedTools?: string[];
  yearsOfExperience?: string;
  education?: string;
  certifications?: string[];
  quantifiedAchievementsCount?: number;
  industryAlignment?: number;
  communicationFit?: number;
  technicalFit?: number;
  leadershipFit?: number;
  alignmentExplanation?: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  tag?: string;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl: string;
  verified: boolean;
  scoreBefore?: string;
  scoreAfter?: string;
}

export interface PricingPlan {
  name: string;
  priceMonthly: string;
  priceAnnually: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  tagline: string;
}

export interface BeforeAfterExample {
  id: string;
  label: string;
  role: string;
  before: {
    headline: string;
    summary: string;
    perception: string;
    atsScore: number;
  };
  after: {
    headline: string;
    summary: string;
    perception: string;
    atsScore: number;
  };
}
