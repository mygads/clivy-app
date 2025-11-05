"use client";

import { AnimatePresence, motion, MotionProps } from "framer-motion";
import { AuroraText } from "@/components/ui/aurora-text";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface WordRotateProps {
    words: string[];
    duration?: number;
    motionProps?: MotionProps;
    className?: string;
}

export function WordRotate({
    words,
    duration = 2500,
    motionProps = {
        initial: { opacity: 0, y: -50 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 50 },
        transition: { duration: 0.25, ease: "easeOut" },
    },
    className,
}: WordRotateProps) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % words.length);
        }, duration);

        return () => clearInterval(interval);
    }, [words, duration]);

    return (
        <span className="overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.span
                    key={words[index]}
                    className={cn("inline-block", className)}
                    {...motionProps}
                >
                <AuroraText>{words[index]}</AuroraText>
                </motion.span>
            </AnimatePresence>
        </span>
    );
}