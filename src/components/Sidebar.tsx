import React, { useState, useMemo, useEffect } from 'react';
import { useDFAStore } from '../store/dfaStore';
import { Play, Pause, SkipBack, SkipForward, Settings2, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import type { DFA } from '../types/dfa';

export const Sidebar: React.FC = () => {
  const { setDFA, steps, currentStepIndex, isPlaying, setStep, setIsPlaying } = useDFAStore();

  const [rawStates, setRawStates] = useState('q0, q1, q2');
  const [rawAlphabet, setRawAlphabet] = useState('0, 1');
  const [startState, setStartState] = useState('q0');
  const [acceptStates, setAcceptStates] = useState<string[]>(['q2']);
  
  const [transitions, setTransitions] = useState<Record<string, Record<string, string>>>({});
  const [error, setError] = useState<string | null>(null);

  // Auto-playback effect
  useEffect(() => {
    let interval: number;
    if (isPlaying && steps.length > 0) {
      interval = window.setInterval(() => {
        if (currentStepIndex < steps.length - 1) {
          setStep(currentStepIndex + 1);
        } else {
          setIsPlaying(false);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStepIndex, steps.length, setStep, setIsPlaying]);

  const parsedStates = useMemo(() => {
    return rawStates.split(',').map(s => s.trim()).filter(Boolean);
  }, [rawStates]);

  const parsedAlphabet = useMemo(() => {
    return rawAlphabet.split(',').map(s => s.trim()).filter(Boolean);
  }, [rawAlphabet]);

  const handleTransitionChange = (state: string, symbol: string, nextState: string) => {
    setTransitions(prev => ({
      ...prev,
      [state]: {
        ...(prev[state] || {}),
        [symbol]: nextState.trim()
      }
    }));
  };

  const handleToggleAcceptState = (state: string) => {
    setAcceptStates(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  const loadExample = () => {
    setRawStates('A, B, C, D, E, F');
    setRawAlphabet('0, 1');
    setStartState('A');
    setAcceptStates(['C', 'D', 'E']);
    setTransitions({
      'A': { '0': 'B', '1': 'C' },
      'B': { '0': 'A', '1': 'D' },
      'C': { '0': 'E', '1': 'F' },
      'D': { '0': 'E', '1': 'F' },
      'E': { '0': 'E', '1': 'F' },
      'F': { '0': 'F', '1': 'F' }
    });
    toast.success('Loaded classic 6-state reducible DFA!');
  };

  const handleGenerate = () => {
    setError(null);
    
    if (parsedStates.length === 0) return setError('At least one state is required.');
    if (parsedAlphabet.length === 0) return setError('Alphabet cannot be empty.');
    if (!startState || !parsedStates.includes(startState)) return setError('Invalid or missing start state.');

    let modifiedStates = [...parsedStates];
    const modifiedTransitions: Record<string, Record<string, string>> = JSON.parse(JSON.stringify(transitions));
    let hasAddedTrap = false;

    // Validate transitions and auto-complete with Trap state
    for (const state of modifiedStates) {
      if (!modifiedTransitions[state]) modifiedTransitions[state] = {};
      
      for (const symbol of parsedAlphabet) {
        const nextState = modifiedTransitions[state][symbol];
        
        if (!nextState || !modifiedStates.includes(nextState)) {
          if (!hasAddedTrap) {
            hasAddedTrap = true;
            if (!modifiedStates.includes('Trap')) {
              modifiedStates.push('Trap');
            }
            // Ensure Trap loops on itself
            modifiedTransitions['Trap'] = {};
            for (const sym of parsedAlphabet) {
              modifiedTransitions['Trap'][sym] = 'Trap';
            }
          }
          modifiedTransitions[state][symbol] = 'Trap';
        }
      }
    }

    if (hasAddedTrap) {
      toast('Incomplete transitions detected. Added a "Trap" state automatically!', {
        icon: '⚠️',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      // Update UI explicitly as well
      setRawStates(modifiedStates.join(', '));
      setTransitions(modifiedTransitions);
    }

    // Validate accept states safely mapped
    const validAcceptStates = acceptStates.filter(s => modifiedStates.includes(s));

    const dfa: DFA = {
      states: modifiedStates,
      alphabet: parsedAlphabet,
      transitions: modifiedTransitions,
      startState,
      acceptStates: validAcceptStates
    };

    setDFA(dfa);
  };

  return (
    <div className="flex flex-col h-full bg-white text-slate-800">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
            <Settings2 className="w-5 h-5 text-indigo-500" />
            DFA Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-1">Define the properties of your DFA</p>
        </div>
        <button onClick={loadExample} className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold px-2.5 py-1.5 rounded bg-indigo-50 hover:bg-indigo-100 transition-colors uppercase tracking-wider border border-indigo-200 shadow-sm">
          Load Example
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Step 1: Base Definition */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">1. Base Definition</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">States (Q)</label>
              <input 
                type="text" 
                value={rawStates}
                onChange={(e) => setRawStates(e.target.value)}
                placeholder="q0, q1, q2"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
              <p className="text-[10px] text-slate-400 mt-1">Comma separated identifiers</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Alphabet (Σ)</label>
              <input 
                type="text" 
                value={rawAlphabet}
                onChange={(e) => setRawAlphabet(e.target.value)}
                placeholder="0, 1"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Step 2: Start and Accept States */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">2. Initial & Accept</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Start State (q₀)</label>
              <select 
                value={startState}
                onChange={(e) => setStartState(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Select Start State --</option>
                {parsedStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Accept States (F)</label>
              <div className="flex flex-wrap gap-2">
                {parsedStates.length > 0 ? parsedStates.map(state => {
                  const isSelected = acceptStates.includes(state);
                  return (
                    <button
                      key={state}
                      onClick={() => handleToggleAcceptState(state)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                        isSelected 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {state}
                    </button>
                  );
                }) : (
                  <p className="text-xs text-slate-400 italic">Define states first</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Step 3: Transition Table */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">3. Transition Function (δ)</h3>
          
          {parsedStates.length > 0 && parsedAlphabet.length > 0 ? (
            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 font-medium w-1/4">State</th>
                    {parsedAlphabet.map(symbol => (
                      <th key={symbol} className="px-3 py-2 font-medium text-center border-l border-slate-200">
                        Input: <span className="font-bold text-indigo-600">{symbol}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedStates.map(state => (
                    <tr key={state} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-3 py-2 font-medium text-slate-700 flex items-center gap-1">
                        {state === startState && <ArrowRight className="w-3 h-3 text-indigo-500" />}
                        {state}
                        {acceptStates.includes(state) && <span className="ml-1 text-[10px] w-4 h-4 rounded-full border border-indigo-500 text-indigo-500 flex items-center justify-center font-bold relative -top-0.5">*</span>}
                      </td>
                      {parsedAlphabet.map(symbol => (
                        <td key={symbol} className="px-2 py-1.5 border-l border-slate-100">
                          <input 
                            type="text"
                            value={transitions[state]?.[symbol] || ''}
                            onChange={(e) => handleTransitionChange(state, symbol, e.target.value)}
                            className="w-full text-center px-2 py-1 text-sm bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Next"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic rounded-lg p-3 bg-slate-50 border border-slate-100">
              Define states and alphabet to configure transitions.
            </p>
          )}
        </section>

      </div>

      <div className="p-5 border-t border-slate-100 bg-white">
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-100 flex items-start gap-2 text-red-600 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        <button 
          onClick={handleGenerate}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-indigo-200 flex items-center justify-center gap-2 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Play className="w-4 h-4" />
          Generate DFA
        </button>

        {steps.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Playback Controls</h3>
            
            <div className="flex items-center justify-between gap-2">
              <button onClick={() => setStep(Math.max(0, currentStepIndex - 1))} disabled={currentStepIndex === 0} className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-50 text-slate-600 transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition-colors">
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>
              <button onClick={() => setStep(Math.min(steps.length - 1, currentStepIndex + 1))} disabled={currentStepIndex === steps.length - 1} className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-50 text-slate-600 transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>Step {currentStepIndex + 1}</span>
                <span>of {steps.length}</span>
              </div>
              <input 
                type="range" 
                min={0} 
                max={steps.length - 1} 
                value={currentStepIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setStep(parseInt(e.target.value));
                }}
                className="w-full accent-indigo-600 outline-none h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
