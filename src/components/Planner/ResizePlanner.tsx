import React, { useEffect } from "react";

import { classMerge } from "@/utils/classMerge";

import { PlannerProps } from './Planner'

type Dimensions = { width: number; height: number };

export interface ResizePlannerProps extends Omit<PlannerProps, "width" | "height"> {
  className?: string;
  render: (props: Dimensions) => React.ReactNode;
}

export const ResizePlanner: React.FC<ResizePlannerProps> = ({ className, render }) => {
  const [wrapperRef, setWrapperRef] = React.useState<HTMLDivElement | null>(null);
  const [dimensions, setPlannerDimensions] = React.useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef) {
        const rect = wrapperRef.getBoundingClientRect();
        setPlannerDimensions({ width: rect.width, height: rect.height });
      }
    }
    handleResize();
    addEventListener('resize', handleResize);
      return () => {
        removeEventListener('resize', handleResize);
      }
  }, [wrapperRef])
 
  return <div ref={setWrapperRef} className={classMerge("w-full h-full", className)}>
    {dimensions && render(dimensions) }
  </div>
}