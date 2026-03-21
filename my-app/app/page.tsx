"use client";

import { InterviewRoom } from "@/components/interview-room";
import { Mic, Shield, Zap, Star, ArrowRight, PlusCircle, Target, Activity, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              SP
            </div>
            <span className="font-bold tracking-tight text-xl">Speed<span className="text-blue-500">Prep AI</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <ThemeToggle />
            {user ? (
              <Link
                href="/dashboard"
                className="px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-[0_0_10px_rgba(37,99,235,0.3)]"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 rounded-full border border-border bg-secondary/50 hover:bg-secondary transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto flex flex-col items-center text-center mb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-6 animate-fade-in">
            <Star className="w-3 h-3 fill-current" />
            <span>Company-Specific Technical Practice</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-5xl mb-8 leading-[1.1]">
            Stop Guessing. Start Preparing for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">Specific Companies.</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mb-12 leading-relaxed">
            Generic question sets are a waste of time. SpeedPrep AI analyzes company-specific interview patterns, historical question trends, and role requirements to generate highly targeted quizzes and simulations tailored to your exact skill level.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Start Targeted Practice
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="px-8 py-4 rounded-2xl border border-border bg-secondary/50 font-semibold hover:bg-secondary transition-all w-full sm:w-auto text-center"
            >
              Explore the Technology
            </a>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="max-w-7xl mx-auto mb-32 scroll-mt-24">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Data-Driven Preparation</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We leverage machine learning to provide a highly structured and personalized learning environment.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-card border border-border hover:border-blue-500/30 transition-all group shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Hyper-Targeted Content</h3>
              <p className="text-muted-foreground leading-relaxed">Our AI curates practice questions and challenges based precisely on your selected company, role, and current experience level.</p>
            </div>
            <div className="p-8 rounded-3xl bg-card border border-border hover:border-blue-500/30 transition-all group shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-500 mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Performance Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">Instantly identify your strengths and uncover weak areas. The system evaluates every answer to pinpoint knowledge gaps.</p>
            </div>
            <div className="p-8 rounded-3xl bg-card border border-border hover:border-blue-500/30 transition-all group shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-500 mb-6 group-hover:scale-110 transition-transform">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Adaptive Difficulty</h3>
              <p className="text-muted-foreground leading-relaxed">As you improve, the AI automatically raises the stakes, introducing more complex questions and edge-cases to keep your prep efficient.</p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="max-w-7xl mx-auto mb-32">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Trusted by Candidates</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See what engineers are saying about their focused interview preparation with SpeedPrep AI.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Sarah Johnson", role: "L4 Engineer at Google", text: "SpeedPrep analyzed the exact patterns for Google's engineering loops. I felt over-prepared for the actual system design interview!" },
              { name: "Michael Chen", role: "Frontend Dev at Meta", text: "I stopped wasting time on generic React questions. The adaptive quizzes helped me bridge my specific knowledge gaps." },
              { name: "Elena Rodriguez", role: "Junior SDE", text: "Tracking my progress over time gave me the confidence I needed. The company-specific role simulation is a game-changer." }
            ].map((t, i) => (
              <div key={i} className="p-8 rounded-3xl bg-secondary/30 border border-border flex flex-col justify-between">
                <p className="italic text-lg mb-8">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-600 font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{t.name}</h4>
                    <p className="text-muted-foreground text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section id="faq" className="max-w-3xl mx-auto mb-32 scroll-mt-24">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">FAQs</h2>
            <p className="text-muted-foreground">Everything you need to know about SpeedPrep AI.</p>
          </div>
          <div className="space-y-4">
            {[
              { q: "How does SpeedPrep AI generate company-specific questions?", a: "By analyzing data from historical technical interviews, public company engineering blogs, and role requirements across top organizations, our ML engine maps out definitive topic patterns." },
              { q: "Will the difficulty match my actual experience level?", a: "Yes. Whether you're a Fresher or a Senior Engineer, the platform asks you for your experience level and automatically adapts the depth of system design, architecture, and coding questions." },
              { q: "Can I track my progress over time?", a: "Absolutely. Our platform keeps a detailed history of your mock interviews and quizzes, highlighting your evolving strengths and areas that need immediate attention." }
            ].map((item, i) => (
              <details key={i} className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <summary className="p-6 cursor-pointer font-medium flex items-center justify-between list-none">
                  {item.q}
                  <PlusCircle className="w-5 h-5 text-muted-foreground group-open:rotate-45 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Skills Enhancement Section */}
        <section className="max-w-7xl mx-auto mb-32">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">A Complete Preparation Engine</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our system continuously updates practice recommendations so you stay perfectly aligned with the latest hiring trends.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Skill Analysis", desc: "Instantly detect weak points across algorithms, systems, and behavioral patterns.", icon: "📊" },
              { title: "Dynamic Quizzes", desc: "Tackle coding challenges specifically weighted toward a company's past questions.", icon: "💻" },
              { title: "Live Scenarios", desc: "Simulate high-pressure interview loops with a realistic AI interviewer.", icon: "🎙️" },
              { title: "Progress Tracking", desc: "Follow a structured, measurable path from practice to your final offer.", icon: "📈" }
            ].map((skill, i) => (
              <div key={i} className="p-8 rounded-3xl bg-card border border-border hover:shadow-lg transition-all text-center">
                <div className="text-4xl mb-6">{skill.icon}</div>
                <h4 className="font-bold text-lg mb-2">{skill.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{skill.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-24 px-6 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
            {/* Branding & Mission */}
            <div className="md:col-span-5 space-y-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                  SP
                </div>
                <span className="font-bold tracking-tighter text-2xl uppercase">Speed<span className="text-blue-500">Prep AI</span></span>
              </Link>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                We're on a mission to bring data-driven efficiency to technical interview preparation, helping candidates crack company-specific patterns and land their dream jobs.
              </p>
              <div className="flex items-center gap-4">
                {['𝕏', 'in', 'ig', 'fb'].map((social) => (
                  <button key={social} className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center hover:border-blue-500/50 hover:bg-secondary transition-all cursor-pointer">
                    <span className="text-sm font-medium uppercase">{social}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div className="space-y-6">
                <h4 className="font-bold text-sm tracking-widest uppercase text-foreground/50">Product</h4>
                <ul className="space-y-4">
                  {['Features', 'Pricing', 'Demo', 'Changelog'].map((item) => (
                    <li key={item}><a href="#" className="text-muted-foreground hover:text-blue-500 transition-colors text-sm font-medium">{item}</a></li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-bold text-sm tracking-widest uppercase text-foreground/50">Company</h4>
                <ul className="space-y-4">
                  {['About Us', 'Careers', 'Blog', 'Press'].map((item) => (
                    <li key={item}><a href="#" className="text-muted-foreground hover:text-blue-500 transition-colors text-sm font-medium">{item}</a></li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-bold text-sm tracking-widest uppercase text-foreground/50">Support</h4>
                <ul className="space-y-4">
                  {['Documentation', 'FAQ', 'Contact', 'Community'].map((item) => (
                    <li key={item}><a href="#" className="text-muted-foreground hover:text-blue-500 transition-colors text-sm font-medium">{item}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
              <span>© 2024 SpeedPrep AI.</span>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">System Operational</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/5 blur-[120px] dark:bg-blue-600/10" />
      </div>
    </div>
  );
}
