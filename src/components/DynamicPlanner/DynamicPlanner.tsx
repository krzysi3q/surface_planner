'use client';
import dynamic from 'next/dynamic';
import type { ResizePlannerProps } from '../Planner'

const Planner = dynamic<ResizePlannerProps>(() => import('../Planner/ResizePlanner').then(mod => mod.ResizePlanner), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function DynamicPlanner(props: ResizePlannerProps) {
  return <Planner  {...props} />;
}