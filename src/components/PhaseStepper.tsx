import React from 'react';
import { CheckCircle2, Circle, Clock, Flame, ChevronRight, HelpCircle } from 'lucide-react';
import { PHASE_NAMES, PHASE_COLORS } from '../initialData';

interface PhaseStepperProps {
  currentPhaseIndex: number; // The official phase index of the book (0 to 9)
  viewingPhaseIndex: number;  // The phase index the user is currently editing/inspecting in the form
  onSelectViewingPhase: (index: number) => void;
  onUpdateOfficialPhase: (index: number) => void;
}

export default function PhaseStepper({
  currentPhaseIndex,
  viewingPhaseIndex,
  onSelectViewingPhase,
  onUpdateOfficialPhase
}: PhaseStepperProps) {
  return (
    <div id="phase-stepper-root" className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
            Production Stage Pipeline
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Track and advance the project's official lifecycle across Milestone's 10 core phases.
          </p>
        </div>

        {/* Quick status badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Official Progress:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-2xs border ${PHASE_COLORS[currentPhaseIndex].text}`}>
            Step {currentPhaseIndex + 1}: {PHASE_NAMES[currentPhaseIndex]}
          </span>
        </div>
      </div>

      {/* 10-Step Interactive Visual Rail */}
      <div id="visual-timeline-rail" className="relative">
        
        {/* Horizontal connecting line behind keys */}
        <div className="absolute top-[22px] left-6 right-6 h-0.5 bg-slate-200 -z-0 hidden xl:block" />

        {/* Grid layout scrollable or wrapped */}
        <div className="grid grid-cols-2 sm:grid-cols-5 xl:grid-cols-10 gap-2.5 relative z-10">
          {PHASE_NAMES.map((name, idx) => {
            const isOfficial = idx === currentPhaseIndex;
            const isCompleted = idx < currentPhaseIndex;
            const isViewing = idx === viewingPhaseIndex;
            const isFuture = idx > currentPhaseIndex;

            // Pick border color based on viewing status or completion
            let borderStyle = 'border-slate-200 bg-white';
            let dotColor = 'bg-slate-300';
            let textColor = 'text-slate-500 hover:text-slate-800';

            if (isViewing) {
              borderStyle = 'border-slate-900 bg-slate-900 ring-2 ring-slate-900/10';
              dotColor = 'bg-white';
              textColor = 'text-white';
            } else if (isOfficial) {
              borderStyle = 'border-amber-400 bg-amber-50';
              dotColor = 'bg-amber-500 animate-pulse';
              textColor = 'text-amber-800 font-bold';
            } else if (isCompleted) {
              borderStyle = 'border-emerald-200 bg-emerald-50/60';
              dotColor = 'bg-emerald-600';
              textColor = 'text-emerald-700';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectViewingPhase(idx)}
                className={`group flex flex-col items-center xl:items-stretch text-left p-2 rounded-xl border transition-all duration-200 focus:outline-none ${borderStyle}`}
              >
                {/* Step indicator top bubble */}
                <div className="flex items-center justify-between w-full mb-1.5 xl:mb-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isViewing 
                      ? 'bg-white/20 text-white' 
                      : isOfficial 
                      ? 'bg-amber-100 text-amber-800' 
                      : isCompleted 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {idx + 1}
                  </span>

                  {/* Status Indicator Dot */}
                  <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                </div>

                {/* Step Label title */}
                <span className={`text-xs font-semibold font-display tracking-tight break-words line-clamp-1 xl:line-clamp-2 ${textColor}`}>
                  {name}
                </span>

                {/* Sub status subtitle */}
                <span className={`text-[9px] mt-0.5 hidden xl:block ${
                  isViewing 
                    ? 'text-slate-300' 
                    : isOfficial 
                    ? 'text-amber-600 font-medium' 
                    : isCompleted 
                    ? 'text-emerald-600' 
                    : 'text-slate-400'
                }`}>
                  {isViewing 
                    ? 'Inspecting' 
                    : isOfficial 
                    ? 'Active Step' 
                    : isCompleted 
                    ? 'Completed' 
                    : 'Pending'
                  }
                </span>

                {/* Small indicator if viewing matches this, to show they can mark as officially active */}
                {isViewing && !isOfficial && (
                  <div className="mt-1 pb-0.5 w-full hidden xl:block">
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateOfficialPhase(idx);
                      }}
                      className="text-[8px] tracking-wide font-extrabold uppercase bg-white text-slate-900 py-0.5 px-1.5 rounded block text-center hover:bg-slate-100 transition-colors"
                      title="Promote project to this official stage"
                    >
                      Activate
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Helpful Hint banner to advance steps manually in detail view */}
      <div className="flex items-center justify-between mt-4 p-2.5 bg-slate-50 rounded-xl border border-slate-150 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-slate-400" />
          <span>
            Clicking any stage selects it for <strong>inspection & editing</strong> below. To change the official book advancement stage, click <strong>"Activate Stage"</strong> in the detail header.
          </span>
        </div>
        <div className="text-slate-400 hidden sm:block">
          Step {viewingPhaseIndex + 1} Selected
        </div>
      </div>

    </div>
  );
}
