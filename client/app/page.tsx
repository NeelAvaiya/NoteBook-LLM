"use client";

import { useRouter } from "next/navigation";
import { useSession, signIn } from "@/lib/auth-client";
import {
    BookOpen,
    Brain,
    FileText,
    MessageSquare,
    Sparkles,
    Zap,
    ArrowRight,
    GraduationCap,
} from "lucide-react";
import { useEffect } from "react";

const features = [
    {
        icon: FileText,
        title: "Multi-Source Upload",
        description:
            "Import PDFs, websites, YouTube videos, or paste text. All your research in one place.",
        gradient: "from-emerald-500/20 to-green-500/20",
        iconColor: "text-emerald-400",
    },
    {
        icon: MessageSquare,
        title: "AI-Powered Chat",
        description:
            "Ask questions about your sources. Get cited answers grounded in your actual content.",
        gradient: "from-blue-500/20 to-cyan-500/20",
        iconColor: "text-blue-400",
    },
    {
        icon: Brain,
        title: "Learning Artifacts",
        description:
            "Generate flashcards, quizzes, summaries, mind maps, and reports from your sources.",
        gradient: "from-purple-500/20 to-pink-500/20",
        iconColor: "text-purple-400",
    },
    {
        icon: Zap,
        title: "Web Search",
        description:
            "Expand beyond your sources with built-in web search for real-time information.",
        gradient: "from-amber-500/20 to-orange-500/20",
        iconColor: "text-amber-400",
    },
];

export default function LandingPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();

    useEffect(() => {
        if (session?.user) {
            router.replace("/dashboard");
        }
    }, [session, router]);

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    if (session?.user) return null;

    return (
        <div className="relative min-h-screen bg-[#0a0a0b] overflow-hidden">
            {/* Gradient orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[40%] -left-[20%] w-[70vw] h-[70vw] rounded-full bg-emerald-600/8 blur-[120px] animate-pulse-glow" />
                <div className="absolute -bottom-[30%] -right-[15%] w-[60vw] h-[60vw] rounded-full bg-blue-600/6 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
                <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-purple-600/5 blur-[80px] animate-pulse-glow" style={{ animationDelay: "3s" }} />
            </div>

            {/* Dot grid pattern */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, #fff 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            />

            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto animate-fade-in">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-heading font-bold text-white tracking-tight">
                        NoteBook LLM
                    </span>
                </div>
                <button
                    onClick={() =>
                        signIn.social({
                            provider: "google",
                            callbackURL: `${window.location.origin}/dashboard`,
                        })
                    }
                    className="px-5 py-2 rounded-full text-sm font-medium text-white/90 border border-white/10 hover:border-white/25 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                >
                    Sign in
                </button>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20 max-w-4xl mx-auto">
                <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-white/60 mb-8">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        Powered by GPT-4o & RAG
                    </div>
                </div>

                <h1
                    className="text-5xl sm:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight leading-[1.1] mb-6 animate-slide-up"
                    style={{ animationDelay: "200ms" }}
                >
                    <span className="text-white">Your AI Research</span>
                    <br />
                    <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent animate-gradient">
                        Assistant
                    </span>
                </h1>

                <p
                    className="text-lg sm:text-xl text-white/50 max-w-2xl leading-relaxed mb-10 animate-slide-up"
                    style={{ animationDelay: "300ms" }}
                >
                    Upload papers, articles, and videos. Have an AI conversation
                    grounded in your sources. Generate flashcards, quizzes, and
                    summaries to accelerate your learning.
                </p>

                <div
                    className="flex flex-col sm:flex-row gap-4 animate-slide-up"
                    style={{ animationDelay: "400ms" }}
                >
                    <button
                        onClick={() =>
                            signIn.social({
                                provider: "google",
                                callbackURL: `${window.location.origin}/dashboard`,
                            })
                        }
                        className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-base hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 cursor-pointer"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                fill="#fff"
                                fillOpacity="0.8"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#fff"
                                fillOpacity="0.8"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#fff"
                                fillOpacity="0.8"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#fff"
                                fillOpacity="0.8"
                            />
                        </svg>
                        Continue with Google
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                </div>

                {/* Social proof */}
                <div
                    className="flex items-center gap-6 mt-12 text-sm text-white/30 animate-slide-up"
                    style={{ animationDelay: "500ms" }}
                >
                    <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4" />
                        For students & researchers
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div>Free to use</div>
                    <div className="w-px h-4 bg-white/10" />
                    <div>Open source</div>
                </div>
            </main>

            {/* Features Grid */}
            <section className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500"
                        >
                            <div
                                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                            />
                            <div className="relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4">
                                    <feature.icon
                                        className={`w-5 h-5 ${feature.iconColor}`}
                                    />
                                </div>
                                <h3 className="text-base font-heading font-semibold text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-white/40 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
