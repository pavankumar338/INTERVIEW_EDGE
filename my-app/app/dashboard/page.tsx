"use client";

import { createClient } from "@/lib/supabase/client";
import {
    LayoutDashboard,
    Settings,
    History,
    User,
    LogOut,
    PlusCircle,
    MessageSquare,
    ChevronRight,
    Star,
    Brain,
    Cpu,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    FileText,
    Zap,
    ShieldCheck,
    Cloud,
    Database,
    Globe,
    Smartphone,
    Layers,
    Briefcase
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { InterviewRoom } from "@/components/interview-room";
import { getSessionHistory } from "@/lib/actions/interview";
import { ResumeUpload } from "@/components/resume-upload";
import { getLatestResume } from "@/lib/actions/resume";


const INTERESTS = [
    {
        id: 'software-it',
        label: 'Software & IT Industry',
        icon: Database,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        roles: ['Software Engineer', 'QA / SDET', 'IT Support Engineer', 'Database Administrator', 'ERP / SAP Consultant']
    },
    {
        id: 'specialized-tech',
        label: 'Specialized Tech Domains',
        icon: Cpu,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        roles: ['Embedded Systems Eng', 'Firmware Engineer', 'VLSI / Chip Design', 'Robotics Engineer', 'Signal Processing Eng']
    },
    {
        id: 'business-tech',
        label: 'Business & Tech Hybrid Roles',
        icon: Briefcase,
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        roles: ['Product Manager', 'Business Analyst', 'Scrum Master / Agile Coach', 'IT Project Manager', 'Tech Consultant']
    },
    {
        id: 'system-design',
        label: 'System Design & Architecture',
        icon: Layers,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        roles: ['Software Architect', 'Solutions Architect', 'Principal Engineer', 'Staff Engineer', 'Platform Engineer']
    },
    {
        id: 'mobile',
        label: 'Mobile App Development',
        icon: Smartphone,
        color: 'text-pink-500',
        bg: 'bg-pink-500/10',
        roles: ['Android Developer', 'iOS Developer', 'React Native Dev', 'Flutter Developer', 'Mobile Backend Eng']
    },
    {
        id: 'web',
        label: 'Web & Internet Technologies',
        icon: Globe,
        color: 'text-cyan-500',
        bg: 'bg-cyan-500/10',
        roles: ['Frontend Developer', 'Backend Developer', 'Fullstack Developer', 'Web Performance Eng', 'Browser / WebAssembly Eng']
    },
    {
        id: 'cybersecurity',
        label: 'Cybersecurity',
        icon: ShieldCheck,
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        roles: ['Security Analyst', 'Penetration Tester', 'SOC Engineer', 'Security Architect', 'Cloud Security Eng']
    },
    {
        id: 'cloud-devops',
        label: 'Cloud Computing & DevOps',
        icon: Cloud,
        color: 'text-sky-500',
        bg: 'bg-sky-500/10',
        roles: ['Cloud Engineer', 'DevOps Engineer', 'Site Reliability Eng', 'Infrastructure Eng', 'Kubernetes / Platform Ops']
    },
    {
        id: 'data-ai',
        label: 'Data & AI Industry',
        icon: Brain,
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
        roles: ['Data Scientist', 'ML Engineer', 'AI Research Engineer', 'Data Analyst', 'Data Engineer']
    },

];

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
    const [selectedExperience, setSelectedExperience] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [view, setView] = useState<'overview' | 'history' | 'profile'>('overview');
    const [history, setHistory] = useState<any[]>([]);
    const [selectedHistorySession, setSelectedHistorySession] = useState<any | null>(null);
    const [resume, setResume] = useState<any>(null);
    const supabase = createClient();

    const fetchLatestResume = async () => {
        const data = await getLatestResume();
        setResume(data);
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, [supabase]);

    const fetchHistory = async () => {
        try {
            const data = await getSessionHistory();
            setHistory(data);
            return data;
        } catch (error) {
            console.error("Failed to fetch history:", error);
            return [];
        }
    };

    const handleInterviewComplete = async () => {
        const updatedHistory = await fetchHistory();
        if (updatedHistory && updatedHistory.length > 0) {
            setSelectedHistorySession(updatedHistory[0]);
            setView('history');
        }
    };

    useEffect(() => {
        if (user) {
            fetchHistory();
            fetchLatestResume();
        }
    }, [user]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    if (!user) return null;

    const currentInterest = INTERESTS.find(i => i.id === selectedInterest);

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col hidden lg:flex">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]">

                        </div>
                        <span className="font-bold tracking-tighter text-2xl">Speed<span className="text-blue-500">Prep</span></span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: "Tech-Interview" },
                        { id: 'history', icon: Star, label: "Performance in Sessions" },
                        { id: 'profile', icon: User, label: "Profile" },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id as any)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                view === item.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-border space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
                        <Settings className="w-5 h-5" />
                        Settings
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-y-auto">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] pointer-events-none" />

                <header className="sticky top-0 z-10 h-20 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-10">
                    <div>
                        <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            Dashboard <ChevronRight className="w-4 h-4" />
                            <span className="capitalize">{view}</span>
                            {selectedInterest && (
                                <>
                                    <ChevronRight className="w-4 h-4" />
                                    {currentInterest?.label}
                                </>
                            )}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
                            <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                    </div>
                </header>

                <div className="p-10 max-w-6xl mx-auto w-full space-y-12">
                    {view === 'overview' ? (
                        <>
                            {/* Welcome Header */}
                            <div className="space-y-2">
                                <h1 className="text-4xl font-bold tracking-tight">Welcome, {user.email?.split('@')[0]}</h1>
                                <p className="text-muted-foreground text-lg">Select your industry to begin your customized interview journey.</p>
                            </div>

                            <AnimatePresence mode="wait">
                                {!selectedInterest ? (
                                    <motion.div
                                        key="interests-view"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-12"
                                    >
                                        {/* Resume Section */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            <div className="lg:col-span-2 space-y-4">
                                                <h3 className="text-xl font-bold flex items-center gap-2">
                                                    <Brain className="w-5 h-5 text-blue-500" />
                                                    Persona & Resume
                                                </h3>
                                                <ResumeUpload onUploadComplete={fetchLatestResume} />
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-xl font-bold flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                    Active Resume
                                                </h3>
                                                {resume ? (
                                                    <div className="p-6 rounded-[32px] bg-card border border-border space-y-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                                <FileText className="w-6 h-6" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold truncate">{resume.filename}</p>
                                                                <p className="text-xs text-muted-foreground uppercase tracking-widest">Uploaded {new Date(resume.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="pt-4 border-t border-border flex items-center justify-between">
                                                            <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                                                                <CheckCircle2 className="w-3 h-3" /> Ready for RAG
                                                            </span>
                                                            <button
                                                                onClick={() => setResume(null)}
                                                                className="text-xs text-muted-foreground hover:text-foreground underline"
                                                            >
                                                                Update
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-6 rounded-[32px] border border-dashed border-border bg-secondary/20 text-center space-y-2">
                                                        <p className="text-sm text-muted-foreground">No resume found.</p>
                                                        <p className="text-xs text-muted-foreground">Upload your CV to unlock personalized RAG-based questions.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                <Star className="w-5 h-5 text-yellow-500" />
                                                Select Industry
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                {INTERESTS.map((interest) => (
                                                    <button
                                                        key={interest.id}
                                                        onClick={() => setSelectedInterest(interest.id)}
                                                        className="group p-8 rounded-[40px] bg-card border border-border hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all text-left space-y-6 relative overflow-hidden"
                                                    >
                                                        <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110 duration-500", interest.bg)}>
                                                            <interest.icon className={cn("w-8 h-8", interest.color)} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <h3 className="text-xl font-bold">{interest.label}</h3>
                                                            <p className="text-sm text-muted-foreground leading-relaxed">Customize your practice sessions for {interest.label} roles and protocols.</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-blue-500 text-sm font-bold pt-4 group-hover:gap-4 transition-all">
                                                            Select Interest <ArrowRight className="w-4 h-4" />
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : !selectedExperience ? (
                                    <motion.div
                                        key="experience"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-bold">What is your experience level?</h3>
                                                <p className="text-muted-foreground text-sm">We'll adapt the interview depth based on this.</p>
                                            </div>
                                            <button
                                                onClick={() => setSelectedInterest(null)}
                                                className="text-sm text-blue-500 hover:underline font-medium"
                                            >
                                                Back to Industry
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {[
                                                { id: 'Fresher', label: 'Fresher / Entry-Level', desc: '0-2 years of experience. Focus on fundamentals, potential, and academic/personal projects.', icon: Star },
                                                { id: 'Experienced', label: 'Experienced Professional', desc: '2+ years of experience. Deep dive into system design, architecture, and real-world scale.', icon: Brain }
                                            ].map((exp) => (
                                                <button
                                                    key={exp.id}
                                                    onClick={() => setSelectedExperience(exp.id)}
                                                    className="p-8 rounded-3xl bg-card border border-border hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all text-left space-y-4 group"
                                                >
                                                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                                        <exp.icon className="w-7 h-7" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-bold">{exp.label}</h4>
                                                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{exp.desc}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-blue-500 text-sm font-bold pt-2 group-hover:gap-4 transition-all">
                                                        Select <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : !selectedRole ? (
                                    <motion.div
                                        key="roles"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-2xl font-bold">Recommended Roles for {currentInterest?.label}</h3>
                                            <button
                                                onClick={() => setSelectedExperience(null)}
                                                className="text-sm text-blue-500 hover:underline font-medium"
                                            >
                                                Back to Experience
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {currentInterest?.roles.map((role) => (
                                                <button
                                                    key={role}
                                                    onClick={() => setSelectedRole(role)}
                                                    className="p-6 rounded-2xl bg-card border border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex items-center justify-between group"
                                                >
                                                    <span className="font-semibold">{role}</span>
                                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <PlusCircle className="w-4 h-4 text-blue-500" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="interview"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex items-center justify-between p-6 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-600/20">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                                    <Brain className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-blue-100 font-medium tracking-wide">READY TO PRACTICE</p>
                                                    <h3 className="text-xl font-bold">{selectedRole} • {selectedExperience}</h3>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedRole(null)}
                                                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-sm font-bold backdrop-blur-md"
                                            >
                                                Back to Roles
                                            </button>
                                        </div>

                                        <InterviewRoom
                                            isLoggedIn={true}
                                            role={selectedRole || "Candidate"}
                                            industry={currentInterest?.label || "General"}
                                            experience={selectedExperience || "Fresher"}
                                            onComplete={handleInterviewComplete}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>


                        </>
                    ) : view === 'history' ? (
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <h1 className="text-4xl font-bold tracking-tight">Performance in Sessions</h1>
                                <p className="text-muted-foreground text-lg">Select a specific session to review your performance and detailed evaluation.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {history.length === 0 ? (
                                    <div className="p-12 text-center rounded-[32px] border border-dashed border-border bg-secondary/20">
                                        <History className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                        <p className="text-muted-foreground">No sessions found. Start your first practice session!</p>
                                    </div>
                                ) : (
                                    history.map((session) => (
                                        <div key={session.id} className="space-y-4">
                                            <button
                                                onClick={() => setSelectedHistorySession(selectedHistorySession?.id === session.id ? null : session)}
                                                className="w-full p-6 rounded-2xl bg-card border border-border flex items-center justify-between hover:border-blue-500/50 transition-all group"
                                            >
                                                <div className="flex items-center gap-6 text-left">
                                                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xl">
                                                        {session.score || "—"}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold flex items-center gap-2">
                                                            {session.role}
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase tracking-widest leading-none">
                                                                {session.industry}
                                                            </span>
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {new Date(session.created_at).toLocaleDateString(undefined, {
                                                                month: 'long',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right hidden sm:block">
                                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</p>
                                                        <p className={cn(
                                                            "text-sm font-medium",
                                                            session.status === 'completed' ? "text-green-500" : "text-yellow-500"
                                                        )}>
                                                            {session.status === 'completed' ? "Completed" : "Ongoing"}
                                                        </p>
                                                    </div>
                                                    <div className={cn(
                                                        "p-3 rounded-xl bg-secondary text-muted-foreground group-hover:bg-blue-600 group-hover:text-white transition-all",
                                                        selectedHistorySession?.id === session.id && "bg-blue-600 text-white rotate-90"
                                                    )}>
                                                        <ChevronRight className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </button>

                                            <AnimatePresence>
                                                {selectedHistorySession?.id === session.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="p-8 rounded-3xl bg-secondary/30 border border-border space-y-8">
                                                            {session.feedback ? (
                                                                <>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                                        {[
                                                                            { label: "Clarity", value: session.feedback.feedback.clarity },
                                                                            { label: "Structure", value: session.feedback.feedback.structure },
                                                                            { label: "Relevance", value: session.feedback.feedback.relevance },
                                                                            { label: "Correctness", value: session.feedback.feedback.correctness },
                                                                        ].map((item) => (
                                                                            <div key={item.label} className="p-4 rounded-xl bg-card border border-border">
                                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                                                                                <p className="text-sm font-medium">{item.value}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        <div className="space-y-3">
                                                                            <h4 className="text-sm font-bold text-red-500 flex items-center gap-2">
                                                                                <AlertCircle className="w-4 h-4" /> Weak Areas
                                                                            </h4>
                                                                            <ul className="space-y-1">
                                                                                {session.feedback.weak_areas.map((area: string, i: number) => (
                                                                                    <li key={i} className="text-xs text-muted-foreground">• {area}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                        <div className="space-y-3">
                                                                            <h4 className="text-sm font-bold text-green-500 flex items-center gap-2">
                                                                                <CheckCircle2 className="w-4 h-4" /> Recommendations
                                                                            </h4>
                                                                            <ul className="space-y-1">
                                                                                {session.feedback.recommendations.map((rec: string, i: number) => (
                                                                                    <li key={i} className="text-xs text-muted-foreground">• {rec}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    </div>

                                                                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                                                        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Summary</p>
                                                                        <p className="text-sm text-muted-foreground italic">"{session.feedback.summary}"</p>
                                                                    </div>

                                                                    {session.feedback.qa_analysis && session.feedback.qa_analysis.length > 0 && (
                                                                        <div className="space-y-4 pt-4 border-t border-border">
                                                                            <h4 className="flex items-center gap-2 text-lg font-bold">
                                                                                <MessageSquare className="w-5 h-5 text-blue-500" />
                                                                                Q&A Analysis
                                                                            </h4>
                                                                            <div className="space-y-4">
                                                                                {session.feedback.qa_analysis.map((qa: any, idx: number) => (
                                                                                    <div key={idx} className="p-5 rounded-2xl bg-card border border-border space-y-3">
                                                                                        <div className="space-y-1">
                                                                                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Question {idx + 1}</span>
                                                                                            <p className="text-sm font-semibold text-foreground">{qa.question}</p>
                                                                                        </div>
                                                                                        <div className="space-y-1">
                                                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Your Answer</span>
                                                                                            <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-xl border border-border/50">{qa.answer || "No response recorded."}</p>
                                                                                        </div>
                                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                                                            <div className="space-y-1">
                                                                                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Feedback</span>
                                                                                                <p className="text-xs text-muted-foreground leading-relaxed">{qa.feedback}</p>
                                                                                            </div>
                                                                                            <div className="space-y-1">
                                                                                                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1"><Zap className="w-3 h-3" /> How to Improve</span>
                                                                                                <p className="text-xs text-muted-foreground leading-relaxed">{qa.improvement}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <div className="text-center py-4">
                                                                    <p className="text-sm text-muted-foreground">Feedback for this session is not available or the session is still ongoing.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : view === 'profile' ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                            <User className="w-12 h-12 text-blue-500/20" />
                            <h2 className="text-2xl font-bold">User Profile</h2>
                            <p className="text-muted-foreground max-w-md">Manage your account settings and preferences here.</p>
                        </div>
                    ) : null}
                </div>
            </main>
        </div>
    );
}
