import React, { useEffect } from "react";

import { classMerge } from "@/utils/classMerge";

import { PlannerProps } from "./Planner";

type Dimensions = { width: number; height: number };

export interface ResizePlannerProps
  extends Omit<PlannerProps, "width" | "height"> {
  className?: string;
  render: (props: Dimensions) => React.ReactNode;
}

export const ResizePlanner: React.FC<ResizePlannerProps> = ({
  className,
  render,
}) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (wrapperRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      });

      observer.observe(wrapperRef.current);

      // Cleanup function
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return (
    <div ref={wrapperRef} className={classMerge("w-full h-full", className)}>
      {dimensions && render(dimensions)}
    </div>
  );
};
