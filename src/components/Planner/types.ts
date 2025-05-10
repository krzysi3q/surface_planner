export type Point = [number, number];

export interface WallStructure {
  id: string;
  points: Point[];
}

export interface Surface {
  id: string;
  points: Point[];
}