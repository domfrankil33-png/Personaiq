import { FeatureItem, TestimonialItem, PricingPlan, BeforeAfterExample } from "./types";

export const FEATURES: FeatureItem[] = [
  {
    id: "ats-opt",
    title: "ATS Clarity Index",
    description: "Aligns structural layout and core experience parameters to ensure modern talent directories process your genuine skills and achievements smoothly.",
    iconName: "FileSpreadsheet",
    tag: "Ats Readiness"
  },
  {
    id: "bio-writer",
    title: "Authentic Storyteller",
    description: "Reframes major career landmarks using empowering, outcome-oriented language that communicates your true values and contribution style.",
    iconName: "Sparkles",
    tag: "Narrative Alignment"
  },
  {
    id: "linkedin-brand",
    title: "LinkedIn Visibility Index",
    description: "Elevates key headlines, summaries, and featured records to boost discoverability for high-quality professional opportunities and roles.",
    iconName: "Linkedin",
    tag: "Presence"
  },
  {
    id: "perception-sim",
    title: "Employer Perception Guide",
    description: "Evaluates professional bio sections through an empathetic lens to identify where your strengths might be understated or overlooked.",
    iconName: "Eye",
    tag: "Assessment"
  },
  {
    id: "growth-matrix",
    title: "Employability Opportunity Map",
    description: "Identifies hidden gaps and potentials in your professional brand, suggesting positive channels to cultivate high industry trust.",
    iconName: "TrendingUp",
    tag: "Career Development"
  },
  {
    id: "salary-negotiator",
    title: "Economic Growth & Leverage",
    description: "Connects your professional readiness with fair market value and sustainable upward mobility, empowering you to command fair compensation.",
    iconName: "Coins",
    tag: "Empowerment"
  }
];

export const BEFORE_AFTER_EXAMPLES: BeforeAfterExample[] = [
  {
    id: "swe",
    label: "Sarah Jenkins",
    role: "Software Developer",
    before: {
      headline: "Software developer at mid-size retail company looking for next challenge.",
      summary: "I have 5 years of experience writing code in Java, Python, and JavaScript. Responsible for writing unit tests, maintaining codebases, and implementing frontend screens.",
      perception: "Perceived as a task executor. Lacks signs of collaborative leadership, system responsibility, or outcome ownership.",
      atsScore: 54
    },
    after: {
      headline: "Platform Engineer | Collaborative Tech Lead & Distributed Systems Builder",
      summary: "Spearheaded the performance optimization of core APIs supporting 12M+ monthly queries, improving response speeds by 42%. Championed collaborative code reviews and co-led a team of junior engineers.",
      perception: "Strong collaborative leader with strategic design vision. Clearly demonstrates impact, team development skills, and platform ownership.",
      atsScore: 94
    }
  },
  {
    id: "pm",
    label: "Marcus Vance",
    role: "Product Coordinator",
    before: {
      headline: "Product Manager looking after customer dashboard and billing integration.",
      summary: "Managed the dashboard feature backlog, collaborated with engineering teams, did stakeholder alignment meetings, and looked after user feedback forms.",
      perception: "Perceived as an administrative coordinator. Lacks evidence of strong community impact, strategic execution, or project empowerment.",
      atsScore: 61
    },
    after: {
      headline: "Product Manager | Specializing in Human-Centered Interfaces & Growth Products",
      summary: "Guided the collaborative design of a payment accessibility update, lowering user checkout friction by 24%. Coordinated stakeholder circles to align product updates with long-term digital growth goals.",
      perception: "Empowered, value-driven product owner. Demonstrates structured collaboration, empathy, and real-world outcomes.",
      atsScore: 92
    }
  }
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    quote: "PersonaIQ helped me see the real value in my daily contributions. By highlighting how I supported my team, I felt confident stepping into senior role discussions and found a team that truly values mentorship.",
    author: "Elena Rostova",
    role: "Lead Platform Engineer",
    company: "Vanguard Systems",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    verified: true,
    scoreBefore: "Junior generalist perspective",
    scoreAfter: "Lead Architect alignment"
  },
  {
    quote: "The Perception Assessment changed how I approach my career biography completely. Instead of just listing technologies, I now describe how my work empowers other teams. My interview requests doubled in a month.",
    author: "Devin Kincaid",
    role: "Senior Product Specialist",
    company: "Hyperion Finance",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    verified: true,
    scoreBefore: "ATS Score: 61",
    scoreAfter: "ATS Score: 94"
  },
  {
    quote: "For a long time, I struggled to articulate my marketing contributions logically. The Career Storyteller output helped me reframe my profile concisely, securing my path to a leadership role with a 35% growth increment.",
    author: "Amara Okoye",
    role: "VP of Growth & Comms",
    company: "ScaleFlow Tech",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
    verified: true,
    scoreBefore: "ATS Score: 52",
    scoreAfter: "ATS Score: 95"
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Standard Plan",
    priceMonthly: "0",
    priceAnnually: "0",
    description: "Start aligning your career records with basic AI-driven assessments for students and entry-level talent.",
    features: [
      "3 Career Suitability Sweeps / mo",
      "Core ATS Compatibility checks Range",
      "Constructive Hiring Perception review",
      "Classic bio narrative suggestions",
      "Free forever, no credit card required"
    ],
    cta: "Analyze Profile Now",
    popular: false,
    tagline: "Free Growth Tier"
  },
  {
    name: "Professional Plan",
    priceMonthly: "15",
    priceAnnually: "9",
    description: "Designed for ambitious specialists seeking better job alignment, visibility, and career mobility.",
    features: [
      "Unlimited Career Evaluations / mo",
      "Full ATS Clarity & Layout optimizations",
      "Detailed Perception Gap diagnostics",
      "LinkedIn Headline & Bio generator tools",
      "Decent Work outcome suggestions catalog",
      "Priority advisory analysis queues",
      "High-end clean resume layout formats"
    ],
    cta: "Unlock Professional Growth",
    popular: true,
    tagline: "Highly Recommended"
  },
  {
    name: "Elevate Enterprise",
    priceMonthly: "89",
    priceAnnually: "59",
    description: "For universities, coaching hubs, and talent accelerators looking to elevate cohort employability.",
    features: [
      "Everything in Professional Plan",
      "Collaborative workspace (up to 5 members)",
      "Custom brand voice training matching your focus",
      "Detailed career development roadmap tools",
      "Empathetic compensation evaluation guides",
      "Review feedback from our Senior Brand Experts",
      "Priority human-in-the-loop validation"
    ],
    cta: "Get Enterprise Access",
    popular: false,
    tagline: "For Institutions"
  }
];
