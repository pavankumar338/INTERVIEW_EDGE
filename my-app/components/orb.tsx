"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OrbProps {
    isActive: boolean;
    isThinking?: boolean;
    size?: "sm" | "md" | "lg";
}

export function Orb({ isActive, isThinking, size = "md" }: OrbProps) {
    const sizeClasses = {
        sm: "w-12 h-12",
        md: "w-64 h-64",
        lg: "w-96 h-96"
    };

    const coreSizeClasses = {
        sm: "w-8 h-8",
        md: "w-48 h-48",
        lg: "w-72 h-72"
    };

    return (
        <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
            {/* Background Glow */}
            <motion.div
                animate={{
                    scale: isActive ? [1, 1.2, 1] : 1,
                    opacity: isActive ? [0.3, 0.6, 0.3] : 0.2,
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className={cn(
                    "absolute inset-0 rounded-full blur-3xl",
                    isActive ? "bg-blue-500/50" : "bg-muted/20"
                )}
            />

            {/* Outer Ring */}
            <motion.div
                animate={{
                    rotate: 360,
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className={cn(
                    "absolute inset-0 rounded-full border border-dashed",
                    isActive ? "border-blue-400/30 scale-110" : "border-border/10 scale-100"
                )}
            />

            {/* Main Orb */}
            <motion.div
                animate={{
                    scale: isActive ? [1, 1.05, 1] : 1,
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className={cn(
                    "relative rounded-full shadow-2xl overflow-hidden flex items-center justify-center transition-colors duration-500",
                    coreSizeClasses[size],
                    "bg-gradient-to-tr from-secondary/80 via-secondary/40 to-secondary/80 border border-border/50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 dark:border-zinc-700/50",
                    isActive && "from-blue-600/20 via-blue-500/10 to-secondary dark:from-blue-900/40 dark:via-blue-800/20 dark:to-zinc-900"
                )}
            >
                {/* Animated Inner Core */}
                {isActive && (
                    <motion.div
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="w-24 h-24 rounded-full bg-blue-500/20 blur-xl"
                    />
                )}

                {/* Crystalline Effect */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent)] dark:bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)]" />

                {/* Thinking Pulse */}
                {isThinking && (
                    <motion.div
                        animate={{
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                        }}
                        className="absolute inset-0 bg-blue-500/10"
                    />
                )}
            </motion.div>
        </div>
    );
}
