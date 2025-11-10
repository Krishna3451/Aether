import { Chat } from "@/actions/chat";
import { cn } from "@/utils";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import Icons from "./global/icons";
import MobileSidebar from "./mobile-sidebar";
import { buttonVariants } from "./ui/button";
import UserAccount from "./user-account";

interface Props {
    user: User;
    chats: Chat[];
}

const MobileHeader = ({ user, chats }: Props) => {
    return (
        <header className="fixed inset-x-0 top-0 z-50 w-full px-3 h-14 bg-background border-b border-border/80 block lg:hidden">
            <div className="flex items-center justify-between w-full h-full text-muted-foreground">
                <div className={cn(
                    "flex items-center",
                    user ? "flex" : "hidden"
                )}>
                    <MobileSidebar chats={chats} />
                </div>

                {!user && (
                    <Link href="/">
                        <Icons.icon className="size-6 block" />
                    </Link>
                )}

                <div className="flex items-center">
                    {user ? (
                        <UserAccount user={user} />
                    ) : (
                        <Link href="/signin" className={buttonVariants({ size: "sm" })}>
                            <span className="text-sm font-medium">
                                Sign Up
                            </span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}

export default MobileHeader
