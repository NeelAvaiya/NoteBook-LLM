"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workspaceApi, type Workspace } from "@/lib/api";

export function useWorkspaces() {
    return useQuery({
        queryKey: ["workspaces"],
        queryFn: () => workspaceApi.list(),
    });
}

export function useWorkspace(id: string) {
    return useQuery({
        queryKey: ["workspaces", id],
        queryFn: () => workspaceApi.get(id),
        enabled: !!id,
    });
}

export function useCreateWorkspace() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: {
            title: string;
            description?: string;
            icon?: string;
            defaultModel?: string;
        }) => workspaceApi.create(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["workspaces"] });
        },
    });
}

export function useUpdateWorkspace() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            ...data
        }: {
            id: string;
            title?: string;
            description?: string;
            icon?: string;
            defaultModel?: string;
        }) => workspaceApi.update(id, data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ["workspaces"] });
            qc.invalidateQueries({ queryKey: ["workspaces", variables.id] });
        },
    });
}

export function useDeleteWorkspace() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => workspaceApi.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["workspaces"] });
        },
    });
}
