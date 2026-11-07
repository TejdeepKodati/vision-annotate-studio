import type { Annotation, ImageDatasetItem, LabelClass } from '../types/annotation.ts';

/**
 * Calculates polygon area using the Shoelace formula
 */
function getPolygonArea(points: { x: number; y: number }[]): number {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Export annotations in MS COCO 1.0 JSON format
 */
export function exportToCOCO(
  annotations: Annotation[],
  classes: LabelClass[],
  datasetItem: ImageDatasetItem
): string {
  const classMap = new Map<string, number>();
  classes.forEach((c, index) => {
    classMap.set(c.id, index + 1);
  });

  const cocoData = {
    info: {
      year: new Date().getFullYear(),
      version: '1.0.0',
      description: `VisionAnnotate Studio Export - ${datasetItem.title}`,
      contributor: 'VisionAnnotate Studio',
      url: 'https://github.com/TejdeepKodati/vision-annotate-studio',
      date_created: new Date().toISOString()
    },
    licenses: [
      {
        id: 1,
        name: 'Open Access / Creative Commons',
        url: 'https://creativecommons.org/licenses/by/4.0/'
      }
    ],
    images: [
      {
        id: 1,
        width: datasetItem.width,
        height: datasetItem.height,
        file_name: `${datasetItem.id}.jpg`,
        license: 1,
        date_captured: new Date().toISOString()
      }
    ],
    categories: classes.map((c) => ({
      id: classMap.get(c.id) || 1,
      name: c.name,
      supercategory: c.category || 'object'
    })),
    annotations: annotations.map((ann, index) => {
      const categoryId = classMap.get(ann.classId) || 1;
      let bbox: [number, number, number, number] = [0, 0, 0, 0];
      let segmentation: number[][] = [];
      let area = 0;

      if (ann.toolType === 'box' && ann.bbox) {
        bbox = [
          Math.round(ann.bbox.x),
          Math.round(ann.bbox.y),
          Math.round(ann.bbox.width),
          Math.round(ann.bbox.height)
        ];
        area = Math.round(ann.bbox.width * ann.bbox.height);
        segmentation = [
          [
            bbox[0], bbox[1],
            bbox[0] + bbox[2], bbox[1],
            bbox[0] + bbox[2], bbox[1] + bbox[3],
            bbox[0], bbox[1] + bbox[3]
          ]
        ];
      } else if (ann.toolType === 'polygon' && ann.points && ann.points.length >= 3) {
        const flatPoints: number[] = [];
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        ann.points.forEach(p => {
          flatPoints.push(Math.round(p.x), Math.round(p.y));
          minX = Math.min(minX, p.x);
          minY = Math.min(minY, p.y);
          maxX = Math.max(maxX, p.x);
          maxY = Math.max(maxY, p.y);
        });
        segmentation = [flatPoints];
        bbox = [
          Math.round(minX),
          Math.round(minY),
          Math.round(maxX - minX),
          Math.round(maxY - minY)
        ];
        area = Math.round(getPolygonArea(ann.points));
      } else if (ann.toolType === 'point' && ann.points && ann.points.length > 0) {
        const pt = ann.points[0];
        bbox = [Math.round(pt.x - 4), Math.round(pt.y - 4), 8, 8];
        area = 64;
        segmentation = [[pt.x, pt.y]];
      }

      return {
        id: index + 1,
        image_id: 1,
        category_id: categoryId,
        segmentation,
        area,
        bbox,
        iscrowd: 0,
        attributes: {
          occluded: Boolean(ann.isOccluded),
          truncated: Boolean(ann.isTruncated),
          confidence: ann.confidence !== undefined ? ann.confidence / 100 : 1.0,
          rationale: ann.rationale || '',
          notes: ann.notes || '',
          toolType: ann.toolType
        }
      };
    })
  };

  return JSON.stringify(cocoData, null, 2);
}

/**
 * Export annotations in YOLO format (normalized coordinates 0.0 to 1.0)
 */
export function exportToYOLO(
  annotations: Annotation[],
  classes: LabelClass[],
  imageWidth: number,
  imageHeight: number
): string {
  const classMap = new Map<string, number>();
  classes.forEach((c, index) => {
    classMap.set(c.id, index);
  });

  const lines: string[] = [];

  annotations.forEach(ann => {
    const classIdx = classMap.get(ann.classId) ?? 0;

    if (ann.toolType === 'box' && ann.bbox) {
      const xCenter = (ann.bbox.x + ann.bbox.width / 2) / imageWidth;
      const yCenter = (ann.bbox.y + ann.bbox.height / 2) / imageHeight;
      const normWidth = ann.bbox.width / imageWidth;
      const normHeight = ann.bbox.height / imageHeight;

      lines.push(
        `${classIdx} ${xCenter.toFixed(6)} ${yCenter.toFixed(6)} ${normWidth.toFixed(6)} ${normHeight.toFixed(6)}`
      );
    } else if (ann.toolType === 'polygon' && ann.points && ann.points.length >= 3) {
      // YOLOv8 segmentation format: class x1 y1 x2 y2 ...
      const normPts = ann.points
        .map(p => `${(p.x / imageWidth).toFixed(6)} ${(p.y / imageHeight).toFixed(6)}`)
        .join(' ');
      lines.push(`${classIdx} ${normPts}`);
    } else if (ann.toolType === 'point' && ann.points && ann.points.length > 0) {
      const pt = ann.points[0];
      const xNorm = (pt.x / imageWidth).toFixed(6);
      const yNorm = (pt.y / imageHeight).toFixed(6);
      lines.push(`${classIdx} ${xNorm} ${yNorm} 0.010000 0.010000`);
    }
  });

  return lines.join('\n');
}

/**
 * Export annotations in Pascal VOC XML format
 */
export function exportToPascalVOC(
  annotations: Annotation[],
  classes: LabelClass[],
  datasetItem: ImageDatasetItem
): string {
  const classNameMap = new Map<string, string>();
  classes.forEach(c => classNameMap.set(c.id, c.name));

  const objectXmlList = annotations.map(ann => {
    const name = classNameMap.get(ann.classId) || 'unknown';
    let xmin = 0, ymin = 0, xmax = 0, ymax = 0;

    if (ann.toolType === 'box' && ann.bbox) {
      xmin = Math.round(ann.bbox.x);
      ymin = Math.round(ann.bbox.y);
      xmax = Math.round(ann.bbox.x + ann.bbox.width);
      ymax = Math.round(ann.bbox.y + ann.bbox.height);
    } else if (ann.points && ann.points.length > 0) {
      xmin = Math.round(Math.min(...ann.points.map(p => p.x)));
      ymin = Math.round(Math.min(...ann.points.map(p => p.y)));
      xmax = Math.round(Math.max(...ann.points.map(p => p.x)));
      ymax = Math.round(Math.max(...ann.points.map(p => p.y)));
    }

    return `  <object>
    <name>${name}</name>
    <pose>Unspecified</pose>
    <truncated>${ann.isTruncated ? 1 : 0}</truncated>
    <difficult>0</difficult>
    <occluded>${ann.isOccluded ? 1 : 0}</occluded>
    <confidence>${ann.confidence !== undefined ? (ann.confidence / 100).toFixed(2) : '1.00'}</confidence>
    <bndbox>
      <xmin>${xmin}</xmin>
      <ymin>${ymin}</ymin>
      <xmax>${xmax}</xmax>
      <ymax>${ymax}</ymax>
    </bndbox>
  </object>`;
  }).join('\n');

  return `<annotation>
  <folder>annotations</folder>
  <filename>${datasetItem.id}.jpg</filename>
  <source>
    <database>VisionAnnotate Studio DB</database>
  </source>
  <size>
    <width>${datasetItem.width}</width>
    <height>${datasetItem.height}</height>
    <depth>3</depth>
  </size>
  <segmented>${annotations.some(a => a.toolType === 'polygon') ? 1 : 0}</segmented>
${objectXmlList}
</annotation>`;
}

/**
 * Parses user imported JSON and converts into internal Annotation format
 */
export function importFromJSON(
  jsonStr: string,
  currentClasses: LabelClass[]
): { annotations: Annotation[]; errors: string[] } {
  const errors: string[] = [];
  const parsedAnnotations: Annotation[] = [];

  try {
    const data = JSON.parse(jsonStr);

    // Case 1: Standard COCO format
    if (data.images && data.annotations && Array.isArray(data.annotations)) {
      const catMap = new Map<number, string>();
      if (Array.isArray(data.categories)) {
        data.categories.forEach((cat: any) => {
          const match = currentClasses.find(c => c.name.toLowerCase() === String(cat.name).toLowerCase());
          catMap.set(cat.id, match ? match.id : currentClasses[0]?.id || 'class-1');
        });
      }

      data.annotations.forEach((ann: any, index: number) => {
        const classId = catMap.get(ann.category_id) || currentClasses[0]?.id || 'class-1';
        if (ann.bbox && Array.isArray(ann.bbox) && ann.bbox.length === 4) {
          parsedAnnotations.push({
            id: `imported-coco-${Date.now()}-${index}`,
            classId,
            toolType: 'box',
            bbox: {
              x: ann.bbox[0],
              y: ann.bbox[1],
              width: ann.bbox[2],
              height: ann.bbox[3]
            },
            confidence: ann.attributes?.confidence ? Math.round(ann.attributes.confidence * 100) : 95,
            isOccluded: Boolean(ann.attributes?.occluded),
            isTruncated: Boolean(ann.attributes?.truncated),
            rationale: ann.attributes?.rationale || 'Imported from COCO JSON',
            createdAt: new Date().toISOString()
          });
        }
      });
    } else if (Array.isArray(data)) {
      // Case 2: VisionAnnotate internal array format
      data.forEach((item: any, idx: number) => {
        if (item.toolType && (item.bbox || item.points)) {
          parsedAnnotations.push({
            ...item,
            id: item.id || `imported-${Date.now()}-${idx}`,
            createdAt: item.createdAt || new Date().toISOString()
          });
        }
      });
    } else {
      errors.push('Unrecognized JSON format. Expected COCO JSON or VisionAnnotate annotation array.');
    }
  } catch (err: any) {
    errors.push(`JSON Syntax Error: ${err.message}`);
  }

  return { annotations: parsedAnnotations, errors };
}