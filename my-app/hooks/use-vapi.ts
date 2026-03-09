"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Vapi from "@vapi-ai/web";

type CallStatus = "inactive" | "loading" | "active";

export const useVapi = () => {
  const vapiPublicKey = (process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "")
    .trim()
    .replace(/^["']|["']$/g, "");

  const assistantId = (process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "")
    .trim()
    .replace(/^["']|["']$/g, "");

  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>("inactive");
  const [messages, setMessages] = useState<any[]>([]);
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    if (!vapiPublicKey) {
      console.warn("Vapi Public Key is missing");
      return;
    }

    const vapi = new Vapi(vapiPublicKey);
    vapiRef.current = vapi;

    const onCallStart = () => {
      console.log("Vapi call started");
      setCallStatus("active");
      setIsCalling(true);
    };

    const onCallEnd = () => {
      console.log("Vapi call ended");
      setCallStatus("inactive");
      setIsCalling(false);
    };

    const onMessage = (message: any) => {
      setMessages((prev) => [...prev, message]);
    };

    const onError = (error: any) => {
      console.error(">>> VAPI_ERROR_DEBUG_V1 <<<");

      // Try to print the most useful nested fields too
      const info: any = {};
      if (error) {
        for (const key of Object.getOwnPropertyNames(error)) info[key] = error[key];
        // common nesting patterns
        if (error.error) info.error = error.error;
        if (error.response) info.response = error.response;
        if (error.data) info.data = error.data;
      }

      console.error("Detailed Error Object:", info);
      console.error("Error message:", error?.message || info?.error?.message || info?.data?.message);

      setCallStatus("inactive");
      setIsCalling(false);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);

    console.log("Initializing Vapi...");
    console.log(
      "Vapi Public Key (masked):",
      `${vapiPublicKey.slice(0, 4)}...${vapiPublicKey.slice(-4)}`
    );
    console.log(
      "Assistant ID (masked):",
      assistantId ? `${assistantId.slice(0, 4)}...${assistantId.slice(-4)}` : "MISSING"
    );

    return () => {
      // IMPORTANT in React 18 Strict Mode: remove listeners to avoid duplicates
      try {
        vapi.off("call-start", onCallStart);
        vapi.off("call-end", onCallEnd);
        vapi.off("message", onMessage);
        vapi.off("error", onError);
      } catch {}

      vapi.stop();
      vapiRef.current = null;
    };
  }, [vapiPublicKey, assistantId]);

  const startCall = useCallback(
    async (overrides?: any) => {
      const vapi = vapiRef.current;
      if (!vapi) {
        console.error("Vapi instance not initialized");
        return;
      }
      if (!assistantId) {
        console.error("Assistant ID is missing - check env NEXT_PUBLIC_VAPI_ASSISTANT_ID");
        setCallStatus("inactive");
        return;
      }

      setCallStatus("loading");
      console.log("Starting Vapi call with assistant:", assistantId);

      // Helpful: detect accidental bad override shapes
      if (overrides?.assistant?.assistantId) {
        console.warn(
          "Your overrides contain overrides.assistant.assistantId — this often causes 400. " +
            "Pass assistantId as the FIRST argument only."
        );
      }

      try {
        // vapi.start() is async → await it
        await vapi.start(assistantId, overrides);
      } catch (err) {
        console.error("startCall() promise rejected:", err);
        setCallStatus("inactive");
        setIsCalling(false);
      }
    },
    [assistantId]
  );

  const stopCall = useCallback(() => {
    vapiRef.current?.stop();
  }, []);

  const toggleCall = useCallback(
    async (overrides?: any) => {
      if (isCalling) stopCall();
      else await startCall(overrides);
    },
    [isCalling, startCall, stopCall]
  );

  return {
    isCalling,
    callStatus,
    messages,
    startCall,
    stopCall,
    toggleCall,
    vapi: vapiRef.current,
  };
};
