'use client';
import dynamic from 'next/dynamic';
import type { ResizePlannerProps } from '../Planner'

const Planner = dynamic<Pick<ResizePlannerProps, 'className'>>(() => import('../Planner/Planner').then(mod => mod.DynamicSizePlanner), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function DynamicPlanner(props: Pick<ResizePlannerProps, 'className'>) {
  return <Planner  {...props} />;
}