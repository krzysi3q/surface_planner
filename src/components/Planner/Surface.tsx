import React, { useMemo } from "react";
import { Point } from "./types";
import { Group, Line } from "react-konva";

interface SurfaceProps { 
  points: Point[];
  id: string;
}

const createPatternCanvas = () => {
  const size = 8;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.strokeStyle = 'rgba(100,100,100,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.lineTo(size, 0);
    ctx.stroke();
  }
  const image = new Image();
  image.src = canvas.toDataURL();
  return image;
};

const patternCanvas = createPatternCanvas();


const getOffsetPolygon = (points: Point[], hatchOffset: number) => {
  const pts = points;
  const result: [number, number][] = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const [x, y] = pts[i];
    // compute normals of adjacent edges
    const [xPrev, yPrev] = pts[(i - 1 + n) % n];
    const [xNext, yNext] = pts[(i + 1) % n];
    // edge vectors
    const vx1 = x - xPrev, vy1 = y - yPrev;
    const vx2 = xNext - x,   vy2 = yNext - y;
    // normals
    const len1 = Math.hypot(vx1, vy1) || 1;
    const len2 = Math.hypot(vx2, vy2) || 1;
    const nx1 = vy1 / len1, ny1 = -vx1 / len1;
    const nx2 = vy2 / len2, ny2 = -vx2 / len2;
    // average normal
    const nx = (nx1 + nx2) / 2;
    const ny = (ny1 + ny2) / 2;
    const norm = Math.hypot(nx, ny) || 1;
    result.push([x + (nx / norm) * hatchOffset, y + (ny / norm) * hatchOffset]);
  }
  return result;
}

const hatchOffset = 25;

export const Surface: React.FC<SurfaceProps> = ({ points, id}) => {
  // prepare offset polygon for pattern band
  const offsetPolygon = useMemo(() => getOffsetPolygon(points, hatchOffset), [points]);

  return (
    <Group>
      <Line
        key={`band-${id}`}
        points={offsetPolygon.flat()}
        closed
        fillPatternImage={patternCanvas}
        fillPatternRepeat="repeat"
        fillPatternRotation={Math.PI / 4}
        fillRule="evenodd"
      />
      <Line
        key={`mask-${id}`}
        points={points.flat()}
        closed
        fill="#fff"
        stroke="black"
        strokeWidth={1}
      />
    </Group>
  );
};