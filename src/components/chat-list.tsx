"use client";

import { cn } from "@/utils";
import Link from "next/link";
import React from "react";
import Icons from "./global/icons";
import SidebarList from "./sidebar-list";
import { Button, buttonVariants } from "./ui/button";
import { Chat } from "@/actions/chat";
import { useSearch } from "@/hooks";

const ChatList = ({ chats }: { chats: Chat[] }) => {

    const { isOpen, setIsOpen } = useSearch();

    return (
        <div className="h-full w-full flex flex-col lg:pt-14">
            <div className="my-2 lg:px-2">
                <Link
                    href="/"
                    className={cn(
                        buttonVariants({ size: "default", variant: 'ghost' }),
                        "w-full gap-x-2 justify-start px-2.5 text-foreground/80 hover:bg-neutral-200/40 font-normal"
                    )}
                >
                    <Icons.edit className="size-4" />
                    New chat
                </Link>
                <Button
                    variant="ghost"
                    onClick={() => setIsOpen(true)}
                    className="w-full gap-x-1.5 justify-start px-2.5 text-foreground/80 hover:bg-neutral-200/40 font-normal"
                >
                    <Icons.search className="size-[15px]" />
                    Search chats
                </Button>
            </div>
            <div className="flex items-center p-2 mt-2">
                <h4 className="text-sm text-muted-foreground capitalize md:pl-2.5">
                    Chats
                </h4>
            </div>
            <React.Suspense
                fallback={
                    <div className="flex flex-col flex-1 px-2 space-y-4 overflow-auto">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-full h-5 rounded-md shrink-0 animate-pulse bg-muted"
                            />
                        ))}
                    </div>
                }
            >
                <SidebarList chats={chats} />
            </React.Suspense>
        </div>
    )
};

export default ChatList
