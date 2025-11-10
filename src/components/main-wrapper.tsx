"use client";

import { useSidebar } from "@/hooks";
import { cn } from "@/utils";
import { User } from "@supabase/supabase-js";

interface Props {
    user: User;
    children: React.ReactNode;
}

const MainWrapper = ({ children, user }: Props) => {

    const { isOpen: isOpenSidebar } = useSidebar();

    return (
        <div
            className={cn(
                "w-full h-dvh mx-auto transition-all duration-300 ease-in-out",
                isOpenSidebar && user ? "lg:ml-68" : "lg:ml-0"
            )}
        >
            {children}
        </div>
    );
};

export default MainWrapper;
