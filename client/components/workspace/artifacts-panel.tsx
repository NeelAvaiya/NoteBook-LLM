"use client";

import { useState } from "react";
import { useArtifacts, useCreateArtifact, useDeleteArtifact } from "@/hooks/use-artifacts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    Sparkles,
    FileText,
    ListChecks,
    Layers,
    HelpCircle,
    Network,
    FileBarChart,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Clock,
    Trash2,
    ArrowLeft,
    RotateCcw,
    ChevronRight,
    X,
} from "lucide-react";
import type { LearningArtifact } from "@/lib/api";

const ARTIFACT_TYPES = [
    { type: "SUMMARY", label: "Summary", icon: FileText, description: "Comprehensive overview", color: "text-blue-400" },
    { type: "TAKEAWAYS", label: "Key Takeaways", icon: ListChecks, description: "Important points", color: "text-emerald-400" },
    { type: "FLASHCARDS", label: "Flashcards", icon: Layers, description: "Study cards", color: "text-purple-400" },
    { type: "QUIZ", label: "Quiz", icon: HelpCircle, description: "Test knowledge", color: "text-amber-400" },
    { type: "MINDMAP", label: "Mind Map", icon: Network, description: "Visual structure", color: "text-pink-400" },
    { type: "REPORT", label: "Report", icon: FileBarChart, description: "Detailed analysis", color: "text-cyan-400" },
] as const;

const STATUS_ICONS: Record<LearningArtifact["status"], { icon: typeof CheckCircle2; className: string }> = {
    PENDING: { icon: Clock, className: "text-amber-400" },
    PROCESSING: { icon: Loader2, className: "text-blue-400 animate-spin" },
    READY: { icon: CheckCircle2, className: "text-emerald-400" },
    FAILED: { icon: AlertCircle, className: "text-red-400" },
};

/* ---- Artifact Viewers ---- */

function FlashcardsViewer({ content }: { content: Record<string, unknown> }) {
    const cards = (content as { cards?: { front: string; back: string }[] }).cards ?? [];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);

    if (!cards.length) return <p className="text-sm text-muted-foreground">No cards generated.</p>;
    const card = cards[currentIndex];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Card {currentIndex + 1} of {cards.length}</span>
                <button className="hover:text-foreground" onClick={() => setFlipped(false)}>
                    <RotateCcw className="w-3.5 h-3.5" />
                </button>
            </div>

            <button
                onClick={() => setFlipped(!flipped)}
                className="w-full min-h-[160px] rounded-xl border border-border/50 p-6 text-center cursor-pointer transition-all hover:border-primary/30 hover:shadow-lg relative"
            >
                <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-[10px]">
                        {flipped ? "Answer" : "Question"}
                    </Badge>
                </div>
                <p className="text-sm leading-relaxed mt-4">
                    {flipped ? card.back : card.front}
                </p>
            </button>

            <div className="flex items-center justify-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    disabled={currentIndex === 0}
                    onClick={() => { setCurrentIndex(currentIndex - 1); setFlipped(false); }}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    disabled={currentIndex === cards.length - 1}
                    onClick={() => { setCurrentIndex(currentIndex + 1); setFlipped(false); }}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

