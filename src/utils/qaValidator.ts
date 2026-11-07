import type { Annotation, BoundingBox, Point2D, QAIssue } from '../types/annotation.ts';

/**
 * Checks if two 2D line segments (p1-q1) and (p2-q2) intersect.
 */
function ccw(p1: Point2D, p2: Point2D, p3: Point2D): boolean {
  return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
}

export function doSegmentsIntersect(
  p1: Point2D,
  q1: Point2D,
  p2: Point2D,
  q2: Point2D
): boolean {
  // Discard shared endpoints
  const isShared1 = (p1.x === p2.x && p1.y === p2.y) || (p1.x === q2.x && p1.y === q2.y);
  const isShared2 = (q1.x === p2.x && q1.y === p2.y) || (q1.x === q2.x && q1.y === q2.y);
  if (isShared1 || isShared2) return false;

  return (
    ccw(p1, p2, q2) !== ccw(q1, p2, q2) &&
    ccw(p1, q1, p2) !== ccw(p1, q1, q2)
  );
}

/**
 * Checks if a polygon has self-intersecting edges.
 */
export function isPolygonSelfIntersecting(points: Point2D[]): boolean {
  const n = points.length;
  if (n < 4) return false;

  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    const q1 = points[(i + 1) % n];

    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue; // Adjacent edge wrap-around

      const p2 = points[j];
      const q2 = points[(j + 1) % n];

      if (doSegmentsIntersect(p1, q1, p2, q2)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Computes Intersection over Union (IoU) between two bounding boxes.
 */
export function calculateBoxIoU(b1: BoundingBox, b2: BoundingBox): number {
  const x1 = Math.max(b1.x, b2.x);
  const y1 = Math.max(b1.y, b2.y);
  const x2 = Math.min(b1.x + b1.width, b2.x + b2.width);
  const y2 = Math.min(b1.y + b1.height, b2.y + b2.height);

  const intersectionArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const area1 = Math.max(0, b1.width) * Math.max(0, b1.height);
  const area2 = Math.max(0, b2.width) * Math.max(0, b2.height);
  const unionArea = area1 + area2 - intersectionArea;

  if (unionArea <= 0) return 0;
  return intersectionArea / unionArea;
}

/**
 * Automated Geometric QA Validator
 * Scans all annotations for micro-boxes, out-of-bounds, self-intersections, high IoU duplicates, and low confidence.
 */
export function validateAnnotations(
  annotations: Annotation[],
  imageWidth: number,
  imageHeight: number
): QAIssue[] {
  const issues: QAIssue[] = [];

  annotations.forEach((ann, idx) => {
    // 1. Check Bounding Box validation
    if (ann.toolType === 'box' && ann.bbox) {
      const { x, y, width, height } = ann.bbox;

      // Inverted or negative dimensions
      if (width <= 0 || height <= 0) {
        issues.push({
          id: `issue-${ann.id}-negative`,
          annotationId: ann.id,
          severity: 'error',
          type: 'negative_box',
          message: `Bounding box #${ann.id.slice(-4)} has invalid negative or zero dimensions (${Math.round(width)}x${Math.round(height)}).`,
          metric: `${Math.round(width)}x${Math.round(height)}px`
        });
      }

      // Micro-box detection (< 15px in width or height)
      if (width > 0 && height > 0 && (width < 15 || height < 15)) {
        issues.push({
          id: `issue-${ann.id}-micro`,
          annotationId: ann.id,
          severity: 'warning',
          type: 'micro_box',
          message: `Micro-box detected on #${ann.id.slice(-4)} (${Math.round(width)}x${Math.round(height)}px). May be noise or sub-pixel artifact.`,
          metric: `${Math.round(width)}x${Math.round(height)}px`
        });
      }

      // Out of bounds detection
      if (x < 0 || y < 0 || x + width > imageWidth || y + height > imageHeight) {
        issues.push({
          id: `issue-${ann.id}-oob`,
          annotationId: ann.id,
          severity: 'error',
          type: 'out_of_bounds',
          message: `Annotation #${ann.id.slice(-4)} extends outside image boundaries (${imageWidth}x${imageHeight}px).`,
          metric: `x:${Math.round(x)}, y:${Math.round(y)}, w:${Math.round(width)}, h:${Math.round(height)}`
        });
      }
    }

    // 2. Check Polygon validation
    if (ann.toolType === 'polygon' && ann.points) {
      if (ann.points.length < 3) {
        issues.push({
          id: `issue-${ann.id}-unclosed`,
          annotationId: ann.id,
          severity: 'error',
          type: 'unclosed_polygon',
          message: `Polygon #${ann.id.slice(-4)} has only ${ann.points.length} vertices. Minimum 3 required for closed polygon.`,
          metric: `${ann.points.length} vertices`
        });
      } else if (!ann.isClosed) {
        issues.push({
          id: `issue-${ann.id}-unclosed-flag`,
          annotationId: ann.id,
          severity: 'warning',
          type: 'unclosed_polygon',
          message: `Polygon #${ann.id.slice(-4)} is not closed. Snap to origin vertex to close contour.`,
        });
      } else if (isPolygonSelfIntersecting(ann.points)) {
        issues.push({
          id: `issue-${ann.id}-self-intersect`,
          annotationId: ann.id,
          severity: 'error',
          type: 'self_intersect',
          message: `Polygon #${ann.id.slice(-4)} has self-intersecting boundary edges (bow-tie geometry).`,
        });
      }

      // Check points within boundary
      const outPoint = ann.points.find(p => p.x < 0 || p.y < 0 || p.x > imageWidth || p.y > imageHeight);
      if (outPoint) {
        issues.push({
          id: `issue-${ann.id}-poly-oob`,
          annotationId: ann.id,
          severity: 'warning',
          type: 'out_of_bounds',
          message: `Polygon #${ann.id.slice(-4)} has vertices outside image boundary.`,
          metric: `pt(${Math.round(outPoint.x)}, ${Math.round(outPoint.y)})`
        });
      }
    }

    // 3. Check Point validation
    if (ann.toolType === 'point' && ann.points && ann.points.length > 0) {
      const pt = ann.points[0];
      if (pt.x < 0 || pt.y < 0 || pt.x > imageWidth || pt.y > imageHeight) {
        issues.push({
          id: `issue-${ann.id}-pt-oob`,
          annotationId: ann.id,
          severity: 'error',
          type: 'out_of_bounds',
          message: `Keypoint #${ann.id.slice(-4)} lies outside image frame.`,
          metric: `(${Math.round(pt.x)}, ${Math.round(pt.y)})`
        });
      }
    }

    // 4. Low Confidence warning (< 65%)
    if (ann.confidence !== undefined && ann.confidence < 65) {
      issues.push({
        id: `issue-${ann.id}-confidence`,
        annotationId: ann.id,
        severity: 'info',
        type: 'low_confidence',
        message: `Annotation #${ann.id.slice(-4)} has low confidence (${ann.confidence}%). Consider adding an edge-case rationale.`,
        metric: `${ann.confidence}%`
      });
    }

    // 5. Duplicate IoU overlap detection against subsequent annotations
    if (ann.toolType === 'box' && ann.bbox) {
      for (let j = idx + 1; j < annotations.length; j++) {
        const other = annotations[j];
        if (other.toolType === 'box' && other.bbox) {
          const iou = calculateBoxIoU(ann.bbox, other.bbox);
          if (iou >= 0.90) {
            issues.push({
              id: `issue-duplicate-${ann.id}-${other.id}`,
              annotationId: ann.id,
              severity: 'error',
              type: 'duplicate_iou',
              message: `High duplicate overlap detected between #${ann.id.slice(-4)} and #${other.id.slice(-4)} (IoU: ${(iou * 100).toFixed(1)}%).`,
              metric: `IoU: ${(iou * 100).toFixed(1)}%`
            });
          } else if (iou >= 0.70 && ann.classId === other.classId) {
            issues.push({
              id: `issue-overlap-${ann.id}-${other.id}`,
              annotationId: ann.id,
              severity: 'warning',
              type: 'duplicate_iou',
              message: `Heavy overlap detected between #${ann.id.slice(-4)} and #${other.id.slice(-4)} of same class (IoU: ${(iou * 100).toFixed(1)}%).`,
              metric: `IoU: ${(iou * 100).toFixed(1)}%`
            });
          }
        }
      }
    }
  });

  return issues;
}