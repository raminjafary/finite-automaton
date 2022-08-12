import { NFA } from "./nfa";
import { EPSILON_CLOSURE } from "./fragments";
import { minimize } from "./dfa-mimizer";

export class DFA {
  transitionTable: Record<string, Record<string, number[]>>;
  originalTransitionTable: Record<string, Record<string, number[]>>;
  originalAcceptingStateNumbers: Set<number>;
  acceptingStateNumbers: Set<number>;

  constructor(public nfa: NFA) {
    this.nfa = nfa;
  }

  getAlphabet() {
    return this.nfa.getAlphabet();
  }

  getOriginalTransitionTable() {
    if (!this.originalTransitionTable) {
      this.getTransitionTable();
    }
    return this.originalTransitionTable;
  }

  matches(str: string) {
    let state = 1;
    let i = 0;
    const table = this.getTransitionTable();

    while (str[i]) {
      state = table![state][str[i++]];
      if (!state) {
        return false;
      }
    }

    if (!this.getAcceptingStateNumbers().has(state)) {
      return false;
    }

    return true;
  }

  remapStateNumbers(calculatedDFATable) {
    const newStatesMap = {};

    this.originalTransitionTable = calculatedDFATable;
    const transitionTable = {};

    Object.keys(calculatedDFATable).forEach((originalNumber, newNumber) => {
      newStatesMap[originalNumber] = newNumber + 1;
    });

    for (const originalNumber in calculatedDFATable) {
      const originalRow = calculatedDFATable[originalNumber];
      const row = {};

      for (const symbol in originalRow) {
        row[symbol] = newStatesMap[originalRow[symbol]];
      }

      transitionTable[newStatesMap[originalNumber]] = row;
    }

    this.originalAcceptingStateNumbers = this.acceptingStateNumbers;
    this.acceptingStateNumbers = new Set();

    for (const originalNumber of this.originalAcceptingStateNumbers) {
      this.acceptingStateNumbers.add(newStatesMap[originalNumber]);
    }

    return transitionTable;
  }
  minimize() {
    this.getTransitionTable();

    this.originalAcceptingStateNumbers = this.acceptingStateNumbers;
    this.originalTransitionTable = this.transitionTable;

    minimize(this);
  }

  getAcceptingStateNumbers() {
    if (!this.acceptingStateNumbers) {
      this.getTransitionTable();
    }

    return this.acceptingStateNumbers;
  }

  getOriginaAcceptingStateNumbers() {
    if (!this.originalAcceptingStateNumbers) {
      this.getTransitionTable();
    }
    return this.originalAcceptingStateNumbers;
  }

  setTransitionTable(table) {
    this.transitionTable = table;
  }

  setAcceptingStateNumbers(stateNumbers) {
    this.acceptingStateNumbers = stateNumbers;
  }

  getTransitionTable() {
    if (this.transitionTable) {
      return this.transitionTable;
    }

    const nfaTable = this.nfa.getTransitionTable();
    const nfaStates = Object.keys(nfaTable);

    this.acceptingStateNumbers = new Set();

    const startState = nfaTable[nfaStates[0]][EPSILON_CLOSURE];

    const worklist = [startState];

    const alphabet = this.getAlphabet();
    const nfaAcceptingStates = this.nfa.getAcceptingStateNumbers();

    const dfaTable = {};

    const updateAcceptingStates = (states) => {
      for (const nfaAcceptingState of nfaAcceptingStates) {
        if (states.indexOf(nfaAcceptingState) !== -1) {
          this.acceptingStateNumbers.add(states.join(","));
          break;
        }
      }
    };
    while (worklist.length > 0) {
      const states = worklist.shift();
      const dfaStateLabel = states!.join(",");
      dfaTable[dfaStateLabel] = {};

      for (const symbol of alphabet!) {
        let onSymbol: number[] = [];

        updateAcceptingStates(states);

        for (const state of states!) {
          const nfaStatesOnSymbol = nfaTable[state][symbol];
          if (!nfaStatesOnSymbol) {
            continue;
          }

          for (const nfaStateOnSymbol of nfaStatesOnSymbol) {
            if (!nfaTable[nfaStateOnSymbol]) {
              continue;
            }
            onSymbol.push(...nfaTable[nfaStateOnSymbol][EPSILON_CLOSURE]);
          }
        }

        const dfaStatesOnSymbolSet = new Set(onSymbol);
        const dfaStatesOnSymbol = [...dfaStatesOnSymbolSet];

        if (dfaStatesOnSymbol.length > 0) {
          const dfaOnSymbolStr = dfaStatesOnSymbol.join(",");

          dfaTable[dfaStateLabel][symbol] = dfaOnSymbolStr;

          if (!dfaTable.hasOwnProperty(dfaOnSymbolStr)) {
            worklist.unshift(dfaStatesOnSymbol);
          }
        }
      }
    }
  }
}
