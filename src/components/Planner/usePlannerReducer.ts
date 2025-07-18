import { useReducer } from "react";
import { Point } from "./types";


interface ReducerStateDefault {
  mode: 'default';
  wallIndex: null;
  editable: true;
}

interface ReducerStatePreview {
  mode: 'preview';
  wallIndex: null;
  editable: false;
}

interface ReducerStateEditWall {
  wallIndex: number;
  nextWallIndex: number;
  editable: true;
  isHorizontal: boolean;
  isVertical: boolean;
  mode: 'edit-wall';
}

interface ReducerStateEditCorner {
  wallIndex: number;
  nextWallIndex: number;
  prevWallIndex: number;
  editable: true;
  mode: 'edit-corner';
}

interface ReducerStateEditSurface {
  wallIndex: null;
  mode: 'edit-surface';
  editable: true;
}

export interface ReducerStateAddSurface {
  mode: 'add-surface';
  wallIndex: null;
  editable: true;
}

export interface ReducerStateSubtractSurface {
  mode: 'subtract-surface';
  wallIndex: null;
  editable: true;
}

export interface ReducerStateDrawWalls {
  mode: 'draw-walls';
  wallIndex: null;
  editable: false;
}

type ReducerState = (ReducerStateDefault | ReducerStatePreview | ReducerStateEditWall | ReducerStateEditCorner | ReducerStateEditSurface|  ReducerStateAddSurface | ReducerStateSubtractSurface | ReducerStateDrawWalls)

type Actions = {
  type: 'default'
} | {
  type: 'preview'
} | {
  type: 'edit-wall';
  payload: {
    wallIndex: number;
  }
} | {
  type: 'edit-corner';
  payload: {
    wallIndex: number;
  }
} | {
  type: 'edit-surface';
} | {
  type: 'add-surface';
} | {
  type: 'subtract-surface';
} | {
  type: 'draw-walls';
}

const getReducer = (surfacePoints: Point[]): React.Reducer<ReducerState, Actions> => (state, action) => {
  switch (action.type) {
    case 'default':
      return {
        mode: 'default',
        wallIndex: null,
        editable: true,
      }
    case 'preview':
      return {
        mode: 'preview',
        wallIndex: null,
        editable: false,
      }
    case 'edit-wall':
      {
        const { wallIndex } = action.payload;
        const nextWallIndex = (wallIndex + 1) % surfacePoints.length;
        const isHorizontal = surfacePoints[wallIndex][1] === surfacePoints[nextWallIndex][1];
        const isVertical = surfacePoints[wallIndex][0] === surfacePoints[nextWallIndex][0];
        return {
          ...state,
          mode: 'edit-wall',
          wallIndex,
          nextWallIndex,
          editable: true,
          isHorizontal,
          isVertical,
        }
      }
    case 'edit-corner':
      {
        const { wallIndex } = action.payload;
        const nextWallIndex = (wallIndex + 1) % surfacePoints.length;
        const prevWallIndex = wallIndex === 0 ? surfacePoints.length - 1 : wallIndex - 1;
        return {
          mode: 'edit-corner',
          wallIndex,
          nextWallIndex,
          prevWallIndex,
          editable: true,
        }
      }
    case 'edit-surface':
      return {
        mode: 'edit-surface',
        wallIndex: null,
        editable: true,
      }
    case 'add-surface':
      return {
        mode: 'add-surface',
        wallIndex: null,
        editable: true,
      }
    case 'subtract-surface':
      return {
        mode: 'subtract-surface',
        wallIndex: null,
        editable: true,
      }
    case 'draw-walls':
      return {
        mode: 'draw-walls',
        wallIndex: null,
        editable: false,
      }
    default:
      return state;
  }
}


export const usePlannerReducer = (surfacePoints: Point[]) => {
  const [state, dispatch] = useReducer(getReducer(surfacePoints), { mode: 'add-surface', wallIndex: null, editable: true });
  return {
    state,
    dispatch,
  }
}