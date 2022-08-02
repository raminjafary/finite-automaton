import { NFAState } from "./nfa-state";

export class NFA {
  initState;
  outState;

  constructor(initState: NFAState, outState: NFAState) {
    this.initState = initState;
    this.outState = outState;
  }

  test(str: string) {
    return this.initState.test(str)
  }
}
