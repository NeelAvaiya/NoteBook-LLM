"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useConversationMessages } from "@/hooks/use-conversations";
import { useQueryClient } from "@tanstack/react-query";
import { ConversationSidebar } from "./conversation-sidebar";
import { API_URL } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    Send,
    History,
    Globe,
    Sparkles,
    Bot,
    User,
    Loader2,
    MessageSquare,
    BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

/** Extract text content from AI SDK v7 UIMessage parts */
function getTextFromMessage(message: UIMessage): string {
    if (!message.parts) return "";
    return message.parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("");
}

interface ChatPanelProps {
    workspaceId: string;
}

export function ChatPanel({ workspaceId }: ChatPanelProps) {
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [webSearch, setWebSearch] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const qc = useQueryClient();

    // Load history when selecting a conversation
    const { data: historyMessages } = useConversationMessages(
        workspaceId,
        conversationId,
    );

    const {
        messages,
        sendMessage,
        status,
        setMessages,
        error,
    } = useChat({
        transport: new DefaultChatTransport({
            api: `${API_URL}/api/workspaces/${workspaceId}/chat`,
            credentials: "include",
            body: () => ({
                conversationId: conversationId || undefined,
                webSearch,
            }),
            fetch: async (input, init) => {
                const res = await fetch(input, init);
                const serverConvId = res.headers.get("x-conversation-id");
                if (serverConvId && !conversationId) {
                    setConversationId(serverConvId);
                }
                return res;
            },
        }),
    });

    const isLoading = status === "streaming" || status === "submitted";

    // Load conversation history into chat
    useEffect(() => {
        if (historyMessages && conversationId) {
            const mapped: UIMessage[] = historyMessages.map((m) => ({
                id: m.id,
                role: m.role.toLowerCase() as "user" | "assistant",
                parts: [{ type: "text" as const, text: m.content }],
                createdAt: new Date(m.createdAt),
            }));
            setMessages(mapped);
        }
    }, [historyMessages, conversationId, setMessages]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // New chat
    const handleNewChat = useCallback(() => {
        setConversationId(null);
        setMessages([]);
        setInputValue("");
        textareaRef.current?.focus();
    }, [setMessages]);

    const handleSelectConversation = useCallback(
        (id: string | null) => {
            if (id === null) {
                handleNewChat();
            } else {
                setConversationId(id);
            }
        },
        [handleNewChat],
    );

    // Send message
    const handleSend = useCallback(() => {
        const text = inputValue.trim();
        if (!text || isLoading) return;
        setInputValue("");
        sendMessage({ text });
        // Invalidate conversations after a short delay to pick up new conversation
        setTimeout(() => {
            qc.invalidateQueries({ queryKey: ["conversations", workspaceId] });
        }, 2000);
    }, [inputValue, isLoading, sendMessage, qc, workspaceId]);

    // Submit on Enter (not Shift+Enter)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex h-full">
            {/* Conversation sidebar */}
            <ConversationSidebar
                workspaceId={workspaceId}
                conversationId={conversationId}
                onSelect={handleSelectConversation}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main chat area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Chat header */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50 shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 ${sidebarOpen ? "text-primary" : ""}`}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        title="Chat history"
                    >
                        <History className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-heading font-semibold">Chat</span>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <Button
                            variant={webSearch ? "default" : "outline"}
                            size="sm"
                            className="h-7 text-xs gap-1 rounded-full px-3"
                            onClick={() => setWebSearch(!webSearch)}
                            title={webSearch ? "Web search enabled" : "Enable web search"}
                        >
                            <Globe className="w-3 h-3" />
                            Web
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={handleNewChat}
                        >
                            <Sparkles className="w-3 h-3" />
                            New
                        </Button>
                    </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1" ref={scrollRef}>
                    <div className="max-w-3xl mx-auto px-4 py-6">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mb-5">
                                    <BookOpen className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-heading font-semibold mb-2">
                                    Start a conversation
                                </h3>
                                <p className="text-sm text-muted-foreground max-w-sm">
                                    Ask questions about your sources. The AI will use your uploaded
                                    content to provide grounded, cited answers.
                                </p>

                                <div className="flex flex-wrap gap-2 mt-6 justify-center">
                                    {[
                                        "Summarize the key points",
                                        "What are the main findings?",
                                        "Explain the methodology",
                                        "Compare the perspectives",
                                    ].map((prompt) => (
                                        <button
                                            key={prompt}
                                            className="px-3 py-1.5 rounded-full border border-border/50 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors cursor-pointer"
                                            onClick={() => {
                                                setInputValue(prompt);
                                                setTimeout(() => textareaRef.current?.focus(), 50);
                                            }}
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {messages.map((message) => {
                                    const text = getTextFromMessage(message);
                                    if (!text) return null;

                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex gap-3 ${
                                                message.role === "user"
                                                    ? "justify-end"
                                                    : "justify-start"
                                            }`}
                                        >
                                            {message.role === "assistant" && (
                                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Bot className="w-4 h-4 text-emerald-400" />
                                                </div>
                                            )}

                                            <div
                                                className={`max-w-[85%] ${
                                                    message.role === "user"
                                                        ? "bg-primary/15 border border-primary/20 rounded-2xl rounded-br-md px-4 py-2.5"
                                                        : "flex-1 min-w-0"
                                                }`}
                                            >
                                                {message.role === "user" ? (
                                                    <p className="text-sm whitespace-pre-wrap">
                                                        {text}
                                                    </p>
                                                ) : (
                                                    <div className="chat-message-content text-sm leading-relaxed">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {text}
                                                        </ReactMarkdown>
                                                    </div>
                                                )}
                                            </div>

                                            {message.role === "user" && (
                                                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                                                    <User className="w-4 h-4 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {isLoading &&
                                    messages[messages.length - 1]?.role === "user" && (
                                        <div className="flex gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center shrink-0">
                                                <Bot className="w-4 h-4 text-emerald-400" />
                                            </div>
                                            <div className="flex items-center gap-1.5 py-2">
                                                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                                                <div
                                                    className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
                                                    style={{ animationDelay: "0.15s" }}
                                                />
                                                <div
                                                    className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
                                                    style={{ animationDelay: "0.3s" }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                {error && (
                                    <div className="flex justify-center">
                                        <Badge variant="destructive" className="text-xs">
                                            Error: {error.message}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input */}
                <div className="px-4 pb-4 pt-2 shrink-0">
                    <div className="relative max-w-3xl mx-auto">
                        <div className="relative rounded-2xl border border-border/50 bg-muted/30 focus-within:border-primary/40 focus-within:bg-muted/50 transition-all">
                            <Textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about your sources..."
                                className="min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent pr-14 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 rounded-2xl"
                                rows={1}
                            />
                            <Button
                                type="button"
                                size="sm"
                                disabled={!inputValue.trim() || isLoading}
                                className="absolute bottom-2 right-2 h-8 w-8 p-0 rounded-xl"
                                onClick={handleSend}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center mt-2">
                            AI responses are grounded in your uploaded sources
                            {webSearch && " + web search"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
