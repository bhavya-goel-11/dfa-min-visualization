import React from 'react';
import { useDFAStore } from '../store/dfaStore';
import { Network } from 'lucide-react';
import { DFAGraph } from './DFAGraph';
import { PartitionTable } from './PartitionTable';

export const MainCanvas: React.FC = () => {
  const { dfa } = useDFAStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-between text-slate-400 w-full h-full relative">
      {dfa ? (
        <>
          <div className="flex-1 w-full bg-slate-50">
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
