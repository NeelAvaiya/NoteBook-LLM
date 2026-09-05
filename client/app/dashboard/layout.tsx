"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BookOpen, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { data: session, isPending } = useSession();

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

    const user = session.user;
    const initials = (user.name || user.email || "U")
        .split(" ")
        .map((s: string) => s[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Top Nav */}
            <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-base font-heading font-bold tracking-tight">
                            NoteBook LLM
                        </span>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-9 w-9 rounded-full"
                            >
                                <Avatar className="h-9 w-9">
                                    <AvatarImage
                                        src={user.image || undefined}
                                        alt={user.name || "User"}
                                    />
                                    <AvatarFallback className="bg-muted text-xs font-semibold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="px-3 py-2 border-b border-border/50">
                                <p className="text-sm font-medium truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user.email}
                                </p>
                            </div>
                            <DropdownMenuItem
                                onClick={() =>
                                    signOut({ fetchOptions: { onSuccess: () => router.replace("/") } })
                                }
                                className="text-destructive focus:text-destructive cursor-pointer"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-1">{children}</main>
        </div>
    );
}
