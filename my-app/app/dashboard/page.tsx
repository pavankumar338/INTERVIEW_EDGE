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
    Stethoscope,
    Cpu,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    FileText
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { InterviewRoom } from "@/components/interview-room";
import { getSessionHistory } from "@/lib/actions/interview";
import { ResumeUpload } from "@/components/resume-upload";
import { getLatestResume } from "@/lib/actions/resume";

const INTERESTS = [
    { id: 'software', label: 'Software Engineering', icon: Brain, color: 'text-blue-500', bg: 'bg-blue-500/10', roles: ['Frontend Dev', 'Backend Dev', 'Fullstack', 'DevOps', 'Mobile Eng'] },
    { id: 'healthcare', label: 'Healthcare & Medical', icon: Stethoscope, color: 'text-emerald-500', bg: 'bg-emerald-500/10', roles: ['Resident Doctor', 'Registered Nurse', 'Radiologist', 'Pharmacist'] },
    { id: 'hardware', label: 'Hardware & Core Eng', icon: Cpu, color: 'text-orange-500', bg: 'bg-orange-500/10', roles: ['Embedded Systems', 'VLSI Design', 'Robotics Eng', 'Firmware Eng'] },
];

function GenerateQuestionsTab() {
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/generate-questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ company, role, experience }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to generate questions");
            
            sessionStorage.setItem("current_assessment", JSON.stringify(data));
            sessionStorage.setItem("assessment_meta", JSON.stringify({ company, role, experience }));
            
            router.push("/assessment");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-3xl border border-border bg-card p-10 rounded-3xl mx-auto mt-8 shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-4 text-center pb-6 border-b border-border">
                <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Interactive Assessment</h1>
                <p className="text-muted-foreground text-lg">Generate a custom multi-round mock interview tailored precisely to your target company.</p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-6 pt-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold ml-1 text-muted-foreground uppercase tracking-wider">Target Company</label>
                    <input 
                        required
                        value={company} onChange={(e) => setCompany(e.target.value)}
                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-4 text-base outline-none focus:border-blue-500 focus:bg-background transition-all"
                        placeholder="e.g. Google, Stripe, Meta"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold ml-1 text-muted-foreground uppercase tracking-wider">Target Role</label>
                    <input 
                        required
                        value={role} onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-4 text-base outline-none focus:border-blue-500 focus:bg-background transition-all"
                        placeholder="e.g. Frontend Developer, Data Engineer"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold ml-1 text-muted-foreground uppercase tracking-wider">Experience Level</label>
                    <select 
                        required
                        value={experience} onChange={(e) => setExperience(e.target.value)}
                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-4 text-base outline-none focus:border-blue-500 focus:bg-background transition-all appearance-none"
                    >
                        <option value="" disabled>Select experience level...</option>
                        <option value="Entry-level">Entry-level</option>
                        <option value="Mid-level">Mid-level</option>
                        <option value="Senior">Senior</option>
                        <option value="Lead/Manager">Lead/Manager</option>
                    </select>
                </div>
                
                {error && <div className="p-4 rounded-xl bg-red-500/10 text-red-500 font-bold border border-red-500/20">{error}</div>}

                <button 
                    type="submit" 
                    disabled={loading || !company || !role || !experience}
                    className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 px-4 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-3 shadow-xl shadow-blue-500/20 text-lg hover:scale-[1.02]"
                >
                    {loading ? (
                        <>
                            <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-transparent rounded-full" />
                            Fetching Technical Requirements...
                        </>
                    ) : (
                        "Start Mock Interview Challenge"
                    )}
                </button>
            </form>
        </div>
    );
}

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [view, setView] = useState<'overview' | 'generate-questions' | 'history' | 'performance'>('overview');
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
        } catch (error) {
            console.error("Failed to fetch history:", error);
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
                            IE
                        </div>
                        <span className="font-bold tracking-tighter text-2xl">INTERVIEW<span className="text-blue-500">EDGE</span></span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: "Overview" },
                        { id: 'generate-questions', icon: MessageSquare, label: "Generate Questions" },
                        { id: 'history', icon: History, label: "Session History" },
                        { id: 'performance', icon: Star, label: "Performance" },
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
                                                onClick={() => setSelectedInterest(null)}
                                                className="text-sm text-blue-500 hover:underline font-medium"
                                            >
                                                Change Industry
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
                                                    <h3 className="text-xl font-bold">{selectedRole} • {currentInterest?.label}</h3>
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
                                            onComplete={fetchHistory}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Stats Footer */}
                            {!selectedInterest && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-12 border-t border-border/50">
                                    {[
                                        { label: "Total Sessions", value: history.length.toString(), icon: MessageSquare },
                                        { label: "Avg Performance", value: history.length > 0 ? (history.reduce((acc: number, s: any) => acc + (s.score || 0), 0) / history.length).toFixed(0) + "%" : "N/A", icon: Star },
                                        { label: "Skills Mastered", value: "0/12", icon: CheckCircle2 },
                                        { label: "Current Level", value: "Beginner", icon: Brain },
                                    ].map((stat) => (
                                        <div key={stat.label} className="p-6 rounded-3xl bg-secondary/30 border border-border/50 flex flex-col gap-2">
                                            <stat.icon className="w-5 h-5 text-muted-foreground mb-1" />
                                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-tight">{stat.label}</p>
                                            <p className="text-2xl font-bold">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : view === 'history' ? (
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <h1 className="text-4xl font-bold tracking-tight">Session History</h1>
                                <p className="text-muted-foreground text-lg">Review your past performances and track your growth.</p>
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
                    ) : view === 'generate-questions' ? (
                        <GenerateQuestionsTab />
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                            <Star className="w-12 h-12 text-blue-500/20" />
                            <h2 className="text-2xl font-bold">Performance Analytics</h2>
                            <p className="text-muted-foreground max-w-md">Detailed skill breakdown and learning curves will be available after more sessions.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}