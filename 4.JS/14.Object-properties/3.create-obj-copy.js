// =======================
// 1. Object.assign() (Shallow Copy)
// =======================
const user1 = { name: "Alice", age: 25 };
const user2 = Object.assign({}, user1);

user1.age = 26;

console.log("Object.assign()");
console.log(user1); // { name: 'Alice', age: 26 }
console.log(user2); // { name: 'Alice', age: 25 }

console.log("----------------------");

// =======================
// 2. Spread Operator (Shallow Copy)
// =======================
const person1 = { name: "Bob", age: 30 };
const person2 = { ...person1 };

person1.age = 31;

console.log("Spread Operator");
console.log(person1); // { name: 'Bob', age: 31 }
console.log(person2); // { name: 'Bob', age: 30 }

console.log("----------------------");

// =======================
// 3. JSON.parse(JSON.stringify()) (Deep Copy)
// =======================
const data1 = { name: "Charlie", age: 40 };
const data2 = JSON.parse(JSON.stringify(data1));

data1.age = 41;

console.log("Deep Copy (JSON)");
console.log(data1); // { name: 'Charlie', age: 41 }
console.log(data2); // { name: 'Charlie', age: 40 }

console.log("----------------------");

// =======================
// 4. structuredClone() (Deep Copy - Modern Way)
// =======================
const original = { name: "David", age: 50 };
const cloned = structuredClone(original);

original.age = 51;

console.log("structuredClone()");
console.log(original); // { name: 'David', age: 51 }
console.log(cloned); // { name: 'David', age: 50 }
