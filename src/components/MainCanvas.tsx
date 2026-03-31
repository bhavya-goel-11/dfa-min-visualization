import React from 'react';
import { useDFAStore } from '../store/dfaStore';
import { Network, Info } from 'lucide-react';
import { DFAGraph } from './DFAGraph';
import { PartitionTable } from './PartitionTable';

export const MainCanvas: React.FC = () => {
  const { dfa, steps, currentStepIndex } = useDFAStore();

  const currentStep = steps[currentStepIndex];

  return (
    <div className="flex-1 flex flex-col items-center justify-between text-slate-400 w-full h-full relative">
      {dfa ? (
        <>
          {currentStep && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-2xl bg-white/90 backdrop-blur-md px-6 py-4 rounded-xl shadow-lg border border-slate-200/60 flex items-start gap-3 transition-all duration-300">
              <Info className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">Virtual Tutor (Step {currentStepIndex + 1})</h4>
                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                  {currentStep.stepDescription}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex-1 w-full bg-slate-50 pt-20">
            <DFAGraph />
          </div>
          
          <PartitionTable />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 animate-pulse h-full">
          <Network className="w-16 h-16 opacity-30" />
          <p className="text-lg">Please configure and generate a DFA from the sidebar.</p>
        </div>
      )}
    </div>
  );
};
