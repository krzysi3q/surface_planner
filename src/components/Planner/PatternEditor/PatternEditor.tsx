import React, { useState } from "react";
import { classMerge } from "@/utils/classMerge";

import { ToolbarButton } from "../../ToolbarButton";
import { CircleCheck, Copy, Eye, Hexagon, Pentagon, RectangleHorizontal, RectangleVertical, RotateCcw, RulerDimensionLine, Square, Trash2, Triangle, X } from "lucide-react";

import { Pattern, Point, TileType } from "../types"
import { getBoundingBox, rotateShape, moveTo, getAngles, getCircumscribedCircle, drawPattern } from "../utils"
import { setNoneCursor, setMoveCursor, setEwResizeCursor, setNsResizeCursor, removeCustomCursor } from "../domUtils"


import { TileEventData } from "./Tile";
import { PatternCanvas } from "./PatternCanvas"
import Konva from "konva";
import { ResizePlanner } from "../ResizePlanner";
import { PatternButton } from "./PatternButton";

import readyPatternsJson from "./ready_patterns.json"


const READY_TO_USE_PATTERNS: Pattern[] = readyPatternsJson as Pattern[];

interface PatternEditorProps {
  className?: string;
  onClose?: () => void;
  value?: Pattern;
  onSubmit?: (pattern: Pattern) => void;
}

const getEquilateralTrianglePoints = (sideLength: number): Point[] => {
  const height = Math.sqrt(3) / 2 * sideLength;
  return [
    [0, 0],
    [sideLength, 0],
    [sideLength / 2, height]
  ];
}

const getSquarePoints = (sideLength: number): Point[] => {
  return [
    [0, 0],
    [sideLength, 0],
    [sideLength, sideLength],
    [0, sideLength]
  ];
}

