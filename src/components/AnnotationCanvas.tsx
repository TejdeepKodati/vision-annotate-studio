import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Annotation, 
  AnnotationTool, 
  BoundingBox, 
  CanvasTransform, 
  ImageDatasetItem, 
  LabelClass, 
  Point2D, 
  QAIssue 
} from '../types/annotation';
import { AlertCircle } from 'lucide-react';

interface AnnotationCanvasProps {
  datasetItem: ImageDatasetItem;
  annotations: Annotation[];
  activeTool: AnnotationTool;
  activeClass: LabelClass;
  classes: LabelClass[];
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;
  onAddAnnotation: (ann: Annotation) => void;
  onUpdateAnnotation: (ann: Annotation) => void;
  onDeleteAnnotation: (id: string) => void;
  transform: CanvasTransform;
  onTransformChange: (t: CanvasTransform) => void;
  showLabels: boolean;
  showCrosshairs: boolean;
  showGrid: boolean;
  fillOpacity: number;
  qaIssues: QAIssue[];
  onCursorMove?: (pt: Point2D) => void;
}

type DragMode = 
  | 'none'
  | 'pan'
  | 'drawing_box'
  | 'drawing_polygon'
  | 'moving_annotation'
  | 'resizing_box'
  | 'moving_vertex';

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
  datasetItem,
  annotations,
  activeTool,
  activeClass,
  classes,
  selectedAnnotationId,
  onSelectAnnotation,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  transform,
  onTransformChange,
  showLabels,
  showCrosshairs,
  showGrid,
  fillOpacity,
  qaIssues,
  onCursorMove
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Drag and Interaction State
  const [dragMode, setDragMode] = useState<DragMode>('none');
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState<Point2D>({ x: 0, y: 0 });

  // Drawing Box State
  const [boxStart, setBoxStart] = useState<Point2D | null>(null);
  const [currentBox, setCurrentBox] = useState<BoundingBox | null>(null);

  // Drawing Polygon State
  const [polygonPoints, setPolygonPoints] = useState<Point2D[]>([]);
  const [isNearOrigin, setIsNearOrigin] = useState<boolean>(false);

  // Box Resize / Move State
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const [initialBox, setInitialBox] = useState<BoundingBox | null>(null);
  const [dragStartPoint, setDragStartPoint] = useState<Point2D>({ x: 0, y: 0 });

  // Moving Vertex State
  const [activeVertexIndex, setActiveVertexIndex] = useState<number | null>(null);

  // Helper: Convert client window coords to image internal coordinates
  const clientToImageCoords = useCallback(
    (clientX: number, clientY: number): Point2D => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left - transform.offsetX;
      const relativeY = clientY - rect.top - transform.offsetY;
      return {
        x: Math.round(relativeX / transform.scale),
        y: Math.round(relativeY / transform.scale)
      };
    },
    [transform]
  );

  // Selected annotation lookup
  const selectedAnnotation = annotations.find(a => a.id === selectedAnnotationId);

  // Wheel zoom centered at cursor position
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newScale = Math.min(Math.max(transform.scale * zoomFactor, 0.2), 5.0);

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newOffsetX = mouseX - (mouseX - transform.offsetX) * (newScale / transform.scale);
    const newOffsetY = mouseY - (mouseY - transform.offsetY) * (newScale / transform.scale);

    onTransformChange({
      scale: newScale,
      offsetX: newOffsetX,
      offsetY: newOffsetY
    });
  };

  // Close polygon handler
  const finalizePolygon = useCallback(() => {
    if (polygonPoints.length >= 3) {
      const newAnn: Annotation = {
        id: `ann-poly-${Date.now()}`,
        classId: activeClass.id,
        toolType: 'polygon',
        points: [...polygonPoints],
        isClosed: true,
        confidence: 95,
        isOccluded: false,
        isTruncated: false,
        rationale: 'Manual polygon segmentation boundary',
        createdAt: new Date().toISOString()
      };
      onAddAnnotation(newAnn);
      onSelectAnnotation(newAnn.id);
    }
    setPolygonPoints([]);
    setDragMode('none');
    setIsNearOrigin(false);
  }, [polygonPoints, activeClass, onAddAnnotation, onSelectAnnotation]);

  const [isSpaceDown, setIsSpaceDown] = useState(false);

  // Keyboard shortcut listener for canvas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (document.activeElement?.tagName.toLowerCase() !== 'input' && document.activeElement?.tagName.toLowerCase() !== 'textarea')) {
        setIsSpaceDown(true);
      }
      if (e.key === 'Escape') {
        if (polygonPoints.length > 0) {
          setPolygonPoints([]);
          setDragMode('none');
        } else {
          onSelectAnnotation(null);
        }
      } else if (e.key === 'Enter') {
        if (polygonPoints.length >= 3) {
          finalizePolygon();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          if (selectedAnnotationId) {
            onDeleteAnnotation(selectedAnnotationId);
            onSelectAnnotation(null);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpaceDown(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [polygonPoints, finalizePolygon, selectedAnnotationId, onDeleteAnnotation, onSelectAnnotation]);

  // Mouse Down handler
  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click or Spacebar => Pan canvas
    if (e.button === 1 || activeTool === 'pan' || isSpaceDown) {
      setDragMode('pan');
      setPanStart({ x: e.clientX - transform.offsetX, y: e.clientY - transform.offsetY });
      return;
    }

    if (e.button !== 0) return; // Only process left click

    const imgCoord = clientToImageCoords(e.clientX, e.clientY);

    if (activeTool === 'box') {
      setDragMode('drawing_box');
      setBoxStart(imgCoord);
      setCurrentBox({ x: imgCoord.x, y: imgCoord.y, width: 0, height: 0 });
    } else if (activeTool === 'polygon') {
      if (polygonPoints.length >= 3 && isNearOrigin) {
        finalizePolygon();
        return;
      }
      setDragMode('drawing_polygon');
      setPolygonPoints(prev => [...prev, imgCoord]);
    } else if (activeTool === 'point') {
      const newAnn: Annotation = {
        id: `ann-pt-${Date.now()}`,
        classId: activeClass.id,
        toolType: 'point',
        points: [imgCoord],
        confidence: 99,
        isOccluded: false,
        isTruncated: false,
        createdAt: new Date().toISOString()
      };
      onAddAnnotation(newAnn);
      onSelectAnnotation(newAnn.id);
    } else if (activeTool === 'select') {
      // Check if clicking outside any shape to deselect
      // (If a shape or handle was clicked, its individual onMouseDown already handled it)
      onSelectAnnotation(null);
    }
  };

  // Mouse Move handler
  const handleMouseMove = (e: React.MouseEvent) => {
    const imgCoord = clientToImageCoords(e.clientX, e.clientY);
    setCursorPos(imgCoord);
    if (onCursorMove) onCursorMove(imgCoord);

    // Pan canvas
    if (dragMode === 'pan') {
      onTransformChange({
        ...transform,
        offsetX: e.clientX - panStart.x,
        offsetY: e.clientY - panStart.y
      });
      return;
    }

    // Box drawing in progress
    if (dragMode === 'drawing_box' && boxStart) {
      const x = Math.min(boxStart.x, imgCoord.x);
      const y = Math.min(boxStart.y, imgCoord.y);
      const width = Math.abs(imgCoord.x - boxStart.x);
      const height = Math.abs(imgCoord.y - boxStart.y);
      setCurrentBox({ x, y, width, height });
    }

    // Polygon drawing near origin check (12px snap radius)
    if (activeTool === 'polygon' && polygonPoints.length >= 3) {
      const origin = polygonPoints[0];
      const dist = Math.hypot(origin.x - imgCoord.x, origin.y - imgCoord.y);
      setIsNearOrigin(dist <= 15 / transform.scale);
    }

    // Moving whole annotation
    if (dragMode === 'moving_annotation' && selectedAnnotation && initialBox) {
      const dx = imgCoord.x - dragStartPoint.x;
      const dy = imgCoord.y - dragStartPoint.y;

      if (selectedAnnotation.toolType === 'box') {
        onUpdateAnnotation({
          ...selectedAnnotation,
          bbox: {
            ...initialBox,
            x: initialBox.x + dx,
            y: initialBox.y + dy
          }
        });
      }
    }

    // Resizing bounding box via 8 handles
    if (dragMode === 'resizing_box' && selectedAnnotation?.bbox && initialBox && activeHandle) {
      const dx = imgCoord.x - dragStartPoint.x;
      const dy = imgCoord.y - dragStartPoint.y;
      let { x, y, width, height } = initialBox;

      if (activeHandle.includes('e')) width += dx;
      if (activeHandle.includes('s')) height += dy;
      if (activeHandle.includes('w')) {
        x += dx;
        width -= dx;
      }
      if (activeHandle.includes('n')) {
        y += dy;
        height -= dy;
      }

      // Maintain valid positive dimensions
      if (width > 5 && height > 5) {
        onUpdateAnnotation({
          ...selectedAnnotation,
          bbox: { x, y, width, height }
        });
      }
    }

    // Moving single polygon vertex
    if (dragMode === 'moving_vertex' && selectedAnnotation?.points && activeVertexIndex !== null) {
      const updatedPoints = [...selectedAnnotation.points];
      updatedPoints[activeVertexIndex] = imgCoord;
      onUpdateAnnotation({
        ...selectedAnnotation,
        points: updatedPoints
      });
    }
  };

  // Mouse Up handler
  const handleMouseUp = () => {
    if (dragMode === 'drawing_box' && currentBox) {
      if (currentBox.width >= 8 && currentBox.height >= 8) {
        const newAnn: Annotation = {
          id: `ann-box-${Date.now()}`,
          classId: activeClass.id,
          toolType: 'box',
          bbox: currentBox,
          confidence: 95,
          isOccluded: false,
          isTruncated: false,
          rationale: 'Manual bounding box annotation',
          createdAt: new Date().toISOString()
        };
        onAddAnnotation(newAnn);
        onSelectAnnotation(newAnn.id);
      }
      setBoxStart(null);
      setCurrentBox(null);
      setDragMode('none');
    } else if (dragMode === 'pan' || dragMode === 'moving_annotation' || dragMode === 'resizing_box' || dragMode === 'moving_vertex') {
      setDragMode('none');
      setActiveHandle(null);
      setActiveVertexIndex(null);
    }
  };

  // Handle Box Resize Mouse Down
  const handleResizeHandleDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    if (!selectedAnnotation?.bbox) return;
    setDragMode('resizing_box');
    setActiveHandle(handle);
    setInitialBox({ ...selectedAnnotation.bbox });
    setDragStartPoint(clientToImageCoords(e.clientX, e.clientY));
  };

  // Handle Shape Body Drag Mouse Down
  const handleShapeMouseDown = (e: React.MouseEvent, ann: Annotation) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    onSelectAnnotation(ann.id);

    if (ann.toolType === 'box' && ann.bbox) {
      setDragMode('moving_annotation');
      setInitialBox({ ...ann.bbox });
      setDragStartPoint(clientToImageCoords(e.clientX, e.clientY));
    }
  };

  // Class color lookup helper
  const getClassColor = (classId: string): string => {
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.color : '#10B981';
  };

  const getClassName = (classId: string): string => {
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : 'Object';
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative flex-1 h-full w-full overflow-hidden bg-slate-950 select-none ${
        activeTool === 'pan' || dragMode === 'pan'
          ? 'cursor-grab active:cursor-grabbing'
          : activeTool === 'select'
          ? 'cursor-default'
          : 'cursor-crosshair'
      }`}
    >
      {/* Background Grid Pattern (optional toggle) */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`,
            backgroundSize: `${40 * transform.scale}px ${40 * transform.scale}px`,
            backgroundPosition: `${transform.offsetX}px ${transform.offsetY}px`
          }}
        />
      )}

      {/* Crosshair Cursor Overlay */}
      {showCrosshairs && (
        <>
          <div
            className="absolute left-0 right-0 h-px bg-emerald-400/40 pointer-events-none"
            style={{ top: cursorPos.y * transform.scale + transform.offsetY }}
          />
          <div
            className="absolute top-0 bottom-0 w-px bg-emerald-400/40 pointer-events-none"
            style={{ left: cursorPos.x * transform.scale + transform.offsetX }}
          />
        </>
      )}

      {/* Main Scaled Multi-Layer Canvas */}
      <div
        className="absolute origin-top-left will-change-transform"
        style={{
          transform: `translate(${transform.offsetX}px, ${transform.offsetY}px) scale(${transform.scale})`,
          width: datasetItem.width,
          height: datasetItem.height
        }}
      >
        {/* Layer 1: Benchmark Dataset Image */}
        <img
          src={datasetItem.imageUrl}
          alt={datasetItem.title}
          draggable={false}
          className="w-full h-full object-contain pointer-events-none shadow-2xl block"
        />

        {/* Layer 2: Vector Annotations SVG */}
        <svg
          width={datasetItem.width}
          height={datasetItem.height}
          className="absolute inset-0 overflow-visible"
        >
          {/* Render Completed Annotations */}
          {annotations.map((ann) => {
            if (ann.isVisible === false) return null;
            const isSelected = ann.id === selectedAnnotationId;
            const color = getClassColor(ann.classId);
            const classNameText = getClassName(ann.classId);
            const hasIssue = qaIssues.some(q => q.annotationId === ann.id);

            return (
              <g key={ann.id} className="transition-opacity">
                {/* 1. Bounding Box Rendering */}
                {ann.toolType === 'box' && ann.bbox && (
                  <g>
                    <rect
                      x={ann.bbox.x}
                      y={ann.bbox.y}
                      width={ann.bbox.width}
                      height={ann.bbox.height}
                      fill={color}
                      fillOpacity={fillOpacity}
                      stroke={color}
                      strokeWidth={isSelected ? 3 / transform.scale : 2 / transform.scale}
                      strokeDasharray={ann.isOccluded ? `${6 / transform.scale},${4 / transform.scale}` : 'none'}
                      onMouseDown={(e) => handleShapeMouseDown(e, ann)}
                      className="cursor-pointer hover:stroke-white transition-colors"
                    />

                    {/* Resize Handles (Only for selected box) */}
                    {isSelected && (
                      <g>
                        {(
                          [
                            { id: 'nw', x: ann.bbox.x, y: ann.bbox.y, cursor: 'nwse-resize' },
                            { id: 'n', x: ann.bbox.x + ann.bbox.width / 2, y: ann.bbox.y, cursor: 'ns-resize' },
                            { id: 'ne', x: ann.bbox.x + ann.bbox.width, y: ann.bbox.y, cursor: 'nesw-resize' },
                            { id: 'e', x: ann.bbox.x + ann.bbox.width, y: ann.bbox.y + ann.bbox.height / 2, cursor: 'ew-resize' },
                            { id: 'se', x: ann.bbox.x + ann.bbox.width, y: ann.bbox.y + ann.bbox.height, cursor: 'nwse-resize' },
                            { id: 's', x: ann.bbox.x + ann.bbox.width / 2, y: ann.bbox.y + ann.bbox.height, cursor: 'ns-resize' },
                            { id: 'sw', x: ann.bbox.x, y: ann.bbox.y + ann.bbox.height, cursor: 'nesw-resize' },
                            { id: 'w', x: ann.bbox.x, y: ann.bbox.y + ann.bbox.height / 2, cursor: 'ew-resize' }
                          ] as const
                        ).map((h) => (
                          <rect
                            key={h.id}
                            x={h.x - 4 / transform.scale}
                            y={h.y - 4 / transform.scale}
                            width={8 / transform.scale}
                            height={8 / transform.scale}
                            fill="#FFFFFF"
                            stroke={color}
                            strokeWidth={2 / transform.scale}
                            onMouseDown={(e) => handleResizeHandleDown(e, h.id)}
                            style={{ cursor: h.cursor }}
                            className="hover:scale-125 transition-transform"
                          />
                        ))}
                      </g>
                    )}

                    {/* Bounding Box Label Badge */}
                    {showLabels && (
                      <foreignObject
                        x={ann.bbox.x}
                        y={Math.max(0, ann.bbox.y - 24 / transform.scale)}
                        width={260 / transform.scale}
                        height={24 / transform.scale}
                        className="overflow-visible pointer-events-none"
                      >
                        <div
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold text-white shadow-sm"
                          style={{
                            backgroundColor: color,
                            transform: `scale(${1 / transform.scale})`,
                            transformOrigin: 'top left'
                          }}
                        >
                          <span>{classNameText}</span>
                          {ann.confidence && (
                            <span className="text-[10px] opacity-80">{ann.confidence}%</span>
                          )}
                          {hasIssue && <span className="text-[10px] text-amber-200">⚠</span>}
                        </div>
                      </foreignObject>
                    )}
                  </g>
                )}

                {/* 2. Polygon Rendering */}
                {ann.toolType === 'polygon' && ann.points && ann.points.length >= 3 && (
                  <g>
                    <polygon
                      points={ann.points.map(p => `${p.x},${p.y}`).join(' ')}
                      fill={color}
                      fillOpacity={fillOpacity}
                      stroke={color}
                      strokeWidth={isSelected ? 3 / transform.scale : 2 / transform.scale}
                      onMouseDown={(e) => handleShapeMouseDown(e, ann)}
                      className="cursor-pointer hover:stroke-white transition-colors"
                    />

                    {/* Draggable Vertex Handles for Selected Polygon */}
                    {isSelected &&
                      ann.points.map((pt, vIdx) => (
                        <circle
                          key={vIdx}
                          cx={pt.x}
                          cy={pt.y}
                          r={5 / transform.scale}
                          fill="#FFFFFF"
                          stroke={color}
                          strokeWidth={2 / transform.scale}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setDragMode('moving_vertex');
                            setActiveVertexIndex(vIdx);
                          }}
                          className="cursor-pointer hover:scale-150 transition-transform"
                        />
                      ))}

                    {/* Polygon Label Badge */}
                    {showLabels && ann.points[0] && (
                      <foreignObject
                        x={ann.points[0].x}
                        y={Math.max(0, ann.points[0].y - 24 / transform.scale)}
                        width={240 / transform.scale}
                        height={24 / transform.scale}
                        className="overflow-visible pointer-events-none"
                      >
                        <div
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold text-white shadow-sm"
                          style={{
                            backgroundColor: color,
                            transform: `scale(${1 / transform.scale})`,
                            transformOrigin: 'top left'
                          }}
                        >
                          <span>{classNameText}</span>
                          {hasIssue && <span className="text-[10px] text-amber-200">⚠</span>}
                        </div>
                      </foreignObject>
                    )}
                  </g>
                )}

                {/* 3. Keypoint Marker Rendering */}
                {ann.toolType === 'point' && ann.points && ann.points[0] && (
                  <g onMouseDown={(e) => handleShapeMouseDown(e, ann)} className="cursor-pointer">
                    <circle
                      cx={ann.points[0].x}
                      cy={ann.points[0].y}
                      r={7 / transform.scale}
                      fill={color}
                      stroke="#FFFFFF"
                      strokeWidth={2 / transform.scale}
                    />
                    <circle
                      cx={ann.points[0].x}
                      cy={ann.points[0].y}
                      r={14 / transform.scale}
                      fill="none"
                      stroke={color}
                      strokeWidth={1.5 / transform.scale}
                      strokeDasharray={`${3 / transform.scale},${3 / transform.scale}`}
                    />
                    {showLabels && (
                      <foreignObject
                        x={ann.points[0].x + 10 / transform.scale}
                        y={ann.points[0].y - 10 / transform.scale}
                        width={180 / transform.scale}
                        height={24 / transform.scale}
                        className="overflow-visible pointer-events-none"
                      >
                        <div
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow"
                          style={{
                            backgroundColor: color,
                            transform: `scale(${1 / transform.scale})`,
                            transformOrigin: 'top left'
                          }}
                        >
                          {classNameText}
                        </div>
                      </foreignObject>
                    )}
                  </g>
                )}
              </g>
            );
          })}

          {/* Real-time Bounding Box Creation Rubberband */}
          {dragMode === 'drawing_box' && currentBox && (
            <g>
              <rect
                x={currentBox.x}
                y={currentBox.y}
                width={currentBox.width}
                height={currentBox.height}
                fill={activeClass.color}
                fillOpacity={0.25}
                stroke={activeClass.color}
                strokeWidth={2 / transform.scale}
                strokeDasharray={`${5 / transform.scale},${3 / transform.scale}`}
              />
              <foreignObject
                x={currentBox.x}
                y={currentBox.y + currentBox.height + 4 / transform.scale}
                width={200 / transform.scale}
                height={20 / transform.scale}
                className="overflow-visible pointer-events-none"
              >
                <div
                  className="px-1.5 py-0.5 bg-slate-900/90 text-[10px] font-mono text-emerald-400 rounded inline-block border border-slate-700"
                  style={{
                    transform: `scale(${1 / transform.scale})`,
                    transformOrigin: 'top left'
                  }}
                >
                  {Math.round(currentBox.width)} × {Math.round(currentBox.height)} px
                </div>
              </foreignObject>
            </g>
          )}

          {/* Real-time Polygon Segment Creation Rubberband */}
          {activeTool === 'polygon' && polygonPoints.length > 0 && (
            <g>
              {/* Completed Edges */}
              <polyline
                points={polygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={activeClass.color}
                strokeWidth={2.5 / transform.scale}
              />
              {/* Rubberband to cursor */}
              <line
                x1={polygonPoints[polygonPoints.length - 1].x}
                y1={polygonPoints[polygonPoints.length - 1].y}
                x2={cursorPos.x}
                y2={cursorPos.y}
                stroke={activeClass.color}
                strokeWidth={2 / transform.scale}
                strokeDasharray={`${4 / transform.scale},${3 / transform.scale}`}
              />
              {/* Placed Vertices */}
              {polygonPoints.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={4 / transform.scale}
                  fill={idx === 0 && isNearOrigin ? '#10B981' : '#FFFFFF'}
                  stroke={activeClass.color}
                  strokeWidth={2 / transform.scale}
                />
              ))}
              {/* Origin Snap Indicator */}
              {isNearOrigin && (
                <circle
                  cx={polygonPoints[0].x}
                  cy={polygonPoints[0].y}
                  r={10 / transform.scale}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth={2 / transform.scale}
                  className="animate-ping"
                />
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Floating Helper Toast for Polygon Tool */}
      {activeTool === 'polygon' && polygonPoints.length > 0 && (
        <div className="absolute top-4 left-4 bg-slate-900/95 border border-emerald-500/40 text-xs text-slate-200 px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2 pointer-events-none z-30">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {polygonPoints.length < 3
              ? `Plotted ${polygonPoints.length} vertices. Click at least 3 points.`
              : isNearOrigin
              ? 'Click origin vertex to close polygon contour.'
              : 'Press Enter or click origin vertex to complete.'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">(Esc to cancel)</span>
        </div>
      )}
    </div>
  );
};