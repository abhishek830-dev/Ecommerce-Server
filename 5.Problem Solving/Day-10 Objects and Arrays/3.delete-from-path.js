// 🧩 Problem: Delete Value at Given Path

// Write a function deletePath that takes:
// 1. An object
// 2. A string path with keys separated by dots

// The function should:
// - Delete the value at the given path if it exists
// - Return true if deletion was successful
// - Return false if the path does not exist

// Example:

const obj = {
  a: {
    b: {
      c: 12,
      d: 20,
    },
  },
};

const deletePath = (obj, path) => {
  // your code here
};

console.log(deletePath(obj, "a.b.c")); // → true
// After deletion, obj becomes:
// { a: { b: { d: 20 } } }

console.log(deletePath(obj, "a.b.x")); //→ false
console.log(deletePath(obj, "a.x.c")); //→ false
console.log(deletePath(obj, "a.b.c.d")); //→ false
