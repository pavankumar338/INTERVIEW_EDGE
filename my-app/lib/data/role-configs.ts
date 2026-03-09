export interface RoleConfig {
    questions: string[];
    focusAreas: string[];
    systemPrompt: string;
}

export const ROLE_CONFIGS: Record<string, RoleConfig> = {
    // Software Engineering
    "Frontend Dev": {
        questions: [
            "How do you handle state management in complex React applications?",
            "Can you explain the difference between Server-side Rendering and Static Site Generation?",
            "How do you optimize a web application for performance and Core Web Vitals?",
            "Describe your experience with CSS-in-JS vs CSS Modules."
        ],
        focusAreas: ["React", "TypeScript", "Performance", "UX/UI Implementation"],
        systemPrompt: "You are a Senior Frontend Engineer interviewing a candidate for a Frontend Developer position. Focus on their knowledge of React, styling, and performance."
    },
    "Backend Dev": {
        questions: [
            "Explain how you would design a scalable rate-limiting system.",
            "What are the pros and cons of using a NoSQL database vs a Relational database?",
            "How do you ensure security and prevent SQL injection or XSS in your APIs?",
            "Describe how you handle database migrations in a production environment."
        ],
        focusAreas: ["System Design", "Databases", "Security", "APIs"],
        systemPrompt: "You are a Lead Backend Engineer. Interview the candidate on system architecture, database management, and API design."
    },
    "Fullstack": {
        questions: [
            "Walk me through how you would architect a real-time collaborative tool.",
            "How do you balance performance between the client and the server?",
            "What is your preferred tech stack and why?",
            "How do you handle authentication and authorization across the entire stack?"
        ],
        focusAreas: ["End-to-End Development", "Architecture", "Integration", "Security"],
        systemPrompt: "You are a Fullstack Architect. Focus on how the candidate bridges the gap between frontend and backend."
    },
    "DevOps": {
        questions: [
            "What is your experience with CI/CD pipelines and which tools do you prefer?",
            "How do you handle container orchestration and scaling in production?",
            "Can you explain the concept of Infrastructure as Code and its benefits?",
            "How do you monitor system health and respond to incidents?"
        ],
        focusAreas: ["Automation", "Cloud Infrastructure", "Security", "Observability"],
        systemPrompt: "You are a Senior DevOps Engineer. Focus on infrastructure reliability, scalability, and automation."
    },
    "Mobile Eng": {
        questions: [
            "How do you handle offline sync and data persistence on mobile devices?",
            "What are the key differences between developing for iOS and Android?",
            "How do you optimize mobile app performance and battery usage?",
            "Describe your experience with cross-platform frameworks vs native development."
        ],
        focusAreas: ["Mobile Architecture", "Performance", "UI/UX", "Synchronization"],
        systemPrompt: "You are a Senior Mobile Developer. Focus on mobile-specific constraints and platform best practices."
    },

    // Healthcare
    "Resident Doctor": {
        questions: [
            "How do you prioritize patient care when managing multiple critical cases?",
            "Describe a time you had to deliver difficult news to a patient's family.",
            "What is your process for diagnosing a complex case with conflicting symptoms?",
            "How do you stay updated with the latest medical research and protocols?"
        ],
        focusAreas: ["Diagnostics", "Patient Communication", "Prioritization", "Ethics"],
        systemPrompt: "You are a Chief Resident. Interview the candidate on clinical reasoning, bedside manner, and time management."
    },
    "Registered Nurse": {
        questions: [
            "How do you handle a situation where a patient is non-compliant with their medication?",
            "What steps do you take to ensure patient safety during a shift change?",
            "Describe your experience with electronic health records (EHR).",
            "How do you manage high-stress environments and prevent burnout?"
        ],
        focusAreas: ["Patient Safety", "Care Coordination", "Empathy", "Documentation"],
        systemPrompt: "You are a Head Nurse. Focus on patient care, attention to detail, and teamwork."
    },
    "Radiologist": {
        questions: [
            "How do you handle cases where clinical findings don't match imaging results?",
            "What is your process for ensuring pediatric radiation safety?",
            "Describe your experience with AI-assisted diagnostic tools.",
            "How do you communicate critical findings to referring physicians?"
        ],
        focusAreas: ["Imaging Analysis", "Safety Protocols", "Communication", "Technology"],
        systemPrompt: "You are a Senior Radiologist. Focus on diagnostic accuracy, safety, and clinical integration."
    },
    "Pharmacist": {
        questions: [
            "How do you ensure accuracy when dispensing high-alert medications?",
            "How do you handle a situation where a prescribed drug has a potential interaction with a patient's existing medication?",
            "Describe your approach to patient counseling and education.",
            "How do you manage inventory and prevent drug shortages?"
        ],
        focusAreas: ["Medication Safety", "Clinical Knowledge", "Patient Education", "Management"],
        systemPrompt: "You are a Chief Pharmacist. Focus on safety, clinical expertise, and regulatory compliance."
    },

    // Hardware
    "Embedded Systems": {
        questions: [
            "Explain the difference between a mutex and a semaphore in an RTOS context.",
            "How do you debug hardware-software interface issues?",
            "Describe your experience with low-level communication protocols like I2C, SPI, or UART.",
            "How do you optimize code for memory-constrained environments?"
        ],
        focusAreas: ["RTOS", "Low-level C/C++", "Hardware Interfacing", "Optimization"],
        systemPrompt: "You are an Embedded Systems Lead. Interview the candidate on microcontrollers, real-time constraints, and hardware debugging."
    }
};

export const getRoleConfig = (role: string): RoleConfig => {
    return ROLE_CONFIGS[role] || {
        questions: [
            "Tell me about your background and why you are interested in this role.",
            "What is your greatest professional achievement?",
            "How do you handle conflict in a team environment?",
            "Where do you see yourself in five years?"
        ],
        focusAreas: ["Soft Skills", "Experience", "Motivation"],
        systemPrompt: "You are a professional recruiter. Conduct a standard behavioral interview focused on the candidate's experience and fit."
    };
};
