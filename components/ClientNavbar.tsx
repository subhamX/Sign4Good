'use client'
import { jwtUserPayloadType } from "@/app/utils/setAuthTokenAsCookie"
import { Menu, LogOut, Trophy, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { LoginButton, LogoutButton } from "./ClientNavbarButtons";
import { NGOSelector } from "./NGOSelector";
import { Button } from "./ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DASH_ACCOUNT_ROUTE } from "@/routes.config";
import { useState, useEffect } from "react";

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
    const [loading, setLoading] = useState(false);

    const ngoDashLink = currentNGO ? DASH_ACCOUNT_ROUTE(currentNGO.id) : null;

    const handleButtonClick = () => {
        setLoading(true);
    };

    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => setLoading(false), 2500);
            return () => clearTimeout(timer); 
        }
    }, [loading]);

    return (
        <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 md:h-16 items-center justify-between px-4">
                <Link href="/" className="flex flex-col">
                    <span className="text-lg font-bold tracking-tight">SignForGood</span>
                    <span className="text-xs text-muted-foreground">NGO Transparency</span>
                </Link>

                <div className="flex items-center gap-2">
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-2">
                        {user && (
                            <>
                                <Link href="/leaderboard">
                                    <Button
                                        variant={currentpath === "/leaderboard" ? "secondary" : "ghost"}
                                        size="sm"
                                        className="text-sm"
                                        onClick={handleButtonClick} 
                                    >
                                        Leaderboard
                                    </Button>
                                </Link>
                            </>
                        )}

                        {user && connectedNGOs.length > 0 && (
                            <NGOSelector ngos={connectedNGOs} currentNGO={currentNGO} />
                        )}

                        {!user ? <LoginButton /> : (
                            <div className="flex items-center gap-2">
                                <LogoutButton />
                                {loading && (
                                    <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    <div className="md:hidden flex items-center gap-2">
                        {/* Select NGO Button */}
                        {user && connectedNGOs.length > 0 && (
                            <div className="flex items-center">
                                <NGOSelector ngos={connectedNGOs} currentNGO={currentNGO} />
                            </div>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                {user && (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/leaderboard"
                                                className={cn(
                                                    "flex items-center w-full gap-2",
                                                    currentpath === "/leaderboard" && "bg-accent font-medium"
                                                )}
                                                onClick={handleButtonClick}
                                            >
                                                <Trophy className="h-4 w-4" /> Leaderboard
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/ngo"
                                                className={cn(
                                                    "flex items-center w-full gap-2",
                                                    currentpath === "/ngo" && "bg-accent font-medium"
                                                )}
                                                onClick={handleButtonClick}
                                            >
                                                📊 All NGOs
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/onboarding"
                                                className={cn(
                                                    "flex items-center w-full gap-2",
                                                    currentpath === "/onboarding" && "bg-accent font-medium"
                                                )}
                                                onClick={handleButtonClick}
                                            >
                                                <Plus className="h-4 w-4" /> Add NGO
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem className="flex items-center w-full gap-2">
                                            <LogoutButton />
                                            {loading && (
                                                <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                            )}
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {!user && (
                                    <DropdownMenuItem>
                                        <LoginButton />
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </nav>
    )
}