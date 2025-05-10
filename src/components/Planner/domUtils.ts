import Konva from "konva";

const getOnEventCursor = (cursor: CSSStyleDeclaration["cursor"]) => (e: Konva.KonvaEventObject<MouseEvent>) => {
  const container = e.target?.getStage()?.container();
  if (container) {
    container.style.cursor = cursor;
  }
};

export const setNsResizeCursor = getOnEventCursor('ns-resize');
export const setEwResizeCursor = getOnEventCursor('ew-resize');
export const setPointerCursor = getOnEventCursor('pointer');
export const setMoveCursor = getOnEventCursor('move');
export const setGrabCursor = getOnEventCursor('grab');
export const setGrabbingCursor = getOnEventCursor('grabbing');
export const setCrosshairCursor = getOnEventCursor('crosshair');
export const removeCustomCursor = (e: Konva.KonvaEventObject<MouseEvent>) => {
  const container = e.target?.getStage()?.container();
  if (container) {
    container.style.cursor = '';
  }
}