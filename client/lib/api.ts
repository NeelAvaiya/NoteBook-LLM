const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.message || `Request failed: ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
}

/* ---------- Types ---------- */

export interface Workspace {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    icon: string | null;
    defaultModel: string;
    createdAt: string;
    updatedAt: string;
    _count?: { sources: number; conversations: number; artifacts: number };
}

export interface Source {
    id: string;
    workspaceId: string;
    type: "PDF" | "WEBSITE" | "YOUTUBE" | "TEXT" | "MARKDOWN";
    title: string;
    content: string | null;
    url: string | null;
    status: "PENDING" | "PROCESSING" | "READY" | "FAILED";
    metadata: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
}

export interface Conversation {
    id: string;
    workspaceId: string;
    title: string | null;
    summary: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    id: string;
    conversationId: string;
    role: "USER" | "ASSISTANT";
    content: string;
    citations: Citation[] | null;
    createdAt: string;
}

export interface Citation {
    sourceId?: string;
    sourceTitle: string;
    sourceType: string;
    chunkId?: string;
    chunkIndex?: number;
    page?: number;
    excerpt: string;
    score?: number;
    url?: string;
}

export interface LearningArtifact {
    id: string;
    workspaceId: string;
    type: "SUMMARY" | "TAKEAWAYS" | "FLASHCARDS" | "QUIZ" | "MINDMAP" | "REPORT";
    title: string;
    content: Record<string, unknown> | null;
    sourceIds: string[];
    status: "PENDING" | "PROCESSING" | "READY" | "FAILED";
    metadata: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
}

/* ---------- Workspace API ---------- */

export const workspaceApi = {
    list: () => fetchApi<Workspace[]>("/api/workspaces"),

    get: (id: string) => fetchApi<Workspace>(`/api/workspaces/${id}`),

    create: (data: {
        title: string;
        description?: string;
        icon?: string;
        defaultModel?: string;
    }) =>
        fetchApi<Workspace>("/api/workspaces", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    update: (
        id: string,
        data: Partial<{
            title: string;
            description: string;
            icon: string;
            defaultModel: string;
        }>,
    ) =>
        fetchApi<Workspace>(`/api/workspaces/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        fetchApi<void>(`/api/workspaces/${id}`, { method: "DELETE" }),
};

/* ---------- Source API ---------- */

export const sourceApi = {
    list: (
        workspaceId: string,
        params?: { q?: string; type?: string; status?: string },
    ) => {
        const query = new URLSearchParams();
        if (params?.q) query.set("q", params.q);
        if (params?.type) query.set("type", params.type);
        if (params?.status) query.set("status", params.status);
        const qs = query.toString();
        return fetchApi<Source[]>(
            `/api/workspaces/${workspaceId}/sources${qs ? `?${qs}` : ""}`,
        );
    },

    get: (workspaceId: string, sourceId: string) =>
        fetchApi<Source>(
            `/api/workspaces/${workspaceId}/sources/${sourceId}`,
        ),

    create: (
        workspaceId: string,
        data: { type: "TEXT" | "MARKDOWN"; title: string; content: string },
    ) =>
        fetchApi<Source>(`/api/workspaces/${workspaceId}/sources`, {
            method: "POST",
            body: JSON.stringify(data),
        }),

    uploadPdf: async (workspaceId: string, file: File, title?: string) => {
        const formData = new FormData();
        formData.append("pdf", file);
        if (title) formData.append("title", title);
        const res = await fetch(
            `${API_URL}/api/workspaces/${workspaceId}/sources/upload`,
            {
                method: "POST",
                credentials: "include",
                body: formData,
            },
        );
        if (!res.ok) throw new Error("Upload failed");
        return res.json() as Promise<Source>;
    },

    importWebsite: (
        workspaceId: string,
        data: { url: string; title?: string },
    ) =>
        fetchApi<Source>(
            `/api/workspaces/${workspaceId}/sources/import/website`,
            { method: "POST", body: JSON.stringify(data) },
        ),

    importYoutube: (
        workspaceId: string,
        data: { url: string; title?: string },
    ) =>
        fetchApi<Source>(
            `/api/workspaces/${workspaceId}/sources/import/youtube`,
            { method: "POST", body: JSON.stringify(data) },
        ),

    delete: (workspaceId: string, sourceId: string) =>
        fetchApi<void>(
            `/api/workspaces/${workspaceId}/sources/${sourceId}`,
            { method: "DELETE" },
        ),

    bulkDelete: (workspaceId: string, sourceIds: string[]) =>
        fetchApi<void>(
            `/api/workspaces/${workspaceId}/sources/bulk-delete`,
            { method: "POST", body: JSON.stringify({ sourceIds }) },
        ),
};

/* ---------- Conversation API ---------- */

export const conversationApi = {
    list: (workspaceId: string) =>
        fetchApi<Conversation[]>(
            `/api/workspaces/${workspaceId}/conversations`,
        ),

    getMessages: (workspaceId: string, conversationId: string) =>
        fetchApi<Message[]>(
            `/api/workspaces/${workspaceId}/conversations/${conversationId}/messages`,
        ),

    create: (workspaceId: string, title?: string) =>
        fetchApi<Conversation>(
            `/api/workspaces/${workspaceId}/conversations`,
            { method: "POST", body: JSON.stringify({ title }) },
        ),

    delete: (workspaceId: string, conversationId: string) =>
        fetchApi<void>(
            `/api/workspaces/${workspaceId}/conversations/${conversationId}`,
            { method: "DELETE" },
        ),
};

/* ---------- Artifact API ---------- */

export const artifactApi = {
    list: (workspaceId: string) =>
        fetchApi<LearningArtifact[]>(
            `/api/workspaces/${workspaceId}/artifacts`,
        ),

    get: (workspaceId: string, artifactId: string) =>
        fetchApi<LearningArtifact>(
            `/api/workspaces/${workspaceId}/artifacts/${artifactId}`,
        ),

    create: (
        workspaceId: string,
        data: { type: string; title?: string; sourceIds?: string[] },
    ) =>
        fetchApi<LearningArtifact>(
            `/api/workspaces/${workspaceId}/artifacts`,
            { method: "POST", body: JSON.stringify(data) },
        ),

    delete: (workspaceId: string, artifactId: string) =>
        fetchApi<void>(
            `/api/workspaces/${workspaceId}/artifacts/${artifactId}`,
            { method: "DELETE" },
        ),
};

export { API_URL };
