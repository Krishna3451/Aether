"use client";

import { Chat } from "@/actions/chat";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSidebar } from "@/hooks";
import ChatList from "./chat-list";
import Icons from "./global/icons";
import { Button } from "./ui/button";

const MobileSidebar = ({ chats }: { chats: Chat[] }) => {

    const { isOpen, setIsOpen } = useSidebar();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    size="iconlg"
                    variant="ghost"
                    onClick={() => setIsOpen(!isOpen)}
                    className="transition transform z-[999]"
                >
                    <Icons.panel className="size-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" show={false}>
                <SheetHeader className="sr-only">
                    <SheetTitle>
                        Chat history
                    </SheetTitle>
                </SheetHeader>
                <SheetClose asChild>
                    <Button
                        size="iconlg"
                        variant="ghost"
                        onClick={() => setIsOpen(!isOpen)}
                        className="transition transform text-muted-foreground mt-2 ml-3"
                    >
                        <Icons.panel className="size-5" />
                    </Button>
                </SheetClose>

                <div className="px-3">
                    <ChatList chats={chats} />
                </div>
            </SheetContent>
        </Sheet>
    )
};

export default MobileSidebar
