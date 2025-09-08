import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Grid, Trash2, Plus } from 'lucide-react';
import { useTextureLibrary, TextureItem } from './TextureLibraryContext';
import { useTranslation } from '../../../hooks/useTranslation';

interface TextureSelectorProps {
  selectedTextureId?: string;
  onTextureSelect: (textureId: string | undefined) => void;
  currentTileTexture?: string;
}

export const TextureSelector: React.FC<TextureSelectorProps> = ({
  selectedTextureId,
  onTextureSelect,
  currentTileTexture,
}) => {
  const { t } = useTranslation();
  const { textures, addTexture, removeTexture } = useTextureLibrary();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleTextureUpload = (base64: string) => {
    const texture = addTexture(base64);
    onTextureSelect(texture.id);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        if (base64) {
          handleTextureUpload(base64);
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
      
      // Clear the input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('File upload error:', error);
      setIsUploading(false);
    }
  };

  const handleAddTextureClick = () => {
    fileInputRef.current?.click();
  };

  const handleTextureClick = (texture: TextureItem) => {
    if (selectedTextureId === texture.id) {
      // Deselect if clicking the same texture
      onTextureSelect(undefined);
    } else {
      onTextureSelect(texture.id);
    }
  };

  const handleRemoveTexture = (e: React.MouseEvent, textureId: string) => {
    e.stopPropagation();
    removeTexture(textureId);
    if (selectedTextureId === textureId) {
      onTextureSelect(undefined);
    }
  };

  return (
    <div className="flex flex-col gap-2 max-w-xs">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-800">{t('planner.patternEditor.textureLibrary')}</span>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
        {/* None option */}
        <div
          className={`relative cursor-pointer border-2 rounded aspect-square flex items-center justify-center bg-gray-100 ${
            !selectedTextureId ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onClick={() => onTextureSelect(undefined)}
        >
          <Grid size={16} className="text-gray-400" />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 truncate">
            {t('planner.patternEditor.noTexture')}
          </div>
        </div>

        {/* Texture options */}
        {textures.map((texture) => (
          <div
            key={texture.id}
            className={`relative cursor-pointer border-2 rounded aspect-square overflow-hidden ${
              selectedTextureId === texture.id ? 'border-blue-500' : 'border-gray-300'
            }`}
            onClick={() => handleTextureClick(texture)}
          >
            <Image
              src={texture.base64}
              alt={texture.name}
              fill
              className="object-cover"
              sizes="64px"
            />
            <button
              onClick={(e) => handleRemoveTexture(e, texture.id)}
              className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 text-xs"
            >
              <Trash2 size={10} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 truncate">
              {texture.name}
            </div>
          </div>
        ))}

        {/* Add texture button */}
        <div
          className={`relative cursor-pointer border-2 border-dashed border-gray-400 rounded aspect-square flex items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-gray-500 transition-colors ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={isUploading ? undefined : handleAddTextureClick}
        >
          <div className="flex flex-col items-center gap-1">
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            ) : (
              <Plus size={16} className="text-gray-600" />
            )}
            <span className="text-xs text-gray-600 text-center px-1">
              {isUploading ? t('planner.patternEditor.textureProcessing') : t('planner.patternEditor.addTexture')}
            </span>
          </div>
        </div>
      </div>

      {currentTileTexture && !selectedTextureId && (
        <div className="text-xs text-amber-600 p-2 bg-amber-50 border border-amber-200 rounded">
          {t('planner.patternEditor.customTextureWarning')}
        </div>
      )}
    </div>
  );
};
