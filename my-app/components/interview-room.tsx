"use client";

import { useVapi } from "@/hooks/use-vapi";
import { Orb } from "./orb";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, PhoneOff, Play, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { startInterviewSession, endInterviewSession } from "@/lib/actions/interview";
import { getRoleConfig } from "@/lib/data/role-configs";
import { searchResumeContext } from "@/lib/actions/resume";
import { Timer } from "lucide-react";

export function InterviewRoom({
    isLoggedIn,
    role = "Candidate",
    industry = "General",
    onComplete,
}: {
    isLoggedIn?: boolean;
    role?: string;
    industry?: string;
    onComplete?: () => void;
}) {
    const { isCalling, callStatus, toggleCall, messages } = useVapi();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const isSavingRef = useRef(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const hasKeys = useMemo(() => {
        return !!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY && !!process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    }, []);

    const handleToggleCall = useCallback(async () => {
        if (!isCalling) {
            const config = getRoleConfig(role);

            // Fetch resume context using RAG
            let resumeContext = "";
            try {
                const results = await searchResumeContext(`Interview for ${role} in ${industry}`);
                if (results && results.length > 0) {
                    resumeContext = "\n\nCandidate's background (from resume): " +
                        results.map((r: any) => r.content).join(" ");
                }
            } catch (err) {
                console.error("Resume context fetch failed:", err);
            }

            const overrides = {
                variableValues: {
                    role,
                    industry,
                    focusAreas: config.focusAreas.join(", "),
                    questions: config.questions.map((q, i) => `${i + 1}. ${q}`).join("\n"),
                    systemPrompt: `
                        ${config.systemPrompt}
                        
                        CRITICAL INSTRUCTIONS:
                        1. RESUME CONTEXT: ${resumeContext || "No resume provided."}
                        2. START with a personalized greeting and mention something specific from their resume (if available).
                        3. ROLE-SPECIFIC QUESTIONS:
                        ${config.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
                        
                        INTERVIEW FLOW:
                        - First 50% of the interview: Deep dive into the candidate's actual projects and experience mentioned in the resume. Ask "how" and "why" they made certain decisions.
                        - Second 50% of the interview: Incorporate the 'ROLE-SPECIFIC QUESTIONS' listed above as "extra" benchmarking questions to ensure they meet standard technical requirements for a ${role}.
                        - If a resume project covers a role-specific question, skip the generic version and ask something more advanced.
                        - Be an active listener. If the candidate gives a shallow answer, probe deeper based on their resume background.
                    `,
                },
                firstMessage: `Hello! I'm your AI interviewer for the ${role} position. I've had a chance to look over your background. Are you ready to begin?`,
            };

            await toggleCall(overrides);
        } else {
            await toggleCall();
        }
    }, [isCalling, role, industry, toggleCall]);

    useEffect(() => {
        if (isCalling && isLoggedIn && !sessionId) {
            (async () => {
                try {
                    const session = await startInterviewSession(role, industry);
                    setSessionId(session.id);
                    setTimeLeft(300); // Reset timer to 5 mins
                } catch (error) {
                    console.error("Failed to start session:", error);
                }
            })();
        }
    }, [isCalling, isLoggedIn, role, industry, sessionId]);

    // Timer Logic
    useEffect(() => {
        if (isCalling && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        toggleCall(); // Force end call when time is up
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isCalling, timeLeft, toggleCall]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // End session in DB when call stops
    useEffect(() => {
        if (!isCalling && sessionId && !isSavingRef.current) {
            (async () => {
                isSavingRef.current = true;
                try {
                    // small delay to catch late transcripts
                    await new Promise((r) => setTimeout(r, 1000));

                    const formattedMessages = messages
                        .filter((m) => m.type === "transcript" && m.transcriptType === "final")
                        .map((m) => ({
                            role: m.role,
                            content: m.transcript,
                        }));

                    if (formattedMessages.length > 0) {
                        await endInterviewSession(sessionId, formattedMessages);
                        setSessionId(null);
                        onComplete?.();
                    } else if (sessionId) {
                        // Fallback: If no transcripts, still close the session in DB
                        // This prevents sessions from staying "ongoing"
                        await endInterviewSession(sessionId, [{ role: "assistant", content: "No conversation recorded." }]);
                        setSessionId(null);
                        onComplete?.();
                    }
                } catch (error) {
                    console.error("Failed to end session:", error);
                } finally {
                    isSavingRef.current = false;
                }
            })();
        }
    }, [isCalling, sessionId, messages, onComplete]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[600px] w-full max-w-4xl mx-auto p-8 rounded-3xl bg-card border border-border backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

            {!hasKeys && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-8 text-center">
                    <div className="bg-card border border-yellow-500/30 p-8 rounded-3xl max-w-md space-y-4 shadow-xl">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-500 mx-auto">
                            <Info className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Action Required</h3>
                        <p className="text-muted-foreground text-sm">
                            Add your <strong>Vapi Public Key</strong> and <strong>Assistant ID</strong> to <code>.env.local</code>.
                        </p>
                        <div className="text-xs text-muted-foreground bg-secondary/50 p-4 rounded-xl text-left font-mono border border-border">
                            NEXT_PUBLIC_VAPI_PUBLIC_KEY=...<br />
                            NEXT_PUBLIC_VAPI_ASSISTANT_ID=...
                        </div>
                    </div>
                </div>
            )}

            <div className="z-10 flex flex-col items-center gap-12 w-full">
                <header className="text-center min-h-[64px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {isLoggedIn || isCalling ? (
                            <motion.div
                                key="header-content"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-2"
                            >
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                                        {isCalling ? "Interview in Progress" : "Virtual Interviewer"}
                                    </h2>
                                    {isCalling && (
                                        <div className={cn(
                                            "flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border",
                                            timeLeft < 60 ? "bg-red-500/10 border-red-500/50 text-red-500 animate-pulse" : "bg-blue-500/10 border-blue-500/50 text-blue-500"
                                        )}>
                                            <Timer className="w-4 h-4" />
                                            {formatTime(timeLeft)}
                                        </div>
                                    )}
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    {isCalling ? "Speak naturally. Your AI interviewer is listening." : "Prepare your mindset and click below to begin."}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div key="login-notice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                <h3 className="text-xl font-medium text-foreground/80">Ready to take the next step?</h3>
                                <div className="flex justify-center">
                                    <Link href="/login" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                        Sign in to start your practice session
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>

                <Orb isActive={isCalling} />

                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleToggleCall}
                            className={cn(
                                "group relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-500",
                                isCalling
                                    ? "bg-red-500/10 border border-red-500/50 hover:bg-red-500/20"
                                    : "bg-blue-600 border border-blue-500 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] dark:shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                            )}
                        >
                            {isCalling ? <PhoneOff className="w-8 h-8 text-red-600 dark:text-red-500" /> : <Mic className="w-8 h-8 text-white" />}
                            {!isCalling && <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping -z-10" />}
                        </motion.button>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <span
                            className={cn(
                                "text-sm font-medium px-3 py-1 rounded-full",
                                callStatus === "active"
                                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                    : callStatus === "loading"
                                        ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                                        : "bg-secondary text-muted-foreground"
                            )}
                        >
                            {callStatus === "active" ? "Connected" : callStatus === "loading" ? "Connecting..." : "Standby"}
                        </span>
                    </div>
                </div>

                {!isCalling && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        {[
                            { icon: <Play className="w-4 h-4" />, label: "Warm-up", desc: "Start with a soft intro" },
                            { icon: <Info className="w-4 h-4" />, label: "Real-time", desc: "No delays in response" },
                            { icon: <Mic className="w-4 h-4" />, label: "Voice Only", desc: "Focused on verbal skills" },
                        ].map((item, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2 overflow-hidden relative group">
                                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="text-blue-600 dark:text-blue-400 relative z-10">{item.icon}</div>
                                <div className="text-foreground text-sm font-medium relative z-10">{item.label}</div>
                                <div className="text-muted-foreground text-xs relative z-10">{item.desc}</div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>

            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        </div>
    );
}
