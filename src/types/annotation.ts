export type AnnotationTool = 'select' | 'box' | 'polygon' | 'point' | 'pan';

export interface Point2D {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LabelClass {
  id: string;
  name: string;
  color: string;
  hotkey: string; // '1' through '9'
  description: string;
  category: string;
  defaultAttributes?: Record<string, any>;
}

export interface Annotation {
  id: string;
  classId: string;
  toolType: AnnotationTool;
  bbox?: BoundingBox;
  points?: Point2D[];
  isClosed?: boolean;
  isOccluded?: boolean;
  isTruncated?: boolean;
  confidence?: number; // 0 to 100
  rationale?: string;
  notes?: string;
  createdAt: string;
  isLocked?: boolean;
  isVisible?: boolean;
}

export interface ImageDatasetItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  width: number;
  height: number;
  guidelines: string[];
  defaultClasses: LabelClass[];
  sampleAnnotations: Annotation[];
}

export type QASeverity = 'error' | 'warning' | 'info';

export type QAIssueType =
  | 'micro_box'
  | 'negative_box'
  | 'self_intersect'
  | 'out_of_bounds'
  | 'duplicate_iou'
  | 'unclosed_polygon'
  | 'low_confidence';

export interface QAIssue {
  id: string;
  annotationId: string;
  severity: QASeverity;
  type: QAIssueType;
  message: string;
  metric?: string;
}

export interface CanvasTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export type ExportFormat = 'coco' | 'yolo' | 'pascal_voc';