
"use client";

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useSearch } from "@/hooks";
import { XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from 'react';
import { Button } from "./ui/button";
import { Chat } from "@/actions/chat";
import Icons from "./global/icons";

const SearchModal = ({ chats }: { chats: Chat[] }) => {

    const router = useRouter();

    const { isOpen, setIsOpen } = useSearch();

    const handleSelect = (href: string) => {
        router.push(`/c/${href}`);
        setIsOpen(false);
    };

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setIsOpen(!isOpen);
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <CommandDialog search open={isOpen} onOpenChange={setIsOpen}>
            <CommandInput
                placeholder="Search for chats..."
                className="h-8"
            />
            <div className="absolute top-2 right-2">
                <Button
                    size="icon"
                    type="button"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="size-8 focus-visible:ring-0"
                >
                    <XIcon className="size-4" />
                </Button>
            </div>
            <CommandList className="pb-1">
                <CommandEmpty>
                    No chats found.
                </CommandEmpty>
                <CommandGroup heading="Chats">
                    {chats.map((chat) => (
                        <CommandItem
                            key={chat.id}
                            onSelect={() => handleSelect(chat.id)}
                            className="cursor-pointer p-0 rounded-md"
                        >
                            <Link href={`/c/${chat.id}`} className="w-full px-3 py-2.5 flex items-center gap-2">
                                <Icons.card className="size-4 text-foreground/80 group-hover:text-foreground" />
                                {chat.title}
                            </Link>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
};

export default SearchModal
