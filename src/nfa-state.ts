import { EPSILON } from "./fragments";
import { State } from "./state";

export class NFAState extends State<NFAState> {
  epsilonClosure: Set<NFAState>;
  number: number;

  test(str: string, visited = new Set<NFAState>()) {
    if (visited.has(this)) {
      return false;
    }

    visited.add(this);

    if (!str.length) {
      if (this.accpeting) {
        return true;
      }

      for (const nextState of this.getTransitionsOnSymbol(EPSILON)) {
        console.log("nextState", nextState);

        if (nextState.test("", visited)) {
          return true;
        }
      }
      return false;
    }

    const symbol = str[0];
    const rest = str.slice(1);

    for (const nextState of this.getTransitionsOnSymbol(symbol)) {
      if (nextState.test(rest)) {
        return true;
      }
    }

    for (const nextState of this.getTransitionsOnSymbol(EPSILON)) {
      if (nextState.test(str, visited)) {
        return true;
      }
    }
    return false;
  }

  getEpsilonClosure() {
    if (!this.epsilonClosure) {
      this.epsilonClosure = new Set();
      this.epsilonClosure.add(this);

      for (const nexState of this.getTransitionsOnSymbol(EPSILON)) {
        if (!this.epsilonClosure.has(nexState)) {
          this.epsilonClosure.add(nexState);
          const nextClosure = nexState.getEpsilonClosure();

          for (const nextClo of nextClosure) {
            this.epsilonClosure.add(nextClo);
          }
        }
      }
    }

    return this.epsilonClosure;
  }
}
