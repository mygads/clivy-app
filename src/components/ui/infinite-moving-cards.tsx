"use client";

import { cn } from "@/lib/utils";
import React, { useCallback, useEffect, useState } from "react";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    quote: string | React.ReactNode;
    name: string;
    title: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  const getDirection = useCallback(() => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards",
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse",
        );
      }
    }
  }, [direction]);

  const getSpeed = useCallback(() => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  }, [speed]);

  const addAnimation = useCallback(() => {
    if (containerRef.current && scrollerRef.current) {
      // Guard against double-cloning if effect re-runs
      const alreadyCloned = scrollerRef.current.dataset.cloned === "true";
      if (!alreadyCloned) {
        const scrollerContent = Array.from(scrollerRef.current.children);
        scrollerContent.forEach((item) => {
          const duplicatedItem = item.cloneNode(true);
          scrollerRef.current?.appendChild(duplicatedItem);
        });
        scrollerRef.current.dataset.cloned = "true";
      }

      getDirection();
      getSpeed();
      setStart(true);
    }
  }, [getDirection, getSpeed]);

  useEffect(() => {
    addAnimation();
  }, [addAnimation]);

  const [start, setStart] = useState(false);

  // addAnimation is defined above using useCallback

  // Effects to update direction/speed when props change
  useEffect(() => {
    getDirection();
  }, [getDirection]);

  useEffect(() => {
    getSpeed();
  }, [getSpeed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {items.map((item, idx) => (
          <li
            className="relative w-[350px] max-w-full shrink-0 md:w-[450px]"
            key={`${item.name}-${idx}`}
          >
            {/* Render JSX content directly if quote is ReactNode, otherwise use default card layout */}
            {React.isValidElement(item.quote) ? (
              item.quote
            ) : (
              <div className="rounded-2xl border border-b-0 border-zinc-200 bg-[linear-gradient(180deg,#fafafa,#f5f5f5)] px-8 py-6 dark:border-zinc-700 dark:bg-[linear-gradient(180deg,#27272a,#18181b)]">
                <blockquote>
                  <div
                    aria-hidden="true"
                    className="user-select-none pointer-events-none absolute -top-0.5 -left-0.5 -z-1 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
                  ></div>
                  <span className="relative z-20 text-sm leading-[1.6] font-normal text-neutral-800 dark:text-gray-100">
                    {item.quote}
                  </span>
                  <div className="relative z-20 mt-6 flex flex-row items-center">
                    <span className="flex flex-col gap-1">
                      <span className="text-sm leading-[1.6] font-normal text-neutral-500 dark:text-gray-400">
                        {item.name}
                      </span>
                      <span className="text-sm leading-[1.6] font-normal text-neutral-500 dark:text-gray-400">
                        {item.title}
                      </span>
                    </span>
                  </div>
                </blockquote>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
