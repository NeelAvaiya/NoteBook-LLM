"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sourceApi, type Source } from "@/lib/api";

export function useSources(workspaceId: string) {
    return useQuery({
        queryKey: ["sources", workspaceId],
        queryFn: () => sourceApi.list(workspaceId),
        enabled: !!workspaceId,
        refetchInterval: (query) => {
            const data = query.state.data as Source[] | undefined;
            const hasPending = data?.some(
                (s) => s.status === "PENDING" || s.status === "PROCESSING",
            );
            return hasPending ? 3000 : false;
        },
    });
}

export function useSource(workspaceId: string, sourceId: string) {
    return useQuery({
        queryKey: ["sources", workspaceId, sourceId],
        queryFn: () => sourceApi.get(workspaceId, sourceId),
        enabled: !!workspaceId && !!sourceId,
    });
}

export function useCreateSource(workspaceId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: {
            type: "TEXT" | "MARKDOWN";
            title: string;
            content: string;
        }) => sourceApi.create(workspaceId, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["sources", workspaceId] });
        },
    });
}

export function useUploadPdf(workspaceId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ file, title }: { file: File; title?: string }) =>
            sourceApi.uploadPdf(workspaceId, file, title),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["sources", workspaceId] });
        },
    });
}

export function useImportWebsite(workspaceId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { url: string; title?: string }) =>
            sourceApi.importWebsite(workspaceId, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["sources", workspaceId] });
        },
    });
}

export function useImportYoutube(workspaceId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { url: string; title?: string }) =>
            sourceApi.importYoutube(workspaceId, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["sources", workspaceId] });
        },
    });
}

export function useDeleteSource(workspaceId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (sourceId: string) =>
            sourceApi.delete(workspaceId, sourceId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["sources", workspaceId] });
        },
    });
}

export function useBulkDeleteSources(workspaceId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (sourceIds: string[]) =>
            sourceApi.bulkDelete(workspaceId, sourceIds),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["sources", workspaceId] });
        },
    });
}
