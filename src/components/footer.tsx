"use client";

import { useSidebar } from "@/hooks";
import { cn } from "@/utils";
import { HeartIcon } from "lucide-react";
import Link from "next/link";
import React from 'react'

const Footer = () => {

    const { isOpen, setIsOpen } = useSidebar();

    return (
        <div className={cn(
            "fixed bottom-0 inset-x-0 z-50 bg-background ml-auto transition-all duration-300 ease-in-out",
            isOpen ? "w-[calc(100%-272px)]" : "w-full"
        )}>
            <footer className={cn(
                "flex items-center justify-center h-6 mx-auto",
            )}>
                <div className="relative px-4 text-[10px] text-center md:px-8 text-muted-foreground">
                    <span className="flex items-center">
                        Built with <HeartIcon className="w-3 h-3 fill-muted-foreground mx-0.5" /> by {" "}
                        <Link href="https://heyshreyas.in" target="_blank" className="font-medium hover:text-foreground/80 ml-0.5">
                            Shreyas
                        </Link>
                    </span>
                </div>
            </footer>
        </div>
    )
};

export default Footer;
