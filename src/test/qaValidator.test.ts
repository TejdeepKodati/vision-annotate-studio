import { calculateBoxIoU, isPolygonSelfIntersecting, validateAnnotations } from '../utils/qaValidator.ts';
import { exportToCOCO, exportToYOLO } from '../utils/exportFormats.ts';
import type { Annotation, LabelClass } from '../types/annotation.ts';

export function runTestSuite(): { passed: boolean; testResults: string[] } {
  const results: string[] = [];

  // 1. Test IoU calculation
  const boxA = { x: 0, y: 0, width: 100, height: 100 };
  const boxB = { x: 50, y: 0, width: 100, height: 100 };
  const iou = calculateBoxIoU(boxA, boxB);
  const expectedIou = (50 * 100) / (100 * 100 + 100 * 100 - 50 * 100); // 5000 / 15000 = 0.3333
  if (Math.abs(iou - expectedIou) < 0.01) {
    results.push('PASS: calculateBoxIoU overlapping test');
  } else {
    results.push(`FAIL: calculateBoxIoU expected ~0.333, got ${iou}`);
  }

  // 2. Test self-intersecting polygon (bowtie)
  const bowtiePoly = [
    { x: 0, y: 0 },
    { x: 100, y: 100 },
    { x: 100, y: 0 },
    { x: 0, y: 100 }
  ];
  const isBowtieIntersecting = isPolygonSelfIntersecting(bowtiePoly);
  if (isBowtieIntersecting) {
    results.push('PASS: isPolygonSelfIntersecting bowtie detection');
  } else {
    results.push('FAIL: isPolygonSelfIntersecting bowtie was not detected');
  }

  // 3. Test simple convex polygon
  const simplePoly = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 }
  ];
  if (!isPolygonSelfIntersecting(simplePoly)) {
    results.push('PASS: isPolygonSelfIntersecting convex polygon pass');
  } else {
    results.push('FAIL: isPolygonSelfIntersecting falsely flagged convex polygon');
  }

  // 4. Test micro-box detection
  const testAnnotations: Annotation[] = [
    {
      id: 'test-micro',
      classId: 'c1',
      toolType: 'box',
      bbox: { x: 10, y: 10, width: 8, height: 12 },
      createdAt: new Date().toISOString()
    }
  ];
  const issues = validateAnnotations(testAnnotations, 1000, 1000);
  if (issues.some(i => i.type === 'micro_box')) {
    results.push('PASS: validateAnnotations flagged micro-box (<15px)');
  } else {
    results.push('FAIL: validateAnnotations missed micro-box');
  }

  // 5. Test COCO JSON export structure
  const testClasses: LabelClass[] = [
    { id: 'c1', name: 'Vehicle', color: '#3B82F6', hotkey: '1', description: 'Cars', category: 'Auto' }
  ];
  const testItem = {
    id: 'test-item',
    title: 'Test Image',
    category: 'Test',
    imageUrl: '',
    width: 800,
    height: 600,
    defaultClasses: testClasses,
    guidelines: [],
    sampleAnnotations: testAnnotations
  };
  const cocoJson = exportToCOCO(testAnnotations, testClasses, testItem);
  const parsed = JSON.parse(cocoJson);
  if (parsed.images && parsed.annotations && parsed.categories) {
    results.push('PASS: exportToCOCO produced compliant structure');
  } else {
    results.push('FAIL: exportToCOCO structure malformed');
  }

  // 6. Test YOLO export normalization
  const yoloTxt = exportToYOLO(testAnnotations, testClasses, 800, 600);
  const parts = yoloTxt.trim().split(' ');
  if (parts.length === 5 && parts[0] === '0') {
    results.push('PASS: exportToYOLO produced normalized 5-tuple');
  } else {
    results.push('FAIL: exportToYOLO invalid output format');
  }

  const allPassed = !results.some(r => r.startsWith('FAIL'));
  return { passed: allPassed, testResults: results };
}

const { passed, testResults } = runTestSuite();
testResults.forEach(r => console.log(r));
if (!passed) process.exit(1);
console.log('All QA Validator tests passed successfully!');
