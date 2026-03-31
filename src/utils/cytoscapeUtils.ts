import type { DFA } from '../types/dfa';
import type { StepSummary } from '../algorithm/minimize';

const PASTEL_COLORS = [
  '#bfdbfe', // blue-200
  '#bbf7d0', // green-200
  '#fecaca', // red-200
  '#fef08a', // yellow-200
  '#e9d5ff', // purple-200
  '#fed7aa', // orange-200
  '#a7f3d0', // emerald-200
  '#fbcfe8', // pink-200
];

export const getStepCytoscapeElements = (dfa: DFA, step: StepSummary) => {
  const elements: any[] = [];
  const { currentPartitions, transitionTable, isFinal } = step;

  const getPartitionIndex = (state: string) => {
    return currentPartitions.findIndex(p => p.includes(state));
  };

  if (isFinal) {
    // Generate Merged DFA Graph
    for (let i = 0; i < currentPartitions.length; i++) {
      const group = currentPartitions[i];
      const id = group.join(',');
      const label = `{${group.join(', ')}}`;
      const isStart = group.includes(dfa.startState);
      const isAccept = group.some(s => dfa.acceptStates.includes(s));
      const color = PASTEL_COLORS[i % PASTEL_COLORS.length];

      const classes = [];
      if (isAccept) classes.push('accept');
      if (isStart) classes.push('start');

      elements.push({
        data: { id, label, bgColor: color },
        classes: classes.join(' ')
      });

      if (isStart) {
        elements.push({ data: { id: '_pseudo_start', label: '' }, classes: 'pseudo-start' });
        elements.push({ data: { source: '_pseudo_start', target: id, label: 'start' }, classes: 'pseudo-edge' });
      }
    }

    const transitionsMap: Record<string, Record<string, string[]>> = {};

    for (let i = 0; i < currentPartitions.length; i++) {
      const group = currentPartitions[i];
      const sourceId = group.join(',');
      const rep = group[0];
      
      transitionsMap[sourceId] = {};
      
      for (const symbol of dfa.alphabet) {
        const targetIndex = transitionTable[rep]?.[symbol];
        if (targetIndex !== undefined && targetIndex !== -1) {
          const targetId = currentPartitions[targetIndex].join(',');
          if (!transitionsMap[sourceId][targetId]) {
            transitionsMap[sourceId][targetId] = [];
          }
          transitionsMap[sourceId][targetId].push(symbol);
        }
      }
    }

    for (const source in transitionsMap) {
      for (const target in transitionsMap[source]) {
        const symbols = transitionsMap[source][target];
        elements.push({
          data: {
            id: `e_${source}_${target}`,
            source,
            target,
            label: symbols.join(', ')
          }
        });
      }
    }
  } else {
    // Coloring existing DFA based on step partitions
    for (const state of dfa.states) {
      const pIndex = getPartitionIndex(state);
      const color = pIndex === -1 ? '#f1f5f9' : PASTEL_COLORS[pIndex % PASTEL_COLORS.length];
      
      const isAccept = dfa.acceptStates.includes(state);
      const classes = [];
      if (isAccept) classes.push('accept');
      if (state === dfa.startState) classes.push('start');

      elements.push({
        data: { id: state, label: state, bgColor: color },
        classes: classes.join(' ')
      });
    }

    if (dfa.startState) {
      elements.push({ data: { id: '_pseudo_start', label: '' }, classes: 'pseudo-start' });
      elements.push({ data: { source: '_pseudo_start', target: dfa.startState, label: 'start' }, classes: 'pseudo-edge' });
    }

    const transitionsMap: Record<string, Record<string, string[]>> = {};
    for (const source of dfa.states) {
      transitionsMap[source] = {};
      for (const symbol in dfa.transitions[source] || {}) {
        const target = dfa.transitions[source][symbol];
        if (!transitionsMap[source][target]) {
          transitionsMap[source][target] = [];
        }
        transitionsMap[source][target].push(symbol);
      }
    }

    for (const source in transitionsMap) {
      for (const target in transitionsMap[source]) {
        const symbols = transitionsMap[source][target];
        elements.push({
          data: {
            id: `e_${source}_${target}`,
            source,
            target,
            label: symbols.join(', ')
          }
        });
      }
    }
  }

  return elements;
};
