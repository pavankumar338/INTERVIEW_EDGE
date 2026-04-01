"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Brain, ArrowLeft, AlertTriangle, Terminal, Code2, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AssessmentPage() {
    const router = useRouter();
    const [meta, setMeta] = useState<any>(null);
    const [results, setResults] = useState<{ rounds: any[] } | null>(null);
    const [evaluating, setEvaluating] = useState(false);
    const [error, setError] = useState("");
    const [showWarning, setShowWarning] = useState(false);
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
        return true;
    };

    useEffect(() => {
        const rawResults = sessionStorage.getItem("current_assessment");
        const rawMeta = sessionStorage.getItem("assessment_meta");
        if (rawResults && rawMeta) {
            setResults(JSON.parse(rawResults));
            setMeta(JSON.parse(rawMeta));
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
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
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
                            <h2 className="text-2xl font-bold">Evaluating Session...</h2>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-bold text-muted-foreground">Round {currentRound + 1} of {results.rounds.length}</h3>
                                <div className="flex gap-2">
                                    {results.rounds.map((_: any, idx: number) => (
                                        <div key={idx} className={`w-3 h-3 rounded-full ${idx === currentRound ? 'bg-blue-500' : 'bg-secondary'}`} />
                                    ))}
                                </div>
                            </div>

                            {error && <div className="p-4 rounded-xl bg-red-500/10 text-red-500 mb-6">{error}</div>}

                            {round.roundType === 'multiple_choice' ? (
                                <div className="space-y-8">
                                    <h2 className="text-2xl font-bold text-blue-500">{round.roundName}</h2>
                                    {round.questions?.map((q: any, i: number) => (
                                        <div key={i} className="p-6 rounded-3xl bg-secondary/30 border border-border space-y-4">
                                            <h3 className="text-lg font-bold">Q{i + 1}. {q.question}</h3>
                                            <div className="space-y-2 mt-4 flex flex-col items-stretch">
                                                {q.options.map((opt: string, optIdx: number) => {
                                                    const isSelected = answers[`${currentRound}-${i}`] === opt;
                                                    const isCorrect = opt === q.correctAnswer;
                                                    let optionClass = "w-full text-left p-4 rounded-xl border transition-all text-sm font-medium ";
                                                    if (!quizCompleted) {
                                                        optionClass += isSelected ? "bg-blue-600 text-white border-blue-500" : "bg-card border-border hover:bg-secondary";
                                                    } else {
                                                        if (isCorrect) optionClass += "bg-emerald-500/10 border-emerald-500 text-emerald-600";
                                                        else if (isSelected && !isCorrect) optionClass += "bg-red-500/10 border-red-500 text-red-600";
                                                        else optionClass += "bg-card border-border opacity-50";
                                                    }
                                                    return (
                                                        <button key={optIdx} onClick={() => handleSelectOption(currentRound, i, opt)} disabled={quizCompleted} className={optionClass}>
                                                            {opt}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                            {quizCompleted && <div className="p-4 rounded-xl bg-blue-500/10 text-xs"><strong>Explanation:</strong> {q.explanation}</div>}
                                        </div>
                                    ))}
                                </div>
                            ) : round.roundType === 'coding' && round.problems ? (
                                <div className="space-y-12">
                                    <h2 className="text-2xl font-bold flex items-center gap-3 text-purple-500">
                                        <Code2 className="w-6 h-6" /> {round.roundName}
                                    </h2>
                                    <div className="flex items-center gap-3 mb-2">
                                        {round.problems.map((prob: any, pIdx: number) => (
                                            <button
                                                key={pIdx}
                                                onClick={() => setCurrentProblemIdx(pIdx)}
                                                className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold ${currentProblemIdx === pIdx ? 'bg-purple-600 text-white border-purple-500' : 'bg-card'}`}
                                            >
                                                {pIdx + 1}
                                            </button>
                                        ))}
                                    </div>
                                    {(() => {
                                        const prob = round.problems[currentProblemIdx];
                                        const codeKey = `${currentRound}-${currentProblemIdx}`;
                                        const code = codeAnswers[codeKey] !== undefined ? codeAnswers[codeKey] : (prob.starterCode || "");
                                        return (
                                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-4 h-[600px]">
                                                <div className="rounded-3xl bg-secondary/30 border border-border p-6 overflow-y-auto">
                                                    <h3 className="text-xs font-bold uppercase text-muted-foreground mb-4">Problem Statement</h3>
                                                    <p className="whitespace-pre-wrap text-[15px]">{prob.problemStatement}</p>
                                                </div>
                                                <div className="rounded-3xl flex flex-col overflow-hidden border border-border bg-[#1e1e1e]">
                                                    <div className="p-3 bg-black/40 border-b border-white/5 flex justify-between">
                                                        <span className="text-xs text-zinc-500 uppercase font-black">Editor</span>
                                                        <select
                                                            value={languageAnswers[codeKey] || 'javascript'}
                                                            onChange={(e) => setLanguageAnswers(p => ({ ...p, [codeKey]: e.target.value }))}
                                                            className="bg-zinc-800 text-xs text-white border-0 outline-none rounded px-2"
                                                        >
                                                            <option value="javascript">JS</option>
                                                            <option value="python">PY</option>
                                                        </select>
                                                    </div>
                                                    <textarea
                                                        value={code}
                                                        onChange={(e) => handleCodeChange(codeKey, e.target.value)}
                                                        disabled={quizCompleted}
                                                        onPaste={handlePaste}
                                                        className="w-full h-full p-4 bg-transparent text-emerald-300 font-mono text-sm outline-none resize-none"
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })()}
                                    {quizCompleted && codeFeedback && (
                                        <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-4">
                                            <h4 className="font-bold text-purple-600">AI Code Review: {codeFeedback.score}/10</h4>
                                            <p className="text-sm font-mono">{codeFeedback.timeComplexity} | {codeFeedback.spaceComplexity}</p>
                                            <p className="text-sm text-muted-foreground">{codeFeedback.feedback}</p>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                {!evaluating && (
                    <div className="flex justify-between items-center bg-card p-6 rounded-3xl border border-border shadow-xl">
                        <button onClick={() => setCurrentRound(c => c - 1)} disabled={currentRound === 0} className="px-6 py-3 rounded-xl font-bold bg-secondary text-secondary-foreground">Previous</button>
                        {currentRound < results.rounds.length - 1 ? (
                            <button onClick={() => setCurrentRound(c => c + 1)} disabled={!isRoundComplete(currentRound)} className="px-6 py-3 rounded-xl font-bold bg-blue-600 text-white">Next Round</button>
                        ) : !quizCompleted ? (
                            <button onClick={handleSubmitExam} disabled={!isRoundComplete(currentRound)} className="px-8 py-3 rounded-xl font-bold bg-emerald-600 text-white">Finish Assessment</button>
                        ) : (
                            <div className="flex items-center gap-4">
                                <div className="font-black text-xl px-6 py-3 bg-emerald-500/10 text-emerald-600 rounded-xl">Score: {finalScore}%</div>
                                <button onClick={() => router.push("/dashboard")} className="px-8 py-3 rounded-xl font-bold bg-blue-600 text-white">Dashboard</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
