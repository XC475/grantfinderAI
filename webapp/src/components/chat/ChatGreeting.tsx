"use client";

import { cn } from "@/lib/utils";
import { TextAnimate } from "@/components/ui/text-animate";

interface ChatGreetingProps {
  userName?: string;
  className?: string;
}

export function ChatGreeting({ userName, className }: ChatGreetingProps) {
  return (
    <h1
      className={cn(
        "text-3xl md:text-4xl lg:text-5xl font-normal text-foreground mb-8 md:mb-10 lg:mb-12 text-center font-sans",
        className
      )}
    >
      Hello{userName && (
        <>
          {" "}
          <TextAnimate
            animation="blurInUp"
            by="character"
            once
            className="inline-block"
            as="span"
          >
            {`${userName}!`}
          </TextAnimate>
        </>
      )}
      {!userName && "!"}
    </h1>
  );
}

