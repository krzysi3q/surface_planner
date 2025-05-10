import Shape, { Point as ShapePoint } from '@doodle3d/clipper-js';

import { Point } from './types';

const pathPointToShapePoint = (point: Point): ShapePoint => ({
  X: point[0],
  Y: point[1],
});

const shapePointToPathPoint = (point: ShapePoint): Point => [point.X, point.Y];

export const unionSurfaces = (pointsA: Point[], pointsB: Point[]): Point[][] => {
  const shapeA = new Shape([pointsA.map(pathPointToShapePoint)], true);
  const shapeB = new Shape([pointsB.map(pathPointToShapePoint)], true);

  const unionShape = shapeA.union(shapeB);
  return unionShape.paths.map(p => p.map(shapePointToPathPoint));
}

export const subtractSurfaces = (pointsA: Point[], pointsB: Point[]): Point[][] => {
  const shapeA = new Shape([pointsA.map(pathPointToShapePoint)], true);
  const shapeB = new Shape([pointsB.map(pathPointToShapePoint)], true);

  const subtractedShape = shapeA.difference(shapeB);
  return subtractedShape.paths.map(p => p.map(shapePointToPathPoint));
}

export const pointInSurface = (point: Point, surface: Point[]): boolean => {
  const shape = new Shape([surface.map(pathPointToShapePoint)], true);
  return shape.pointInShape(pathPointToShapePoint(point));
} 

export const pointInPath = (point: Point, path: Point[]): boolean => {
  const isPointOnLine = (p: Point, a: Point, b: Point): boolean => {
    const crossProduct = (p[1] - a[1]) * (b[0] - a[0]) - (p[0] - a[0]) * (b[1] - a[1]);
    if (Math.abs(crossProduct) > Number.EPSILON) return false;

    const dotProduct = (p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1]);
    if (dotProduct < 0) return false;

    const squaredLengthBA = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2;
    if (dotProduct > squaredLengthBA) return false;

    return true;
  };

  for (let i = 0; i < path.length; i++) {
    const a = path[i];
    const b = path[(i + 1) % path.length]; // Loop back to the start for closed paths
    if (isPointOnLine(point, a, b)) return true;
  }

  return false;
};


export const doLinesIntersect = (a1: Point, a2: Point, b1: Point, b2: Point): boolean => {
  const orientation = (p: Point, q: Point, r: Point): number => {
    const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
    if (Math.abs(val) < Number.EPSILON) return 0; // Collinear
    return val > 0 ? 1 : 2; // Clockwise or Counterclockwise
  };

  const o1 = orientation(a1, a2, b1);
  const o2 = orientation(a1, a2, b2);
  const o3 = orientation(b1, b2, a1);
  const o4 = orientation(b1, b2, a2);

  // General case: lines intersect if orientations differ
  if (o1 !== o2 && o3 !== o4) return true;

  // Special cases: check if points are collinear and overlap
  const onSegment = (p: Point, q: Point, r: Point): boolean => {
    return (
      Math.min(p[0], r[0]) <= q[0] &&
      q[0] <= Math.max(p[0], r[0]) &&
      Math.min(p[1], r[1]) <= q[1] &&
      q[1] <= Math.max(p[1], r[1])
    );
  };

  if (o1 === 0 && onSegment(a1, b1, a2)) return true;
  if (o2 === 0 && onSegment(a1, b2, a2)) return true;
  if (o3 === 0 && onSegment(b1, a1, b2)) return true;
  if (o4 === 0 && onSegment(b1, a2, b2)) return true;

  return false;
};

export const isSurfaceIntersecting = (surface: Point[]): boolean => {
  for (let i = 0; i < surface.length; i++) {
    const a1 = surface[i];
    const a2 = surface[(i + 1) % surface.length]; // Loop back for closed paths

    for (let j = i + 1; j < surface.length; j++) {
      const b1 = surface[j];
      const b2 = surface[(j + 1) % surface.length];

      // Skip if the lines are connected at their endpoints
      if (
        (a1[0] === b1[0] && a1[1] === b1[1]) ||
        (a2[0] === b2[0] && a2[1] === b2[1]) ||
        (a1[0] === b2[0] && a1[1] === b2[1]) ||
        (a2[0] === b1[0] && a2[1] === b1[1])
      ) {
        continue;
      }

      if (doLinesIntersect(a1, a2, b1, b2)) return true;
    }
  }

  return false;
};