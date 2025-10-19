import React, { useState, useEffect } from "react";

const ThreeDotsBounceIcon = ({
  size = 48,
  color = "currentColor",
  strokeWidth = undefined,
  background = "transparent",
  opacity = 1,
  rotation = 0,
  shadow = 0,
  flipHorizontal = false,
  flipVertical = false,
  padding = 0,
}) => {
  const transforms = [];
  if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
  if (flipHorizontal) transforms.push("scaleX(-1)");
  if (flipVertical) transforms.push("scaleY(-1)");

  const viewBoxSize = 32 + padding * 2;
  const viewBoxOffset = -padding;
  const viewBox = `${viewBoxOffset} ${viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        opacity,
        transform: transforms.join(" ") || undefined,
        filter:
          shadow > 0
            ? `drop-shadow(0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.3))`
            : undefined,
        backgroundColor: background !== "transparent" ? background : undefined,
      }}
    >
      <circle cx="6" cy="12" r="1.5" fill="currentColor">
        <animate
          id="SVGKiXXedfO"
          attributeName="cy"
          begin="0;SVGgLulOGrw.end+0.25s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
          values="12;6;12"
        />
      </circle>
      <circle cx="16" cy="12" r="1.5" fill="currentColor">
        <animate
          attributeName="cy"
          begin="SVGKiXXedfO.begin+0.1s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
          values="12;6;12"
        />
      </circle>
      <circle cx="26" cy="12" r="1.5" fill="currentColor">
        <animate
          id="SVGgLulOGrw"
          attributeName="cy"
          begin="SVGKiXXedfO.begin+0.2s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
          values="12;6;12"
        />
      </circle>
    </svg>
  );
};

export function TypingIndicator() {
  const [currentWord, setCurrentWord] = useState(0);
  const words = ["Thinking", "Searching", "Analyzing", "Processing"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000); // Change word every 2 seconds

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div className="justify-left flex space-x-1 mt-4">
      <div className="rounded-lg bg-muted p-3">
        <div className="flex flex-row gap-1">
          <span className="text-sm text-muted-foreground font-medium transition-opacity duration-300">
            {words[currentWord]}
          </span>
          <div className="text-muted-foreground mt-[8px]">
            <ThreeDotsBounceIcon size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
