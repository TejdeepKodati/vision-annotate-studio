import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Annotation, 
  AnnotationTool, 
  CanvasTransform, 
  ImageDatasetItem, 
  LabelClass, 
  Point2D 
} from './types/annotation';
import { sampleDatasets } from './data/sampleDatasets';
import { validateAnnotations } from './utils/qaValidator';
import { TopNav } from './components/TopNav';
import { LeftToolbar } from './components/LeftToolbar';
import { AnnotationCanvas } from './components/AnnotationCanvas';
import { RightSidebar } from './components/RightSidebar';
import { GuidelineDrawer } from './components/GuidelineDrawer';
import { ExportModal } from './components/ExportModal';
import { StatusBar } from './components/StatusBar';

export default function App() {
  // Datasets State
  const [datasets] = useState<ImageDatasetItem[]>(sampleDatasets);
  const [currentDataset, setCurrentDataset] = useState<ImageDatasetItem>(sampleDatasets[0]);

  // Classes & Annotations State
  const [classes, setClasses] = useState<LabelClass[]>(sampleDatasets[0].defaultClasses);
  const [activeClass, setActiveClass] = useState<LabelClass>(sampleDatasets[0].defaultClasses[0]);
  const [annotations, setAnnotations] = useState<Annotation[]>(sampleDatasets[0].sampleAnnotations);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  // Active Tool
  const [activeTool, setActiveTool] = useState<AnnotationTool>('select');

  // Canvas Viewport Transform
  const [transform, setTransform] = useState<CanvasTransform>({
    scale: 0.9,
    offsetX: 60,
    offsetY: 40
  });

  // Display Aids
  const [showLabels, setShowLabels] = useState(true);
  const [showCrosshairs, setShowCrosshairs] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [fillOpacity, setFillOpacity] = useState(0.2);

  // Live Cursor Position
  const [cursorPos, setCursorPos] = useState<Point2D>({ x: 0, y: 0 });

  // Sidebar Tab & Drawers
  const [sidebarTab, setSidebarTab] = useState<'classes' | 'annotations' | 'inspector' | 'qa'>('classes');
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Multi-Level Undo / Redo History Stack
  const [history, setHistory] = useState<Annotation[][]>([sampleDatasets[0].sampleAnnotations]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback((newAnnotations: Annotation[]) => {
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newAnnotations];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setAnnotations(history[newIndex]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setAnnotations(history[newIndex]);
    }
  }, [historyIndex, history]);

  // Automated Geometric QA Validation
  const qaIssues = useMemo(() => {
    return validateAnnotations(annotations, currentDataset.width, currentDataset.height);
  }, [annotations, currentDataset.width, currentDataset.height]);

  // Dataset Switcher Handler
  const handleSelectDataset = (dataset: ImageDatasetItem) => {
    setCurrentDataset(dataset);
    setClasses(dataset.defaultClasses);
    setActiveClass(dataset.defaultClasses[0]);
    setAnnotations(dataset.sampleAnnotations);
    setSelectedAnnotationId(null);
    setHistory([dataset.sampleAnnotations]);
    setHistoryIndex(0);
    setTransform({ scale: 0.9, offsetX: 60, offsetY: 40 });
  };

  // Custom Image Upload Handler
  const handleUploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const customItem: ImageDatasetItem = {
          id: `custom-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          category: 'User Upload',
          imageUrl: result,
          width: img.width,
          height: img.height,
          defaultClasses: classes,
          sampleAnnotations: [],
          guidelines: [
            'User-uploaded imagery guidelines.',
            'Delineate visible targets with bounding boxes or polygon segmentation.',
            'Maintain edge-to-edge precision and document rationales for ambiguous items.'
          ]
        };
        handleSelectDataset(customItem);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Add Annotation
  const handleAddAnnotation = (ann: Annotation) => {
    const updated = [...annotations, ann];
    setAnnotations(updated);
    pushHistory(updated);
  };

  // Update Annotation
  const handleUpdateAnnotation = (updatedAnn: Annotation) => {
    const updated = annotations.map(a => (a.id === updatedAnn.id ? updatedAnn : a));
    setAnnotations(updated);
    pushHistory(updated);
  };

  // Delete Annotation
  const handleDeleteAnnotation = (id: string) => {
    const updated = annotations.filter(a => a.id !== id);
    setAnnotations(updated);
    pushHistory(updated);
  };

  // Import parsed annotations from modal
  const handleImportAnnotations = (newAnns: Annotation[]) => {
    const merged = [...annotations, ...newAnns];
    setAnnotations(merged);
    pushHistory(merged);
  };

  // Viewport Zoom Actions
  const handleZoomIn = () => {
    setTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 5.0) }));
  };

  const handleZoomOut = () => {
    setTransform(prev => ({ ...prev, scale: Math.max(prev.scale * 0.8, 0.2) }));
  };

  const handleResetZoom = () => {
    setTransform(prev => ({ ...prev, scale: 1.0, offsetX: 60, offsetY: 40 }));
  };

  const handleFitToScreen = () => {
    setTransform({ scale: 0.8, offsetX: 50, offsetY: 30 });
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      // Class hotkeys (1-9)
      if (e.key >= '1' && e.key <= '9') {
        const targetClass = classes.find(c => c.hotkey === e.key);
        if (targetClass) {
          setActiveClass(targetClass);
        }
      }

      // Tool Hotkeys
      switch (e.key.toLowerCase()) {
        case 'v':
          setActiveTool('select');
          break;
        case 'b':
          setActiveTool('box');
          break;
        case 'p':
          setActiveTool('polygon');
          break;
        case 'k':
          setActiveTool('point');
          break;
        case 'h':
          setActiveTool('pan');
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          handleResetZoom();
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) handleRedo();
            else handleUndo();
          }
          break;
        case 'y':
          if (e.ctrlKey || e.metaKey) {
            handleRedo();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [classes, handleUndo, handleRedo]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      {/* Top Navigation Bar */}
      <TopNav
        datasets={datasets}
        currentDataset={currentDataset}
        onSelectDataset={handleSelectDataset}
        onUploadImage={handleUploadImage}
        scale={transform.scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onFitToScreen={handleFitToScreen}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenExportModal={() => setIsExportOpen(true)}
        onToggleGuidelines={() => setIsGuidelinesOpen(!isGuidelinesOpen)}
        qaIssues={qaIssues}
        onOpenQATab={() => setSidebarTab('qa')}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Rapid Tool Palette */}
        <LeftToolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels(!showLabels)}
          showCrosshairs={showCrosshairs}
          onToggleCrosshairs={() => setShowCrosshairs(!showCrosshairs)}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          fillOpacity={fillOpacity}
          onChangeFillOpacity={setFillOpacity}
        />

        {/* Central High-Performance Canvas */}
        <AnnotationCanvas
          datasetItem={currentDataset}
          annotations={annotations}
          activeTool={activeTool}
          activeClass={activeClass}
          classes={classes}
          selectedAnnotationId={selectedAnnotationId}
          onSelectAnnotation={(id) => {
            setSelectedAnnotationId(id);
            if (id) setSidebarTab('inspector');
          }}
          onAddAnnotation={handleAddAnnotation}
          onUpdateAnnotation={handleUpdateAnnotation}
          onDeleteAnnotation={handleDeleteAnnotation}
          transform={transform}
          onTransformChange={setTransform}
          showLabels={showLabels}
          showCrosshairs={showCrosshairs}
          showGrid={showGrid}
          fillOpacity={fillOpacity}
          qaIssues={qaIssues}
          onCursorMove={setCursorPos}
        />

        {/* Right Inspection & Taxonomy Sidebar */}
        <RightSidebar
          classes={classes}
          activeClass={activeClass}
          onSelectClass={setActiveClass}
          onAddClass={(newCls) => setClasses(prev => [...prev, newCls])}
          annotations={annotations}
          selectedAnnotationId={selectedAnnotationId}
          onSelectAnnotation={setSelectedAnnotationId}
          onUpdateAnnotation={handleUpdateAnnotation}
          onDeleteAnnotation={handleDeleteAnnotation}
          qaIssues={qaIssues}
          activeTab={sidebarTab}
          onChangeTab={setSidebarTab}
        />
      </div>

      {/* Bottom Status Bar */}
      <StatusBar
        cursorPos={cursorPos}
        scale={transform.scale}
        totalAnnotations={annotations.length}
        qaIssues={qaIssues}
        activeTool={activeTool}
      />

      {/* Dataset Guidelines Slide-Out Drawer */}
      <GuidelineDrawer
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
        datasetItem={currentDataset}
      />

      {/* Export / Import Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        annotations={annotations}
        classes={classes}
        datasetItem={currentDataset}
        onImportAnnotations={handleImportAnnotations}
      />
    </div>
  );
}