// Function to remove duplicates from an array
function removeDuplicates(arr) {
  // Write logic here

  const results = []; // 5,2,3,1,4

  for (let i = 0; i < arr.length; i++) {
    const currElem = arr[i];

    // Check whether if this currElem exists inside results
    if (!results.includes(currElem)) {
      // results.includes(currElem) === false
      results.push(currElem);
    }
  }

  return results;
}

function removeDuplicatesUsingFind(arr) {
  // Write logic here

  const results = []; // 5,2,3,1,4

  for (let i = 0; i < arr.length; i++) {
    const currElem = arr[i];

    // Check whether if this currElem exists inside results

    const matched = results.find((item) => item === currElem);

    if (!matched) {
      // results.includes(currElem) === false
      results.push(currElem);
    }
  }

  return results;
}

// Example Input
const inputArray = [5, 2, 3, 5, 1, 1, 2, 2, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5];

// Function call
const outputArray = removeDuplicates(inputArray);

// Example Output
console.log(outputArray); // Output: [1, 2, 3, 4, 5]
