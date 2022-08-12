import { DFA } from "./dfa";

let currentTransitionMap: Record<string, Set<number>>;

export function minimize(dfa: DFA) {
  const table = dfa.getTransitionTable();
  const allStates = Object.keys(table!);
  const alphabet = dfa.getAlphabet();
  const accepting = dfa.getAcceptingStateNumbers();

  currentTransitionMap = {};

  const nonAccepting: Set<number> = new Set();

  allStates.forEach((state) => {
    let stateNumber = Number(state);

    const isAccepting = accepting.has(stateNumber);

    if (isAccepting) {
      currentTransitionMap[stateNumber] = accepting;
    } else {
      nonAccepting.add(stateNumber);
      currentTransitionMap[stateNumber] = nonAccepting;
    }
  });

  const all = [[nonAccepting, accepting].filter((set) => set.size > 0)];

  let current;
  let previous;

  current = all[all.length - 1];

  previous = all[all.length - 2];

  while (!sameRow(current, previous)) {
    const newTransitionMap = {};

    for (const set of current) {
      const handledStates = {};

      const [first, ...rest] = set;
      handledStates[first] = new Set([first]);

      restSets: for (const state of rest) {
        for (const handledState of Object.keys(handledStates)) {
          if (areEquivalent(state, handledState, table, alphabet)) {
            handledStates[handledState].add(state);
            handledStates[state] = handledStates[handledState];
            continue restSets;
          }
        }
        handledStates[state] = new Set([state]);
      }

      Object.assign(newTransitionMap, handledStates);
    }

    currentTransitionMap = newTransitionMap;

    let newSets = new Set(
      Object.keys(newTransitionMap).map((state) => newTransitionMap[state])
    );

    all.push([...newSets]);

    current = all[all.length - 1];

    previous = all[all.length - 2];
  }

  const remaped = new Map();
  let idx = 1;
  current.forEach((set) => remaped.set(set, idx++));

  const minimizedTable = {};

  const minimizedAcceptingStates = new Set();

  const updateAcceptingStates = (set, idx) => {
    for (const state of set) {
      if (accepting.has(state)) {
        minimizedAcceptingStates.add(idx);
      }
    }
  };

  for (const [set, idx] of remaped.entries()) {
    minimizedTable[idx] = {};
    for (const symbol of alphabet!) {
      updateAcceptingStates(set, idx);

      let originalTransition;

      for (const originalState of set) {
        originalTransition = table![originalState][symbol];
        if (originalTransition) {
          break;
        }
      }

      if (originalTransition) {
        minimizedTable[idx][symbol] = remaped.get(
          currentTransitionMap[originalTransition]
        );
      }
    }
  }

  dfa.setTransitionTable(minimizedTable);
  dfa.setAcceptingStateNumbers(minimizedAcceptingStates);

  return dfa;
}

function sameRow(r1, r2) {
  if (!r2) {
    return false;
  }

  if (r1.length !== r2.length) {
    return false;
  }

  for (let i = 0; i < r1.length; i++) {
    const s1 = r1[i];
    const s2 = r2[i];

    if (s1.size !== s2.size) {
      return false;
    }

    if ([...s1].sort().join(",") !== [...s2].sort().join(",")) {
      return false;
    }
  }

  return true;
}

function areEquivalent(s1, s2, table, alphabet) {
  for (const symbol of alphabet) {
    if (!goToSameSet(s1, s2, table, symbol)) {
      return false;
    }
  }
  return true;
}

function goToSameSet(s1, s2, table, symbol) {
  if (!currentTransitionMap[s1] || !currentTransitionMap[s2]) {
    return false;
  }

  const originalTransitionS1 = table[s1][symbol];
  const originalTransitionS2 = table[s2][symbol];

  if (!originalTransitionS1 && !originalTransitionS2) {
    return true;
  }

  return (
    currentTransitionMap[s1].has(originalTransitionS1) &&
    currentTransitionMap[s2].has(originalTransitionS2)
  );
}
