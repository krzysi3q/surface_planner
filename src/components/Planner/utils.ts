import Shape, { Point as ShapePoint } from '@doodle3d/clipper-js';

import { Pattern, Point } from './types';

const pathPointToShapePoint = (point: Point): ShapePoint => ({
  X: point[0],
  Y: point[1],
});

const shapePointToPathPoint = (point: ShapePoint): Point => [point.X, point.Y];
const pathPointsToShape = (points: Point[]): Shape => new Shape([points.map(pathPointToShapePoint)], true);

export const unionSurfaces = (pointsA: Point[], pointsB: Point[]): Point[][] => {
  const shapeA = pathPointsToShape(pointsA)
  const shapeB = pathPointsToShape(pointsB);

  const unionShape = shapeA.union(shapeB);
  return unionShape.paths.map(p => p.map(shapePointToPathPoint));
}

export const subtractSurfaces = (pointsA: Point[], pointsB: Point[]): Point[][] => {
  const shapeA = pathPointsToShape(pointsA)
  const shapeB = pathPointsToShape(pointsB);

  const subtractedShape = shapeA.difference(shapeB);
  return subtractedShape.paths.map(p => p.map(shapePointToPathPoint));
}

export const pointInSurface = (point: Point, surface: Point[]): boolean => {
  const shape = pathPointsToShape(surface);
  return shape.pointInShape(pathPointToShapePoint(point));
} 

export const getSurfaceArea = (surface: Point[]): number => {
  if (surface.length < 3) return 0; // Not a valid polygon
  const shape = pathPointsToShape(surface);
  return Math.abs(shape.totalArea());
}

export const doSurfacesIntersect = (surfaceA: Point[], surfaceB: Point[]): boolean => {
  // If surfaces have less than 3 points, they're not valid polygons
  if (surfaceA.length < 3 || surfaceB.length < 3) {
    return false;
  }

  // Fast bounding box check first - if bounding boxes don't overlap, surfaces can't intersect
  const boxA = getBoundingBox(surfaceA);
  const boxB = getBoundingBox(surfaceB);
  
  // Check if bounding boxes overlap
  if (boxA.x + boxA.width < boxB.x || 
      boxB.x + boxB.width < boxA.x || 
      boxA.y + boxA.height < boxB.y || 
      boxB.y + boxB.height < boxA.y) {
    return false;
  }
  
  // Use clipper-js for precise intersection detection
  try {
    const shapeA = pathPointsToShape(surfaceA);
    const shapeB = pathPointsToShape(surfaceB);
    
    // Calculate intersection - if result has any paths, surfaces intersect
    const intersection = shapeA.intersect(shapeB);
    return intersection.paths.length > 0 && intersection.totalArea() > Number.EPSILON;
  } catch (error) {
    // Fallback to point-in-polygon and edge intersection checks
    console.warn('Clipper-js intersection failed, using fallback method:', error);
    return doSurfacesIntersectFallback(surfaceA, surfaceB);
  }
}

export const pointInPath = (point: Point, path: Point[]): boolean => {
  const shape = pathPointsToShape(path);
  return shape.pointInPath(0, pathPointToShapePoint(point));
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

export const createPatternCanvas = () => {
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

export const getAngles = (points: [Point, Point, Point]) => {
    const [prev, pt, nxt] = points;
    // Calculate angles of vectors pt->prev and pt->nxt from positive x-axis
    const angleRadPtPrev = Math.atan2(prev[1] - pt[1], prev[0] - pt[0]);
    const angleRadPtNxt = Math.atan2(nxt[1] - pt[1], nxt[0] - pt[0]);

    // Calculate interior angle assuming CCW polygon points.
    // This is the angle swept CCW from vector (pt->nxt) to vector (pt->prev).
    let interiorAngleRad = angleRadPtPrev - angleRadPtNxt;
    // Normalize to [0, 2*PI)
    if (interiorAngleRad < 0) {
      interiorAngleRad += 2 * Math.PI;
    }
    
    // This is the magnitude of the interior angle in degrees.
    const interiorAngleMagnitudeDeg = Math.round(((interiorAngleRad * 180) / Math.PI) * 1000) / 1000;
    return {
      angleRadPtPrev,
      angleRadPtNxt,
      interiorAngleMagnitudeDeg,
    }
  }

export const saveToLocalStorage = (key: string, value: unknown) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error("Error saving to localStorage", error);
  }
};
export const loadFromLocalStorage = (key: string) => {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) return undefined;
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error("Error loading from localStorage", error);
    return undefined;
  }
}
export const removeFromLocalStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from localStorage", error);
  }
}

