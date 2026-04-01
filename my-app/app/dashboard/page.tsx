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
    BookOpen,
    Calendar,
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
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { InterviewRoom } from "@/components/interview-room";
import { getSessionHistory } from "@/lib/actions/interview";
import { ResumeUpload } from "@/components/resume-upload";
import { getLatestResume } from "@/lib/actions/resume";
import { ResumeAnalysis } from "@/components/resume-analysis";
import { Lightbulb as LightbulbIcon } from "lucide-react";


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

function StudyPathTab() {
    const [role, setRole] = useState("");
    const [topics, setTopics] = useState("");
    const [days, setDays] = useState("7");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [plan, setPlan] = useState<any>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setPlan(null);

        try {
            const res = await fetch("/api/generate-study-path", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role, topics, days: parseInt(days) }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to generate study path");
            setPlan(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12">
            {!plan ? (
                <div className="max-w-3xl border border-border bg-card p-10 rounded-3xl mx-auto shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="space-y-4 text-center pb-6 border-b border-border">
                        <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Personalized Study Path</h1>
                        <p className="text-muted-foreground text-lg">Generate a day-by-day learning roadmap tailored to your goals.</p>
                        <div className="flex justify-center pt-2">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                Beginner to Advanced (0-Level Start)
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleGenerate} className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1 text-muted-foreground uppercase tracking-wider">Target Role</label>
                            <input
                                required
                                value={role} onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-4 outline-none focus:border-blue-500 transition-all"
                                placeholder="e.g. Senior Frontend Engineer"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Key Topics</label>
                                <button 
                                    type="button"
                                    onClick={async () => {
                                        if (!role) {
                                            setError("Please enter a role first to get suggestions.");
                                            return;
                                        }
                                        setLoading(true);
                                        try {
                                            const res = await fetch("/api/generate-questions", { // Reuse existing logic or new simple route
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ company: "General", role, experience: "Intermediate" }),
                                            });
                                            // This is just a placeholder logic to show how I'd approach it
                                            setTopics(`Advanced ${role} concepts, System Design, Scalability, Performance Optimization`);
                                        } catch (e) {} finally { setLoading(false); }
                                    }}
                                    className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest"
                                >
                                    Suggest Focus Areas
                                </button>
                            </div>
                            <textarea
                                required
                                value={topics} onChange={(e) => setTopics(e.target.value)}
                                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-4 min-h-[100px] outline-none focus:border-blue-500 transition-all resize-none"
                                placeholder="e.g. React performance optimization, System Design, Browser internals"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1 text-muted-foreground uppercase tracking-wider">Duration (Days)</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    min="1"
                                    max="90"
                                    required
                                    value={days} onChange={(e) => setDays(e.target.value)}
                                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-4 outline-none focus:border-blue-500 transition-all font-bold text-lg"
                                    placeholder="Enter number of days..."
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold pointer-events-none">
                                    Days
                                </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground ml-1 uppercase tracking-widest mt-2 italic">Typically 3 - 30 days works best</p>
                        </div>

                        {error && <div className="p-4 rounded-xl bg-red-500/10 text-red-500 font-bold border border-red-500/20">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading || !role || !topics}
                            className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-3 shadow-blue-500/20 text-lg"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-transparent rounded-full" />
                                    Architecting Your Path...
                                </>
                            ) : (
                                "Generate My Study Plan"
                            )}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-border">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-blue-500 font-bold uppercase tracking-widest text-sm">
                                <Zap className="w-4 h-4" /> Personalized Plan
                            </div>
                            <h1 className="text-4xl font-black tracking-tight">{plan.title}</h1>
                            <p className="text-muted-foreground text-lg max-w-2xl">{plan.description}</p>
                        </div>
                        <button
                            onClick={() => setPlan(null)}
                            className="px-6 py-3 bg-secondary hover:bg-secondary/80 rounded-xl font-bold transition-all h-fit"
                        >
                            Create New Plan
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                        {plan.modules.map((module: any) => (
                            <div key={module.day} className="relative pl-12 pb-12 last:pb-0 group">
                                {/* Timeline Line */}
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border group-last:bg-transparent" />
                                
                                {/* Day Circle */}
                                <div className="absolute left-0 top-0 w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-600/30 z-10 transition-transform group-hover:scale-110">
                                    {module.day}
                                </div>

                                <div className="bg-card border border-border rounded-3xl p-8 hover:border-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/5">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                        <h3 className="text-2xl font-bold flex items-center gap-3">
                                            {module.title}
                                            <span className="text-xs bg-secondary px-3 py-1 rounded-full text-muted-foreground font-medium">Day {module.day} Phase</span>
                                        </h3>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed mb-8">{module.description}</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2">
                                                <Calendar className="w-4 h-4" /> Daily Tasks
                                            </h4>
                                            <ul className="space-y-3">
                                                {module.tasks.map((task: string, i: number) => (
                                                    <li key={i} className="flex gap-3 text-sm text-foreground/80 leading-relaxed">
                                                        <div className="w-5 h-5 rounded bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-blue-500 mt-0.5">
                                                            {i + 1}
                                                        </div>
                                                        {task}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                                <Globe className="w-4 h-4" /> Recommended Resources
                                            </h4>
                                            <div className="space-y-3">
                                                {module.resources.map((res: any, i: number) => (
                                                    <a 
                                                        key={i} 
                                                        href={res.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="block p-4 rounded-2xl bg-secondary/30 border border-border hover:bg-secondary/50 hover:border-blue-500/30 transition-all group/res"
                                                    >
                                                        <p className="text-sm font-bold group-hover/res:text-blue-500 transition-colors">{res.name}</p>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <span className="text-[10px] uppercase font-bold text-muted-foreground">{res.type || "Link"}</span>
                                                            <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover/res:opacity-100 group-hover/res:translate-x-1 transition-all" />
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function GenerateQuestionsTab({ activeResume }: { activeResume: any }) {
    const [company, setCompany] = useState("");
    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [useResume, setUseResume] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (activeResume) setUseResume(true);
    }, [activeResume]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/generate-questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    company, 
                    role, 
                    experience,
                    resumeContent: useResume ? activeResume?.extracted_text : null 
                }),
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

                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", activeResume ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">Resume Personalization</p>
                                <p className="text-xs text-muted-foreground">{activeResume ? `Using: ${activeResume.filename}` : "No active resume found"}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            disabled={!activeResume}
                            onClick={() => setUseResume(!useResume)}
                            className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-30",
                                useResume ? "bg-blue-600" : "bg-zinc-700"
                            )}
                        >
                            <span className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                useResume ? "translate-x-6" : "translate-x-1"
                            )} />
                        </button>
                    </div>
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
    const [selectedExperience, setSelectedExperience] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [view, setView] = useState<
        'overview' | 'history' | 'profile' | 'generate-questions' | 'study-path' | 'resume-analyst'
    >('overview');
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
                        { id: 'generate-questions', icon: MessageSquare, label: "Company Assessments" },
                        { id: 'study-path', icon: BookOpen, label: "Study Plan" },
                        { id: 'resume-analyst', icon: ShieldCheck, label: "Resume Analyst" },
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
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" /> Ready for RAG
                                                                </span>
                                                                {resume.analysis?.score && (
                                                                    <span className="text-xs font-bold text-blue-500">
                                                                        Score: {resume.analysis.score}/100
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-2 items-end">
                                                                <button
                                                                    onClick={() => setResume(null)}
                                                                    className="text-xs text-muted-foreground hover:text-foreground underline"
                                                                >
                                                                    Update
                                                                </button>
                                                                <button
                                                                    onClick={() => setView('resume-analyst')}
                                                                    className="text-xs font-bold text-blue-500 hover:text-blue-400"
                                                                >
                                                                    Full Analysis →
                                                                </button>
                                                            </div>
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
                                                                month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right hidden sm:block">
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Type</p>
                                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${session.role.includes('Quiz') ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'}`}>
                                                            {session.role.includes('Quiz') ? 'Assessment' : 'Interview'}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                                                        <p className={cn("text-sm font-medium", session.status === 'completed' ? "text-green-500" : "text-yellow-500")}>
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
                                                                            { label: "Clarity", key: "clarity" },
                                                                            { label: "Structure", key: "structure" },
                                                                            { label: "Relevance", key: "relevance" },
                                                                            { label: "Correctness", key: "correctness" },
                                                                        ].map((item) => {
                                                                            // Support both nested and flat structures
                                                                            const val = session.feedback?.feedback?.[item.key] || session.feedback?.[item.key] || "N/A";
                                                                            return (
                                                                                <div key={item.label} className="p-4 rounded-xl bg-card border border-border">
                                                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                                                                                    <p className="text-sm font-medium">{val}</p>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        <div className="space-y-3">
                                                                            <h4 className="text-sm font-bold text-red-500 flex items-center gap-2">
                                                                                <AlertCircle className="w-4 h-4" /> Weak Areas
                                                                            </h4>
                                                                            <ul className="space-y-1">
                                                                                {(session.feedback?.weak_areas || []).map((area: string, i: number) => (
                                                                                    <li key={i} className="text-xs text-muted-foreground">• {area}</li>
                                                                                ))}
                                                                                {(!session.feedback?.weak_areas || session.feedback.weak_areas.length === 0) && (
                                                                                    <li className="text-xs text-muted-foreground italic">No weak areas identified. Good job!</li>
                                                                                )}
                                                                            </ul>
                                                                        </div>
                                                                        <div className="space-y-3">
                                                                            <h4 className="text-sm font-bold text-green-500 flex items-center gap-2">
                                                                                <CheckCircle2 className="w-4 h-4" /> Recommendations
                                                                            </h4>
                                                                            <ul className="space-y-1">
                                                                                {(session.feedback?.recommendations || []).map((rec: string, i: number) => (
                                                                                    <li key={i} className="text-xs text-muted-foreground">• {rec}</li>
                                                                                ))}
                                                                                {(!session.feedback?.recommendations || session.feedback.recommendations.length === 0) && (
                                                                                    <li className="text-xs text-muted-foreground italic">No specific recommendations yet.</li>
                                                                                )}
                                                                            </ul>
                                                                        </div>
                                                                    </div>

                                                                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                                                        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Session Summary</p>
                                                                        <p className="text-sm text-muted-foreground italic leading-relaxed">
                                                                            "{session.feedback?.summary || session.feedback?.feedbackSummary || "No summary available for this session."}"
                                                                        </p>
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
                    ) : view === 'study-path' ? (
                        <StudyPathTab />
                    ) : view === 'generate-questions' ? (
                        <GenerateQuestionsTab activeResume={resume} />
                    ) : view === 'resume-analyst' ? (
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <h1 className="text-4xl font-bold tracking-tight">Resume Analyst</h1>
                                <p className="text-muted-foreground text-lg">AI-powered deep dive into your resume for corrections, scoring, and strategic recommendations.</p>
                            </div>

                            {resume ? (
                                <ResumeAnalysis analysis={resume.analysis} />
                            ) : (
                                <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
                                    <div className="w-20 h-20 bg-secondary rounded-[32px] flex items-center justify-center mx-auto text-muted-foreground/30">
                                        <FileText className="w-10 h-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold">No Resume Found</h3>
                                        <p className="text-muted-foreground">Please upload your resume first to get a detailed analysis and score.</p>
                                    </div>
                                    <button 
                                        onClick={() => setView('overview')}
                                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all"
                                    >
                                        Go to Upload
                                    </button>
                                </div>
                            )}
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