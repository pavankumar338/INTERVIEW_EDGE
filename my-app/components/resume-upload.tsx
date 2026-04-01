"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { uploadResume } from "@/lib/actions/resume";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function ResumeUpload({ onUploadComplete }: { onUploadComplete?: () => void }) {
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [fileName, setFileName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            setStatus("error");
            setErrorMessage("Please upload a PDF file.");
            return;
        }

        setFileName(file.name);
        setIsUploading(true);
        setStatus("idle");

        try {
            const formData = new FormData();
            formData.append("resume", file);
            await uploadResume(formData);
            setStatus("success");
            onUploadComplete?.();
        } catch (error: any) {
            console.error("Upload error:", error);
            setStatus("error");
            setErrorMessage(error.message || "Failed to upload resume.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
            />

            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={cn(
                    "relative group cursor-pointer p-8 rounded-[32px] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center gap-4",
                    status === "success"
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : status === "error"
                            ? "border-red-500/50 bg-red-500/5"
                            : "border-border hover:border-blue-500/50 hover:bg-blue-500/5"
                )}
            >
                <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                    status === "success" ? "bg-emerald-500/10 text-emerald-500" :
                        status === "error" ? "bg-red-500/10 text-red-500" :
                            "bg-secondary text-muted-foreground group-hover:text-blue-500"
                )}>
                    {isUploading ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                    ) : status === "success" ? (
                        <CheckCircle2 className="w-8 h-8" />
                    ) : status === "error" ? (
                        <AlertCircle className="w-8 h-8" />
                    ) : (
                        <Upload className="w-8 h-8" />
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className="font-bold text-lg">
                        {isUploading ? "Reviewing your profile..." :
                            status === "success" ? "Resume Uploaded" :
                                status === "error" ? "Upload Failed" :
                                    "Upload Your Resume"}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-[240px]">
                        {isUploading ? "Preparing your personalized career review..." :
                            status === "success" ? `Successfully parsed ${fileName}` :
                                status === "error" ? errorMessage :
                                    "We'll use your resume to personalize your interview experience."}
                    </p>
                </div>

                {status === "idle" && !isUploading && (
                    <div className="mt-2 px-4 py-2 rounded-xl bg-secondary text-xs font-semibold text-muted-foreground group-hover:bg-blue-600 group-hover:text-white transition-all">
                        Select PDF File
                    </div>
                )}
            </motion.div>
        </div>
    );
}
