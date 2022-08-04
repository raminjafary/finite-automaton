import { EPSILON, EPSILON_CLOSURE } from "./fragments";
import { NFAState } from "./nfa-state";

export class NFA {
  transitionTable: Record<string, Record<string, number[]>>;
  acceptingStates: Set<NFAState>;
  acceptingStateNumbers: Set<number>;
  alphabet: Set<string>;

  constructor(public initState: NFAState, public outState: NFAState) {
    this.initState = initState;
    this.outState = outState;
  }

  test(str: string) {
    return this.initState.test(str);
  }

  getAcceptingStates() {
    if (!this.acceptingStates) {
      this.getTransitionTable();
    }

    return this.acceptingStates;
  }

  getAcceptingStateNumbers() {
    if (!this.acceptingStateNumbers) {
      this.acceptingStateNumbers = new Set();
      for (const state of this.getAcceptingStates()) {
        this.acceptingStateNumbers.add(state.number);
      }
    }

    return this.acceptingStateNumbers;
  }

  getAlphabet() {
    if (!this.alphabet) {
      this.alphabet = new Set();
      const table = this.getTransitionTable();
      for (const state in table) {
        const transitions = table[state];

        for (const symbol in transitions) {
          if (symbol !== EPSILON) {
            this.alphabet.add(symbol);
          }
        }
      }
      return this.alphabet;
    }
  }

  getTransitionTable() {
    if (!this.transitionTable) {
      this.transitionTable = {};
      this.acceptingStates = new Set();

      const visited = new Set<NFAState>();
      const symbols = new Set<string>();

      const visitState = (state: NFAState) => {
        if (visited.has(state)) {
          return;
        }

        visited.add(state);

        state.number = visited.size;

        this.transitionTable[state.number] = {};

        if (state.accpeting) {
          this.acceptingStates.add(state);
        }

        const transitions = state.getTransitions();

        for (const [symbol, symbolTransition] of transitions) {
          let compinedState: number[] = [];
          symbols.add(symbol);

          for (const nextState of symbolTransition) {
            visitState(nextState);
            compinedState.push(nextState.number);
          }
          this.transitionTable[state.number][symbol] = compinedState;
        }
      };

      visitState(this.initState);

      visited.forEach((state) => {
        delete this.transitionTable[state.number][EPSILON];
        this.transitionTable[state.number][EPSILON_CLOSURE] = [
          ...state.getEpsilonClosure(),
        ].map((s) => s.number);
      });
    }
    return this.transitionTable;
  }
}
