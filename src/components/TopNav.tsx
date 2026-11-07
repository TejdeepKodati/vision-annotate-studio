import React, { useRef } from 'react';
import { 
  Scan, 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Undo2, 
  Redo2, 
  Download, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle,
  Heart
} from 'lucide-react';
import { ImageDatasetItem, QAIssue } from '../types/annotation';

interface TopNavProps {
  datasets: ImageDatasetItem[];
  currentDataset: ImageDatasetItem;
  onSelectDataset: (dataset: ImageDatasetItem) => void;
  onUploadImage: (file: File) => void;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToScreen: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenExportModal: () => void;
  onToggleGuidelines: () => void;
  qaIssues: QAIssue[];
  onOpenQATab: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  datasets,
  currentDataset,
  onSelectDataset,
  onUploadImage,
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenExportModal,
  onToggleGuidelines,
  qaIssues,
  onOpenQATab
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const errorCount = qaIssues.filter(i => i.severity === 'error').length;
  const warningCount = qaIssues.filter(i => i.severity === 'warning').length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadImage(e.target.files[0]);
    }
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between select-none shrink-0 z-20">
      {/* Brand & Project Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-950">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight leading-none flex items-center gap-1.5">
              VisionAnnotate <span className="text-emerald-400 font-semibold">Studio</span>
            </h1>
            <p className="text-[10px] text-slate-400 leading-none mt-1">CV Labeling & QA Platform</p>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* Benchmark Dataset Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={currentDataset.id}
            onChange={(e) => {
              const selected = datasets.find(d => d.id === e.target.value);
              if (selected) onSelectDataset(selected);
            }}
            className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer max-w-[210px] truncate"
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>

          {/* Custom Image Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload custom image (PNG, JPG, WEBP, SVG)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700/80 text-xs text-slate-200 border border-slate-700 rounded-md transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Upload Image</span>
          </button>
        </div>
      </div>

      {/* Middle Controls: Zoom & History */}
      <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800/80">
        {/* Undo / Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-1.5 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 rounded transition-colors"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="p-1.5 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 rounded transition-colors"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Zoom Controls */}
        <button
          onClick={onZoomOut}
          title="Zoom Out (-)"
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={onResetZoom}
          title="Click to reset 100% (0)"
          className="text-xs font-mono font-medium text-slate-300 px-2 py-0.5 hover:bg-slate-800 rounded min-w-[50px] text-center transition-colors"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          onClick={onZoomIn}
          title="Zoom In (+)"
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onFitToScreen}
          title="Fit Image to Viewport"
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Controls: Guidelines, QA Badge, Export & Mandatory Badge */}
      <div className="flex items-center gap-2">
        {/* QA Status Button */}
        <button
          onClick={onOpenQATab}
          title="Geometric QA Auditor"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border transition-colors ${
            errorCount > 0
              ? 'bg-rose-950/60 border-rose-600/40 text-rose-300 hover:bg-rose-900/60'
              : warningCount > 0
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60'
              : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
          }`}
        >
          {errorCount > 0 ? (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          ) : warningCount > 0 ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span className="font-medium">
            {errorCount > 0
              ? `${errorCount} Err`
              : warningCount > 0
              ? `${warningCount} Warn`
              : 'QA Pass'}
          </span>
        </button>

        {/* Guidelines Drawer Button */}
        <button
          onClick={onToggleGuidelines}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700/80 text-xs text-slate-200 border border-slate-700 rounded-md transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden lg:inline">Guidelines</span>
        </button>

        {/* Export Modal Trigger */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white rounded-md shadow-sm shadow-emerald-950 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export / Import</span>
        </button>

        {/* MANDATORY BADGE: made with ♥ by Tejdeep */}
        <a
          href="https://github.com/TejdeepKodati/vision-annotate-studio"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-500/30 rounded-full transition-colors ml-1"
        >
          made with ♥ by Tejdeep
        </a>
      </div>
    </header>
  );
};