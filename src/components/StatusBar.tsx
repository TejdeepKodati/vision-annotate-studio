import React from 'react';
import { Point2D, QAIssue } from '../types/annotation';
import { Heart } from 'lucide-react';

interface StatusBarProps {
  cursorPos: Point2D;
  scale: number;
  totalAnnotations: number;
  qaIssues: QAIssue[];
  activeTool: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  cursorPos,
  scale,
  totalAnnotations,
  qaIssues,
  activeTool
}) => {
  const errorCount = qaIssues.filter(q => q.severity === 'error').length;
  const warnCount = qaIssues.filter(q => q.severity === 'warning').length;

  return (
    <footer className="h-7 bg-slate-950 border-t border-slate-800 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none shrink-0 z-20">
      {/* Left: Tool Tip & Coordinate Readouts */}
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>TOOL: <span className="text-emerald-400 font-bold uppercase">{activeTool}</span></span>
        </span>
        <div className="h-3 w-px bg-slate-800" />
        <span>
          X: <span className="text-slate-200">{cursorPos.x}</span> px
          {'  '}Y: <span className="text-slate-200">{cursorPos.y}</span> px
        </span>
        <div className="h-3 w-px bg-slate-800 hidden sm:block" />
        <span className="hidden sm:inline">
          SCALE: <span className="text-slate-200">{Math.round(scale * 100)}%</span>
        </span>
      </div>

      {/* Right: Annotation Count, QA Status & Mandatory Badge */}
      <div className="flex items-center gap-4">
        <span>
          OBJECTS: <span className="text-emerald-400 font-bold">{totalAnnotations}</span>
        </span>
        <div className="h-3 w-px bg-slate-800" />
        <span
          className={
            errorCount > 0
              ? 'text-rose-400 font-bold'
              : warnCount > 0
              ? 'text-amber-400 font-bold'
              : 'text-emerald-400 font-bold'
          }
        >
          {errorCount > 0
            ? `QA: ${errorCount} ERRORS`
            : warnCount > 0
            ? `QA: ${warnCount} WARNINGS`
            : 'QA: PASS'}
        </span>
        <div className="h-3 w-px bg-slate-800" />
        
        {/* MANDATORY BADGE: made with ♥ by Tejdeep */}
        <a
          href="https://github.com/TejdeepKodati/vision-annotate-studio"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 font-sans text-[11px]"
        >
          made with ♥ by Tejdeep
        </a>
      </div>
    </footer>
  );
};