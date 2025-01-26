'use client'
import { jwtUserPayloadType } from "@/app/utils/setAuthTokenAsCookie"
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { LoginButton, LogoutButton } from "./ClientNavbarButtons";
import { NGOSelector } from "./NGOSelector";
import { Button } from "./ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const ClientNavbar = ({
    user,
    connectedNGOs,
}: {
    user: jwtUserPayloadType | null,
    connectedNGOs: {
        id: string;
        name: string;
    }[],
}) => {
    const currentpath = usePathname();
    const currentNGO = connectedNGOs.find(ngo => ngo.id === currentpath.split('/')[2]) || null;

    console.log(currentNGO)

    return (
        <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 md:h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex flex-col">
                        <span className="text-lg font-bold tracking-tight">SignForGood</span>
                        <span className="text-xs text-muted-foreground">NGO Transparency</span>
                    </Link>
                </div>

                {/* NGO Selector is always visible if available */}
                <div className="flex items-center gap-2">
                    {user && connectedNGOs.length > 0 && (
                        <NGOSelector ngos={connectedNGOs} currentNGO={currentNGO} />
                    )}

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                {user && (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link href="/leaderboard" className={cn(
                                                "flex items-center w-full",
                                                currentpath === "/leaderboard" && "bg-accent font-medium"
                                            )}>
                                                🏆 Leaderboard
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/onboarding" className={cn(
                                                "flex items-center w-full",
                                                currentpath === "/onboarding" && "bg-accent font-medium"
                                            )}>
                                                + Add NGO
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                {!user ? (
                                    <DropdownMenuItem>
                                        <LoginButton />
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem>
                                        <LogoutButton />
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-2">
                        {user && (
                            <>
                                <Link href="/leaderboard">
                                    <Button 
                                        variant={currentpath === "/leaderboard" ? "secondary" : "ghost"} 
                                        size="sm" 
                                        className={cn(
                                            "text-sm",
                                            currentpath === "/leaderboard" && "font-medium"
                                        )}
                                    >
                                        🏆 Leaderboard
                                    </Button>
                                </Link>
                                <Link href="/onboarding">
                                    <Button 
                                        variant={currentpath === "/onboarding" ? "secondary" : "ghost"} 
                                        size="sm" 
                                        className={cn(
                                            "text-sm whitespace-nowrap",
                                            currentpath === "/onboarding" && "font-medium"
                                        )}
                                    >
                                        + Add NGO
                                    </Button>
                                </Link>
                            </>
                        )}
                        {!user ? <LoginButton /> : <LogoutButton />}
                    </div>
                </div>
            </div>
        </nav>
    )
}