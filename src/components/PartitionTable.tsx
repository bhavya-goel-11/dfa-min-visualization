import React from 'react';
import { useDFAStore } from '../store/dfaStore';

export const PartitionTable: React.FC = () => {
  const { dfa, steps, currentStepIndex } = useDFAStore();

  if (!dfa || !steps.length) return null;

  const step = steps[currentStepIndex];
  const { currentPartitions, transitionTable } = step;

  return (
    <div className="w-full bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 p-4 max-h-[35%] overflow-y-auto">
      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
        Equivalence Classes (Step {currentStepIndex + 1})
      </h3>
      
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-4 py-2 font-medium w-12 border-r border-slate-200 text-center">Group</th>
              <th className="px-4 py-2 font-medium w-1/4">States</th>
              {dfa.alphabet.map(symbol => (
                <th key={symbol} className="px-4 py-2 font-medium text-center border-l border-slate-200">
                  Target (on '<span className="font-bold text-indigo-600">{symbol}</span>')
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentPartitions.map((group, pIndex) => (
              <tr key={pIndex} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-2 font-bold text-slate-500 text-center border-r border-slate-200">
                  P{pIndex}
                </td>
                <td className="px-0 py-0 font-medium text-slate-700 align-top">
                  <div className="flex flex-col h-full divide-y divide-slate-50">
                    {group.map(state => (
                      <span key={state} className="py-1 px-4 block text-xs">{state}</span>
                    ))}
                  </div>
                </td>
                {dfa.alphabet.map(symbol => (
                  <td key={symbol} className="px-0 py-0 border-l border-slate-100 align-top">
                    <div className="flex flex-col h-full divide-y divide-slate-50">
                      {group.map(state => {
                        const targetP = transitionTable[state]?.[symbol];
                        return (
                          <span key={state} className="py-1 px-2 text-center text-xs text-slate-600 block whitespace-nowrap">
                            {state} → {targetP !== undefined && targetP !== -1 ? <span className="font-semibold text-indigo-600">P{targetP}</span> : <span className="text-slate-400 italic">None</span>}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
