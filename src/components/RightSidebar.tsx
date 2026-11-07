import React, { useState } from 'react';
import { 
  Annotation, 
  BoundingBox, 
  LabelClass, 
  QAIssue 
} from '../types/annotation';
import { 
  Tag, 
  ListFilter, 
  Sliders, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Trash2, 
  Plus, 
  Check, 
  HelpCircle,
  Wrench
} from 'lucide-react';

interface RightSidebarProps {
  classes: LabelClass[];
  activeClass: LabelClass;
  onSelectClass: (c: LabelClass) => void;
  onAddClass: (c: LabelClass) => void;
  annotations: Annotation[];
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;
  onUpdateAnnotation: (ann: Annotation) => void;
  onDeleteAnnotation: (id: string) => void;
  qaIssues: QAIssue[];
  activeTab: 'classes' | 'annotations' | 'inspector' | 'qa';
  onChangeTab: (tab: 'classes' | 'annotations' | 'inspector' | 'qa') => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  classes,
  activeClass,
  onSelectClass,
  onAddClass,
  annotations,
  selectedAnnotationId,
  onSelectAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  qaIssues,
  activeTab,
  onChangeTab
}) => {
  // New Class Form Modal State
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassColor, setNewClassColor] = useState('#EC4899');
  const [newClassHotkey, setNewClassHotkey] = useState('7');

  const selectedAnnotation = annotations.find(a => a.id === selectedAnnotationId);

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newCls: LabelClass = {
      id: `custom-class-${Date.now()}`,
      name: newClassName.trim(),
      color: newClassColor,
      hotkey: newClassHotkey || String(classes.length + 1),
      description: 'Custom user-defined label category',
      category: 'Custom'
    };
    onAddClass(newCls);
    onSelectClass(newCls);
    setNewClassName('');
    setIsAddingClass(false);
  };

  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col select-none shrink-0 z-10 h-full">
      {/* Tab Navigation Header */}
      <div className="flex border-b border-slate-800 bg-slate-950/70 p-1 gap-1 text-xs font-medium">
        <button
          onClick={() => onChangeTab('classes')}
          className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'classes'
              ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Classes</span>
        </button>

        <button
          onClick={() => onChangeTab('annotations')}
          className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'annotations'
              ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>List ({annotations.length})</span>
        </button>

        <button
          onClick={() => onChangeTab('inspector')}
          className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'inspector'
              ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>

        <button
          onClick={() => onChangeTab('qa')}
          className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'qa'
              ? 'bg-slate-800 text-rose-400 font-semibold shadow-sm'
              : qaIssues.length > 0
              ? 'text-amber-400 hover:text-amber-300'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>QA {qaIssues.length > 0 && `(${qaIssues.length})`}</span>
        </button>
      </div>

      {/* Tab 1: Label Taxonomy & Class Selector */}
      {activeTab === 'classes' && (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-1">
            <span>LABEL PALETTE (KEYS 1-9)</span>
            <button
              onClick={() => setIsAddingClass(!isAddingClass)}
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>

          {/* New Class Inline Form */}
          {isAddingClass && (
            <form onSubmit={handleCreateClass} className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 flex flex-col gap-2 mb-2">
              <input
                type="text"
                placeholder="Class name..."
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="bg-slate-900 text-xs text-slate-100 px-2 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-emerald-500"
                autoFocus
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={newClassColor}
                    onChange={(e) => setNewClassColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    maxLength={1}
                    value={newClassHotkey}
                    onChange={(e) => setNewClassHotkey(e.target.value)}
                    className="w-6 h-6 text-center text-xs bg-slate-900 text-slate-100 rounded border border-slate-700 font-mono"
                    placeholder="Key"
                  />
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsAddingClass(false)}
                    className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Classes List */}
          {classes.map((c) => {
            const isSelected = c.id === activeClass.id;
            const count = annotations.filter(a => a.classId === c.id).length;
            return (
              <div
                key={c.id}
                onClick={() => onSelectClass(c)}
                className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500/50 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: c.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{c.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{c.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                    {count}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {c.hotkey}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Annotations Hierarchy List */}
      {activeTab === 'annotations' && (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
          {annotations.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              No annotations yet. Use tools on the left to start labeling.
            </div>
          ) : (
            annotations.map((ann, idx) => {
              const isSelected = ann.id === selectedAnnotationId;
              const cls = classes.find(c => c.id === ann.classId);
              const color = cls?.color || '#10B981';
              const name = cls?.name || 'Object';
              const issues = qaIssues.filter(q => q.annotationId === ann.id);

              return (
                <div
                  key={ann.id}
                  onClick={() => {
                    onSelectAnnotation(ann.id);
                    onChangeTab('inspector');
                  }}
                  className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500/60 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">
                        {name} <span className="text-[10px] text-slate-500 font-mono">#{ann.id.slice(-4)}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 capitalize">
                        {ann.toolType} • {ann.confidence || 95}% conf
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {issues.length > 0 && (
                      <span className="text-[10px] text-amber-400" title={`${issues.length} QA warnings`}>
                        ⚠
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateAnnotation({
                          ...ann,
                          isVisible: ann.isVisible === false ? true : false
                        });
                      }}
                      className="p-1 text-slate-400 hover:text-slate-200 rounded"
                    >
                      {ann.isVisible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAnnotation(ann.id);
                        if (selectedAnnotationId === ann.id) onSelectAnnotation(null);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Detailed Inspector & Rationale Documentation */}
      {activeTab === 'inspector' && (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          {selectedAnnotation ? (
            <>
              {/* Class Reassignment */}
              <div>
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                  Taxonomy Class
                </label>
                <select
                  value={selectedAnnotation.classId}
                  onChange={(e) => onUpdateAnnotation({ ...selectedAnnotation, classId: e.target.value })}
                  className="w-full bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-md p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Geometric Coordinates Readout */}
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
                <p className="text-[10px] text-slate-500 font-sans uppercase mb-1">Geometry Metrics</p>
                {selectedAnnotation.toolType === 'box' && selectedAnnotation.bbox && (
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div>X: {Math.round(selectedAnnotation.bbox.x)} px</div>
                    <div>Y: {Math.round(selectedAnnotation.bbox.y)} px</div>
                    <div>W: {Math.round(selectedAnnotation.bbox.width)} px</div>
                    <div>H: {Math.round(selectedAnnotation.bbox.height)} px</div>
                    <div className="col-span-2 text-slate-400">
                      Area: {Math.round(selectedAnnotation.bbox.width * selectedAnnotation.bbox.height).toLocaleString()} px²
                    </div>
                  </div>
                )}
                {selectedAnnotation.toolType === 'polygon' && selectedAnnotation.points && (
                  <div>
                    <div>Vertices: {selectedAnnotation.points.length} points</div>
                    <div>Status: {selectedAnnotation.isClosed ? 'Closed Contour' : 'Open Path'}</div>
                  </div>
                )}
                {selectedAnnotation.toolType === 'point' && selectedAnnotation.points && (
                  <div>
                    <div>X: {Math.round(selectedAnnotation.points[0]?.x || 0)} px</div>
                    <div>Y: {Math.round(selectedAnnotation.points[0]?.y || 0)} px</div>
                  </div>
                )}
              </div>

              {/* Confidence Score Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Confidence Score
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {selectedAnnotation.confidence || 95}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={selectedAnnotation.confidence || 95}
                  onChange={(e) =>
                    onUpdateAnnotation({
                      ...selectedAnnotation,
                      confidence: parseInt(e.target.value, 10)
                    })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Occlusion & Truncation Flags */}
              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedAnnotation.isOccluded)}
                    onChange={(e) =>
                      onUpdateAnnotation({ ...selectedAnnotation, isOccluded: e.target.checked })
                    }
                    className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span>Occluded target</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedAnnotation.isTruncated)}
                    onChange={(e) =>
                      onUpdateAnnotation({ ...selectedAnnotation, isTruncated: e.target.checked })
                    }
                    className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span>Truncated boundary</span>
                </label>
              </div>

              {/* Rationale & Annotator Edge Case Notes */}
              <div>
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                  Rationale / Edge Case Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Document reasoning, occlusion context, or boundary ambiguity..."
                  value={selectedAnnotation.rationale || ''}
                  onChange={(e) =>
                    onUpdateAnnotation({ ...selectedAnnotation, rationale: e.target.value })
                  }
                  className="w-full bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-md p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              {/* Delete Action */}
              <button
                onClick={() => {
                  onDeleteAnnotation(selectedAnnotation.id);
                  onSelectAnnotation(null);
                }}
                className="w-full mt-2 py-2 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Annotation</span>
              </button>
            </>
          ) : (
            <div className="text-center py-12 text-xs text-slate-500">
              Select an annotation on the canvas or from the list to inspect and edit its properties.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Geometric QA Inspector */}
      {activeTab === 'qa' && (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          <div className="text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
            <span>AUTOMATED QA AUDITOR</span>
            <span className="text-[10px] text-slate-500">{qaIssues.length} issues found</span>
          </div>

          {qaIssues.length === 0 ? (
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-4 text-center">
              <Check className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
              <p className="text-xs font-medium text-emerald-300">100% Geometric QA Pass</p>
              <p className="text-[10px] text-slate-400 mt-1">
                No self-intersections, micro-boxes, or invalid duplicates detected.
              </p>
            </div>
          ) : (
            qaIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => {
                  onSelectAnnotation(issue.annotationId);
                  onChangeTab('inspector');
                }}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  issue.severity === 'error'
                    ? 'bg-rose-950/40 border-rose-700/50 hover:bg-rose-900/40'
                    : issue.severity === 'warning'
                    ? 'bg-amber-950/40 border-amber-600/50 hover:bg-amber-900/40'
                    : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between font-semibold mb-1">
                  <span
                    className={
                      issue.severity === 'error'
                        ? 'text-rose-400'
                        : issue.severity === 'warning'
                        ? 'text-amber-400'
                        : 'text-slate-300'
                    }
                  >
                    {issue.type.replace('_', ' ').toUpperCase()}
                  </span>
                  {issue.metric && (
                    <span className="text-[10px] font-mono text-slate-400">{issue.metric}</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">{issue.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  );
};