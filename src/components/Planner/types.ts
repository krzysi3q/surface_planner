import type { TextureItem } from './PatternEditor/TextureLibraryContext';

export type Point = [number, number];

export interface WallStructure {
  id: string;
  points: Point[];
}

export interface SurfaceType {
  id: string;
  points: Point[][];
  pattern: Pattern;
  textures?: TextureItem[]; // Used textures embedded in the project
}

export type { TextureItem } from './PatternEditor/TextureLibraryContext';

export interface TileMetadata {
  angle: number;
  centerX: number;
  centerY: number;
}

export interface TileType {
  id: string;
  points: Point[]
  color: string
  type: 'triangle' | 'rectangle' | 'square' | 'diamond' | 'hexagon'
  metadata: TileMetadata
  texture?: string; // base64 encoded image (legacy)
  textureId?: string; // reference to texture library
  textureOffsetX?: number; // texture horizontal offset in pixels
  textureOffsetY?: number; // texture vertical offset in pixels
  textureScale?: number; // texture scale factor for both dimensions (default: 1.0)
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
  rawImageWidth?: number
  rawImageHeight?: number
}