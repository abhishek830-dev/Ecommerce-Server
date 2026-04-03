const arr = [1, 2, 3];

// First way - one by one
arr.unshift(5);
arr.unshift(6);
arr.unshift(7);

// Second way - bulk
arr.unshift(10, 11, 12);

console.log("Arr: ", arr);
