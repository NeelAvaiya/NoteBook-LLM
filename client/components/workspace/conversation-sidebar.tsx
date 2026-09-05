"use client";

import { useConversations, useDeleteConversation } from "@/hooks/use-conversations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
    MessageSquare,
    Plus,
    Trash2,
    X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ConversationSidebarProps {
    workspaceId: string;
    conversationId: string | null;
    onSelect: (id: string | null) => void;
    open: boolean;
    onClose: () => void;
}

export function ConversationSidebar({
    workspaceId,
    conversationId,
    onSelect,
    open,
    onClose,
}: ConversationSidebarProps) {
    const { data: conversations } = useConversations(workspaceId);
    const deleteConversation = useDeleteConversation(workspaceId);

    if (!open) return null;

    return (
        <div className="w-64 border-r border-border/50 flex flex-col bg-muted/20 shrink-0 animate-fade-in">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
                <span className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
                    History
                </span>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => onSelect(null)}
                        title="New Chat"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={onClose}
                    >
                        <X className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-1.5 space-y-0.5">
                    {!conversations?.length ? (
                        <div className="text-center py-8">
                            <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">
                                No conversations yet
                            </p>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all text-xs ${
                                    conversationId === conv.id
                                        ? "bg-primary/10 text-foreground"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                }`}
                                onClick={() => onSelect(conv.id)}
                            >
                                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="truncate font-medium">
                                        {conv.title || "Untitled Chat"}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/60">
                                        {formatDistanceToNow(
                                            new Date(conv.updatedAt),
                                            { addSuffix: true },
                                        )}
                                    </p>
                                </div>
                                <button
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-destructive"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (conversationId === conv.id) {
                                            onSelect(null);
                                        }
                                        deleteConversation.mutate(conv.id);
                                    }}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
