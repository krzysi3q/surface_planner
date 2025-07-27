import React from "react";
import { Point } from "../types";
import { getSurfaceArea, getAngles, getPointDistance } from "../utils";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * DimensionInfo Component
 * 
 * Displays real-time dimension information for the floor planner:
 * - Surface Area: Total area of all surfaces in square meters
 * - Perimeter: Total perimeter of all surfaces in meters
 * - Selected Wall: Length of currently selected wall (shown only in edit-wall mode)
 * - Corner Angle: Interior angle of currently selected corner (shown only in edit-corner mode)
 * 
 * The component automatically converts from the internal pixel units to metric units
 * using the scale factor of 0.01 (1 pixel = 1cm).
 */

interface DimensionInfoProps {
  surfacePoints: Point[][],
  selectedWall?: {
    surfaceIndex: number;
    wallIndex: number;
  };
  selectedCorner?: {
    surfaceIndex: number;
    wallIndex: number;
  };
  mode: string;
}

export const DimensionInfo: React.FC<DimensionInfoProps> = ({
  surfacePoints,
  selectedWall,
  selectedCorner,
  mode
}) => {
  const { t } = useTranslation();

  // Calculate total surface area
  const totalArea = React.useMemo(() => {
    if (surfacePoints.length === 0) return 0;
    return getSurfaceArea(surfacePoints) * 0.01 * 0.01; // Convert to square meters
  }, [surfacePoints]);

  // Calculate total perimeter
  const totalPerimeter = React.useMemo(() => {
    if (surfacePoints.length === 0) return 0;
    
    let perimeter = 0;
    surfacePoints.forEach(surfacePoint => {
      for (let i = 0; i < surfacePoint.length; i++) {
        const currentPoint = surfacePoint[i];
        const nextPoint = surfacePoint[(i + 1) % surfacePoint.length];
        perimeter += getPointDistance(currentPoint, nextPoint);
      }
    });
    
    return perimeter * 0.01; // Convert to meters
  }, [surfacePoints]);

  // Calculate selected wall length
  const wallLength = React.useMemo(() => {
    if (!selectedWall || !surfacePoints[selectedWall.surfaceIndex]) return null;

    const selectedSurfacePoints = surfacePoints[selectedWall.surfaceIndex];
    const pointA = selectedSurfacePoints[selectedWall.wallIndex];
    const pointB = selectedSurfacePoints[(selectedWall.wallIndex + 1) % selectedSurfacePoints.length];
    
    return getPointDistance(pointA, pointB) * 0.01; // Convert to meters
  }, [surfacePoints, selectedWall]);

  // Calculate selected corner angle
  const cornerAngle = React.useMemo(() => {
    if (!selectedCorner || !surfacePoints[selectedCorner.surfaceIndex]) return null;

    const selectedSurfacePoints = surfacePoints[selectedCorner.surfaceIndex];
    const pointCount = selectedSurfacePoints.length;
    
    if (pointCount < 3) return null;
    
    const prevIndex = (selectedCorner.wallIndex - 1 + pointCount) % pointCount;
    const currIndex = selectedCorner.wallIndex;
    const nextIndex = (selectedCorner.wallIndex + 1) % pointCount;

    const prevPoint = selectedSurfacePoints[prevIndex];
    const currPoint = selectedSurfacePoints[currIndex];
    const nextPoint = selectedSurfacePoints[nextIndex];

    const angles = getAngles([prevPoint, currPoint, nextPoint]);
    return angles.interiorAngleMagnitudeDeg;
  }, [surfacePoints, selectedCorner]);

  if (mode === 'preview') {
    return null; // Don't show in preview mode
  }

  return (
    <div className="absolute z-10 bottom-2 left-2 bg-white border border-gray-200 rounded-lg p-2 md:p-3 shadow-lg text-xs md:text-sm max-w-48 md:max-w-56">
      <div className="text-xs font-semibold text-gray-500 mb-1 md:mb-2 border-b border-gray-100 pb-1">
        DIMENSIONS
      </div>
      <div className="space-y-1">
        {/* Surface Area */}
        <div className="flex items-center justify-between min-w-40 md:min-w-44">
          <span className="font-medium text-gray-700">{t('planner.measurements.surfaceArea') || 'Surface Area'}:</span>
          <span className="text-gray-900 font-mono text-xs md:text-sm">
            {totalArea.toFixed(2)} m²
          </span>
        </div>
        
        {/* Perimeter */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">{t('planner.measurements.perimeter') || 'Perimeter'}:</span>
          <span className="text-gray-900 font-mono text-xs md:text-sm">
            {totalPerimeter.toFixed(2)} m
          </span>
        </div>
        
        {/* Wall Length */}
        {wallLength !== null && mode === 'edit-wall' && (
          <div className="flex items-center justify-between border-t border-gray-200 pt-1 mt-1">
            <span className="font-medium text-blue-700">{t('planner.measurements.selectedWall') || 'Selected Wall'}:</span>
            <span className="text-blue-900 font-mono text-xs md:text-sm">
              {wallLength.toFixed(3)} m
            </span>
          </div>
        )}
        
        {/* Corner Angle */}
        {cornerAngle !== null && mode === 'edit-corner' && (
          <div className="flex items-center justify-between border-t border-gray-200 pt-1 mt-1">
            <span className="font-medium text-green-700">{t('planner.measurements.cornerAngle') || 'Corner Angle'}:</span>
            <span className="text-green-900 font-mono text-xs md:text-sm">
              {cornerAngle.toFixed(1)}°
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
