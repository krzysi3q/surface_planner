export type Point = [number, number];

export interface WallStructure {
  id: string;
  points: Point[];
}

export interface SurfaceType {
  id: string;
  points: Point[];
}