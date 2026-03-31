import type { DFA } from '../types/dfa';

export interface StepSummary {
  stepDescription: string;
  currentPartitions: string[][];
  transitionTable: Record<string, Record<string, number>>;
  isFinal: boolean;
}

/**
 * Pure function implementing Moore's Partition Algorithm for DFA Minimization.
 * Generates an array of step summaries to visualize the algorithm step-by-step.
 */
export const minimizeDFA = (dfa: DFA): StepSummary[] => {
  const steps: StepSummary[] = [];
  const { states, alphabet, transitions, startState, acceptStates } = dfa;

  // Helper to find which partition a state belongs to by returning the partition index
  const getPartitionIndex = (partitions: string[][], state: string): number => {
    return partitions.findIndex(group => group.includes(state));
  };

  // --- Step 1: Remove Unreachable States ---
  const reachable = new Set<string>();
  const queue: string[] = [startState];
  reachable.add(startState);

  // Breadth-First Search to find all reachable states
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const symbol of alphabet) {
      const nextState = transitions[current]?.[symbol];
      if (nextState && !reachable.has(nextState)) {
        reachable.add(nextState);
        queue.push(nextState);
      }
    }
  }

  // Determine reachable and unreachable sets
  const reachableStates = Array.from(reachable).sort();
  const unreachableStates = states.filter(s => !reachable.has(s)).sort();
  
  // Filter accept and non-accept states strictly to reachable ones
  const reachableAccept = acceptStates.filter(s => reachable.has(s)).sort();
  const reachableNonAccept = reachableStates.filter(s => !reachableAccept.includes(s)).sort();

  // Helper to build the transition snapshot for the current partition state
  // This maps: state -> symbol -> target partition index
  const buildTransitionTable = (partitions: string[][]) => {
    const table: Record<string, Record<string, number>> = {};
    for (const state of reachableStates) {
      table[state] = {};
      for (const symbol of alphabet) {
        const nextState = transitions[state]?.[symbol];
        if (nextState) {
          table[state][symbol] = getPartitionIndex(partitions, nextState);
        } else {
          table[state][symbol] = -1; // Fallback for invalid transitions
        }
      }
    }
    return table;
  };

  // Record Step 1
  const step1Partitions = [reachableStates];
  steps.push({
    stepDescription: `Step 1: Removed unreachable states. Reachable: {${reachableStates.join(', ')}}${unreachableStates.length > 0 ? `. Unreachable (removed): {${unreachableStates.join(', ')}}` : ' (All states reachable)'}.`,
    currentPartitions: step1Partitions,
    transitionTable: buildTransitionTable(step1Partitions),
    isFinal: false
  });

  // --- Step 2: Initial Partition P0 ---
  // Default Moore's initialization splits states into Accept and Non-Accept groups
  let currentPartitions: string[][] = [];
  if (reachableNonAccept.length > 0) currentPartitions.push(reachableNonAccept);
  if (reachableAccept.length > 0) currentPartitions.push(reachableAccept);

  let transitionTable = buildTransitionTable(currentPartitions);
  
  steps.push({
    stepDescription: `Step 2: Initial Partition P0. Separating Accept {${reachableAccept.join(', ')}} and Non-Accept {${reachableNonAccept.join(', ')}} states.`,
    currentPartitions: JSON.parse(JSON.stringify(currentPartitions)), // Capture snapshot
    transitionTable,
    isFinal: false
  });

  // --- Step 3 & 4: Iterative Refinement ---
  let stepCounter = 1;
  let hasChanges = true;

  while (hasChanges) {
    hasChanges = false;
    const nextPartitions: string[][] = [];

    // For each bounded group in the current partition
    for (const group of currentPartitions) {
      // Group states by their transition "signature"
      // Signature is a string representing the target partition index for each alphabet symbol
      const signatures: Record<string, string[]> = {};

      for (const state of group) {
        const signatureParts = alphabet.map(symbol => transitionTable[state][symbol]);
        const signature = signatureParts.join(','); // e.g. "0,1" meaning input A goes to P0, input B goes to P1
        
        if (!signatures[signature]) {
          signatures[signature] = [];
        }
        signatures[signature].push(state);
      }

      const newGroups = Object.values(signatures);
      // If a group splits into subsets, it means they behave differently and partitions changed
      if (newGroups.length > 1) {
        hasChanges = true;
      }

      nextPartitions.push(...newGroups);
    }

    // Sort heavily to ensure deterministic grouping comparisons
    for (const p of nextPartitions) {
      p.sort();
    }
    nextPartitions.sort((a, b) => {
      if (a.length !== b.length) return b.length - a.length;
      return a[0].localeCompare(b[0]);
    });

    if (hasChanges) {
      currentPartitions = nextPartitions;
      transitionTable = buildTransitionTable(currentPartitions);
      
      steps.push({
        stepDescription: `Step 3 (Iteration ${stepCounter}): Partition P${stepCounter}. Split groups based on diverging transitions resolving to different partition destinations.`,
        currentPartitions: JSON.parse(JSON.stringify(currentPartitions)),
        transitionTable,
        isFinal: false
      });
      stepCounter++;
    } else {
      // Step 4: No changes means P_n == P_{n-1}. We found the minimal DFA partitions.
      steps.push({
        stepDescription: `Step 4: Algorithm terminated. P${stepCounter} is identical to P${stepCounter - 1}. The minimal DFA has ${currentPartitions.length} states.`,
        currentPartitions: JSON.parse(JSON.stringify(currentPartitions)),
        transitionTable, // Unchanged from previous step, but explicitly passed
        isFinal: true
      });
    }
  }

  return steps;
};
