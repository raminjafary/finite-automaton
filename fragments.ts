import { NFA } from "./nfa";
import { NFAState } from "./nfa-state";

export function char(symbol: string) {
  const initState = new NFAState({ accpeting: false });
  const outState = new NFAState({ accpeting: true });

  return new NFA(initState.addTransition(symbol, outState), outState);
}

export const EPSILON = "ε";

export function epsilon() {
  return char(EPSILON);
}

export function concatPair(first: NFA, second: NFA) {
  first.outState.accpeting = false;
  second.outState.accpeting = true;

  first.outState.addTransition(EPSILON, second.initState);

  return new NFA(first.initState, second.outState);
}

export function concat(first: NFA, ...fragments: NFA[]) {
  for (const fragment of fragments) {
    first = concatPair(first, fragment);
  }

  return first;
}

export function orPair(first: NFA, second: NFA) {
  const start = new NFAState({ accpeting: false });
  const end = new NFAState({ accpeting: true });

  start.addTransition(EPSILON, first.initState);
  start.addTransition(EPSILON, second.initState);

  first.outState.accpeting = false;
  second.outState.accpeting = false;

  first.outState.addTransition(EPSILON, end);
  second.outState.addTransition(EPSILON, end);

  return new NFA(start, end);
}

export function or(first: NFA, ...fragments: NFA[]) {
  for (const fragment of fragments) {
    first = orPair(first, fragment);
  }

  return first;
}

export function rep(fragment: NFA) {
  const start = new NFAState({ accpeting: false });
  const end = new NFAState({ accpeting: true });

  start.addTransition(EPSILON, fragment.initState);
  start.addTransition(EPSILON, end);

  fragment.outState.accpeting = false;
  fragment.outState.addTransition(EPSILON, end);
  
  end.addTransition(EPSILON, fragment.initState);

  return new NFA(start, end);
}

export function optimizedRep(fragment: NFA) {
  fragment.initState.addTransition(EPSILON, fragment.outState);
  fragment.outState.addTransition(EPSILON, fragment.initState);

  return fragment;
}

export function plusRep(fragment: NFA) {
  fragment.outState.addTransition(EPSILON, fragment.initState);
  return fragment;
}

export function questionRep(fragment: NFA) {
  fragment.initState.addTransition(EPSILON, fragment.outState);
  return fragment;
}
