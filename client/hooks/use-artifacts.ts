"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { artifactApi, type LearningArtifact } from "@/lib/api";

export function useArtifacts(workspaceId: string) {
    return useQuery({
        queryKey: ["artifacts", workspaceId],
        queryFn: () => artifactApi.list(workspaceId),
        enabled: !!workspaceId,
        refetchInterval: (query) => {
            const data = query.state.data as LearningArtifact[] | undefined;
            const hasPending = data?.some(
                (a) => a.status === "PENDING" || a.status === "PROCESSING",
            );
            return hasPending ? 3000 : false;
        },
    });
}

export function useArtifact(workspaceId: string, artifactId: string) {
    return useQuery({
        queryKey: ["artifacts", workspaceId, artifactId],
        queryFn: () => artifactApi.get(workspaceId, artifactId),
        enabled: !!workspaceId && !!artifactId,
    });
}

export function useCreateArtifact(workspaceId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: {
            type: string;
            title?: string;
            sourceIds?: string[];
        }) => artifactApi.create(workspaceId, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["artifacts", workspaceId] });
        },
    });
}

export function useDeleteArtifact(workspaceId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (artifactId: string) =>
            artifactApi.delete(workspaceId, artifactId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["artifacts", workspaceId] });
        },
    });
}
