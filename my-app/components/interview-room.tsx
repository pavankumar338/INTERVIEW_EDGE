"use client";

import { useVapi } from "@/hooks/use-vapi";
import { Orb } from "./orb";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, PhoneOff, Play, Info, ArrowRight, Video, Camera, Brain, Timer, Download, RotateCcw, FileVideo } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { startInterviewSession, endInterviewSession } from "@/lib/actions/interview";
import { getRoleConfig } from "@/lib/data/role-configs";
import { getLatestResume } from "@/lib/actions/resume";

export function InterviewRoom({
    isLoggedIn,
    role = "Candidate",
    industry = "General",
    experience = "Fresher",
    onComplete,
}: {
    isLoggedIn?: boolean;
    role?: string;
    industry?: string;
    experience?: string;
    onComplete?: () => void;
}) {
    const { isCalling, callStatus, toggleCall, messages } = useVapi();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const isSavingRef = useRef(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

    const hasKeys = useMemo(() => {
        return !!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY && !!process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    }, []);

    const handleToggleCall = useCallback(async () => {
        if (!isCalling) {
            const config = getRoleConfig(role);

            // Fetch latest resume
            let resumeContext = "";
            try {
                const resume = await getLatestResume();
                if (resume && resume.extracted_text) {
                    resumeContext = "\n\nCandidate's background (from resume):\n" + resume.extracted_text.substring(0, 3000);
                }
            } catch (err) {
                console.error("Resume fetch failed:", err);
            }

            const overrides = {
                variableValues: {
                    role,
                    industry,
                    experience,
                    focusAreas: config.focusAreas.join(", "),
                    questions: config.questions.map((q, i) => `${i + 1}. ${q}`).join("\n"),
                    systemPrompt: `
                        ${config.systemPrompt}
                        
                        CRITICAL INSTRUCTIONS:
                        1. CANDIDATE EXPERIENCE LEVEL: ${experience}
                           - If "Fresher": Focus heavily on core fundamentals, problem-solving potential, basic concepts, and academic/personal projects. Keep the difficulty moderate and encouraging.
                           - If "Experienced": Go deep into system design, architecture, edge cases, real-world constraints, and complex scenarios. Expect production-level answers.
                        2. RESUME CONTEXT: ${resumeContext || "No resume provided."}
                        3. START with a personalized greeting and mention something specific from their resume (if available).
                        4. ROLE-SPECIFIC QUESTIONS:
                        ${config.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
                        
                        INTERVIEW FLOW:
                        - MANDATORY: Ask questions tailored to the candidate's resume and experience level.
                        - MANDATORY: Ask the 'ROLE-SPECIFIC QUESTIONS' adjusting the depth based on whether they are a Fresher or Experienced.
                        - Be an active listener and probe correctly based on their level.
                    `,
                },
                firstMessage: `Hello! I'm your AI interviewer for the ${role} position. I see you are applying as a ${experience}. I've had a chance to look over your background. Are you ready to begin?`,
            };

            await toggleCall(overrides);
        } else {
            await toggleCall();
        }
    }, [isCalling, role, industry, experience, toggleCall]);

    useEffect(() => {
        if (isCalling && isLoggedIn && !sessionId) {
            (async () => {
                try {
                    const session = await startInterviewSession(role, industry);
                    setSessionId(session.id);
                } catch (error) {
                    console.error("Failed to start session:", error);
                }
            })();
        }
    }, [isCalling, isLoggedIn, role, industry, sessionId]);

    // Video Stream & Recording Logic
    useEffect(() => {
        let activeStream: MediaStream | null = null;
        if (isCalling) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((s) => {
                    activeStream = s;
                    setStream(s);
                    
                    // Start Recording
                    chunksRef.current = [];
                    const recorder = new MediaRecorder(s, { mimeType: 'video/webm;codecs=vp8,opus' });
                    recorder.ondataavailable = (e) => {
                        if (e.data.size > 0) chunksRef.current.push(e.data);
                    };
                    recorder.onstop = () => {
                        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                        const url = URL.createObjectURL(blob);
                        setRecordingUrl(url);
                    };
                    recorder.start();
                    mediaRecorderRef.current = recorder;
                })
                .catch((err) => console.error("Failed to get video stream:", err));
        } else {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
            }
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
                setStream(null);
            }
        }
        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(t => t.stop());
            }
        };
    }, [isCalling]);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, isCalling]);

    const [sessionCompleted, setSessionCompleted] = useState(false);

    // End session in DB when call stops
    useEffect(() => {
        if (!isCalling && sessionId && !isSavingRef.current) {
            (async () => {
                isSavingRef.current = true;
                try {
                    // small delay to catch late transcripts
                    await new Promise((r) => setTimeout(r, 1000));

                    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                        mediaRecorderRef.current.stop();
                    }

                    const formattedMessages = messages
                        .filter((m) => m.type === "transcript" && m.transcriptType === "final")
                        .map((m) => ({
                            role: m.role,
                            content: m.transcript,
                        }));

                    if (formattedMessages.length > 0) {
                        setIsSaving(true);
                        await endInterviewSession(sessionId, formattedMessages);
                        setSessionId(null);
                        setSessionCompleted(true);
                        setIsSaving(false);
                    } else if (sessionId) {
                        await endInterviewSession(sessionId, [{ role: "assistant", content: "No conversation recorded." }]);
                        setSessionId(null);
                        setSessionCompleted(true);
                    }
                } catch (error) {
                    console.error("Failed to end session:", error);
                } finally {
                    isSavingRef.current = false;
                }
            })();
        }
    }, [isCalling, sessionId, messages]);

    return (
        <div className="flex flex-col items-center justify-between min-h-[650px] w-full max-w-5xl mx-auto p-6 md:p-12 rounded-[40px] bg-white/50 dark:bg-zinc-900/50 border border-border backdrop-blur-2xl shadow-2xl relative overflow-hidden transition-all duration-700">
            {/* dynamic background effects */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

            {!hasKeys && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-8 text-center">
                    <div className="bg-card border border-yellow-500/50 p-8 rounded-3xl max-w-md space-y-4 shadow-2xl">
                        <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-600 dark:text-yellow-500 mx-auto">
                            <Info className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">Action Required</h3>
                        <p className="text-muted-foreground text-base">
                            Add your <strong>Vapi Public Key</strong> and <strong>Assistant ID</strong> to <code>.env.local</code>.
                        </p>
                        <div className="text-xs text-muted-foreground bg-secondary/50 p-4 rounded-xl text-left font-mono border border-border">
                            NEXT_PUBLIC_VAPI_PUBLIC_KEY=...<br />
                            NEXT_PUBLIC_VAPI_ASSISTANT_ID=...
                        </div>
                    </div>
                </div>
            )}

            <div className="z-10 flex flex-col items-center w-full flex-1">
                <header className="text-center w-full mb-10">
                    <AnimatePresence mode="wait">
                        {isLoggedIn || isCalling ? (
                            <motion.div
                                key="header-content"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        <Brain className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                                        {isSaving ? "Evaluating Performance..." : isCalling ? "Interview in Progress" : "Virtual Interviewer"}
                                    </h2>
                                </div>
                                {isCalling && !isSaving && (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold bg-secondary/80 backdrop-blur-md border border-border shadow-sm">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            <span className="text-muted-foreground">Recording</span>
                                        </div>
                                    </div>
                                )}
                                {!isCalling && !isSaving && (
                                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                                        Prepare your mindset and click Start Interview to begin.
                                    </p>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div key="login-notice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <h3 className="text-2xl font-bold text-foreground/80">Ready to take the next step?</h3>
                                <div className="flex justify-center">
                                    <Link href="/login" className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2">
                                        Sign in to start <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>

                <div className="w-full flex justify-center flex-1">
                    {isCalling ? (
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-stretch justify-center animate-in fade-in zoom-in duration-500">
                            {/* AI Interviewer */}
                            <div className="flex flex-col items-center justify-center p-8 rounded-[32px] bg-secondary/40 border border-white/10 relative overflow-hidden shadow-2xl backdrop-blur-md group min-h-[360px]">
                                <div className="absolute top-6 left-6 flex items-center gap-2 bg-background/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 z-10 shadow-lg">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="text-xs font-bold text-foreground">AI Interviewer</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <div className="scale-110"><Orb isActive={isCalling && !isSaving} /></div>
                            </div>

                            {/* User Video Feed */}
                            <div className="flex flex-col items-center justify-center bg-black/90 rounded-[32px] overflow-hidden relative border border-white/10 shadow-2xl group min-h-[360px]">
                                <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 z-10 shadow-lg">
                                    <Camera className="w-4 h-4 text-white" />
                                    <span className="text-xs font-bold text-white">You</span>
                                </div>
                                {stream ? (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover scale-x-[-1] transition-transform duration-1000 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-zinc-500 gap-4 w-full h-full bg-black">
                                        <div className="p-4 rounded-full bg-white/5 animate-pulse">
                                            <Camera className="w-8 h-8 opacity-50 text-white" />
                                        </div>
                                        <p className="text-sm font-medium text-white/50">Starting camera...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="py-8"><Orb isActive={false} /></div>
                    )}
                </div>

                {/* Controls Area */}
                <div className="flex flex-col items-center gap-8 mt-12 w-full max-w-3xl">
                    <AnimatePresence>
                        {recordingUrl && !isCalling && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full flex flex-col items-center gap-6 p-8 rounded-[32px] bg-blue-500/5 border border-blue-500/10 mb-8"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <FileVideo className="w-6 h-6 text-blue-500" />
                                    <h3 className="text-xl font-bold">Review Your Session</h3>
                                </div>
                                <video 
                                    src={recordingUrl} 
                                    controls 
                                    className="w-full aspect-video rounded-2xl border border-border bg-black shadow-2xl"
                                />
                                <div className="flex flex-col sm:flex-row gap-4 w-full">
                                    <a 
                                        href={recordingUrl} 
                                        download={`interview-session-${new Date().getTime()}.webm`}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-secondary text-foreground font-bold border border-border hover:bg-secondary/80 transition-all shadow-sm"
                                    >
                                        <Download className="w-5 h-5" /> Download Recording
                                    </a>
                                    {sessionCompleted && (
                                        <button 
                                            onClick={() => onComplete?.()}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                                        >
                                            View Performance Report <ArrowRight className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setRecordingUrl(null)}
                                        className="px-6 py-4 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground font-bold border border-border transition-all"
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleToggleCall}
                            className={cn(
                                "group relative flex items-center gap-4 px-8 py-4 rounded-full transition-all duration-500 font-bold text-lg overflow-hidden",
                                isSaving
                                    ? "bg-muted cursor-not-allowed opacity-50 text-muted-foreground"
                                    : isCalling
                                        ? "bg-red-500/10 border-2 border-red-500/50 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_40px_rgba(37,99,235,0.4)]"
                            )}
                            disabled={isSaving}
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {isCalling ? <PhoneOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                {isCalling ? "End Interview" : "Start Interview"}
                            </span>
                            {!isCalling && (
                                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            )}
                        </motion.button>
                        
                        {!isCalling && !isSaving && (
                            <div className="absolute -inset-4 rounded-full border border-blue-500/20 animate-ping -z-10" />
                        )}
                    </div>

                    {!isCalling && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-8 border-t border-border/50">
                            {[
                                { icon: <Play className="w-5 h-5" />, label: "Warm-up", desc: "Start with a soft intro" },
                                { icon: <Info className="w-5 h-5" />, label: "Real-time", desc: "No delays in response" },
                                { icon: <Video className="w-5 h-5" />, label: "Voice & Video", desc: "Full interview experience" },
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-[24px] bg-secondary/40 hover:bg-secondary/80 border border-white/5 hover:border-white/10 transition-all duration-300 space-y-3 relative group overflow-hidden">
                                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-600 dark:text-blue-400 relative z-10 shadow-inner">
                                        {item.icon}
                                    </div>
                                    <div className="relative z-10">
                                        <div className="text-foreground text-sm font-bold mb-1">{item.label}</div>
                                        <div className="text-muted-foreground text-xs leading-relaxed">{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