export const getBoundingBox = (points: Point[]): { x: number, y: number, width: number, height: number} => {
  const xs = points.map(point => point[0]);
  const ys = points.map(point => point[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

export const getCircumscribedCircle = (points: Point[]): { center: Point, radius: number } => {
  // Handle edge cases
  if (points.length < 3) {
    throw new Error('At least 3 points are required to compute a circumscribed circle');
  }
  
  if (points.length === 3) {
    // For exactly 3 points, calculate exact circumcircle
    return getTriangleCircumcircle(points[0], points[1], points[2]);
  }
  
  // For more points, find the convex hull first to reduce computation
  // Then calculate the minimum enclosing circle
  const { center, radius } = computeMinimumEnclosingCircle(points);
  return { center, radius };
};

// Calculate circumcircle of a triangle
const getTriangleCircumcircle = (a: Point, b: Point, c: Point): { center: Point, radius: number } => {
  // Use a direct formula approach which is more numerically stable
  // Calculate twice the signed area of the triangle
  const D = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  
  // Check if points are collinear (D is close to 0)
  if (Math.abs(D) < Number.EPSILON) {
    // Handle collinear case by creating a bounding circle
    const midpoint = [
      (Math.min(a[0], b[0], c[0]) + Math.max(a[0], b[0], c[0])) / 2,
      (Math.min(a[1], b[1], c[1]) + Math.max(a[1], b[1], c[1])) / 2
    ] as Point;
    
    const radius = Math.max(
      Math.sqrt(Math.pow(midpoint[0] - a[0], 2) + Math.pow(midpoint[1] - a[1], 2)),
      Math.sqrt(Math.pow(midpoint[0] - b[0], 2) + Math.pow(midpoint[1] - b[1], 2)),
      Math.sqrt(Math.pow(midpoint[0] - c[0], 2) + Math.pow(midpoint[1] - c[1], 2))
    );
    
    return { center: midpoint, radius };
  }
  
  // Calculate squared distances
  const a2 = a[0] * a[0] + a[1] * a[1];
  const b2 = b[0] * b[0] + b[1] * b[1];
  const c2 = c[0] * c[0] + c[1] * c[1];
  
  // Calculate center coordinates
  const centerX = (a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / D;
  const centerY = (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / D;
  
  // Calculate radius as distance from center to any point
  const radius = Math.sqrt(
    Math.pow(centerX - a[0], 2) + Math.pow(centerY - a[1], 2)
  );
  
  return { center: [centerX, centerY], radius };
};

// Implementation of Welzl's algorithm for minimum enclosing circle
const computeMinimumEnclosingCircle = (points: Point[]): { center: Point, radius: number } => {
  // Clone points to avoid modifying the original array
  const shuffledPoints = [...points].sort(() => Math.random() - 0.5);
  
  // Start with an invalid circle
  let circle = { center: [0, 0] as Point, radius: 0 };
  
  // Find a valid circle that contains all points
  for (let i = 0; i < shuffledPoints.length; i++) {
    const p = shuffledPoints[i];
    
    if (!isPointInCircle(p, circle)) {
      circle = { center: p, radius: 0 };
      
      for (let j = 0; j < i; j++) {
        const q = shuffledPoints[j];
        
        if (!isPointInCircle(q, circle)) {
          circle = makeCircleFromTwoPoints(p, q);
          
          for (let k = 0; k < j; k++) {
            const r = shuffledPoints[k];
            
            if (!isPointInCircle(r, circle)) {
              circle = getTriangleCircumcircle(p, q, r);
            }
          }
        }
      }
    }
  }
  
  return circle;
};

// Helper function to check if a point is inside a circle
const isPointInCircle = (point: Point, circle: { center: Point, radius: number }): boolean => {
  if (circle.radius === 0) return false;
  
  const dist = Math.sqrt(
    Math.pow(point[0] - circle.center[0], 2) + 
    Math.pow(point[1] - circle.center[1], 2)
  );
  
  return dist <= circle.radius * (1 + Number.EPSILON);
};

// Create a circle from two points (diameter)
const makeCircleFromTwoPoints = (a: Point, b: Point): { center: Point, radius: number } => {
  const center: Point = [
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2
  ];
  
  const radius = Math.sqrt(
    Math.pow(a[0] - center[0], 2) + 
    Math.pow(a[1] - center[1], 2)
  );
  
  return { center, radius };
};

// rotate a shape around its center
export const rotateShape = (points: Point[], angle: number, center: Point): Point[] => {
  
  const centerX = center[0];
  const centerY = center[1];
  angle = (angle * Math.PI) / 180; // Convert to radians

  return points.map(point => {
    const x = point[0] - centerX;
    const y = point[1] - centerY;
    return [
      x * Math.cos(angle) - y * Math.sin(angle) + centerX,
      x * Math.sin(angle) + y * Math.cos(angle) + centerY
    ];
  });
}

export const moveToTopLeft = (points: Point[]): Point[] => moveTo(points, 0, 0);

export const moveTo = (points: Point[], x: number, y: number): Point[] => {
  const minX = Math.min(...points.map(point => point[0]));
  const minY = Math.min(...points.map(point => point[1]));
  return points.map(point => [point[0] - minX + x, point[1] - minY + y]);
}

export const drawPattern = (pattern: Pattern) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = pattern.width;
  canvas.height = pattern.height;
  ctx.fillStyle = pattern.gapColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = pattern.gapColor;
  pattern.tiles.forEach(tile => {
    ctx.fillStyle = tile.color;
    ctx.beginPath();
    tile.points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point[0], point[1]);
      } else {
        ctx.lineTo(point[0], point[1]);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
  return canvas;
}

// Fallback method for surface intersection detection without clipper-js
const doSurfacesIntersectFallback = (surfaceA: Point[], surfaceB: Point[]): boolean => {
  // Check if any point of surfaceA is inside surfaceB
  for (const point of surfaceA) {
    if (pointInSurface(point, surfaceB)) {
      return true;
    }
  }
  
  // Check if any point of surfaceB is inside surfaceA
  for (const point of surfaceB) {
    if (pointInSurface(point, surfaceA)) {
      return true;
    }
  }
  
  // Check if any edge of surfaceA intersects with any edge of surfaceB
  for (let i = 0; i < surfaceA.length; i++) {
    const a1 = surfaceA[i];
    const a2 = surfaceA[(i + 1) % surfaceA.length];
    
    for (let j = 0; j < surfaceB.length; j++) {
      const b1 = surfaceB[j];
      const b2 = surfaceB[(j + 1) % surfaceB.length];
      
      if (doLinesIntersect(a1, a2, b1, b2)) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Checks if two surfaces are completely separate (optimized check)
 * Returns true if surfaces definitely don't intersect, false if they might intersect
 */
export const areSurfacesDisjoint = (surfaceA: Point[], surfaceB: Point[]): boolean => {
  // Fast bounding box check
  const boxA = getBoundingBox(surfaceA);
  const boxB = getBoundingBox(surfaceB);
  
  // If bounding boxes don't overlap, surfaces are definitely disjoint
  return (boxA.x + boxA.width < boxB.x || 
          boxB.x + boxB.width < boxA.x || 
          boxA.y + boxA.height < boxB.y || 
          boxB.y + boxB.height < boxA.y);
};

/**
 * Calculates the intersection area between two surfaces
 * Returns 0 if surfaces don't intersect
 */
export const getSurfaceIntersectionArea = (surfaceA: Point[], surfaceB: Point[]): number => {
  // Quick disjoint check
  if (areSurfacesDisjoint(surfaceA, surfaceB)) {
    return 0;
  }
  
  // If surfaces have less than 3 points, they're not valid polygons
  if (surfaceA.length < 3 || surfaceB.length < 3) {
    return 0;
  }
  
  try {
    const shapeA = pathPointsToShape(surfaceA);
    const shapeB = pathPointsToShape(surfaceB);
    
    const intersection = shapeA.intersect(shapeB);
    return intersection.totalArea();
  } catch (error) {
    console.warn('Clipper-js intersection area calculation failed:', error);
    return 0;
  }
};