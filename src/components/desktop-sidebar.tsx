"use client";

import useSidebar from "@/hooks/use-sidebar";
import { cn } from "@/utils";
import ChatList from "./chat-list";
import { Chat, getUserChats } from "@/actions/chat";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { User } from "@supabase/supabase-js";

interface Props {
    user: User;
    chats: Chat[];
}

const DesktopSidebar = ({ user, chats }: Props) => {

    const { id } = useParams<{ id: string }>();

    const { isOpen, setIsOpen } = useSidebar();

    if (!user) {
        return null;
    }

    return (
        <div
            id="sidebar"
            className={cn(
                "flex-col hidden lg:flex fixed left-0 top-0 bottom-0 z-[99] bg-muted/20 backdrop-blur-lg border-r transition-all duration-300 ease-in-out",
                isOpen ? "w-68 border-border/60" : "w-0 border-r-0 border-transparent",
            )}
        >
            <div
                className={cn(
                    "flex flex-col size-full transition-opacity duration-300 ease-in-out",
                    isOpen
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                )}
                style={{
                    visibility: isOpen ? "visible" : "hidden"
                }}
            >
                <ChatList chats={chats} />
            </div>
        </div>
    )
};

export default DesktopSidebar
