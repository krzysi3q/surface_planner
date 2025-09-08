import React, { createContext, useContext, useState, useCallback } from 'react';

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
    const id = `texture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

  const value: TextureLibraryContextType = {
    textures,
    addTexture,
    removeTexture,
    getTexture,
    clearAll,
  };

  return (
    <TextureLibraryContext.Provider value={value}>
      {children}
    </TextureLibraryContext.Provider>
  );
};
