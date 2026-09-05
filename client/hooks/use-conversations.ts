"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { conversationApi } from "@/lib/api";

export function useConversations(workspaceId: string) {
    return useQuery({
        queryKey: ["conversations", workspaceId],
        queryFn: () => conversationApi.list(workspaceId),
        enabled: !!workspaceId,
    });
}

export function useConversationMessages(
    workspaceId: string,
    conversationId: string | null,
) {
    return useQuery({
        queryKey: ["messages", workspaceId, conversationId],
        queryFn: () =>
            conversationApi.getMessages(workspaceId, conversationId!),
        enabled: !!workspaceId && !!conversationId,
    });
}

export function useDeleteConversation(workspaceId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (conversationId: string) =>
            conversationApi.delete(workspaceId, conversationId),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: ["conversations", workspaceId],
            });
        },
    });
}
