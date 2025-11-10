"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/utils";
import Icons from "./global/icons";
import UserAccount from "./user-account";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { useSidebar } from "@/hooks";

interface Props {
    user: User
}

const DesktopHeader = ({ user }: Props) => {

    const router = useRouter();

    const pathname = usePathname();

    const { isOpen: isOpenSidebar, setIsOpen: setIsOpenSidebar } = useSidebar();

    useEffect(() => {

    }, [pathname]);

    return (
        <header className="fixed inset-x-0 top-0 z-50 w-full px-3 h-14 hidden lg:block">
            <div className="flex items-center justify-between w-full h-full mx-auto">
                <div className="flex items-center gap-x-2 text-muted-foreground">
                    <Link href="/" className="mr-2 text-foreground">
                        <Icons.icon className="size-5" />
                    </Link>
                    {user && (
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className={cn(
                                            "transition transform duration-300",
                                        )}
                                        onClick={() => setIsOpenSidebar(!isOpenSidebar)}
                                    >
                                        <Icons.panel className="size-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Sidebar
                                </TooltipContent>
                            </Tooltip>
                            {/* <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => router.push("/")}
                                        className={cn(
                                            "transition transform duration-300",
                                            // TODO: make a array of protected routes in constants to show auth
                                            // isOpenSidebar ? "translate-x-[152px]" : "translate-x-0"
                                        )}
                                    >
                                        <Icons.create className="size-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    New chat
                                </TooltipContent>
                            </Tooltip> */}
                        </TooltipProvider>
                    )}
                </div>
                <React.Suspense fallback={<div>
                    wait a moment
                </div>}>
                    <div className="flex items-center gap-x-4 text-muted-foreground">
                        {user ? (
                            <>
                                <UserAccount user={user} />
                            </>
                        ) : (
                            <>
                                <Link href="/signin" className={buttonVariants({ size: "sm", variant: "outline" })}>
                                    Log in
                                </Link>
                                <Link href="/signin" className={buttonVariants({ size: "sm", })}>
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </React.Suspense>
            </div>
        </header>
    )
};

export default DesktopHeader
