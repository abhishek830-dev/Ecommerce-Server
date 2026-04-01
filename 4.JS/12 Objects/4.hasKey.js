const dummy = {
  a: 1,
  b: 2,
  c: 3,
  e: {
    f: true,
    g: false,
  },
};

// Way 1 - Using hasOwnProperty
const hasA = dummy.hasOwnProperty("a"); // true
const hasC = dummy.hasOwnProperty("c"); // true
const hasD = dummy.hasOwnProperty("d"); // false
const hasF = dummy.e.hasOwnProperty("f"); // true
const hasG = dummy.e.hasOwnProperty("g"); // true

console.log({ hasA, hasC, hasD, hasF, hasG });

// Way 2 - using in operator
const hasA1 = "a" in dummy;
const hasC1 = "c" in dummy;
const hasG1 = "g" in dummy.e;
const hasQ1 = "q" in dummy.e;

console.log({ hasA1, hasC1, hasG1, hasQ1 });
