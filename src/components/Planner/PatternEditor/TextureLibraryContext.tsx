import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface TextureItem {
  id: string;
  name: string;
  base64: string;
  createdAt: Date;
}

interface TextureLibraryContextType {
  textures: TextureItem[];
  addTexture: (base64: string, name?: string) => TextureItem;
  removeTexture: (id: string) => void;
  getTexture: (id: string) => TextureItem | undefined;
  clearAll: () => void;
  addTexturesFromProject: (projectTextures: TextureItem[]) => Map<string, string>; // Returns old ID -> new ID mapping
  getUsedTextures: (textureIds: string[]) => TextureItem[];
}

const TextureLibraryContext = createContext<TextureLibraryContextType | null>(null);

export const useTextureLibrary = () => {
  const context = useContext(TextureLibraryContext);
  if (!context) {
    throw new Error('useTextureLibrary must be used within a TextureLibraryProvider');
  }
  return context;
};

interface TextureLibraryProviderProps {
  children: React.ReactNode;
}

export const TextureLibraryProvider: React.FC<TextureLibraryProviderProps> = ({ children }) => {
  const [textures, setTextures] = useState<TextureItem[]>([]);

  const addTexture = useCallback((base64: string, name?: string): TextureItem => {
    const id = uuidv4();
    const texture: TextureItem = {
      id,
      name: name || `Texture ${textures.length + 1}`,
      base64,
      createdAt: new Date(),
    };

    setTextures(prev => [...prev, texture]);
    return texture;
  }, [textures.length]);

  const removeTexture = useCallback((id: string) => {
    setTextures(prev => prev.filter(texture => texture.id !== id));
  }, []);

  const getTexture = useCallback((id: string) => {
    return textures.find(texture => texture.id === id);
  }, [textures]);

  const clearAll = useCallback(() => {
    setTextures([]);
  }, []);

  const addTexturesFromProject = useCallback((projectTextures: TextureItem[]): Map<string, string> => {
    const idMapping = new Map<string, string>();
    
    projectTextures.forEach(projectTexture => {
      // Check if texture already exists (by base64 content)
      const existingTexture = textures.find(t => t.base64 === projectTexture.base64);
      
      if (existingTexture) {
        // Texture already exists, map old ID to existing ID
        idMapping.set(projectTexture.id, existingTexture.id);
      } else {
        // Add new texture with new ID
        const newTexture = addTexture(projectTexture.base64, projectTexture.name);
        idMapping.set(projectTexture.id, newTexture.id);
      }
    });
    
    return idMapping;
  }, [textures, addTexture]);

  const getUsedTextures = useCallback((textureIds: string[]): TextureItem[] => {
    const uniqueIds = [...new Set(textureIds)]; // Remove duplicates
    return uniqueIds
      .map(id => getTexture(id))
      .filter((texture): texture is TextureItem => texture !== undefined);
  }, [getTexture]);

  const value: TextureLibraryContextType = {
    textures,
    addTexture,
    removeTexture,
    getTexture,
    clearAll,
    addTexturesFromProject,
    getUsedTextures,
  };

  return (
    <TextureLibraryContext.Provider value={value}>
      {children}
    </TextureLibraryContext.Provider>
  );
};
