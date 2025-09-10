import { loadFromLocalStorage } from "./utils";
import type { TextureItem } from './PatternEditor/TextureLibraryContext';
import type { Pattern, Point } from './types';

export interface SurfaceWithTextures {
  id: string;
  points: Point[][];
  pattern: Pattern;
  textures?: TextureItem[];
}

export interface LoadedSurfaceData {
  id: string;
  points: Point[][];
  pattern: Pattern;
}

/**
 * Load surface from localStorage and separate texture data
 * This ensures textures can be loaded into the library before surface rendering
 */
export const loadSurfaceWithTextures = (): { surface: LoadedSurfaceData | undefined; textures: TextureItem[] } => {
  try {
    const savedData = loadFromLocalStorage('surface') as SurfaceWithTextures | undefined;
    
    if (!savedData) {
      return { surface: undefined, textures: [] };
    }
    
    // Extract textures and return clean surface data
    const textures = savedData.textures || [];
    const cleanSurface: LoadedSurfaceData = {
      id: savedData.id,
      points: savedData.points,
      pattern: savedData.pattern
    };
    
    return { surface: cleanSurface, textures };
  } catch (error) {
    console.error('Error loading surface with textures:', error);
    return { surface: undefined, textures: [] };
  }
};
