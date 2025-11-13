"use client";

import { useState, useEffect } from "react";

interface TypewriterTextProps {
  text: string;
  className?: string;
  speed?: number; // ms per character
}

export function TypewriterText({ text, className, speed = 50 }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Check if animation has already been shown
    const animationShown = sessionStorage.getItem("welcomeAnimationShown");
    
    if (animationShown === "true") {
      setDisplayedText(text);
      setHasAnimated(true);
      return;
    }

    // Animate typing effect
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        sessionStorage.setItem("welcomeAnimationShown", "true");
        setHasAnimated(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className={className}>
      {displayedText}
    </span>
  );
}

