import { Sparkles, ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onCtaClick: () => void;
  activeSection?: string;
}

export default function Header({ onCtaClick, activeSection = "showcase" }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "showcase", label: "Profile Analysis" },
    { id: "features", label: "Capabilities" },
    { id: "transformation", label: "Visibility Transformation" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-black/80 border-b border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-lg">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Persona<span className="text-indigo-400">IQ</span>
            </span>
            <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/15">
              Empowerment
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3 bg-zinc-950/30 border border-white/5 py-1 px-2 rounded-full backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`text-[10px] uppercase tracking-widest font-sans font-bold transition-all duration-300 relative py-1.5 px-4 rounded-full cursor-pointer overflow-hidden flex items-center gap-1.5 ${
                    isActive
                      ? "text-white bg-white/[0.06] border border-white/10 shadow-[0_1px_10px_rgba(255,255,255,0.02)] scale-[1.01]"
                      : "text-zinc-500 hover:text-zinc-250 hover:bg-white/[0.02]"
                  }`}
                >
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0 inline-block" />
                  )}
                  {item.label}

                  {isActive && (
                    <span className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-blue-400/60 via-indigo-400/60 to-purple-400/60 opacity-40 shadow-[0_0_4px_rgba(99,102,241,0.2)]" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Action Button */}
          <div className="hidden md:flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-2xs text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/15 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Sustainable Work
            </span>
            <button
              onClick={onCtaClick}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:bg-zinc-850 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              Analyze Profile
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          </div>

          {/* Mobile Menu Icon */}
          <div className="flex md:hidden items-center gap-3">
            <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-zinc-400 hover:text-white focus:outline-none p-1 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-white/5 px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 text-sm font-semibold transition-all duration-300 rounded-xl flex items-center justify-between border ${
                  isActive
                    ? "bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 text-white border-indigo-500/20 shadow-inner"
                    : "text-zinc-400 border-transparent hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,1)]" />
                )}
              </a>
            );
          })}
          <div className="pt-4 border-t border-white/5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onCtaClick();
              }}
              className="w-full px-4 py-3 text-center font-medium text-white rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
            >
              Analyze My Profile
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
