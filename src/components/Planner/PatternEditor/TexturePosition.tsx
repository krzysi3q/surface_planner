import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { ToolbarButton } from '../../ToolbarButton';
import { RotateCcw, Plus, Minus } from 'lucide-react';

interface TexturePositionProps {
  offsetX: number;
  offsetY: number;
  scale: number;
  onOffsetXChange: (value: number) => void;
  onOffsetYChange: (value: number) => void;
  onScaleChange: (value: number) => void;
  onResetPosition: () => void;
  onResetScale: () => void;
  disabled?: boolean;
}

export const TexturePosition: React.FC<TexturePositionProps> = ({
  offsetX,
  offsetY,
  scale,
  onOffsetXChange,
  onOffsetYChange,
  onScaleChange,
  onResetPosition,
  onResetScale,
  disabled = false
}) => {
  const { t } = useTranslation();

  // Dynamic step calculation based on current scale
  const getScaleStep = (currentScale: number) => {
    if (currentScale <= 1.0) return 0.01;  // Fine precision for small scales
    if (currentScale <= 2.0) return 0.05;  // Medium precision for medium scales
    return 0.1;                            // Coarser precision for large scales
  };

  // Convert scale to slider position (0-100) for more precise control
  const scaleToSliderValue = (scaleValue: number) => {
    // Use logarithmic mapping for better precision at lower values
    // Scale 0.01 -> 0, Scale 1.0 -> 50, Scale 3.0 -> 100
    if (scaleValue <= 1.0) {
      return (scaleValue - 0.01) / 0.99 * 50; // 0.01-1.0 maps to 0-50
    } else {
      return 50 + (scaleValue - 1.0) / 2.0 * 50; // 1.0-3.0 maps to 50-100
    }
  };

  // Convert slider position back to scale value
  const sliderValueToScale = (sliderValue: number) => {
    if (sliderValue <= 50) {
      return 0.01 + (sliderValue / 50) * 0.99; // 0-50 maps to 0.01-1.0
    } else {
      return 1.0 + ((sliderValue - 50) / 50) * 2.0; // 50-100 maps to 1.0-3.0
    }
  };

  const handleScaleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sliderValue = parseFloat(e.target.value);
    let newScale = sliderValueToScale(sliderValue);
    
    // Round to appropriate precision based on scale value
    const step = getScaleStep(newScale);
    newScale = Math.round(newScale / step) * step;
    
    // Ensure bounds
    newScale = Math.max(0.01, Math.min(3.0, newScale));
    
    onScaleChange(newScale);
  };

  const handleScaleAdjustment = (increment: boolean) => {
    const step = getScaleStep(scale);
    let newScale = increment ? scale + step : scale - step;
    
    // Ensure bounds
    newScale = Math.max(0.01, Math.min(3.0, newScale));
    
    onScaleChange(newScale);
  };

  const handlePositionAdjustment = (axis: 'x' | 'y', increment: boolean) => {
    const step = 1; // 1px step for precise position adjustments
    const currentValue = axis === 'x' ? offsetX : offsetY;
    let newValue = increment ? currentValue + step : currentValue - step;
    
    // Ensure bounds
    newValue = Math.max(-500, Math.min(500, newValue));
    
    if (axis === 'x') {
      onOffsetXChange(newValue);
    } else {
      onOffsetYChange(newValue);
    }
  };

  if (disabled) return null;

  return (
    <div className="border-t border-gray-300 pt-3 mt-3 space-y-4">
      {/* Position Controls */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">
            {t('planner.patternEditor.texturePosition')}
          </h4>
          <ToolbarButton
            onClick={onResetPosition}
            icon={<RotateCcw size={14} />}
            className="w-6 h-6"
            disabled={offsetX === 0 && offsetY === 0}
          />
        </div>
        
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              {t('planner.patternEditor.textureOffsetX')}
            </label>
            <input
              type="range"
              min="-500"
              max="500"
              step="1"
              value={offsetX}
              onChange={(e) => onOffsetXChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex items-center justify-between mt-1">
              <button
                onClick={() => handlePositionAdjustment('x', false)}
                disabled={offsetX <= -500}
                className="w-6 h-6 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-300 text-gray-700 rounded flex items-center justify-center transition-colors"
              >
                <Minus size={12} />
              </button>
              <div className="text-xs text-gray-500 text-center">
                {offsetX}px
              </div>
              <button
                onClick={() => handlePositionAdjustment('x', true)}
                disabled={offsetX >= 500}
                className="w-6 h-6 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-300 text-gray-700 rounded flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              {t('planner.patternEditor.textureOffsetY')}
            </label>
            <input
              type="range"
              min="-500"
              max="500"
              step="1"
              value={offsetY}
              onChange={(e) => onOffsetYChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex items-center justify-between mt-1">
              <button
                onClick={() => handlePositionAdjustment('y', false)}
                disabled={offsetY <= -500}
                className="w-6 h-6 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-300 text-gray-700 rounded flex items-center justify-center transition-colors"
              >
                <Minus size={12} />
              </button>
              <div className="text-xs text-gray-500 text-center">
                {offsetY}px
              </div>
              <button
                onClick={() => handlePositionAdjustment('y', true)}
                disabled={offsetY >= 500}
                className="w-6 h-6 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-300 text-gray-700 rounded flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scale Controls */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">
            {t('planner.patternEditor.textureScale')}
          </h4>
          <ToolbarButton
            onClick={onResetScale}
            icon={<RotateCcw size={14} />}
            className="w-6 h-6"
            disabled={scale === 1}
          />
        </div>
        
        <div className="space-y-2">
          <div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={scaleToSliderValue(scale)}
              onChange={handleScaleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex items-center justify-between mt-1">
              <button
                onClick={() => handleScaleAdjustment(false)}
                disabled={scale <= 0.01}
                className="w-6 h-6 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-300 text-gray-700 rounded flex items-center justify-center transition-colors"
              >
                <Minus size={12} />
              </button>
              <div className="text-xs text-gray-500 text-center">
                {scale < 1 ? scale.toFixed(2) : scale.toFixed(1)}x
              </div>
              <button
                onClick={() => handleScaleAdjustment(true)}
                disabled={scale >= 3.0}
                className="w-6 h-6 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-300 text-gray-700 rounded flex items-center justify-center transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
