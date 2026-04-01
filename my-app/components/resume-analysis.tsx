"use client";

import { Check, AlertCircle, TrendingUp, Info, FileText, MoveRight, Star, ListChecks, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnalysisData {
    score: number;
    breakdown?: {
        impact: number;
        clarity: number;
        verbs: number;
        keywords: number;
    };
    recommendations: string[];
    strengths: string[];
    missing_info: string[];
    ats_tips: string[];
}

export function ResumeAnalysis({ analysis }: { analysis: AnalysisData | null }) {
    if (!analysis) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-500";
        if (score >= 60) return "text-amber-500";
        return "text-rose-500";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return "Excellent Work";
        if (score >= 60) return "Good Foundation";
        return "Needs Attention";
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Simple Score Card - "Human" Feel */}
            <div className="p-8 rounded-3xl border border-border bg-card/50 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-sm">
                <div className="flex-1 space-y-2 text-center md:text-left">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center md:justify-start gap-3">
                        Review Summary
                        <div className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-[10px] uppercase font-bold tracking-widest rounded-lg flex items-center gap-1.5 text-blue-500">
                            Professional Review
                        </div>
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                        I've analyzed your resume against current industry standard practices. Here is a breakdown of your score and some actionable feedback to help you stand out.
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center px-10 py-6 bg-secondary/30 rounded-2xl border border-border min-w-[200px]">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Mentor's Rating</div>
                    <div className={cn("text-5xl font-black tabular-nums", getScoreColor(analysis.score))}>
                        {analysis.score}<span className="text-xl opacity-30">/100</span>
                    </div>
                    <div className={cn("text-xs font-bold mt-1 uppercase tracking-wider", getScoreColor(analysis.score))}>
                        {getScoreLabel(analysis.score)}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left: Key Sections */}
                <div className="md:col-span-12 lg:col-span-8 space-y-6">
                    
                    {/* Strengths & Missing Info row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <section className="bg-card border border-border p-6 rounded-2xl space-y-4 shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-foreground/70">
                                <Check className="w-4 h-4 text-emerald-500" />
                                What's Working
                            </h3>
                            <div className="space-y-3">
                                {analysis.strengths.map((strength, i) => (
                                    <div key={i} className="flex gap-2 text-sm items-start text-muted-foreground leading-snug">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                        {strength}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-card border border-border p-6 rounded-2xl space-y-4 shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-foreground/70">
                                <AlertCircle className="w-4 h-4 text-rose-500" />
                                Areas for Improvement
                            </h3>
                            <div className="space-y-3">
                                {analysis.missing_info.map((info, i) => (
                                    <div key={i} className="flex gap-2 text-sm items-start text-muted-foreground leading-snug">
                                        <div className="w-1 h-1 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                                        {info}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Recommendations - The Actionable Part */}
                    <section className="bg-card border border-border p-6 rounded-3xl space-y-6 shadow-sm">
                        <div className="flex items-center gap-3 border-b border-border pb-4">
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                <ListChecks className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold">Action Plan</h3>
                        </div>
                        <div className="space-y-2">
                            {analysis.recommendations.map((rec, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-secondary/20 transition-colors group">
                                    <div className="text-lg font-black text-muted-foreground/30 group-hover:text-blue-500/50 tabular-nums">
                                        0{i + 1}
                                    </div>
                                    <p className="text-sm text-foreground/80 leading-relaxed pt-1">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right: Sidebar style ATS tips */}
                <div className="md:col-span-12 lg:col-span-4 space-y-6">
                    <section className="bg-secondary/40 border border-border p-6 rounded-3xl space-y-6 sticky top-6">
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
                                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                Formatting & ATS Tips
                            </h4>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Quick adjustments for better visibility</p>
                        </div>
                        
                        <div className="space-y-4">
                            {analysis.ats_tips?.map((tip, i) => (
                                <div key={i} className="space-y-2 border-l-2 border-border pl-4">
                                    <p className="text-xs leading-relaxed text-muted-foreground italic">"{tip}"</p>
                                </div>
                            ))}
                        </div>

                        {analysis.breakdown && (
                            <div className="pt-4 space-y-4 border-t border-border mt-4">
                                <h5 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Technical Breakdown</h5>
                                <div className="space-y-3">
                                    {[
                                        { key: 'impact', label: 'Impact' },
                                        { key: 'clarity', label: 'Clarity' },
                                        { key: 'keywords', label: 'Keywords' },
                                    ].map((c) => (
                                        <div key={c.key} className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                                                <span>{c.label}</span>
                                                <span>{(analysis.breakdown as any)[c.key]}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                                    style={{ width: `${(analysis.breakdown as any)[c.key]}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
