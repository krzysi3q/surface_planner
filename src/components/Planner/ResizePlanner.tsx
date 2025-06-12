import React, { useEffect } from "react";

import { classMerge } from "@/utils/classMerge";

import { Planner, PlannerProps } from './Planner'


export interface ResizePlannerProps extends Omit<PlannerProps, "width" | "height"> {
  className?: string;
}

export const ResizePlanner: React.FC<ResizePlannerProps> = ({ className }) => {
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
    {dimensions && <Planner width={dimensions.width} height={dimensions.height} /> }
  </div>
}