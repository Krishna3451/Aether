"use client";

import React from "react"
import { ThemeProvider } from "next-themes";
import { Toaster } from "../ui/sonner";

interface Props {
    children: React.ReactNode;
}

const Providers = ({ children }: Props) => {
    return (
        <>
            <Toaster
                richColors
                theme="light"
                position="top-center"
            />
            {children}
        </>
    );
};

export default Providers
