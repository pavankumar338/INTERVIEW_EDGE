"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brain, ArrowLeft } from "lucide-react";

export default function AssessmentPage() {
    const router = useRouter();
    const [meta, setMeta] = useState<any>(null);
    const [results, setResults] = useState<{rounds: any[]} | null>(null);
    const [evaluating, setEvaluating] = useState(false);
    const [error, setError] = useState("");
    
    const [currentRound, setCurrentRound] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [codeAnswers, setCodeAnswers] = useState<Record<number, string>>({});
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const [codeFeedback, setCodeFeedback] = useState<any>(null);

    useEffect(() => {
        const rawResults = sessionStorage.getItem("current_assessment");
        const rawMeta = sessionStorage.getItem("assessment_meta");
        if (rawResults && rawMeta) {
            setResults(JSON.parse(rawResults));
            setMeta(JSON.parse(rawMeta));
        } else {
            router.push("/dashboard");
        }
    }, [router]);

    const handleSelectOption = (roundIdx: number, qIdx: number, option: string) => {
        if (quizCompleted) return;
        setAnswers(prev => ({ ...prev, [`${roundIdx}-${qIdx}`]: option }));
    };

    const handleCodeChange = (roundIdx: number, text: string) => {
        if (quizCompleted) return;
        setCodeAnswers(prev => ({ ...prev, [roundIdx]: text }));
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
                } else if (round.roundType === 'coding') {
                    codingMax += 10;
                    const code = codeAnswers[r] || "";
                    if (code.trim()) {
                        const evalRes = await fetch("/api/evaluate-code", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                problemStatement: round.problemStatement,
                                code,
                                language: round.language
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

            setCodeFeedback(cFeedback);
            setFinalScore(combinedScore);
            setQuizCompleted(true);
            setCurrentRound(0);

            const { saveQuizScore } = await import("@/lib/actions/interview");
            await saveQuizScore(meta.role, meta.company || "General", combinedScore);
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
            <div className="max-w-4xl mx-auto space-y-8">
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
                            ) : round.roundType === 'coding' ? (
                                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                    <h2 className="text-2xl font-bold flex items-center gap-3 text-purple-500">
                                        <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center font-bold font-mono">&lt;/&gt;</div>
                                        {round.roundName}
                                    </h2>
                                    <div className="p-0 rounded-3xl bg-secondary/30 border border-border flex flex-col overflow-hidden">
                                        <div className="p-6 border-b border-border bg-card">
                                            <h3 className="text-lg font-bold mb-2">Problem Statement</h3>
                                            <p className="whitespace-pre-wrap text-sm text-foreground/80 font-medium font-sans leading-relaxed">{round.problemStatement}</p>
                                        </div>
                                        
                                        <div className="p-4 bg-[#1e1e1e] border-t-4 border-purple-500/50">
                                            <div className="flex items-center justify-between mb-3 px-2">
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-[#d4d4d4]/70">Integrated Compiler • {round.language || 'Javascript'}</span>
                                                <div className="flex gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                                </div>
                                            </div>
                                            <textarea
                                                value={codeAnswers[currentRound] !== undefined ? codeAnswers[currentRound] : (round.starterCode || "")}
                                                onChange={(e) => handleCodeChange(currentRound, e.target.value)}
                                                disabled={quizCompleted}
                                                className="w-full h-80 bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl font-mono text-[14px] leading-relaxed border-0 focus:ring-0 resize-y outline-none"
                                                spellCheck={false}
                                                placeholder="// Write your solution here..."
                                            />
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
                                className="px-6 py-3 rounded-xl font-bold bg-blue-600 text-white transition-all hover:bg-blue-500 shadow-md shadow-blue-500/20"
                            >
                                Next Round
                            </button>
                        ) : !quizCompleted ? (
                            <button 
                                onClick={handleSubmitExam}
                                className="px-8 py-3 rounded-xl font-bold bg-emerald-600 text-white transition-all hover:bg-emerald-500 shadow-lg shadow-emerald-500/30"
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
