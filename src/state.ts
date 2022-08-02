export class State {
  accpeting;
  transitions;

  constructor({ accpeting = false }) {
    this.accpeting = accpeting;
    this.transitions = new Map<string, Set<State>>();
  }

  addTransition(symbol: string, state: State) {
    this.getTransitionSymbol(symbol).add(state);
    return this;
  }

  getTransition() {
    return this.transitions;
  }

  getTransitionSymbol(symbol: string) {
    let transitions = this.transitions.get(symbol) || new Set<State>();

    this.transitions.set(symbol, transitions);

    return transitions;
  }
}
