"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaces, useCreateWorkspace, useDeleteWorkspace } from "@/hooks/use-workspaces";
import {
    Plus,
    BookOpen,
    MoreHorizontal,
    Trash2,
    Clock,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

const WORKSPACE_EMOJIS = ["📚", "🧠", "🔬", "📖", "🎓", "💡", "🗂️", "📝", "🌍", "⚡"];

export default function DashboardPage() {
    const router = useRouter();
    const { data: workspaces, isLoading } = useWorkspaces();
    const createWorkspace = useCreateWorkspace();
    const deleteWorkspace = useDeleteWorkspace();

    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState("📚");

    const handleCreate = async () => {
        if (!title.trim()) return;
        const ws = await createWorkspace.mutateAsync({
            title: title.trim(),
            description: description.trim() || undefined,
            icon,
        });
        setOpen(false);
        setTitle("");
        setDescription("");
        setIcon("📚");
        router.push(`/workspace/${ws.id}`);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight">
                        Your Workspaces
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Organize your research into focused workspaces
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 rounded-xl">
                            <Plus className="w-4 h-4" />
                            New Workspace
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="font-heading">
                                Create Workspace
                            </DialogTitle>
                            <DialogDescription>
                                Give your workspace a name and pick an icon.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-2">
                            {/* Icon picker */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Icon
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {WORKSPACE_EMOJIS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setIcon(emoji)}
                                            className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all cursor-pointer ${
                                                icon === emoji
                                                    ? "bg-primary/20 ring-2 ring-primary scale-110"
                                                    : "bg-muted hover:bg-muted/80"
                                            }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Title
                                </label>
                                <Input
                                    placeholder="e.g. Machine Learning Research"
                                    value={title}
                                    onChange={(e) =>
                                        setTitle(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && handleCreate()
                                    }
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Description{" "}
                                    <span className="text-muted-foreground font-normal">
                                        (optional)
                                    </span>
                                </label>
                                <Textarea
                                    placeholder="What is this workspace about?"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    rows={2}
                                />
                            </div>

                            <Button
                                onClick={handleCreate}
                                disabled={!title.trim() || createWorkspace.isPending}
                                className="w-full rounded-xl"
                            >
                                {createWorkspace.isPending && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                Create Workspace
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="h-44 rounded-2xl bg-card border border-border/50 animate-pulse"
                        />
                    ))}
                </div>
            ) : !workspaces?.length ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
                        <BookOpen className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-heading font-semibold mb-2">
                        No workspaces yet
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                        Create your first workspace to start uploading sources
                        and chatting with AI.
                    </p>
                    <Button onClick={() => setOpen(true)} className="gap-2 rounded-xl">
                        <Plus className="w-4 h-4" />
                        Create your first workspace
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                    {workspaces.map((ws) => (
                        <div
                            key={ws.id}
                            onClick={() => router.push(`/workspace/${ws.id}`)}
                            className="group relative rounded-2xl border border-border/50 bg-card p-6 cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                        >
                            {/* Menu */}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={(e) =>
                                                e.stopPropagation()
                                            }
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteWorkspace.mutate(ws.id);
                                            }}
                                            className="text-destructive focus:text-destructive cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Icon */}
                            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                {ws.icon || "📚"}
                            </div>

                            {/* Info */}
                            <h3 className="text-lg font-heading font-semibold truncate mb-1">
                                {ws.title}
                            </h3>
                            {ws.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                    {ws.description}
                                </p>
                            )}

                            {/* Footer */}
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto pt-3 border-t border-border/30">
                                <Clock className="w-3.5 h-3.5" />
                                {formatDistanceToNow(new Date(ws.updatedAt), {
                                    addSuffix: true,
                                })}
                            </div>
                        </div>
                    ))}

                    {/* New workspace card */}
                    <button
                        onClick={() => setOpen(true)}
                        className="rounded-2xl border-2 border-dashed border-border/50 p-6 flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 min-h-[180px] cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                            <Plus className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                            New Workspace
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}
