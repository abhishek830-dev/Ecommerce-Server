// =======================
// Nested Object Example
// =======================

const original = {
  name: "Alice",
  address: {
    city: "Delhi",
    pin: 110001,
  },
};

// =======================
// 1. Object.assign() (Shallow Copy ❌)
// =======================
const assignCopy = Object.assign({}, original);

assignCopy.address.city = "Mumbai";

console.log("Object.assign()");
console.log("original:", original); // ❗ city changed → Mumbai
console.log("assignCopy:", assignCopy);

console.log("----------------------");

// =======================
// 2. Spread Operator (Shallow Copy ❌)
// =======================
const spreadCopy = { ...original };

spreadCopy.address.city = "Pune";

console.log("Spread Operator");
console.log("original:", original); // ❗ city changed → Pune
console.log("spreadCopy:", spreadCopy);

console.log("----------------------");

// =======================
// 3. JSON (Deep Copy ✅)
// =======================
const jsonCopy = JSON.parse(JSON.stringify(original));

jsonCopy.address.city = "Bangalore";

console.log("JSON Deep Copy");
console.log("original:", original); // ✅ no change
console.log("jsonCopy:", jsonCopy);

console.log("----------------------");

// =======================
// 4. structuredClone() (Deep Copy ✅)
// =======================
const structuredCopy = structuredClone(original);

structuredCopy.address.city = "Chennai";

console.log("structuredClone()");
console.log("original:", original); // ✅ no change
console.log("structuredCopy:", structuredCopy);