function QuizViewer({ content }: { content: Record<string, unknown> }) {
    const questions = (content as { questions?: { question: string; options: string[]; correctIndex: number; explanation: string }[] }).questions ?? [];
    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(0);

    if (!questions.length) return <p className="text-sm text-muted-foreground">No questions generated.</p>;
    const q = questions[currentQ];

    const handleAnswer = (idx: number) => {
        if (selected !== null) return;
        setSelected(idx);
        setAnswered((a) => a + 1);
        if (idx === q.correctIndex) setScore((s) => s + 1);
    };

    const nextQuestion = () => {
        setSelected(null);
        setCurrentQ((c) => c + 1);
    };

    if (currentQ >= questions.length) {
        return (
            <div className="text-center py-6">
                <p className="text-2xl font-heading font-bold mb-2">
                    {score}/{questions.length}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                    Quiz complete! You got {Math.round((score / questions.length) * 100)}% correct.
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setCurrentQ(0); setSelected(null); setScore(0); setAnswered(0); }}
                >
                    Retake Quiz
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Question {currentQ + 1} of {questions.length}</span>
                <span>Score: {score}/{answered}</span>
            </div>

            <p className="text-sm font-medium">{q.question}</p>

            <div className="space-y-2">
                {q.options.map((opt, idx) => {
                    let style = "border-border/50 hover:border-primary/30";
                    if (selected !== null) {
                        if (idx === q.correctIndex) style = "border-emerald-500 bg-emerald-500/10";
                        else if (idx === selected) style = "border-red-500 bg-red-500/10";
                    }
                    return (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all cursor-pointer ${style}`}
                            disabled={selected !== null}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>

            {selected !== null && (
                <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground animate-fade-in">
                    {q.explanation}
                </div>
            )}

            {selected !== null && currentQ < questions.length - 1 && (
                <Button size="sm" className="w-full rounded-lg" onClick={nextQuestion}>
                    Next Question
                </Button>
            )}
            {selected !== null && currentQ === questions.length - 1 && (
                <Button size="sm" className="w-full rounded-lg" onClick={nextQuestion}>
                    See Results
                </Button>
            )}
        </div>
    );
}

function TakeawaysViewer({ content }: { content: Record<string, unknown> }) {
    const items = (content as { items?: string[] }).items ?? [];
    return (
        <ul className="space-y-2.5">
            {items.map((item, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                </li>
            ))}
        </ul>
    );
}

function MarkdownViewer({ content }: { content: Record<string, unknown> }) {
    const markdown = (content as { markdown?: string }).markdown ?? "";
    return (
        <div className="chat-message-content text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
            </ReactMarkdown>
        </div>
    );
}

function MindmapViewer({ content }: { content: Record<string, unknown> }) {
    const data = content as {
        nodes?: { id: string; label: string }[];
        edges?: { id: string; source: string; target: string }[];
    };
    const nodes = data.nodes ?? [];
    const edges = data.edges ?? [];

    return (
        <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
                {nodes.length} nodes · {edges.length} connections
            </p>
            <div className="space-y-2">
                {nodes.map((node) => {
                    const connections = edges.filter((e) => e.source === node.id);
                    return (
                        <div
                            key={node.id}
                            className="rounded-lg border border-border/50 p-3"
                        >
                            <p className="text-sm font-medium">{node.label}</p>
                            {connections.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                    {connections.map((edge) => {
                                        const target = nodes.find((n) => n.id === edge.target);
                                        return target ? (
                                            <Badge
                                                key={edge.id}
                                                variant="secondary"
                                                className="text-[10px]"
                                            >
                                                → {target.label}
                                            </Badge>
                                        ) : null;
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ArtifactContent({ artifact }: { artifact: LearningArtifact }) {
    if (!artifact.content) return null;

    switch (artifact.type) {
        case "SUMMARY":
        case "REPORT":
            return <MarkdownViewer content={artifact.content} />;
        case "TAKEAWAYS":
            return <TakeawaysViewer content={artifact.content} />;
        case "FLASHCARDS":
            return <FlashcardsViewer content={artifact.content} />;
        case "QUIZ":
            return <QuizViewer content={artifact.content} />;
        case "MINDMAP":
            return <MindmapViewer content={artifact.content} />;
        default:
            return <pre className="text-xs overflow-auto">{JSON.stringify(artifact.content, null, 2)}</pre>;
    }
}

/* ---- Main Panel ---- */

interface ArtifactsPanelProps {
    workspaceId: string;
    selectedSourceIds: string[];
}

export function ArtifactsPanel({ workspaceId, selectedSourceIds }: ArtifactsPanelProps) {
    const { data: artifacts, isLoading } = useArtifacts(workspaceId);
    const createArtifact = useCreateArtifact(workspaceId);
    const deleteArtifact = useDeleteArtifact(workspaceId);
    const [viewingId, setViewingId] = useState<string | null>(null);

    const viewingArtifact = artifacts?.find((a) => a.id === viewingId);

    const handleGenerate = async (type: string) => {
        await createArtifact.mutateAsync({
            type,
            sourceIds: selectedSourceIds.length > 0 ? selectedSourceIds : undefined,
        });
    };

    // Viewing a specific artifact
    if (viewingArtifact) {
        const typeConfig = ARTIFACT_TYPES.find((t) => t.type === viewingArtifact.type);
        const TypeIcon = typeConfig?.icon ?? FileText;

        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setViewingId(null)}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <TypeIcon className={`w-4 h-4 ${typeConfig?.color}`} />
                    <span className="text-sm font-heading font-semibold truncate flex-1">
                        {viewingArtifact.title}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => {
                            deleteArtifact.mutate(viewingArtifact.id);
                            setViewingId(null);
                        }}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4">
                        {viewingArtifact.status === "READY" && viewingArtifact.content ? (
                            <ArtifactContent artifact={viewingArtifact} />
                        ) : viewingArtifact.status === "FAILED" ? (
                            <div className="text-center py-8">
                                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    Generation failed. Try again.
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    Generating {viewingArtifact.type.toLowerCase()}...
                                </p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        );
    }

    // List view
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 shrink-0">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-heading font-semibold">Studio</h2>
                {artifacts && artifacts.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                        {artifacts.length}
                    </Badge>
                )}
            </div>

            <ScrollArea className="flex-1">
                <div className="p-3 space-y-4">
                    {/* Generate buttons */}
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold px-1 mb-2">
                            Generate
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                            {ARTIFACT_TYPES.map(({ type, label, icon: Icon, description, color }) => (
                                <button
                                    key={type}
                                    onClick={() => handleGenerate(type)}
                                    disabled={createArtifact.isPending}
                                    className="flex flex-col items-start gap-1 p-2.5 rounded-lg border border-border/30 hover:border-primary/20 hover:bg-muted/40 transition-all text-left cursor-pointer disabled:opacity-50"
                                >
                                    <Icon className={`w-4 h-4 ${color}`} />
                                    <span className="text-[11px] font-medium">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generated artifacts list */}
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(2)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-14 rounded-lg bg-muted/50 animate-pulse"
                                />
                            ))}
                        </div>
                    ) : artifacts && artifacts.length > 0 ? (
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold px-1 mb-2">
                                Generated
                            </p>
                            <div className="space-y-1">
                                {artifacts.map((artifact) => {
                                    const typeConfig = ARTIFACT_TYPES.find((t) => t.type === artifact.type);
                                    const TypeIcon = typeConfig?.icon ?? FileText;
                                    const statusConfig = STATUS_ICONS[artifact.status];
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <button
                                            key={artifact.id}
                                            onClick={() => setViewingId(artifact.id)}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left cursor-pointer group"
                                        >
                                            <TypeIcon className={`w-4 h-4 shrink-0 ${typeConfig?.color}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">
                                                    {artifact.title}
                                                </p>
                                            </div>
                                            <StatusIcon className={`w-3.5 h-3.5 shrink-0 ${statusConfig.className}`} />
                                            <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}

                    {/* Empty generated state */}
                    {!isLoading && (!artifacts || artifacts.length === 0) && (
                        <div className="text-center py-6">
                            <p className="text-xs text-muted-foreground">
                                Click a button above to generate learning artifacts from your
                                sources.
                            </p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
