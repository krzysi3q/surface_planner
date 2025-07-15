import React, { JSX, useCallback, useEffect } from 'react'
import { Portal } from "../Portal"
import { classMerge } from "@/utils/classMerge"

interface TooltipProps {
  text: JSX.Element | string
  className?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  disabled?: boolean
  active?: boolean
  portal?: boolean
  component: (ref: (ref: HTMLElement | null) => void) => JSX.Element
}

const TOOLTIP_OFFSET = 8

const findParentBy = (target: HTMLElement | null, findFn: (el: HTMLElement) => boolean): HTMLElement | null  => {
  if (target === null) return null
  if (findFn(target)) {
    return target
  }
  return findParentBy(target.parentElement, findFn)
}

export const Tooltip: React.FC<TooltipProps> = ({text, position = 'top', component, className, disabled, active, portal = true}) => {
  const [targetRef, setTargetRef] = React.useState<HTMLElement | null>(null)
  const [pos, setPos] = React.useState<{x: number, y: number} | null>(null)

  const setPositionAccordingToTarget = useCallback((target: HTMLElement | null) => {
    if (!target) return
    const rect = target.getBoundingClientRect()
    let { top, left, bottom, right } = rect
    const { width, height } = rect
    
    // For fixed positioning, we don't need scroll offset as getBoundingClientRect already gives viewport coordinates
    const dialog = findParentBy(target, (el) => el.tagName.toLocaleLowerCase() === 'dialog')
    if (dialog) {
      const dialogRect = dialog.getBoundingClientRect()
      top -= dialogRect.top
      left -= dialogRect.left
      bottom -= dialogRect.top
      right -= dialogRect.left
    }
    
    switch (position) {
      case 'bottom':
        setPos({x: bottom + TOOLTIP_OFFSET, y: left + width/2}) // x = top position, y = left position
        break
      case 'left':
        setPos({x: top + height/2, y: left - TOOLTIP_OFFSET}) // x = top position, y = left position
        break
      case 'right':
        setPos({x: top + height/2, y: right + TOOLTIP_OFFSET}) // x = top position, y = left position
        break
      default:
      case 'top':
        setPos({x: top - TOOLTIP_OFFSET, y: left + width/2}) // x = top position, y = left position
        break
    }
  }, [position]);

  useEffect(() => {
    if (targetRef && !disabled) {
      const showTooltip = () => setPositionAccordingToTarget(targetRef)
      const hideTooltip = () => setPos(null)

      targetRef.addEventListener('mouseenter', showTooltip)
      targetRef.addEventListener('mouseleave', hideTooltip)
      return () => {
        targetRef.removeEventListener('mouseenter', showTooltip)
        targetRef.removeEventListener('mouseleave', hideTooltip)
      }
    }
  }, [targetRef, position, disabled, setPositionAccordingToTarget])

  useEffect(() => {
    if (targetRef && active) {
      setPositionAccordingToTarget(targetRef)
    } else {
      setPos(null)
    }
  }, [targetRef, active, setPositionAccordingToTarget])

  const getTooltip = ({x, y}: {x: number, y: number}) => (
    <div className={classMerge('fixed text-white text-xs px-2 py-1 shadow-lg rounded',
        position === 'top' && '-translate-x-1/2 -translate-y-full',
        position === 'bottom' && '-translate-x-1/2 translate-y-0',
        position === 'left' && '-translate-x-full -translate-y-1/2',
        position === 'right' && '-translate-y-1/2',
        className
      )} style={{left: y, top: x, zIndex: 9999, backgroundColor: 'rgba(31, 41, 55, 0.9)'}}>
      {text}
      <div className={classMerge('absolute w-1.5 h-1.5 rotate-45',
        position === 'top' && 'top-full left-1/2 -translate-y-1/2 -translate-x-1/2',
        position === 'bottom' && 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
        position === 'left' && 'top-1/2 left-full -translate-x-1/2 -translate-y-1/2',
        position === 'right' && 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2',
      )} style={{backgroundColor: 'rgba(31, 41, 55, 0.9)'}} />
    </div>
  )
  const enabled = (!disabled || active)
  return (
    <>
      {component(setTargetRef)}
      {pos && enabled && (
        portal ? <Portal>{getTooltip(pos)}</Portal> : getTooltip(pos)
      )}
    </>
  )
}