import React, { useMemo } from "react";
import { Pattern, Point } from "../types";
import { Line, Text, Group } from "react-konva";

interface PatternDistanceProps {
  pointA: Point
  pointB: Point
  pattern: Pattern
}

interface UniqueDistance {
  position: [Point, Point]
  value: number
  orientation: 'top' | 'bottom' | 'left' | 'right'
}

type Orientation = UniqueDistance['orientation'];

const ORIENTATION_MAP: Record<Orientation, Orientation> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left'
} as const;

const getLineDirection = (pointA: Point, pointB: Point): Orientation | undefined => {
  const [x1, y1] = pointA;
  const [x2, y2] = pointB;
  
  if (y1 === y2) {
    return x1 < x2 ? 'top' : 'bottom';
  }
  if (x1 === x2) {
    return y1 < y2 ? 'right' : 'left';
  }
  return undefined;
};

const calculateDistance = (
  midPoint: Point,
  pattern: Pattern,
  point: Point,
  orientation: Orientation,
  patternWidth: number,
  patternHeight: number
): number => {
  if (orientation === 'top' || orientation === 'bottom') {
    const relativeY = (midPoint[1] - pattern.y) % patternHeight;
    const normalizedY = relativeY < 0 ? relativeY + patternHeight : relativeY;
    const tileY = orientation === 'top' 
      ? Math.min(point[1] * pattern.scale, patternHeight)
      : Math.max(point[1] * pattern.scale, 0);
    
    const distance = Math.abs(normalizedY - tileY);
    return normalizedY > tileY && orientation === 'top' || normalizedY < tileY && orientation === 'bottom'
      ? patternHeight - distance 
      : distance;
  } else {
    const relativeX = (midPoint[0] - pattern.x) % patternWidth;
    const normalizedX = relativeX < 0 ? relativeX + patternWidth : relativeX;
    const tileX = orientation === 'left'
      ? Math.min(point[0] * pattern.scale, patternWidth)
      : Math.max(point[0] * pattern.scale, 0);
    
    const distance = Math.abs(normalizedX - tileX);
    return normalizedX > tileX && orientation === 'left' || normalizedX < tileX && orientation === 'right'
      ? patternWidth - distance 
      : distance;
  }
};

const calculatePosition = (
  midPoint: Point,
  value: number,
  orientation: Orientation,
  lineIndex: number,
  lineGap: number,
  offset: number
): [Point, Point] => {
  const baseX = midPoint[0] + lineIndex * lineGap - offset;
  const baseY = midPoint[1] + lineIndex * lineGap - offset;
  
  switch (orientation) {
    case 'top':
      return [[baseX, midPoint[1]], [baseX, midPoint[1] + value]];
    case 'bottom':
      return [[baseX, midPoint[1]], [baseX, midPoint[1] - value]];
    case 'left':
      return [[midPoint[0], baseY], [midPoint[0] + value, baseY]];
    case 'right':
      return [[midPoint[0], baseY], [midPoint[0] - value, baseY]];
  }
};

const TextComponent: React.FC<{
  position: [Point, Point];
  text: string;
  orientation: Orientation;
}> = ({ position, text, orientation }) => {
  const textConfig = useMemo(() => {
    const baseConfig = {
      text,
      fontSize: 8,
      fill: "red",
      align: "center" as const,
      verticalAlign: "middle" as const,
      offsetX: 30,
      offsetY: 7
    };

    switch (orientation) {
      case 'top':
        return {
          ...baseConfig,
          x: position[1][0] + 2,
          y: position[1][1],
          rotation: -90
        };
      case 'bottom':
        return {
          ...baseConfig,
          x: position[1][0] - 3,
          y: position[1][1],
          rotation: 90
        };
      case 'left':
        return {
          ...baseConfig,
          x: position[1][0] + text.length * 6,
          y: position[1][1] + 3,
          rotation: 0
        };
      case 'right':
        return {
          ...baseConfig,
          x: position[1][0],
          y: position[1][1] + 3,
          rotation: 0
        };
    }
  }, [position, text, orientation]);

  return <Text {...textConfig} />;
};

export const PatternDistance: React.FC<PatternDistanceProps> = ({ pointA, pointB, pattern }) => {
  const uniqueDistances = useMemo(() => {
    const lineOrientation = getLineDirection(pointA, pointB);
    if (!lineOrientation) return [];

    const midPoint: Point = [
      (pointA[0] + pointB[0]) / 2,
      (pointA[1] + pointB[1]) / 2
    ];

    const oppositeOrientation = ORIENTATION_MAP[lineOrientation];
    const numTiles = pattern.tiles.length;
    const lineGap = 5;
    const offset = Math.floor(numTiles / 2) * lineGap;
    const height = pattern.height * pattern.scale;
    const width = pattern.width * pattern.scale;

    const distances: UniqueDistance[] = [];
    const seenValues = new Set<string>();

    for (let i = 0; i < numTiles; i++) {
      const tile = pattern.tiles[i];
      
      for (let idx = 0; idx < tile.points.length; idx++) {
        const point = tile.points[idx];
        const nxt = tile.points[(idx + 1) % tile.points.length];
        const tileOrientation = getLineDirection(point, nxt);
        
        if (tileOrientation !== oppositeOrientation) continue;

        const value = calculateDistance(midPoint, pattern, point, lineOrientation, width, height);
        const key = `${value}-${lineOrientation}`;
        
        if (seenValues.has(key)) continue;
        seenValues.add(key);

        const position = calculatePosition(midPoint, value, lineOrientation, i, lineGap, offset);
        distances.push({ position, value, orientation: lineOrientation });
      }
    }

    return distances;
  }, [pointA, pointB, pattern]);

  if (uniqueDistances.length === 0) return null;

  return (
    <Group>
      {uniqueDistances.map(({ position, value, orientation }, index) => {
        const text = `${(value * 10).toFixed(0)} mm`;
        return (
          <Group key={index}>
            <Line
              points={position.flat()}
              stroke="red"
              strokeWidth={1}
            />
            <TextComponent 
              position={position} 
              text={text} 
              orientation={orientation} 
            />
          </Group>
        );
      })}
    </Group>
  );
}

//