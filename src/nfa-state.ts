import { EPSILON } from "./fragments";
import { State } from "./state";

export class NFAState extends State {
  test(str: string, visited = new Set<NFAState>()) {
    if (visited.has(this)) {
      return false;
    }

    visited.add(this);

    if (!str.length) {
      if (this.accpeting) {
        return true;

      }

      for (const nextState of this.getTransitionSymbol(EPSILON)) {
        if (nextState.test("", visited)) {
          return true;
        }
      }
      return false;
    }


    const symbol = str[0];
    const rest = str.slice(1);

    for (const nextState of this.getTransitionSymbol(symbol)) {
      if (nextState.test(rest)) {
        return true;
      }
    }

    for (const nextState of this.getTransitionSymbol(EPSILON)) {
      if (nextState.test(str, visited)) {
        return true;
      }
    }
    return false;
  }
}
