const input = [1, 4, 6, 10, 3, 10, 11, 2, 4, 2, 222, 222, 2, 220];

let maxNo = input[0]; // 1
let secondMaxNo = "";
let thirdMaxNo = "";

for (let i = 1; i < input.length; i++) {
  const currVal = input[i];
  if (currVal > maxNo) {
    thirdMaxNo = secondMaxNo;
    secondMaxNo = maxNo;
    maxNo = currVal;
  } else if (currVal > secondMaxNo && currVal < maxNo) {
    thirdMaxNo = secondMaxNo;
    secondMaxNo = currVal;
  } else if (currVal > thirdMaxNo && currVal < secondMaxNo) {
    thirdMaxNo = currVal;
  }
}

console.log({ maxNo, secondMaxNo, thirdMaxNo }); // 222, 220, 11 || 222, 222, 220
