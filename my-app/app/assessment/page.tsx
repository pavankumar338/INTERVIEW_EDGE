"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Brain, ArrowLeft, AlertTriangle, Terminal, Code2, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AssessmentPage() {
    const router = useRouter();
    const [meta, setMeta] = useState<any>(null);
    const [results, setResults] = useState<{rounds: any[]} | null>(null);
    const [evaluating, setEvaluating] = useState(false);
    const [error, setError] = useState("");
    
    const [showWarning, setShowWarning] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    
    const [currentRound, setCurrentRound] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [codeAnswers, setCodeAnswers] = useState<Record<string, string>>({});
    const [languageAnswers, setLanguageAnswers] = useState<Record<string, string>>({});
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const [codeFeedback, setCodeFeedback] = useState<any>(null);
    const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setCurrentProblemIdx(0);
    }, [currentRound]);

    const isRoundComplete = (rIdx: number) => {
        if (!results || quizCompleted) return true;
        const r = results.rounds[rIdx];
        if (r.roundType === 'multiple_choice') {
            return r.questions?.every((_: any, qIdx: number) => answers[`${rIdx}-${qIdx}`] !== undefined) ?? true;
        }
        // Coding rounds are optional to complete
        return true;
    };

    useEffect(() => {
        const rawResults = sessionStorage.getItem("current_assessment");
        const rawMeta = sessionStorage.getItem("assessment_meta");
        if (rawResults && rawMeta) {
            setResults(JSON.parse(rawResults));
            setMeta(JSON.parse(rawMeta));
            // Initialize 80 minute timer (1 hour 20 mins = 4800 seconds)
            setTimeLeft(80 * 60);
        } else {
            router.push("/dashboard");
        }
    }, [router]);

    useEffect(() => {
        if (timeLeft === null || quizCompleted || evaluating) return;

        if (timeLeft <= 0) {
            handleSubmitExam();
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => (prev !== null && prev > 0) ? prev - 1 : 0);
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timeLeft, quizCompleted, evaluating]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? `${h}h ` : ""}${m}m ${s}s`;
    };

    const handleSelectOption = (roundIdx: number, qIdx: number, option: string) => {
        if (quizCompleted) return;
        setAnswers(prev => ({ ...prev, [`${roundIdx}-${qIdx}`]: option }));
    };

    const handleCodeChange = (codeKey: string, text: string) => {
        if (quizCompleted) return;
        setCodeAnswers(prev => ({ ...prev, [codeKey]: text }));
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 2000);
    };

    const handleSubmitExam = async () => {
        if (!results || !meta) return;
        setEvaluating(true);
        try {
            let mcqCorrect = 0;
            let mcqTotal = 0;
            let codingScore = 0;
            let codingMax = 0;
            let cFeedback = null;

            for (let r = 0; r < results.rounds.length; r++) {
                const round = results.rounds[r];
                if (round.roundType === 'multiple_choice') {
                    round.questions.forEach((q: any, i: number) => {
                        mcqTotal++;
                        if (answers[`${r}-${i}`] === q.correctAnswer) mcqCorrect++;
                    });
                } else if (round.roundType === 'coding' && round.problems) {
                    for (let pIdx = 0; pIdx < round.problems.length; pIdx++) {
                        const prob = round.problems[pIdx];
                        codingMax += 10;
                        const codeKey = `${r}-${pIdx}`;
                        const code = codeAnswers[codeKey] || "";
                        if (code.trim()) {
                            const evalRes = await fetch("/api/evaluate-code", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    problemStatement: prob.problemStatement,
                                    code,
                                    language: languageAnswers[codeKey] || prob.language || "javascript"
                                })
                            });
                            if (evalRes.ok) {
                                const evalData = await evalRes.json();
                                codingScore += evalData.score || 0;
                                cFeedback = evalData;
                            }
                        }
                    }
                }
            }

            const mcqPercentage = mcqTotal > 0 ? (mcqCorrect / mcqTotal) * 100 : null;
            const codingPercentage = codingMax > 0 ? (codingScore / codingMax) * 100 : null;
            
            let combinedScore = 0;
            if (mcqPercentage !== null && codingPercentage !== null) {
                combinedScore = Math.round((mcqPercentage + codingPercentage) / 2);
            } else if (mcqPercentage !== null) {
                combinedScore = Math.round(mcqPercentage);
            } else if (codingPercentage !== null) {
                combinedScore = Math.round(codingPercentage);
            }

            // Simple logic for weak areas based on round performance
            const weakRounds: string[] = [];
            const recommendations: string[] = [];
            results.rounds.forEach((round: any, rIdx: number) => {
                let roundCorrect = 0;
                let roundTotal = 0;
                if (round.roundType === 'multiple_choice') {
                    round.questions.forEach((q: any, qIdx: number) => {
                        roundTotal++;
                        if (answers[`${rIdx}-${qIdx}`] === q.correctAnswer) roundCorrect++;
                    });
                    if (roundTotal > 0 && roundCorrect / roundTotal < 0.7) {
                        weakRounds.push(round.roundName);
                        recommendations.push(`Strengthen your ${round.roundName} fundamentals.`);
                    }
                }
            });

            setCodeFeedback(cFeedback);
            setFinalScore(combinedScore);
            setQuizCompleted(true);
            setCurrentRound(0);

            const { saveQuizScore } = await import("@/lib/actions/interview");
            await saveQuizScore(meta.role, meta.company || "General", combinedScore, weakRounds, recommendations);
        } catch (err: any) {
            console.error("Evaluation failed:", err);
            setError("Failed to evaluate exam: " + err.message);
        } finally {
            setEvaluating(false);
        }
    };

    if (!results) return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
            <span className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
    );

    const round = results.rounds[currentRound];

    return (
        <div className="min-h-screen bg-background text-foreground p-8 pb-32">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between border-b border-border pb-6">
                    <div>
                        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 text-sm font-medium">
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Brain className="w-8 h-8 text-blue-500" />
                            {meta?.company} Mock Interview Assessment
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm font-bold bg-secondary w-fit px-3 py-1 rounded-full mt-3">Target Role: {meta?.role}</p>
                    </div>
                    {timeLeft !== null && !quizCompleted && (
                        <div className={cn(
                            "flex flex-col items-end p-4 rounded-2xl border bg-card shadow-lg transition-colors",
                            timeLeft < 300 ? "border-red-500 animate-pulse" : "border-border"
                        )}>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Time Remaining</p>
                            <div className={cn(
                                "text-2xl font-mono font-black",
                                timeLeft < 300 ? "text-red-500" : "text-blue-500"
                            )}>
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-card border border-border rounded-[32px] p-8 min-h-[500px] shadow-xl relative overflow-hidden">
                    {evaluating ? (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md space-y-6">
                            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                            <h2 className="text-2xl font-bold">Executing AI Grading Protocol...</h2>
                            <p className="text-muted-foreground text-center max-w-sm">Our Gemini 2.5 architecture is compiling your code, verifying time complexities, and assembling your feedback report.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-bold text-muted-foreground">
                                    Round {currentRound + 1} of {results.rounds.length}
                                </h3>
                                <div className="flex gap-2">
                                    {results.rounds.map((_: any, idx: number) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => quizCompleted && setCurrentRound(idx)}
                                            className={`w-3 h-3 rounded-full transition-all ${idx === currentRound ? 'bg-blue-500 scale-125' : 'bg-secondary-foreground/20'} ${quizCompleted ? 'cursor-pointer hover:bg-blue-400' : ''}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            {error && <div className="p-4 rounded-xl bg-red-500/10 text-red-500 mb-6">{error}</div>}

                            {round.roundType === 'multiple_choice' ? (
                                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                                    <h2 className="text-2xl font-bold flex items-center gap-3 text-blue-500">
                                        <div className="p-2 bg-blue-500/10 rounded-xl"><Brain className="w-6 h-6" /></div>
                                        {round.roundName}
                                    </h2>
                                    {round.questions?.map((q: any, i: number) => (
                                        <div key={i} className="p-6 rounded-3xl bg-secondary/30 border border-border space-y-4 shadow-sm hover:shadow-md transition-all">
                                            <h3 className="text-lg font-bold flex items-start gap-3">
                                                <span className="text-blue-500 font-black">Q{i+1}.</span> {q.question}
                                            </h3>
                                            <div className="space-y-2 mt-4 flex flex-col items-stretch">
                                                {q.options.map((opt: string, optIdx: number) => {
                                                    const isSelected = answers[`${currentRound}-${i}`] === opt;
                                                    const isCorrect = opt === q.correctAnswer;
                                                    
                                                    let optionClass = "w-full text-left p-4 rounded-xl border transition-all text-sm font-medium outline-none ";
                                                    if (!quizCompleted) {
                                                        optionClass += isSelected ? "bg-blue-600 text-white border-blue-500 ring-2 ring-blue-500/50" : "bg-card border-border hover:border-blue-500/50 hover:bg-secondary";
                                                    } else {
                                                        if (isCorrect) optionClass += "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400";
                                                        else if (isSelected && !isCorrect) optionClass += "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400";
                                                        else optionClass += "bg-card border-border opacity-50";
                                                    }

                                                    return (
                                                        <button key={optIdx} onClick={() => handleSelectOption(currentRound, i, opt)} disabled={quizCompleted} className={optionClass}>
                                                            {opt}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                            {quizCompleted && (
                                                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm mt-4 text-muted-foreground animate-in slide-in-from-top-2">
                                                    <strong className="text-foreground">Explanation:</strong> {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : round.roundType === 'coding' && round.problems ? (
                                <div className="space-y-12 animate-in fade-in zoom-in-95 duration-300">
                                    <h2 className="text-2xl font-bold flex items-center gap-3 text-purple-500">
                                        <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center font-bold font-mono"><Code2 className="w-5 h-5" /></div>
                                        {round.roundName}
                                        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20">
                                            <Lock className="w-4 h-4" /> Anti-Cheat Active
                                        </div>
                                    </h2>

                                    <div className="flex flex-col gap-4">
                                        {/* Horizontal Pagination */}
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground mr-2">Problems:</span>
                                            {round.problems.map((prob: any, pIdx: number) => {
                                                const isActive = pIdx === currentProblemIdx;
                                                const isCompleted = codeAnswers[`${currentRound}-${pIdx}`]?.trim()?.length > 5;
                                                return (
                                                    <button
                                                        key={pIdx}
                                                        onClick={() => setCurrentProblemIdx(pIdx)}
                                                        className={`w-12 h-12 rounded-xl transition-all border flex items-center justify-center font-bold text-lg relative ${isActive ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-card border-border hover:border-purple-500/50 hover:bg-secondary text-muted-foreground'}`}
                                                    >
                                                        {pIdx + 1}
                                                        {isCompleted && <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full border-[3px] border-background ${isActive ? 'bg-white' : 'bg-emerald-500'}`} />}
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        {/* Main Editor View */}
                                        <div className="flex-1 min-w-0">
                                            {(() => {
                                                const pIdx = currentProblemIdx;
                                                const prob = round.problems[pIdx];
                                                if (!prob) return null;
                                                
                                                const codeKey = `${currentRound}-${pIdx}`;
                                                const code = codeAnswers[codeKey] !== undefined ? codeAnswers[codeKey] : (prob.starterCode || "");
                                                const lineCount = code.split("\n").length;
                                                const lineNumbers = Array.from({ length: Math.max(lineCount, 15) }, (_, i) => i + 1);

                                                return (
                                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-4 h-[650px]">
                                                            {/* Left Pane: Description */}
                                                            <div className="rounded-3xl bg-secondary/30 border border-border flex flex-col overflow-hidden h-full shadow-lg">
                                                                <div className="p-4 border-b border-border bg-card/80 flex items-center gap-2">
                                                                    <Terminal className="w-4 h-4 text-purple-500" />
                                                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Problem {pIdx + 1} Statement</h3>
                                                                </div>
                                                                <div className="p-6 overflow-y-auto w-full custom-scrollbar">
                                                                    <p className="whitespace-pre-wrap text-[15px] text-foreground/90 font-sans leading-relaxed">
                                                                        {prob.problemStatement}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Right Pane: Code Editor */}
                                                            <div className="rounded-3xl flex flex-col overflow-hidden h-full border border-white/5 shadow-2xl relative">
                                                                <div className="flex items-center justify-between p-3 bg-[#1e1e1e] border-b border-white/10">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-[10px] font-bold text-[#d4d4d4]/50 uppercase tracking-widest ml-2">Compiler</span>
                                                                        <select
                                                                            value={languageAnswers[codeKey] || (prob.language ? prob.language.toLowerCase() : 'javascript')}
                                                                            onChange={(e) => {
                                                                                if (!quizCompleted) {
                                                                                    setLanguageAnswers(prev => ({ ...prev, [codeKey]: e.target.value }));
                                                                                }
                                                                            }}
                                                                            disabled={quizCompleted}
                                                                            className="text-[11px] font-bold text-[#d4d4d4] bg-[#2d2d2d] border border-white/10 outline-none rounded flex items-center px-2 py-1 uppercase tracking-widest cursor-pointer hover:bg-[#3d3d3d] transition-colors"
                                                                        >
                                                                            <option value="javascript">JavaScript</option>
                                                                            <option value="python">Python</option>
                                                                            <option value="java">Java</option>
                                                                            <option value="cpp">C++</option>
                                                                            <option value="csharp">C#</option>
                                                                            <option value="go">Go</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className="flex gap-2 mr-2">
                                                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                                                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="flex-1 flex font-mono text-sm leading-relaxed overflow-hidden bg-[#1e1e1e] relative">
                                                                    <div className="w-12 bg-black/40 text-slate-600 text-right pr-4 py-4 select-none flex flex-col border-r border-white/5 overflow-hidden">
                                                                        {lineNumbers.map(n => (
                                                                            <div key={n} className={n <= lineCount ? "text-slate-400" : "text-slate-700"}>
                                                                                {n}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <div className="flex-1 relative group overflow-hidden">
                                                                        <textarea
                                                                            value={code}
                                                                            onChange={(e) => handleCodeChange(codeKey, e.target.value)}
                                                                            disabled={quizCompleted}
                                                                            onPaste={handlePaste}
                                                                            onCopy={(e) => {
                                                                                e.preventDefault();
                                                                                setShowWarning(true);
                                                                                setTimeout(() => setShowWarning(false), 2000);
                                                                            }}
                                                                            onCut={(e) => {
                                                                                e.preventDefault();
                                                                                setShowWarning(true);
                                                                                setTimeout(() => setShowWarning(false), 2000);
                                                                            }}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Tab') {
                                                                                    e.preventDefault();
                                                                                    const target = e.currentTarget;
                                                                                    const start = target.selectionStart;
                                                                                    const end = target.selectionEnd;
                                                                                    handleCodeChange(codeKey, code.substring(0, start) + "    " + code.substring(end));
                                                                                    setTimeout(() => {
                                                                                        target.selectionStart = target.selectionEnd = start + 4;
                                                                                    }, 0);
                                                                                }
                                                                            }}
                                                                            spellCheck={false}
                                                                            className="w-full h-full p-4 bg-transparent text-emerald-300 font-mono text-[14px] leading-relaxed outline-none resize-none absolute inset-0 z-10 whitespace-pre overflow-y-auto"
                                                                            style={{ tabSize: 4 }}
                                                                            placeholder="// Write your solution here..."
                                                                        />
                                                                        <AnimatePresence>
                                                                            {showWarning && (
                                                                                <motion.div 
                                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                                                    className="absolute top-4 right-4 z-20 flex items-center justify-center pointer-events-none"
                                                                                >
                                                                                    <div className="bg-red-500 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 border border-red-400 backdrop-blur-md">
                                                                                        <AlertTriangle className="w-5 h-5" />
                                                                                        <span className="font-bold tracking-tight text-xs uppercase">Copy/Paste Disabled!</span>
                                                                                    </div>
                                                                                </motion.div>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {quizCompleted && codeFeedback && (
                                        <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-4 mt-6 animate-in fade-in slide-in-from-top-4 shadow-lg">
                                            <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
                                                <h4 className="font-bold text-xl text-purple-600 dark:text-purple-400">AI Code Review Profile</h4>
                                                <div className="px-4 py-1 bg-purple-500 text-white font-bold rounded-full">Score: {codeFeedback.score}/10</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-background/50 rounded-xl border border-border">
                                                    <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Time Complexity</div>
                                                    <div className="font-mono text-lg font-bold">{codeFeedback.timeComplexity}</div>
                                                </div>
                                                <div className="p-4 bg-background/50 rounded-xl border border-border">
                                                    <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Space Complexity</div>
                                                    <div className="font-mono text-lg font-bold">{codeFeedback.spaceComplexity}</div>
                                                </div>
                                            </div>
                                            <div className="text-sm mt-4 p-4 bg-background/50 rounded-xl border border-border leading-relaxed">
                                                <strong className="block mb-2 text-foreground">Detailed Feedback:</strong>
                                                <span className="text-muted-foreground">{codeFeedback.feedback}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                {!evaluating && (
                    <div className="flex justify-between items-center bg-card p-6 rounded-3xl border border-border shadow-xl">
                        <button 
                            onClick={() => setCurrentRound(c => c - 1)} 
                            disabled={currentRound === 0}
                            className="px-6 py-3 rounded-xl font-bold bg-secondary text-secondary-foreground disabled:opacity-30 transition-all hover:bg-secondary/80 flex items-center gap-2"
                        >
                            Previous Round
                        </button>
                        
                        {currentRound < results.rounds.length - 1 ? (
                            <button 
                                onClick={() => setCurrentRound(c => c + 1)}
                                disabled={!isRoundComplete(currentRound)}
                                className="px-6 py-3 rounded-xl font-bold bg-blue-600 text-white transition-all hover:bg-blue-500 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next Round
                            </button>
                        ) : !quizCompleted ? (
                            <button 
                                onClick={handleSubmitExam}
                                disabled={!isRoundComplete(currentRound)}
                                className="px-8 py-3 rounded-xl font-bold bg-emerald-600 text-white transition-all hover:bg-emerald-500 shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Finish & Evaluate Interview
                            </button>
                        ) : (
                            <div className="flex items-center gap-4">
                                <div className="font-black text-xl px-6 py-3 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl">Score: {finalScore}%</div>
                                <button 
                                    onClick={() => router.push("/dashboard")}
                                    className="px-8 py-3 rounded-xl font-bold bg-blue-600 text-white transition-all shadow-md shadow-blue-500/20"
                                >
                                    Return to Home
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
