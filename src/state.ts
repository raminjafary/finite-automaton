export class State<T extends unknown> {
  accpeting: boolean;
  transitions: Map<string, Set<T>>;

  constructor({ accpeting = false }) {
    this.accpeting = accpeting;
    this.transitions = new Map<string, Set<T>>();
  }

  addTransition(symbol: string, state: T) {
    this.getTransitionsOnSymbol(symbol).add(state);
    return this;
  }

  getTransitions() {
    return this.transitions;
  }

  getTransitionsOnSymbol(symbol: string) {
    let transitions = this.transitions.get(symbol) || new Set<T>();

    this.transitions.set(symbol, transitions);

    return transitions;
  }
}
