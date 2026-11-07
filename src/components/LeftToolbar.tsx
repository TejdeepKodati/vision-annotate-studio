import React from 'react';
import { 
  MousePointer, 
  Square, 
  Pentagon, 
  Crosshair, 
  Hand, 
  Eye, 
  Grid3X3, 
  Layers
} from 'lucide-react';
import { AnnotationTool } from '../types/annotation';

interface LeftToolbarProps {
  activeTool: AnnotationTool;
  onSelectTool: (tool: AnnotationTool) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  showCrosshairs: boolean;
  onToggleCrosshairs: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  fillOpacity: number;
  onChangeFillOpacity: (opacity: number) => void;
}

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
  activeTool,
  onSelectTool,
  showLabels,
  onToggleLabels,
  showCrosshairs,
  onToggleCrosshairs,
  showGrid,
  onToggleGrid,
  fillOpacity,
  onChangeFillOpacity
}) => {
  const tools: { id: AnnotationTool; label: string; icon: React.ReactNode; hotkey: string }[] = [
    { id: 'select', label: 'Select & Move', icon: <MousePointer className="w-4 h-4" />, hotkey: 'V' },
    { id: 'box', label: 'Bounding Box', icon: <Square className="w-4 h-4" />, hotkey: 'B' },
    { id: 'polygon', label: 'Polygon Segment', icon: <Pentagon className="w-4 h-4" />, hotkey: 'P' },
    { id: 'point', label: 'Keypoint / Point', icon: <Crosshair className="w-4 h-4" />, hotkey: 'K' },
    { id: 'pan', label: 'Pan Canvas', icon: <Hand className="w-4 h-4" />, hotkey: 'H' }
  ];

  return (
    <aside className="w-14 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-3 select-none shrink-0 z-10 justify-between">
      {/* Primary Tool Selector */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        {tools.map((t) => {
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTool(t.id)}
              title={`${t.label} (${t.hotkey})`}
              className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center relative transition-all ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              {t.icon}
              <span className="text-[9px] font-mono leading-none mt-0.5 opacity-75">{t.hotkey}</span>
            </button>
          );
        })}

        <div className="w-8 h-px bg-slate-800 my-2" />

        {/* Visual Aids Toggles */}
        <button
          onClick={onToggleLabels}
          title={`Toggle Annotation Labels (${showLabels ? 'On' : 'Off'})`}
          className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center transition-all ${
            showLabels
              ? 'bg-slate-800 text-emerald-400 border border-slate-700'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span className="text-[8px] leading-none mt-0.5">Tag</span>
        </button>

        <button
          onClick={onToggleCrosshairs}
          title={`Toggle Crosshair Guidelines (${showCrosshairs ? 'On' : 'Off'})`}
          className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center transition-all ${
            showCrosshairs
              ? 'bg-slate-800 text-emerald-400 border border-slate-700'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          <Crosshair className="w-4 h-4" />
          <span className="text-[8px] leading-none mt-0.5">Hair</span>
        </button>

        <button
          onClick={onToggleGrid}
          title={`Toggle Background Grid Overlay (${showGrid ? 'On' : 'Off'})`}
          className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center transition-all ${
            showGrid
              ? 'bg-slate-800 text-emerald-400 border border-slate-700'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          <Grid3X3 className="w-4 h-4" />
          <span className="text-[8px] leading-none mt-0.5">Grid</span>
        </button>
      </div>

      {/* Fill Opacity Slider Control */}
      <div className="flex flex-col items-center gap-1 w-full px-2">
        <Layers className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[9px] font-mono text-slate-400">{Math.round(fillOpacity * 100)}%</span>
        <input
          type="range"
          min="0"
          max="0.8"
          step="0.05"
          value={fillOpacity}
          onChange={(e) => onChangeFillOpacity(parseFloat(e.target.value))}
          title="Annotation Fill Opacity"
          className="w-8 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>
    </aside>
  );
};