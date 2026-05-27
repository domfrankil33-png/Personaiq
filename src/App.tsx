import { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ProfileAnalyzer from "./components/ProfileAnalyzer";
import Features from "./components/Features";
import VisibilityTransformation from "./components/VisibilityTransformation";
import CtaSection from "./components/CtaSection";
import Footer from "./components/Footer";
import { AnalysisResult } from "./types";

export default function App() {
  const [activeResult, setActiveResult] = useState<AnalysisResult | null>(null);
  const [activeSection, setActiveSection] = useState<string>("showcase");

  // Multi-section high-performance IntersectionObserver setup
  useEffect(() => {
    const sectionIds = ["showcase", "features", "transformation"];
    
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -40% 0px", // Focus focal area centered in the upper-mid viewport
      threshold: 0.1,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  // Scroll to Analyzer sandbox
  const handleCtaClick = () => {
    const analyzerSection = document.getElementById("showcase");
    if (analyzerSection) {
      analyzerSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setActiveResult(result);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 selection:text-white">
      {/* 1. Sticky Navigation Header */}
      <Header onCtaClick={handleCtaClick} activeSection={activeSection} />

      {/* 2. Hero Section + Dynamic Dashboard preview */}
      <Hero onCtaClick={handleCtaClick} activeResult={activeResult} />

      {/* 3. Real-Time Profile analysis panel */}
      <ProfileAnalyzer onAnalysisComplete={handleAnalysisComplete} />

      {/* 4. Core Capabilities Map Grid (ATS, Story, Employer Review) */}
      <Features />

      {/* 5. Integrated Visibility Transformation Section */}
      <VisibilityTransformation />

      {/* 6. Compelling Bottom Visual banner */}
      <CtaSection onCtaClick={handleCtaClick} />

      {/* 7. Multi-column sitemap and compliance Footer */}
      <Footer />
    </div>
  );
}
