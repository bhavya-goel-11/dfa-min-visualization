export interface DFA {
  states: string[];
  alphabet: string[];
  transitions: Record<string, Record<string, string>>;
  startState: string;
  acceptStates: string[];
}
