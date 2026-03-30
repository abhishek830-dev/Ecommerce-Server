// Arrays for demonstration
const arr1 = [1, 2, 3, 4, 5];
const arr2 = [5, 4, 3, 2, 1];

// Using `find` to locate specific elements in arr1
arr1.find((item) => item === 1); // Returns: 1
arr1.find((item) => item === 2); // Returns: 2
arr1.find((item) => item === 10); // Returns: undefined (not found)

// Using `some` to check if a certain element exists in arr1
arr1.some((item) => item === 1); // Returns: true (1 exists in arr1)
arr1.some((item) => item === 2); // Returns: true (2 exists in arr1)
arr1.some((item) => item === 4); // Returns: true (4 exists in arr1)
arr1.some((item) => item === 40); // Returns: false (40 does not exist in arr1)

// Array of product objects
const products = [
  { id: 1, name: "ankit", category: "engineer" },
  { id: 2, name: "rahul", category: "engineer" },
  { id: 3, name: "shyam", category: "mba" },
];

// Checking if a specific product exists using `includes`
products.includes(2); // Returns: false (`includes` checks for array elements, not object properties)

// Finding a product by `id` using `find`
products.find((item) => item.id === 10); // Returns: undefined (no product with id 10)
products.find((item) => item.id === 1); // Returns: {id: 1, name: 'ankit', category: 'engineer'}
products.find((item) => item.id === 2); // Returns: {id: 2, name: 'rahul', category: 'engineer'}
products.find((item) => item.id === 3); // Returns: {id: 3, name: 'shyam', category: 'mba'}
products.find((item) => item.id === 4); // Returns: undefined (no product with id 4)

// Using `some` to check if a product exists with a specific `id`
products.some((item) => item.id === 3); // Returns: true (product with id 3 exists)
