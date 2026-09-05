"use client";

import { useState, useRef, useCallback } from "react";
import {
    useUploadPdf,
    useImportWebsite,
    useImportYoutube,
    useCreateSource,
} from "@/hooks/use-sources";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    FileText,
    Globe,
    CirclePlay,
    Upload,
    Loader2,
    Type,
    CheckCircle2,
} from "lucide-react";

interface AddSourceDialogProps {
    workspaceId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddSourceDialog({
    workspaceId,
    open,
    onOpenChange,
}: AddSourceDialogProps) {
    const uploadPdf = useUploadPdf(workspaceId);
    const importWebsite = useImportWebsite(workspaceId);
    const importYoutube = useImportYoutube(workspaceId);
    const createSource = useCreateSource(workspaceId);

    const [tab, setTab] = useState("pdf");
    const [url, setUrl] = useState("");
    const [title, setTitle] = useState("");
    const [textContent, setTextContent] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const isPending =
        uploadPdf.isPending ||
        importWebsite.isPending ||
        importYoutube.isPending ||
        createSource.isPending;

    const reset = useCallback(() => {
        setUrl("");
        setTitle("");
        setTextContent("");
        setSelectedFile(null);
        setDragOver(false);
    }, []);

    const handleClose = useCallback(
        (v: boolean) => {
            if (!v) reset();
            onOpenChange(v);
        },
        [onOpenChange, reset],
    );

    const handleUpload = async () => {
        if (!selectedFile) return;
        await uploadPdf.mutateAsync({
            file: selectedFile,
            title: title.trim() || undefined,
        });
        handleClose(false);
    };

    const handleImportWebsite = async () => {
        if (!url.trim()) return;
        await importWebsite.mutateAsync({
            url: url.trim(),
            title: title.trim() || undefined,
        });
        handleClose(false);
    };

    const handleImportYoutube = async () => {
        if (!url.trim()) return;
        await importYoutube.mutateAsync({
            url: url.trim(),
            title: title.trim() || undefined,
        });
        handleClose(false);
    };

    const handleCreateText = async () => {
        if (!title.trim() || !textContent.trim()) return;
        await createSource.mutateAsync({
            type: "TEXT",
            title: title.trim(),
            content: textContent.trim(),
        });
        handleClose(false);
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file?.type === "application/pdf") {
            setSelectedFile(file);
        }
    }, []);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-heading">
                        Add Source
                    </DialogTitle>
                    <DialogDescription>
                        Upload a PDF, import a website or YouTube video, or paste
                        text.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={tab} onValueChange={setTab} className="mt-2">
                    <TabsList className="w-full">
                        <TabsTrigger value="pdf" className="flex-1 gap-1.5 text-xs">
                            <FileText className="w-3.5 h-3.5" />
                            PDF
                        </TabsTrigger>
                        <TabsTrigger value="website" className="flex-1 gap-1.5 text-xs">
                            <Globe className="w-3.5 h-3.5" />
                            Website
                        </TabsTrigger>
                        <TabsTrigger value="youtube" className="flex-1 gap-1.5 text-xs">
                            <CirclePlay className="w-3.5 h-3.5" />
                            YouTube
                        </TabsTrigger>
                        <TabsTrigger value="text" className="flex-1 gap-1.5 text-xs">
                            <Type className="w-3.5 h-3.5" />
                            Text
                        </TabsTrigger>
                    </TabsList>

                    {/* PDF Upload */}
                    <TabsContent value="pdf" className="space-y-4 mt-4">
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragOver(true);
                            }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={onDrop}
                            onClick={() => fileRef.current?.click()}
                            className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                                dragOver
                                    ? "border-primary bg-primary/5"
                                    : selectedFile
                                      ? "border-primary/30 bg-primary/5"
                                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                            }`}
                        >
                            {selectedFile ? (
                                <>
                                    <CheckCircle2 className="w-8 h-8 text-primary" />
                                    <p className="text-sm font-medium truncate max-w-full">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {(selectedFile.size / 1024 / 1024).toFixed(1)} MB — Click to change
                                    </p>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        Drag & drop a PDF or{" "}
                                        <span className="text-primary font-medium">
                                            browse
                                        </span>
                                    </p>
                                </>
                            )}
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setSelectedFile(file);
                                }}
                            />
                        </div>
                        <Input
                            placeholder="Title (optional, auto-detected)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || isPending}
                            className="w-full rounded-xl"
                        >
                            {uploadPdf.isPending && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            Upload PDF
                        </Button>
                    </TabsContent>

                    {/* Website Import */}
                    <TabsContent value="website" className="space-y-4 mt-4">
                        <Input
                            placeholder="https://example.com/article"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            autoFocus
                        />
                        <Input
                            placeholder="Title (optional)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <Button
                            onClick={handleImportWebsite}
                            disabled={!url.trim() || isPending}
                            className="w-full rounded-xl"
                        >
                            {importWebsite.isPending && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            Import Website
                        </Button>
                    </TabsContent>

                    {/* YouTube Import */}
                    <TabsContent value="youtube" className="space-y-4 mt-4">
                        <Input
                            placeholder="https://youtube.com/watch?v=..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            autoFocus
                        />
                        <Input
                            placeholder="Title (optional)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <Button
                            onClick={handleImportYoutube}
                            disabled={!url.trim() || isPending}
                            className="w-full rounded-xl"
                        >
                            {importYoutube.isPending && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            Import YouTube
                        </Button>
                    </TabsContent>

                    {/* Text Paste */}
                    <TabsContent value="text" className="space-y-4 mt-4">
                        <Input
                            placeholder="Source title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                        />
                        <Textarea
                            placeholder="Paste your text content here..."
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            rows={6}
                        />
                        <Button
                            onClick={handleCreateText}
                            disabled={
                                !title.trim() ||
                                !textContent.trim() ||
                                isPending
                            }
                            className="w-full rounded-xl"
                        >
                            {createSource.isPending && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            Add Text Source
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
