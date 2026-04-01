const removeDuplicatesV2 = (arr) => {
  const foundObj = {};
  const results = [];

  for (let i = 0; i < arr.length; i++) {
    if (!(arr[i] in foundObj)) {
      foundObj[arr[i]] = 1;
      results.push(arr[i]);
    }
  }

  return results;
};

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

function removeDuplicatesViaObjV2(arr) {
  // Write logic here

  const results = []; //[5]
  const foundKeys = {}; //

  for (let i = 0; i < arr.length; i++) {
    const currElem = arr[i];

    // // Check whether if this currElem exists inside results
    // if (!results.includes(currElem)) {
    //   // results.includes(currElem) === false
    //   results.push(currElem);
    // }

    // Logic to check inside object // 5
    if (!foundKeys.hasOwnProperty(currElem)) {
      // (!false)
      results.push(currElem);
      foundKeys[currElem] = true;
    }

    // if (foundKeys.hasOwnProperty(currElem)) {
    // } else {
    //   results.push(currElem);
    //   foundKeys[currElem] = true;
    // }
  }

  return results;
}

// Example Input
const inputArray = [
  5, 2, 5, 3, 5, 1, 1, 2, 2, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5,
];

// Function call
const outputArray = removeDuplicates(inputArray);

// Example Output
console.log(outputArray); // Output: [1, 2, 3, 4, 5]
