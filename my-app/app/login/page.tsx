"use client";

import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Chrome, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function SignInPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const isSubmitting = useRef(false);
    const supabase = createClient();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');
        const errorDescription = params.get('error_description');
        
        if (error) {
            if (error === 'auth-code-error' || error === 'no-code') {
                setErrorMessage("Authentication failed. Please try signing in again.");
            } else {
                setErrorMessage(errorDescription || error || "An unexpected error occurred during sign-in.");
            }
            
            // Clean up the URL search params so the error message doesn't persist on refresh
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }, []);

    const handleGoogleSignIn = async () => {
        if (isSubmitting.current) return;
        isSubmitting.current = true;
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error("Error signing in:", error);
            setIsLoading(false);
            isSubmitting.current = false;
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] dark:bg-blue-600/10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 blur-[100px] pointer-events-none" />

            <Link
                href="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-card border border-border backdrop-blur-xl p-10 rounded-[32px] shadow-2xl space-y-8 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] mx-auto mb-6">
                            IE
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
                        <p className="text-muted-foreground">Sign in to access your interview dashboard</p>
                    </div>

                    <div className="space-y-4">
                        {errorMessage && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center font-medium">
                                {errorMessage}
                            </div>
                        )}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-semibold flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden shadow-lg shadow-primary/10"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Chrome className="w-5 h-5" />
                                    Continue with Google
                                </>
                            )}
                        </button>
                        <p className="text-center text-xs text-muted-foreground px-6">
                            By continuing, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        New here? <Link href="/" className="text-blue-600 dark:text-blue-500 hover:underline font-medium">Explore Features</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
