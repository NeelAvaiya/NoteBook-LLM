"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { SourcesPanel } from "@/components/workspace/sources-panel";
import { ChatPanel } from "@/components/workspace/chat-panel";
import { ArtifactsPanel } from "@/components/workspace/artifacts-panel";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function WorkspacePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: workspaceId } = use(params);
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);

    useEffect(() => {
        if (!isPending && !session?.user) {
            router.replace("/");
        }
    }, [session, isPending, router]);

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!session?.user) return null;

    const handleToggleSource = (sourceId: string) => {
        setSelectedSourceIds((prev) =>
            prev.includes(sourceId)
                ? prev.filter((id) => id !== sourceId)
                : [...prev, sourceId],
        );
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <WorkspaceHeader workspaceId={workspaceId} />

            <ResizablePanelGroup direction="horizontal" className="flex-1">
                {/* Sources Panel */}
                <ResizablePanel
                    defaultSize={22}
                    minSize={16}
                    maxSize={35}
                    className="border-r border-border/50"
                >
                    <SourcesPanel
                        workspaceId={workspaceId}
                        selectedSourceIds={selectedSourceIds}
                        onToggleSource={handleToggleSource}
                    />
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Chat Panel */}
                <ResizablePanel defaultSize={53} minSize={30}>
                    <ChatPanel workspaceId={workspaceId} />
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Artifacts Panel */}
                <ResizablePanel
                    defaultSize={25}
                    minSize={18}
                    maxSize={40}
                    className="border-l border-border/50"
                >
                    <ArtifactsPanel
                        workspaceId={workspaceId}
                        selectedSourceIds={selectedSourceIds}
                    />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
