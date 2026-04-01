"use client";

import { motion } from "framer-motion";
import { 
    Zap, 
    Target, 
    Layout, 
    Star, 
    CheckCircle2, 
    ArrowRight, 
    TrendingUp, 
    Lightbulb,
    FileText,
    MousePointer2,
    ShieldCheck,
    Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

const GUIDE_SECTIONS = [
    {
        title: "The Golden Formula",
        icon: Target,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        content: "Every bullet point on your resume should follow this structure: [Strong Action Verb] + [The Task / Responsibility] + [The Result / Metric].",
        example: "Developed a microservice to automate billing, reducing processing time by 40% annually.",
        tips: ["Never start with 'Responsible for'", "Focus on outputs, not inputs", "Use active voice"]
    },
    {
        title: "The $ % # Rule",
        icon: TrendingUp,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        content: "Recruiters and AI look for numbers to validate your claims. Quantify wherever possible.",
        example: "Increased team throughput by 25% or managed a budget of $500K.",
        tips: ["Include $, %, or # in at least 50% of your bullets", "Use rough estimates if exact data is missing", "Compare before-and-after states"]
    },
    {
        title: "ATS Optimization",
        icon: ShieldCheck,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        content: "Applicant Tracking Systems read resumes from top to bottom. Use standard section headers and simple formatting.",
        example: "Use 'Work Experience' instead of 'My Career Journey'.",
        tips: ["Avoid tables/columns in PDFs", "Use standard fonts like Inter or Arial", "Include keywords from the job description"]
    },
    {
        title: "Visual Hierarchy",
        icon: Layout,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        content: "The first 1/3 of your resume (above the fold) is the most critical. Put your most impressive skills and summary there.",
        example: "A clear, 3-line professional summary followed by a skills matrix.",
        tips: ["Keep it to 1 page if <10 yrs of exp", "Use 10-12pt font for body text", "Maintain consistent spacing"]
    }
];

const VERB_LIST = [
    { strong: "Spearheaded", weak: "Led / Started" },
    { strong: "Architected", weak: "Built / Made" },
    { strong: "Orchestrated", weak: "Organized" },
    { strong: "Maximized", weak: "Increased" },
    { strong: "Pioneered", weak: "Started" },
];

export function ResumeGuide() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Hero Header */}
            <div className="relative p-10 rounded-[40px] bg-blue-600 overflow-hidden text-white shadow-2xl shadow-blue-600/20">
                <div className="relative z-10 max-w-2xl space-y-4">
                    <div className="px-4 py-1 rounded-full bg-white/20 w-fit text-xs font-black uppercase tracking-widest backdrop-blur-md">
                        Masterclass Series
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                        How to Build a <span className="text-blue-200 underline decoration-white/30 decoration-4 underline-offset-8 italic">Legendary</span> Resume
                    </h1>
                    <p className="text-blue-100 text-lg opacity-90 max-w-lg">
                        Learn the high-converting framework used by engineers at Google, Meta, and OpenAI to bypass filters and land interviews.
                    </p>
                </div>
                <Zap className="absolute right-[-20px] top-[-20px] w-64 h-64 text-white/5 -rotate-12" />
            </div>

            {/* Core Strategy Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {GUIDE_SECTIONS.map((section, i) => (
                    <motion.div 
                        key={i}
                        whileHover={{ y: -5 }}
                        className="p-8 rounded-[40px] bg-card border border-border space-y-6 hover:shadow-2xl hover:border-blue-500/50 transition-all group"
                    >
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500", section.bg)}>
                            <section.icon className={cn("w-7 h-7", section.color)} />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black tracking-tight">{section.title}</h3>
                            <p className="text-muted-foreground leading-relaxed text-sm">{section.content}</p>
                        </div>
                        
                        <div className="p-4 rounded-2xl bg-secondary/50 border border-border/50 italic text-sm text-foreground/80 flex gap-3 items-start">
                            <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                            {section.example}
                        </div>

                        <ul className="space-y-2 pt-2">
                            {section.tips.map((tip, idx) => (
                                <li key={idx} className="flex gap-3 text-xs font-semibold text-muted-foreground items-center">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>

            {/* Verb Power-up Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center bg-card border border-border p-10 rounded-[48px] overflow-hidden relative group">
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-3xl font-black tracking-tighter">Vocabulary <br /> <span className="text-blue-500">Power-up</span></h3>
                    <p className="text-muted-foreground text-sm">Replace passive, low-impact verbs with high-impact "Power Verbs" that demand attention.</p>
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {VERB_LIST.map((verb, i) => (
                        <div key={i} className="p-4 rounded-2xl border border-border bg-secondary/20 flex justify-between items-center hover:bg-white hover:border-blue-500 group/verb transition-all">
                            <span className="text-red-500 line-through text-xs opacity-50">{verb.weak}</span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground group-hover/verb:text-blue-500 group-hover/verb:translate-x-1 transition-all" />
                            <span className="text-emerald-500 font-black text-sm">{verb.strong}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Checklist Footer */}
            <div className="p-8 rounded-[40px] border-2 border-dashed border-border bg-secondary/10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Star className="w-10 h-10" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold">Ready to Analyze?</h4>
                        <p className="text-muted-foreground text-sm">Follow these steps then use the Resume Analyst tab for a final score.</p>
                    </div>
                </div>
                <button 
                  onClick={() => window.scrollTo(0, 0)}
                  className="px-8 py-4 bg-foreground text-background font-black rounded-2xl hover:scale-105 transition-all text-sm uppercase tracking-widest flex items-center gap-3"
                >
                    Apply These Rules <MousePointer2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