export const PatternEditor: React.FC<PatternEditorProps> = ({className, value, onClose, onSubmit}) => {

  const [pattern, setPattern] = useState<Pattern>(value || {
    tiles: [],
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    tilesGap: 0,
    scale: 0.004,
    gapColor: "#000000"
  });

  const [edited, setEdited] = useState<string | null>(null)

  const addTriangle = () => {
    setPattern(prev => {
      const items = prev.tiles.length
      const trianglePoints = getEquilateralTrianglePoints(100);
      const points = moveTo(trianglePoints, items * 10, items * 10);
      const { center } = getCircumscribedCircle(points);
      const newTile: TileType = {
        id: self.crypto.randomUUID(),
        points: points,
        color: "#d6d6d6",
        type: "triangle",
        metadata: {
          angle: 0,
          centerX: center[0],
          centerY: center[1],
        }
      };
      if (prev.tiles.length === 0) {
        const { width, height } = getBoundingBox(trianglePoints);
        return {
          ...prev,
          tiles: [newTile],
          width,
          height,
        }
      }

      return {
        ...prev,
        tiles: [...prev.tiles, newTile]
      }
    });
  }

  const addRectangleVertical = () => {
    setPattern(prev => {
      const items = prev.tiles.length
      const points = moveTo([
        [0, 0],
        [50, 0],
        [50, 200],
        [0, 200]
      ], items * 10, items * 10);
      const { center } = getCircumscribedCircle(points);
      const newTile: TileType = {
        id: self.crypto.randomUUID(),
        type: "rectangle",
        points: points,
        color: "#d6d6d6",
        metadata: {
          angle: 0,
          centerX: center[0],
          centerY: center[1],
        }
      };
      if (items === 0) {
        const { width, height } = getBoundingBox(newTile.points);
        return {
          ...prev,
          tiles: [newTile],
          width,
          height,
        }
      }
      return {
        ...prev,
        tiles: [...prev.tiles, newTile]
      }
    });
  }

  const addRectangleHorizontal = () => {
    setPattern(prev => {
      const items = prev.tiles.length
      const points = moveTo([
        [0, 0],
        [200, 0],
        [200, 50],
        [0, 50]
      ], items * 10, items * 10);
      const { center } = getCircumscribedCircle(points);
      const newTile: TileType = {
        id: self.crypto.randomUUID(),
        type: "rectangle",
        points: points,
        color: "#d6d6d6",
        metadata: {
          angle: 0,
          centerX: center[0],
          centerY: center[1],
        }
      };
      if (items === 0) {
        const { width, height } = getBoundingBox(newTile.points);
        return {
          ...prev,
          tiles: [newTile],
          width,
          height,
        }
      }
      return {
        ...prev,
        tiles: [...prev.tiles, newTile]
      }
    });
  }

  const addSquare = () => {
    setPattern(prev => {
      const items = prev.tiles.length
      
      const points = moveTo(getSquarePoints(100), items * 10, items * 10);
      const { center } = getCircumscribedCircle(points);
      const newTile: TileType = {
        id: self.crypto.randomUUID(),
        type: "square",
        points: points,
        color: "#d6d6d6",
        metadata: {
          angle: 0,
          centerX: center[0],
          centerY: center[1],
        }
      };
      if (items === 0) {
        const { width, height } = getBoundingBox(newTile.points);
        return {
          ...prev,
          tiles: [newTile],
          width,
          height,
        }
      }
      return {
        ...prev,
        tiles: [...prev.tiles, newTile]
      }
    });
  }

  const addPentagon = () => {
    setPattern(prev => {
      const items = prev.tiles.length
      const points = moveTo([
        [50, 0],
        [100, 38],
        [81, 98],
        [19, 98],
        [0, 38]
      ], items * 10, items * 10);
      const { center } = getCircumscribedCircle(points);
      const newTile: TileType = {
        id: self.crypto.randomUUID(),
        type: "pentagon",
        points: points,
        color: "#d6d6d6",
        metadata: {
          angle: 0,
          centerX: center[0],
          centerY: center[1],
        }
      };
      if (items === 0) {
        const { width, height } = getBoundingBox(newTile.points);
        return {
          ...prev,
          tiles: [newTile],
          width,
          height,
        }
      }
      return {
        ...prev,
        tiles: [...prev.tiles, newTile]
      }
    });
  }

  const addHexagon = () => {
    setPattern(prev => {
      const items = prev.tiles.length
      const points = moveTo([
        [50, 0],
        [100, 25],
        [100, 81],
        [50, 106],
        [0, 81],
        [0, 25]
      ], items * 10, items * 10);
      const { center } = getCircumscribedCircle(points);
      const newTile: TileType = {
        id: self.crypto.randomUUID(),
        type: "hexagon",
        points: points,
        color: "#d6d6d6",
        metadata: {
          angle: 0,
          centerX: center[0],
          centerY: center[1],
        }
      };
      if (items === 0) {
        const { width, height } = getBoundingBox(newTile.points);
        return {
          ...prev,
          tiles: [newTile],
          width,
          height,
        }
      }
      return {
        ...prev,
        tiles: [...prev.tiles, newTile]
      }
    });
  }

  const getPosition = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const position = stage?.getPointerPosition()
    return position || null;
  }

  const [activeData, setActiveData] = useState<{ tile: TileType, action: TileEventData['action'], isSecondary: boolean } | null>(null)
  const [rotateCursor, setRotateCursor] = useState<boolean>(false)
  const cursorRef = React.useRef<SVGSVGElement>(null);
  const initialPosition = React.useRef<{ x: number, y: number } | null>(null);
  const onBackgroundClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if(e.target === e.currentTarget) { 
      setEdited(null);
    }
  }

  const onTileClick = (e: Konva.KonvaEventObject<MouseEvent>, id: string) => {
    setMoveCursor(e);
    setEdited(id);
    const tileIndex = pattern.tiles.findIndex(tile => tile.id === id)
    setPattern(prev => {
      const tiles = [...prev.tiles];
      if (tileIndex > -1) {
        const tile = tiles[tileIndex];
        tiles.splice(tileIndex, 1);
        tiles.push(tile);
      }
      return {
        ...prev,
        tiles,
      }
    })
  }

  const onTileDown = (e: Konva.KonvaEventObject<MouseEvent>, data: TileEventData) => {
    const tile = pattern.tiles.find(t => t.id === data.id);
    const position = getPosition(e) 
    if (!tile || !position) return;
    initialPosition.current = position;
    setActiveData({ tile, action: data.action, isSecondary: data.isSecondary });
  }
  const onMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    setActiveData(null);
    setRotateCursor(false);
    removeCustomCursor(e);
  }
  const onTileEnter = (e: Konva.KonvaEventObject<MouseEvent>, data: TileEventData) => {
    if (!activeData && data.action === "rotate") {
      setRotateCursor(true);
      setNoneCursor(e);
      setTimeout(() => {
        if (cursorRef.current) {
          cursorRef.current.style = `left: ${e.evt.x}px; top: ${e.evt.y}px;`;
        }
      }, 10);
    }

    if (!activeData && data.action === "resize-ns") {
      setRotateCursor(false);
      setNsResizeCursor(e);
    }
    if (!activeData && data.action === "resize-ew") {
      setRotateCursor(false);
      setEwResizeCursor(e);
    }
    if (!activeData && data.action === "move") {
      setRotateCursor(false);
      setMoveCursor(e);
    }
  }
  const onTileLeave = (e: Konva.KonvaEventObject<MouseEvent>, data: TileEventData) => {
    if (!activeData && data.action === "rotate") {
      setRotateCursor(false);
      removeCustomCursor(e);
    }
    if (!activeData && (data.action === "resize-ns" || data.action === "resize-ew")) {
      setRotateCursor(false);
      removeCustomCursor(e);
    }

    if (!activeData && data.action === "move") {
      setRotateCursor(false);
      removeCustomCursor(e);
    }
  }
  const onMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (rotateCursor && cursorRef.current) {
      cursorRef.current.style = `left: ${e.evt.x}px; top: ${e.evt.y}px;`;
    }
    
    const position = getPosition(e) 
    if (position && activeData && activeData.action === 'rotate' && initialPosition.current) {
      const tile = activeData.tile;
      const canvasWidth = e.target.getStage()?.width() || 0;
      const canvasHeight = e.target.getStage()?.height() || 0;
      const centerX = tile.metadata.centerX + (canvasWidth/2 - pattern.width/2);
      const centerY = tile.metadata.centerY + (canvasHeight/2 - pattern.height/2);
      const { interiorAngleMagnitudeDeg } = getAngles([[position.x, position.y],  [centerX, centerY], [initialPosition.current.x, initialPosition.current.y]])
      const rotationAngle = Math.round(interiorAngleMagnitudeDeg)
      const angle = (tile.metadata.angle + rotationAngle) % 360;
      const newTile = {
        ...tile,
        points: rotateShape(tile.points, rotationAngle, [tile.metadata.centerX, tile.metadata.centerY]),
        metadata: {
          ...tile.metadata,
          angle,
        }
      }
      setPattern(prev => ({
        ...prev,
        tiles: prev.tiles.map(t => t.id === tile.id ? newTile : t)
      }))
    }

    // --- Resize shapes ---
    if (position && activeData && (activeData.action === 'resize-ns' || activeData.action === 'resize-ew') && initialPosition.current) {
      const tile = activeData.tile;
      const center = [tile.metadata.centerX, tile.metadata.centerY];
      const newTile = {
          ...tile,
          points: [] as Point[],
        };
      
      setPattern(prev => {
        const patternScale = prev.scale * 1000;
        
        if (activeData.tile.type === 'rectangle') {
          // For rectangles, use direct mouse movement distance with reduced sensitivity
          const dx = (position.x - initialPosition.current!.x) * 0.25;
          const dy = (position.y - initialPosition.current!.y) * 0.25;
          
          if (activeData.action === 'resize-ew') {
            // Horizontal resize - move left and right edges by dx/2 each
            const newPoints = tile.points.map<Point>(point => [
              point[0] < center[0] ? 
                Math.round((point[0] - dx/2) * patternScale) / patternScale : 
                Math.round((point[0] + dx/2) * patternScale) / patternScale,
              point[1]
            ]);
            newTile.points = newPoints;
          } else if (activeData.action === 'resize-ns') {
            // Vertical resize - move top and bottom edges by dy/2 each
            const newPoints = tile.points.map<Point>(point => [
              point[0],
              point[1] < center[1] ? 
                Math.round((point[1] + dy/2) * patternScale) / patternScale : 
                Math.round((point[1] - dy/2) * patternScale) / patternScale
            ]);
            newTile.points = newPoints;
          }
        } else {
          // For other shapes (triangle, pentagon, etc.), use proportional scaling based on distance from center
          let scale = 1;
          
          if (activeData.action === 'resize-ew') {
            // Use horizontal movement for uniform scaling with reduced sensitivity
            const initialDist = initialPosition.current!.x - center[0];
            const currentDist = center[0] + (position.x - center[0]) * 0.25;
            if (initialDist !== 0) {
              scale = (currentDist - center[0]) / initialDist + 1;
            }
          } else if (activeData.action === 'resize-ns') {
            // Use vertical movement for uniform scaling with reduced sensitivity
            const initialDist = initialPosition.current!.y - center[1];
            const currentDist = center[1] + (position.y - center[1]) * 0.25;
            if (initialDist !== 0) {
              scale = (currentDist - center[1]) / initialDist + 1;
            }
          }
          
          // Apply uniform scaling from center
          const newPoints = tile.points.map<Point>(point => [
            Math.round((center[0] + (point[0] - center[0]) * scale) * patternScale) / patternScale,
            Math.round((center[1] + (point[1] - center[1]) * scale) * patternScale) / patternScale
          ]);
          newTile.points = newPoints;
        }

        return {
          ...prev,
          tiles: prev.tiles.map(t => t.id === tile.id ? newTile : t)
      }});
    }

    if (position && activeData && activeData.action === 'move' && initialPosition.current) {
      const tile = activeData.tile;
      let dx = position.x - initialPosition.current.x;
      let dy = position.y - initialPosition.current.y;
      const movedPoints = tile.points.map<Point>(point => [point[0] + dx, point[1] + dy]);
      // --- Snapping logic (edge-to-edge) ---
      const SNAP_THRESHOLD = 4; // px
      let snapDx = 0;
      let snapDy = 0;
      // Get bounding box for moved tile
      const movedXs = movedPoints.map(p => p[0]);
      const movedYs = movedPoints.map(p => p[1]);
      const movedBox = {
        minX: Math.min(...movedXs),
        maxX: Math.max(...movedXs),
        minY: Math.min(...movedYs),
        maxY: Math.max(...movedYs),
      };
      // Snap to other tile edges
      const otherTiles = pattern.tiles.filter(t => t.id !== tile.id);
      for (const t of otherTiles) {
        const xs = t.points.map(p => p[0]);
        const ys = t.points.map(p => p[1]);
        const box = {
          minX: Math.min(...xs),
          maxX: Math.max(...xs),
          minY: Math.min(...ys),
          maxY: Math.max(...ys),
        };
        // Check all edge pairs (left, right, top, bottom)
        const edgePairs = [
          { movedEdge: movedBox.minX, otherEdge: box.maxX, axis: 'x', sign: 1 }, // left to right
          { movedEdge: movedBox.maxX, otherEdge: box.minX, axis: 'x', sign: 1 }, // right to left
          { movedEdge: movedBox.minX, otherEdge: box.minX, axis: 'x', sign: 1 }, // left to left
          { movedEdge: movedBox.maxX, otherEdge: box.maxX, axis: 'x', sign: 1 }, // right to right
          { movedEdge: movedBox.minY, otherEdge: box.maxY, axis: 'y', sign: 1 }, // top to bottom
          { movedEdge: movedBox.maxY, otherEdge: box.minY, axis: 'y', sign: 1 }, // bottom to top
          { movedEdge: movedBox.minY, otherEdge: box.minY, axis: 'y', sign: 1 }, // top to top
          { movedEdge: movedBox.maxY, otherEdge: box.maxY, axis: 'y', sign: 1 }, // bottom to bottom
        ];
        for (const pair of edgePairs) {
          const diff = pair.otherEdge - pair.movedEdge;
          if (Math.abs(diff) <= SNAP_THRESHOLD) {
            if (pair.axis === 'x') snapDx = diff;
            if (pair.axis === 'y') snapDy = diff;
            break;
          }
        }
        if (snapDx !== 0 || snapDy !== 0) break;
      }
      // Snap to pattern edges (canvas edges)
      if (snapDx === 0 && snapDy === 0) {
        const patternEdges = [
          { axis: 'x', value: 0, edge: movedBox.minX },
          { axis: 'x', value: pattern.width, edge: movedBox.maxX },
          { axis: 'y', value: 0, edge: movedBox.minY },
          { axis: 'y', value: pattern.height, edge: movedBox.maxY },
        ];
        for (const edge of patternEdges) {
          const diff = edge.value - edge.edge;
          if (Math.abs(diff) <= SNAP_THRESHOLD) {
            if (edge.axis === 'x') snapDx = diff;
            if (edge.axis === 'y') snapDy = diff;
            break;
          }
        }
      }
      dx += snapDx;
      dy += snapDy;
      const newPoints = tile.points.map<Point>(point => [
        point[0] + dx,
        point[1] + dy
      ]);
      const newTile = {
        ...tile,
        points: newPoints,
        metadata: {
          ...tile.metadata,
          centerX: tile.metadata.centerX + dx,
          centerY: tile.metadata.centerY + dy
        }
      };
      setPattern(prev => ({
        ...prev,
        tiles: prev.tiles.map(t => t.id === tile.id ? newTile : t)
      }));
    }
  }

  const removeTile = () => {
    if (edited) {
      setPattern(prev => {
        const tiles = prev.tiles.filter(t => edited !== t.id)
        if (tiles.length > 0) {
          return{
            ...prev,
            tiles,
          }
        } else {
          return {
            ...prev,
            tiles: [],
          }
        }
      })
      setEdited(null);
    }
  }

  const duplicateTile = () => {
    if (edited) {
      const tile = pattern.tiles.find(t => t.id === edited);
      if (tile) {
        const newTile = {
          ...tile,
          id: self.crypto.randomUUID(),
          points: tile.points.map<Point>(point => [
            point[0] + 10,
            point[1] + 10
          ]),
        }
        setPattern(prev => ({
          ...prev,
          tiles: [...prev.tiles, newTile]
        }))
        setEdited(newTile.id);
      }
    }
  }

  const stageRef = React.useRef<Konva.Stage>(null);
  const previewPattern = () => {
   
    const patternCanvas = drawPattern(pattern);
    if (!patternCanvas) return;
    const dataUrl = patternCanvas.toDataURL();
    const win = window.open("", "Title", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=500,height=500,top="+(screen.height-400)+",left="+(screen.width-840));
    if (win) {
      win.document.body.innerHTML = `<div style="width: 100%; height: 100%; background: url(${dataUrl});"></div`;
    }
  
  }

  return (
    <div className="bg-black/25 absolute top-0 left-0 w-full h-full z-20">
      <div className={classMerge("bg-gray-100 shadow-md rounded-lg flex flex-col gap-4 p-4 w-full md:w-2xl mx-auto mt-20", className)}>
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold text-black">Pattern Editor</h1>
          <ToolbarButton onClick={onClose} icon={<X />} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-black">Add tile</h2>
          <div className="flex gap-2">
            <ToolbarButton onClick={() => addTriangle()} icon={<Triangle />} />
            <ToolbarButton onClick={() => addRectangleHorizontal()} icon={<RectangleHorizontal />} />
            <ToolbarButton onClick={() => addRectangleVertical()} icon={<RectangleVertical />} />
            <ToolbarButton onClick={() => addSquare()} icon={<Square />} />
            <ToolbarButton onClick={() => addPentagon()} icon={<Pentagon />} />
            <ToolbarButton onClick={() => addHexagon()} icon={<Hexagon />} />
            <div className="grow" />
            {/* <div className="flex items-center gap-1">
              <UnfoldHorizontal className="size-6 text-black"/>
              <input type="range" min={0} max={20} step={1} value={pattern.tilesGap} onChange={e => setPattern(c=> ({...c, tilesGap: e.target.valueAsNumber}))} className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              <output className="text-sm font-bold text-black w-8">{pattern.tilesGap}mm</output>
            </div> */}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-black">Patterns:</h2>
          <div className="flex flex-wrap gap-2">
            {READY_TO_USE_PATTERNS.map((pat, i) => (
              <PatternButton 
                key={i}
                pattern={pat}
                onClick={(p) => {
                  setPattern({...p, tiles: [...p.tiles]});
                }}
              />))}
          </div>
        </div>
        <div className="relative h-[500px]">
          <ResizePlanner render={(dimensions) => <PatternCanvas 
            ref={stageRef}
            pattern={pattern}
            height={dimensions.height}
            width={dimensions.width}
            isDragging={activeData !== null}
            selectedId={edited}
            onStageClick={onBackgroundClick}
            onStageMouseMove={onMouseMove}
            onStageMouseUp={onMouseUp}
            onTileClick={onTileClick}
            onTileDown={onTileDown}
            onTileEnter={onTileEnter}
            onTileLeave={onTileLeave}            
          />
          } />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 items-center justify-center px-4 bg-gray-100 shadow-md p-1 space-x-2 rounded-lg">
              <RulerDimensionLine className="text-black" />
              <input type="number" min={0} step={1} disabled={!pattern.tiles.length} className="w-20 h-8 text-black text-center border border-black rounded-md bg-gray-100" value={pattern.width * (pattern.scale * 10)} onChange={e => setPattern(c=> ({...c, width: e.target.valueAsNumber / (pattern.scale * 10)}))} />
              <span className="text-black">x</span>
              <input type="number" min={0} step={1} disabled={!pattern.tiles.length} className="w-20 h-8 text-black text-center border border-black rounded-md bg-gray-100" value={pattern.height * (pattern.scale * 10)} onChange={e => setPattern(c=> ({...c, height: e.target.valueAsNumber / (pattern.scale * 10)}))} />
              <span className="text-black">mm</span>
              <ToolbarButton onClick={previewPattern} icon={<Eye/>}/>
          </div>
          {edited && (
            <div className="absolute z-10 left-2 top-5 w-12 bg-gray-100 shadow-md p-1 rounded-lg flex flex-col gap-1 items-center justify-center">
              <input 
                type="color" 
                value={pattern.tiles.find(t => t.id === edited)?.color} 
                onChange={e => setPattern(c=> ({...c, tiles: c.tiles.map(t => t.id === edited ? {...t, color: e.target.value } : t)}))} 
                className="w-full h-9 m-0 p-0 rounded-md border border-solid border-black cursor-pointer hover:text-red-800 hover:bg-gray-200" 
              />
              <ToolbarButton onClick={duplicateTile} icon={<Copy />} />
              <ToolbarButton variant="danger" onClick={removeTile} icon={<Trash2 />} />
            </div>
          )}
          {rotateCursor && <RotateCcw className="fixed text-black -translate-1/2 pointer-events-none" ref={cursorRef}  />}
        </div>
        <div className="flex justify-end gap-3">
          <ToolbarButton label="Cancel" onClick={onClose}/>
          <ToolbarButton label="Save" icon={<CircleCheck className="text-green-800 size-5"/>} onClick={() => onSubmit?.(pattern)} className="border border-black"/>
        </div>
      </div>
    </div>
  );
}