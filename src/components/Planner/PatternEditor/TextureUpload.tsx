import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { resizeImage, validateImageFile } from '@/utils/imageUtils';
import { useTranslation } from '@/hooks/useTranslation';
import { ToolbarButton } from '../../ToolbarButton';

interface TextureUploadProps {
  onTextureUpload: (base64: string) => void;
  currentTexture?: string;
  onRemoveTexture?: () => void;
}

export const TextureUpload: React.FC<TextureUploadProps> = ({
  onTextureUpload,
  currentTexture,
  onRemoveTexture,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!validateImageFile(file)) {
      setError(t('planner.patternEditor.textureError'));
      return;
    }

    setIsUploading(true);

    try {
      const base64 = await resizeImage(file, 512, 512, 0.8);
      onTextureUpload(base64);
    } catch (err) {
      setError(t('planner.patternEditor.textureError'));
      console.error('Image processing error:', err);
    } finally {
      setIsUploading(false);
      // Clear the input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <ToolbarButton
          onClick={handleUploadClick}
          disabled={isUploading}
          className="flex items-center gap-2 px-3 py-2"
          icon={isUploading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          label={isUploading ? t('planner.patternEditor.textureProcessing') : t('planner.patternEditor.uploadTexture')}
        />

        {currentTexture && onRemoveTexture && (
          <ToolbarButton
            onClick={onRemoveTexture}
            className="text-red-600"
            icon={<X size={16} />}
            variant="danger"
          />
        )}
      </div>

      {currentTexture && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
          <ImageIcon size={16} className="text-gray-600" />
          <span className="text-sm text-gray-700">{t('planner.patternEditor.textureApplied')}</span>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 p-2 bg-red-50 rounded border border-red-200">
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
