'use client';

import DynamicPlanner from "@/components/DynamicPlanner";
import { TouchDeviceWarning } from "@/components/TouchDeviceWarning";
import { useTouchDevice } from "@/hooks/useTouchDevice";

export default function Planner() {
  const isTouchDevice = useTouchDevice();

  return (
    <section id="planner" className="h-screen">
      {isTouchDevice ? (
        <TouchDeviceWarning />
      ) : (
        <DynamicPlanner />
      )}
    </section>
  );
}
