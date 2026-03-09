"use client";

import { InterviewRoom } from "@/components/interview-room";
import { Mic, Shield, Zap, Star, ArrowRight, PlusCircle } from "lucide-react";
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
              IE
            </div>
            <span className="font-bold tracking-tight text-xl">INTERVIEW<span className="text-blue-500">EDGE</span></span>
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
            <span>Next-Gen Career Preparation</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mb-8 leading-[1.1]">
            Master Your Next Interview with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">Voice AI</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
            Revolutionize your career preparation with our cutting-edge AI platform. Build confidence, refine your communication, and ace your next big opportunity.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="px-8 py-4 rounded-2xl border border-border bg-secondary/50 font-semibold hover:bg-secondary transition-all w-full sm:w-auto text-center"
            >
              View Features
            </a>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="max-w-7xl mx-auto mb-32 scroll-mt-24">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to transform your interview performance from average to exceptional.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-card border border-border hover:border-blue-500/30 transition-all group shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Natural Conversation</h3>
              <p className="text-muted-foreground leading-relaxed">Speak naturally as you would in a real interview. Our AI understands context and follows up on your points.</p>
            </div>
            <div className="p-8 rounded-3xl bg-card border border-border hover:border-blue-500/30 transition-all group shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-500 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Feedback</h3>
              <p className="text-muted-foreground leading-relaxed">Receive instant analysis of your tone, clarity, and content quality to help you improve on the fly.</p>
            </div>
            <div className="p-8 rounded-3xl bg-card border border-border hover:border-blue-500/30 transition-all group shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-500 mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Safe Learning</h3>
              <p className="text-muted-foreground leading-relaxed">Practice in a low-stakes environment. Make mistakes, learn, and iterate until you reach perfection.</p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="max-w-7xl mx-auto mb-32">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Trusted by Professionals</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of successful candidates who used Interview Edge to land their dream jobs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Sarah Johnson", role: "Software Engineer at Google", text: "The AI feedback was spot on. It helped me realize I was talking too fast during technical explanations." },
              { name: "Michael Chen", role: "Product Manager at Meta", text: "Incredibly realistic. The follow-up questions felt just like a real panel interview." },
              { name: "Elena Rodriguez", role: "Marketing Director", text: "Finally, a tool that helps with the behavioral part of interviews. Worth every penny." }
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
            <p className="text-muted-foreground">Everything you need to know about Interview Edge.</p>
          </div>
          <div className="space-y-4">
            {[
              { q: "How does the Voice AI work?", a: "Our AI uses advanced natural language processing to understand your speech in real-time and provide contextually relevant responses." },
              { q: "Is my data private?", a: "Yes, all your sessions are private and encrypted. We never share your recordings with third parties." },
              { q: "Can I practice for specific companies?", a: "Yes! Our Premium plan allows you to select specific company profiles and seniority levels for targeted practice." }
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
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Master Every Skill</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI doesn't just listen; it analyzes every facet of your performance to build a 360° profile of your interview readiness.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Communication", desc: "Refine your body language, tone, and pacing to ensure your message lands with impact.", icon: "💬" },
              { title: "Vocabulary", desc: "Expand your professional lexicon and eliminate filler words for more sophisticated responses.", icon: "📚" },
              { title: "Speaking", desc: "Improve clarity, pronunciation, and confidence in your spoken English and delivery.", icon: "🗣️" },
              { title: "Technical Skills", desc: "Practice explaining complex concepts simply and effectively for technical rounds.", icon: "⚙️" }
            ].map((skill, i) => (
              <div key={i} className="p-8 rounded-3xl bg-card border border-border hover:shadow-lg transition-all text-center">
                <div className="text-4xl mb-6">{skill.icon}</div>
                <h4 className="font-bold text-lg mb-2">{skill.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{skill.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Industry Specialization Section */}
        <section className="max-w-7xl mx-auto mb-32 relative group">
          {/* Background Decorative Layer */}
          <div className="absolute inset-0 bg-blue-600/5 rounded-[64px] blur-3xl -z-10 group-hover:bg-blue-600/10 transition-colors duration-700" />
          <div className="absolute inset-0 border border-border/50 rounded-[64px] bg-card/20 backdrop-blur-3xl overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[grid-line_1px_rgba(0,0,0,0.1)] dark:bg-[grid-line_1px_rgba(255,255,255,0.1)] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" style={{ backgroundSize: '40px 40px' }} />
          </div>

          <div className="relative z-10 px-8 py-24 flex flex-col items-center">
            <div className="max-w-3xl text-center mb-20 space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Tailored for Every Industry</h2>
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                Whether you're breaking into tech or a seasoned healthcare professional, our AI assistant is trained on industry-specific protocols and terminologies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
              {[
                {
                  name: "Healthcare",
                  desc: "Medical ethics, clinical reasoning, and patient empathy scenarios designed for modern medicine.",
                  icon: "🏥",
                  color: "from-emerald-500/20 to-teal-500/20",
                  iconColor: "text-emerald-500"
                },
                {
                  name: "Software",
                  desc: "System design, algorithmic thinking, and dev-culture fit for top-tier engineering roles.",
                  icon: "💻",
                  color: "from-blue-500/20 to-indigo-500/20",
                  iconColor: "text-blue-500"
                },
                {
                  name: "Hardware",
                  desc: "Manufacturing processes, VLSI, and engineering fundamentals for hardware pioneers.",
                  icon: "🔌",
                  color: "from-orange-500/20 to-amber-500/20",
                  iconColor: "text-orange-500"
                }
              ].map((role, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -10 }}
                  className="group/card relative p-10 rounded-[40px] bg-background border border-border/50 shadow-xl hover:border-blue-500/30 transition-all duration-500 flex flex-col h-full items-start"
                >
                  <div className={cn(
                    "w-20 h-20 rounded-3xl bg-gradient-to-br flex items-center justify-center text-4xl mb-8 group-hover/card:scale-110 transition-transform duration-500",
                    role.color
                  )}>
                    {role.icon}
                  </div>
                  <h4 className="text-2xl font-bold mb-4">{role.name}</h4>
                  <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
                    {role.desc}
                  </p>
                  <div className="w-full pt-6 border-t border-border/50">
                    <span className="text-sm font-semibold flex items-center gap-2 group-hover/card:text-blue-500 transition-colors">
                      Learn More <ArrowRight className="w-4 h-4 group-hover/card:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-20">
              <Link href="/login" className="inline-flex items-center gap-3 px-10 py-5 rounded-[24px] bg-primary text-primary-foreground font-bold hover:scale-105 transition-all shadow-2xl shadow-primary/20">
                Choose Your Path
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
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
                  IE
                </div>
                <span className="font-bold tracking-tighter text-2xl uppercase">Interview<span className="text-blue-500">Edge</span></span>
              </Link>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                We're on a mission to democratize elite-level interview coaching through the power of Voice AI, helping everyone land the role they deserve.
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
              <span>© 2024 Interview Edge AI.</span>
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
