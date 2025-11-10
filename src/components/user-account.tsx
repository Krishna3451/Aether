"use client";

import { signOut } from "@/actions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useInstructions, useSettings } from "@/hooks";
import { User } from "@supabase/supabase-js";
import Avvvatars from 'avvvatars-react';
import { LogOutIcon, SettingsIcon, UserCogIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const UserAccount = ({ user }: { user: User }) => {

    const router = useRouter();

     const { isOpen, setIsOpen } = useInstructions();

     const { isOpen: isOpenSettings, setIsOpen: setIsOpenSettings } = useSettings();

    const handleSignout = async () => {
        await signOut();
        toast.success("You're logged out!");
        router.refresh();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="cursor-pointer">
                {user?.user_metadata?.picture ? (
                    <Image
                        src={user?.user_metadata?.picture}
                        alt="U"
                        width={1024}
                        height={1024}
                        className="w-8 h-8 rounded-full"
                    />
                ) : (
                    <Avvvatars
                        value={user?.user_metadata?.full_name}
                        border
                        size={32}
                        radius={999}
                        borderSize={1}
                        borderColor="hsl(var(--border))"
                    />
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="p-2 w-60">
                <div className="flex flex-col items-start px-3.5 py-1.5">
                    <h5 className="text-sm font-medium capitalize">
                        {user?.user_metadata.full_name}
                    </h5>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {user?.email}
                    </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsOpen(true)}>
                    <UserCogIcon className="size-4 mr-2" />
                    Customize
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsOpenSettings(true)}>
                    <SettingsIcon className="size-4 mr-2" />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignout}>
                    <LogOutIcon className="size-4 mr-2" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
};

export default UserAccount
