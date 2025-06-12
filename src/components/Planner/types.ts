export type Point = [number, number];

export interface WallStructure {
  id: string;
  points: Point[];
}

export interface SurfaceType {
  id: string;
  points: Point[];
  pattern: Pattern;
}

export interface TileMetadata {
  angle: number;
  centerX: number;
  centerY: number;
}

export interface TileType {
  id: string;
  points: Point[]
  color: string
  type: 'triangle' | 'rectangle' | 'square' | 'pentagon' | 'hexagon'
  metadata: TileMetadata
}


export interface Pattern {
  tiles: TileType[]
  width: number
  height: number
  x: number
  y: number
  tilesGap: number
  scale: number
  gapColor: string
}