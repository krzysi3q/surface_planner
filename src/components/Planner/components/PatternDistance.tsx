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
  orientation: Orientation
): number => {
  // Quantize scale so tile cell size becomes integer pixels to match rasterized pattern repetition.
  const s = pattern.scale;
  const imgW = (pattern.rawImageWidth ?? pattern.width);
  const imgH = (pattern.rawImageHeight ?? pattern.height);
  const cellW = imgW * s;
  const cellH = imgH * s;
  // Edge-based replication approach avoids cumulative drift from repeated modulo on large offsets / fractional cells
  const midX = midPoint[0];
  const midY = midPoint[1];

  if (orientation === 'top' || orientation === 'bottom') {
    const edgeLocalY = point[1]; // unscaled
    const baseEdgeY = pattern.y + edgeLocalY * s; // world coordinate of one instance edge
    if (cellH === 0) return 0;
    if (orientation === 'top') { // distance in +y direction
      const k = Math.ceil((midY - baseEdgeY) / cellH);
      const worldEdge = baseEdgeY + k * cellH;
      let dist = worldEdge - midY;
      if (dist < 0) dist += cellH; // safety against FP
      return dist;
    } else { // bottom: distance in -y direction
      const k = Math.floor((midY - baseEdgeY) / cellH);
      const worldEdge = baseEdgeY + k * cellH;
      let dist = midY - worldEdge;
      if (dist < 0) dist += cellH;
      return dist;
    }
  } else {
    const edgeLocalX = point[0];
    const baseEdgeX = pattern.x + edgeLocalX * s;
    if (cellW === 0) return 0;
    if (orientation === 'left') { // distance in +x
      const k = Math.ceil((midX - baseEdgeX) / cellW);
      const worldEdge = baseEdgeX + k * cellW;
      let dist = worldEdge - midX;
      if (dist < 0) dist += cellW;
      return dist;
    } else { // right: distance in -x
      const k = Math.floor((midX - baseEdgeX) / cellW);
      const worldEdge = baseEdgeX + k * cellW;
      let dist = midX - worldEdge;
      if (dist < 0) dist += cellW;
      return dist;
    }
  }
};

const calculatePosition = (
  value: number,
  orientation: Orientation,
  lineIndex: number,
  lineGap: number,
  offset: number,
  pointA: Point,
  pointB: Point
): [Point, Point] => {
  // Calculate position at 1/3 of wall length
  const oneThirdX = pointA[0] + (pointB[0] - pointA[0]) / 3;
  const oneThirdY = pointA[1] + (pointB[1] - pointA[1]) / 3;
  
  const baseX = oneThirdX + lineIndex * lineGap - offset;
  const baseY = oneThirdY + lineIndex * lineGap - offset;
  
  switch (orientation) {
    case 'top':
      return [[baseX, oneThirdY], [baseX, oneThirdY + value]];
    case 'bottom':
      return [[baseX, oneThirdY], [baseX, oneThirdY - value]];
    case 'left':
      return [[oneThirdX, baseY], [oneThirdX + value, baseY]];
    case 'right':
      return [[oneThirdX, baseY], [oneThirdX - value, baseY]];
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
    const lineGap = 6;
    const offset = Math.floor(numTiles / 2) * lineGap;
  // Cell size in screen space (may be fractional). width/height already define the base pattern image size.
  // No padding adjustments: distances measured relative to raw pattern origin used for fillPatternX/Y

    const distances: UniqueDistance[] = [];
    const seenValues = new Set<string>();

    for (let i = 0; i < numTiles; i++) {
      const tile = pattern.tiles[i];
      
      for (let idx = 0; idx < tile.points.length; idx++) {
        const point = tile.points[idx];
        const nxt = tile.points[(idx + 1) % tile.points.length];
        const tileOrientation = getLineDirection(point, nxt);
        
        if (tileOrientation !== oppositeOrientation) continue;

        const value = Math.round(calculateDistance(midPoint, pattern, point, lineOrientation));

        if (value <= 0) continue;
        
        const key = `${value}-${lineOrientation}`;
        
        if (seenValues.has(key)) continue;
        seenValues.add(key);

        const position = calculatePosition(value, lineOrientation, i, lineGap, offset, pointA, pointB);
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
        const tick = 5; // half length of perpendicular ticks
        const [p0, p1] = position;
        const vertical = p0[0] === p1[0];
        const tickLines: number[][] = vertical
          ? [[p1[0] - tick, p1[1], p1[0] + tick, p1[1]]] // horizontal tick at other end
          : [[p1[0], p1[1] - tick, p1[0], p1[1] + tick]]; // vertical tick at other end
        return (
          <Group key={index}>
            <Line
              points={position.flat()}
              stroke="red"
              strokeWidth={1}
            />
            {tickLines.map((pts, i) => (
              <Line key={i} points={pts} stroke="red" strokeWidth={1} />
            ))}
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