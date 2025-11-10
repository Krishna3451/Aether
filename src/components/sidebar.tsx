"use client";

import useSidebar from "@/hooks/use-sidebar";
import { cn } from "@/utils";
import React from 'react';

export interface Props extends React.ComponentProps<'div'> { };

const Sidebar = ({ className, children }: Props) => {

    const { isOpen, setIsOpen } = useSidebar();

    return (
        <div
            data-state={isOpen ? "open" : "closed"}
            className={cn("h-full flex-col", className)}
        >
            {children}
        </div>
    )
};

export default Sidebar
