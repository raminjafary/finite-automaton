import { char, orPair } from "./fragments";

const re = orPair(char("s"), char("b"));

console.log(re.test(""));
console.log(re.test("s"));
console.log(re.test("b"));
