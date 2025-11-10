
"use client";

import { cn } from "@/utils";
import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface ContainerProps {
    children: ReactNode;
    className?: string
    animation?: "fadeUp" | "fadeDown" | "fadeLeft" | "fadeRight" | "scaleUp" | "blurIn";
    delay?: number;
    words?: boolean;
}

// TODO: If mobile then reduce animation duration or remove it
const getVariants = (animation: string) => {
    switch (animation) {
        case "fadeUp":
            return { opacity: 0, y: 20 };
        case "fadeDown":
            return { opacity: 0, y: -20 };
        case "fadeLeft":
            return { opacity: 0, x: -20 };
        case "fadeRight":
            return { opacity: 0, x: 20 };
        case "scaleUp":
            return { opacity: 0, scale: 0.95 };
        case "blurIn":
            return {
                opacity: 0,
                filter: "blur(10px)",
                y: 10
            };
        default:
            return { opacity: 0, y: 20 };
    }
};

const Container = ({
    children,
    className,
    animation = "fadeUp",
    delay = 0,
    words = false,
}: ContainerProps) => {

    if (words && typeof children === "string") {
        return (
            <div className={cn(
                "w-full mx-auto",
                className
            )}>
                {children.split(" ").map((word, index) => (
                    <motion.span
                        key={index}
                        initial={{
                            opacity: 0,
                            filter: "blur(10px)",
                            y: 10,
                        }}
                        whileInView={{
                            opacity: 1,
                            filter: "blur(0px)",
                            y: 0,
                        }}
                        viewport={{ once: true }}
                        transition={{
                            duration: 0.9,
                            delay: (delay + index) * 0.05,
                            ease: "easeOut"
                        }}
                        className="inline-block"
                    >
                        {word}&nbsp;
                    </motion.span>
                ))}
            </div>
        );
    }

    return (
        <motion.div
            className={className}
            initial={getVariants(animation)}
            whileInView={{
                opacity: 1,
                y: 0,
                x: 0,
                scale: 1,
                filter: "blur(0px)",
            }}
            viewport={{ once: true }}
            transition={{
                duration: 0.3,
                delay: delay * 0.2,
                ease: "easeOut"
            }}
        >
            {children}
        </motion.div>
    );
};

export default Container; 
