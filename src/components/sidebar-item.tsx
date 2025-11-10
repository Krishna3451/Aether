import { Chat, deleteChat, updateChat } from "@/actions/chat";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Container from "./global/container";
import Icons from "./global/icons";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface Props {
    chat?: Chat;
    index: number;
}

const SidebarItem = ({ chat, index }: Props) => {

    const inputRef = useRef<HTMLInputElement>(null);

    const router = useRouter();

    const pathname = usePathname();

    const [title, setTitle] = useState(chat?.title!);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isEditable, setIsEditable] = useState<boolean>(false);

    const handleUpdateTitle = async () => {
        try {
            const updatedTitle = await updateChat(chat?.id!, title);
            setTitle(updatedTitle);
            setIsEditable(false);
            toast.success("Chat title updated");
        } catch (error) {
            console.log("Error updating chat", error);
            toast.error("Error updating chat. Please try again");
            setTitle(chat?.title!);
            setIsEditable(false);
        }
    };

    const handleDeleteChat = async (chatId: string) => {
        try {
            await deleteChat(chatId);
            toast.success("Chat deleted");
            router.refresh();
            router.push("/");
        } catch (error) {
            console.error('Error deleting chat:', error);
            toast.error('Error deleting chat. Please try again');
        }
    };

    useEffect(() => {
        if (isEditable && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditable]);

    return (
        <Container delay={0.5 * index + 0.1}>
            <li className="relative">
                <Link href={`/c/${chat?.id}`} className="pl-2.5 pr-1 flex items-center justify-between py-2 rounded-lg cursor-pointer hover:bg-neutral-200/40 w-full group/id">
                    <div className="flex items-center w-full gap-2">
                        <div className="flex flex-1 relative overflow-hidden whitespace-nowrap" dir="auto">
                            {isEditable ? (
                                <Input
                                    ref={inputRef}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value.slice(0, 30))}
                                    onBlur={handleUpdateTitle}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleUpdateTitle();
                                        } else if (e.key === "Escape") {
                                            setIsEditable(false);
                                            setTitle(chat?.title!);
                                        }
                                    }}
                                    className="w-full focus-visible:ring-0 focus-visible:ring-transparent outline-none border-none h-5 p-0 rounded-none"
                                />
                            ) : (
                                <p className="text-sm font-normal">
                                    {title?.length! > 30 ? title?.substring(0, 30) + "..." : title}
                                </p>
                            )}
                            {/* <div className="absolute inset-y-0 right-0 group-hover/id:bg-gradient-to-l group-hover/id:from-neutral-200/40 group-hover/id:from-mute h-auto w-8"></div> */}
                        </div>
                    </div>
                    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                        <DropdownMenuTrigger asChild className="focus-visible:ring-0 focus-visible:ring-transparent outline-none border-none">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                className="text-muted-foreground invisible hover:bg-transparent group-hover/id:visible h-5 px-1 border-none outline-none"
                            >
                                <EllipsisVertical className="size-4 data-[state=open]:opacity-100 data-[state=open]:visible" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="border border-border w-36">
                            <DropdownMenuItem onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsOpen(false);
                                setIsEditable(true);
                            }}>
                                <Icons.pen className="size-4" />
                                <p>Rename</p>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive hover:!text-destructive hover:!bg-destructive/10 group" onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsOpen(false);
                                handleDeleteChat(chat?.id!);
                            }}>
                                <Icons.delete className="size-4 text-destructive group-hover:text-destructive" />
                                <p>Delete</p>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Link>
            </li>
        </Container>
    )
};

export default SidebarItem
