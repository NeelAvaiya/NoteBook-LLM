"use client";

import { useRouter } from "next/navigation";
import { useWorkspace, useUpdateWorkspace, useDeleteWorkspace } from "@/hooks/use-workspaces";
import {
    ArrowLeft,
    BookOpen,
    Settings,
    Trash2,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkspaceHeaderProps {
    workspaceId: string;
}

export function WorkspaceHeader({ workspaceId }: WorkspaceHeaderProps) {
    const router = useRouter();
    const { data: workspace, isLoading } = useWorkspace(workspaceId);
    const deleteWorkspace = useDeleteWorkspace();

    const handleDelete = async () => {
        await deleteWorkspace.mutateAsync(workspaceId);
        router.replace("/dashboard");
    };

    return (
        <header className="flex items-center gap-3 px-4 h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl shrink-0">
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => router.push("/dashboard")}
            >
                <ArrowLeft className="w-4 h-4" />
            </Button>

            {isLoading ? (
                <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                </div>
            ) : workspace ? (
                <>
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-base">
                        {workspace.icon || "📚"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-heading font-semibold truncate">
                            {workspace.title}
                        </h1>
                    </div>
                </>
            ) : (
                <span className="text-sm text-muted-foreground">
                    Workspace not found
                </span>
            )}

            <div className="ml-auto flex items-center gap-1">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Settings className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => router.push("/dashboard")}
                            className="cursor-pointer"
                        >
                            <BookOpen className="w-4 h-4 mr-2" />
                            All Workspaces
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleDelete}
                            className="text-destructive focus:text-destructive cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Workspace
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
