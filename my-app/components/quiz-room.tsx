"use client";

import { useState, useEffect } from "react";
import { generateQuizQuestions } from "@/lib/actions/quiz";
import { CheckCircle2, XCircle, ArrowRight, Brain, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function QuizRoom({ role, industry, company, onComplete }: { role: string; industry: string; company: string; onComplete?: () => void }) {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const fetchQuiz = async () => {
            const data = await generateQuizQuestions(role, industry, company, 5);
            setQuestions(data);
            setLoading(false);
        };
        fetchQuiz();
    }, [role, industry, company]);

    const handleAnswer = (index: number) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(index);
        setShowExplanation(true);
        if (index === questions[currentIndex].correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            // Quiz over 
            onComplete?.();
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-muted-foreground animate-pulse">Generating company-specific questions for {company}...</p>
            </div>
        );
    }

    if (questions.length === 0) return <div>Failed to load questions.</div>;

    const currentQ = questions[currentIndex];

    return (
        <div className="max-w-3xl w-full mx-auto p-8 rounded-3xl bg-card border border-border shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">{company} Technical Quiz</h2>
                        <p className="text-sm text-muted-foreground">Question {currentIndex + 1} of {questions.length}</p>
                    </div>
                </div>
                <div className="text-sm font-bold bg-secondary px-3 py-1 rounded-full">
                    Score: {score}/{currentIndex + (selectedAnswer !== null ? 1 : 0)}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                >
                    <h3 className="text-2xl font-bold leading-relaxed">{currentQ.question}</h3>
                    
                    <div className="space-y-3">
                        {currentQ.options.map((option: string, i: number) => {
                            let optionClass = "bg-secondary/50 hover:bg-secondary border-transparent cursor-pointer";
                            
                            if (selectedAnswer !== null) {
                                if (i === currentQ.correctAnswer) {
                                    optionClass = "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400";
                                } else if (i === selectedAnswer) {
                                    optionClass = "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400";
                                } else {
                                    optionClass = "bg-secondary/20 border-transparent opacity-50 cursor-not-allowed";
                                }
                            }

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleAnswer(i)}
                                    disabled={selectedAnswer !== null}
                                    className={cn(
                                        "w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group",
                                        optionClass
                                    )}
                                >
                                    <span className="font-medium">{option}</span>
                                    {selectedAnswer !== null && i === currentQ.correctAnswer && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                    {selectedAnswer === i && i !== currentQ.correctAnswer && <XCircle className="w-5 h-5 text-red-500" />}
                                </button>
                            );
                        })}
                    </div>

                    {showExplanation && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-4"
                        >
                            <div>
                                <h4 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-2">Explanation</h4>
                                <p className="text-muted-foreground leading-relaxed">{currentQ.explanation}</p>
                            </div>
                            
                            <div className="flex justify-end pt-4 border-t border-blue-500/10">
                                <button
                                    onClick={nextQuestion}
                                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
                                >
                                    {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
