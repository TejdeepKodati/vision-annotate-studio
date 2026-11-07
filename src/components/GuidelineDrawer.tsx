import React from 'react';
import { X, BookOpen, CheckCircle, AlertOctagon, HelpCircle } from 'lucide-react';
import { ImageDatasetItem } from '../types/annotation';

interface GuidelineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  datasetItem: ImageDatasetItem;
}

export const GuidelineDrawer: React.FC<GuidelineDrawerProps> = ({
  isOpen,
  onClose,
  datasetItem
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs select-none animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100">Dataset Guidelines</h2>
              <p className="text-[11px] text-slate-400">{datasetItem.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Guideline Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-300">
          {/* Rules List */}
          <div>
            <h3 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Annotation Protocol Rules
            </h3>
            <ul className="space-y-2">
              {datasetItem.guidelines.map((g, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-mono text-emerald-400 font-bold shrink-0">{idx + 1}.</span>
                  <span className="leading-relaxed">{g}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Occlusion & Boundary Standards */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 text-xs">Occlusion Handling Criteria</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              If an object is partially obscured by foliage, infrastructure, or other targets:
            </p>
            <div className="space-y-1.5 pt-1 text-[11px]">
              <div className="flex items-center gap-2 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>&gt; 50% Visible: Draw full estimated bounding box; enable Occluded flag.</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>20% - 50% Visible: Annotate only if class identity is unambiguous.</span>
              </div>
              <div className="flex items-center gap-2 text-rose-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>&lt; 20% Visible: Discard and do not annotate (prevents false-positive noise).</span>
              </div>
            </div>
          </div>

          {/* Negative Examples / What Not to Annotate */}
          <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-900/30 space-y-2">
            <h4 className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5" />
              Negative Examples (Do Not Annotate)
            </h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
              <li>Reflections in puddles, glass facades, or water bodies.</li>
              <li>Microscopic artifacts or dust particles under 15 pixels.</li>
              <li>Projected vehicular shadows on asphalt.</li>
            </ul>
          </div>

          {/* Annotator Pre-Flight Checklist */}
          <div>
            <h4 className="font-bold text-slate-200 text-xs mb-2">Pre-Export QA Checklist</h4>
            <div className="space-y-2 text-[11px]">
              <label className="flex items-center gap-2 p-2 bg-slate-800/40 rounded-lg cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-700 text-emerald-500" />
                <span>All polygon contours snapped and closed</span>
              </label>
              <label className="flex items-center gap-2 p-2 bg-slate-800/40 rounded-lg cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-700 text-emerald-500" />
                <span>Zero duplicate overlap collisions (IoU &lt; 0.90)</span>
              </label>
              <label className="flex items-center gap-2 p-2 bg-slate-800/40 rounded-lg cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-700 text-emerald-500" />
                <span>Edge cases documented with rationales</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-md shadow transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};