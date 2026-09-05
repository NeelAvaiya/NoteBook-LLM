"use client";

import { useState } from "react";
import { useSources, useDeleteSource } from "@/hooks/use-sources";
import { AddSourceDialog } from "./add-source-dialog";
import {
    Plus,
    FileText,
    Globe,
    CirclePlay,
    Type,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Clock,
    Trash2,
    ChevronRight,
    FileStack,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Source } from "@/lib/api";

const SOURCE_ICONS: Record<Source["type"], typeof FileText> = {
    PDF: FileText,
    WEBSITE: Globe,
    YOUTUBE: CirclePlay,
    TEXT: Type,
    MARKDOWN: FileText,
};

const SOURCE_COLORS: Record<Source["type"], string> = {
    PDF: "text-red-400",
    WEBSITE: "text-blue-400",
    YOUTUBE: "text-red-500",
    TEXT: "text-amber-400",
    MARKDOWN: "text-purple-400",
};

const STATUS_CONFIG: Record<
    Source["status"],
    { icon: typeof CheckCircle2; className: string; label: string }
> = {
    PENDING: {
        icon: Clock,
        className: "text-amber-400",
        label: "Pending",
    },
    PROCESSING: {
        icon: Loader2,
        className: "text-blue-400 animate-spin",
        label: "Processing",
    },
    READY: {
        icon: CheckCircle2,
        className: "text-emerald-400",
        label: "Ready",
    },
    FAILED: {
        icon: AlertCircle,
        className: "text-red-400",
        label: "Failed",
    },
};

interface SourcesPanelProps {
    workspaceId: string;
    selectedSourceIds: string[];
    onToggleSource: (id: string) => void;
}

export function SourcesPanel({
    workspaceId,
    selectedSourceIds,
    onToggleSource,
}: SourcesPanelProps) {
    const { data: sources, isLoading } = useSources(workspaceId);
    const deleteSource = useDeleteSource(workspaceId);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const readySources = sources?.filter((s) => s.status === "READY") ?? [];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
                <div className="flex items-center gap-2">
                    <FileStack className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-sm font-heading font-semibold">Sources</h2>
                    {sources && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                            {sources.length}
                        </Badge>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setDialogOpen(true)}
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            {/* Source list */}
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {isLoading ? (
                        [...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="h-12 rounded-lg bg-muted/50 animate-pulse"
                            />
                        ))
                    ) : !sources?.length ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                                <FileText className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium mb-1">No sources yet</p>
                            <p className="text-xs text-muted-foreground mb-4">
                                Add PDFs, websites, or videos
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-xs rounded-lg"
                                onClick={() => setDialogOpen(true)}
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Source
                            </Button>
                        </div>
                    ) : (
                        sources.map((source) => {
                            const Icon = SOURCE_ICONS[source.type];
                            const iconColor = SOURCE_COLORS[source.type];
                            const status = STATUS_CONFIG[source.status];
                            const StatusIcon = status.icon;
                            const isSelected = selectedSourceIds.includes(source.id);
                            const isExpanded = expandedId === source.id;

                            return (
                                <div key={source.id}>
                                    <div
                                        className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                                            isSelected
                                                ? "bg-primary/10 border border-primary/20"
                                                : "hover:bg-muted/50 border border-transparent"
                                        }`}
                                        onClick={() => {
                                            if (source.status === "READY") {
                                                onToggleSource(source.id);
                                            }
                                        }}
                                    >
                                        {/* Select checkbox area */}
                                        <div
                                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                                isSelected
                                                    ? "bg-primary border-primary"
                                                    : "border-border group-hover:border-muted-foreground"
                                            }`}
                                        >
                                            {isSelected && (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
                                            )}
                                        </div>

                                        <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />

                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">
                                                {source.title}
                                            </p>
                                        </div>

                                        <StatusIcon
                                            className={`w-3.5 h-3.5 shrink-0 ${status.className}`}
                                        />

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedId(isExpanded ? null : source.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronRight
                                                className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${
                                                    isExpanded ? "rotate-90" : ""
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Expanded detail */}
                                    {isExpanded && (
                                        <div className="ml-8 mt-1 mb-2 px-3 py-2 rounded-lg bg-muted/30 text-xs space-y-2 animate-slide-down">
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">
                                                    Type: {source.type}
                                                </span>
                                                <Badge
                                                    variant={
                                                        source.status === "READY"
                                                            ? "default"
                                                            : source.status === "FAILED"
                                                              ? "destructive"
                                                              : "secondary"
                                                    }
                                                    className="text-[10px] h-4"
                                                >
                                                    {status.label}
                                                </Badge>
                                            </div>
                                            {source.url && (
                                                <p className="text-muted-foreground truncate">
                                                    URL: {source.url}
                                                </p>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-destructive hover:text-destructive text-[11px] p-0"
                                                onClick={() =>
                                                    deleteSource.mutate(source.id)
                                                }
                                            >
                                                <Trash2 className="w-3 h-3 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>

            {/* Footer */}
            {readySources.length > 0 && (
                <div className="px-4 py-2.5 border-t border-border/50 shrink-0">
                    <p className="text-[10px] text-muted-foreground text-center">
                        {selectedSourceIds.length} of {readySources.length} sources
                        selected for artifacts
                    </p>
                </div>
            )}

            <AddSourceDialog
                workspaceId={workspaceId}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    );
}
