import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  FileCode, 
  FileText 
} from 'lucide-react';
import { Annotation, ExportFormat, ImageDatasetItem, LabelClass } from '../types/annotation';
import { exportToCOCO, exportToPascalVOC, exportToYOLO, importFromJSON } from '../utils/exportFormats';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  annotations: Annotation[];
  classes: LabelClass[];
  datasetItem: ImageDatasetItem;
  onImportAnnotations: (newAnnotations: Annotation[]) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  annotations,
  classes,
  datasetItem,
  onImportAnnotations
}) => {
  const [activeTab, setActiveTab] = useState<ExportFormat | 'import'>('coco');
  const [copied, setCopied] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Format content calculations
  let codeContent = '';
  let filename = '';
  let mimeType = 'application/json';

  if (activeTab === 'coco') {
    codeContent = exportToCOCO(annotations, classes, datasetItem);
    filename = `${datasetItem.id}_coco.json`;
    mimeType = 'application/json';
  } else if (activeTab === 'yolo') {
    codeContent = exportToYOLO(annotations, classes, datasetItem.width, datasetItem.height);
    filename = `${datasetItem.id}_labels.txt`;
    mimeType = 'text/plain';
  } else if (activeTab === 'pascal_voc') {
    codeContent = exportToPascalVOC(annotations, classes, datasetItem);
    filename = `${datasetItem.id}_voc.xml`;
    mimeType = 'application/xml';
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([codeContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRunImport = () => {
    setImportError(null);
    if (!importJsonText.trim()) {
      setImportError('Please paste valid JSON annotations content.');
      return;
    }
    const res = importFromJSON(importJsonText, classes);
    if (res.errors.length > 0) {
      setImportError(res.errors.join('\n'));
      return;
    }
    onImportAnnotations(res.annotations);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs select-none p-4 animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl flex flex-col shadow-2xl max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 rounded-t-xl">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100">Dataset Export & Import</h2>
              <p className="text-[11px] text-slate-400">Industry Standard CV Annotation Formats</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('coco')}
            className={`py-2 px-3 border-b-2 transition-all ${
              activeTab === 'coco'
                ? 'border-emerald-400 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            COCO 1.0 JSON
          </button>
          <button
            onClick={() => setActiveTab('yolo')}
            className={`py-2 px-3 border-b-2 transition-all ${
              activeTab === 'yolo'
                ? 'border-emerald-400 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            YOLO TXT
          </button>
          <button
            onClick={() => setActiveTab('pascal_voc')}
            className={`py-2 px-3 border-b-2 transition-all ${
              activeTab === 'pascal_voc'
                ? 'border-emerald-400 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Pascal VOC XML
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`py-2 px-3 border-b-2 transition-all ${
              activeTab === 'import'
                ? 'border-emerald-400 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Import JSON
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
          {activeTab !== 'import' ? (
            <div className="relative">
              <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-300 overflow-x-auto max-h-[50vh] text-[11px] leading-relaxed">
                <code>{codeContent}</code>
              </pre>
            </div>
          ) : (
            <div className="space-y-3 font-sans">
              <p className="text-xs text-slate-300">
                Paste raw COCO 1.0 JSON annotations or VisionAnnotate Studio annotation array to merge into current scene:
              </p>
              <textarea
                rows={12}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"images": [...], "annotations": [...]}'
                className="w-full bg-slate-950 text-xs font-mono text-slate-200 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-emerald-500 resize-none"
              />
              {importError && (
                <div className="p-2.5 bg-rose-950/60 border border-rose-800/60 rounded text-xs text-rose-300">
                  {importError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 rounded-b-xl flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            {activeTab !== 'import' ? `${annotations.length} objects formatted` : 'Paste JSON to proceed'}
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'import' ? (
              <>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-md border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white rounded-md transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {filename}</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleRunImport}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white rounded-md transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Parse & Import</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};