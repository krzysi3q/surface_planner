import React from 'react'
import { createPortal } from 'react-dom';

interface PortalProps {
  targetId?: string;
}

export const Portal: React.FC<React.PropsWithChildren<PortalProps>> = ({children, targetId}) => {
  const target = targetId ? document.getElementById(targetId) : document.body
  return createPortal(children, target as HTMLElement)
}