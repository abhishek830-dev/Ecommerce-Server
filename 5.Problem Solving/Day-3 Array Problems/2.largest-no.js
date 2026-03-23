const input = [1, 4, 6, 10, 3, 10, 11, 2, 4, 2, 222, 222, 2, 220];

let maxNo = input[0]; // 1
let secondMaxNo = "";
let thirdMaxNo = "";

for (let i = 1; i < input.length; i++) {
  const currVal = input[i]; // 1 , 4, 6, 10, 3, 10, 11, 2, 4, 2, 222, 222
  if (currVal > maxNo) {
    // 4 > 1, 6 > 4, 10 > 6, 3>10, 10>10, 11 > 10, 222 > 11
    thirdMaxNo = secondMaxNo; // "", 1, 4, 6, 10
    secondMaxNo = maxNo; // 1, 4, 6, 10, 11
    maxNo = currVal; // 4, 6, 10, 11, 222
  } else if (currVal > secondMaxNo && currVal < maxNo) {
    // 1 < "" = false, 3>6, (10 > 6 && 10 < 10 ), (222 > 11 && 222 < 222)
    thirdMaxNo = secondMaxNo; // ""
    secondMaxNo = currVal; // 1
  } else if (currVal > thirdMaxNo && currVal < secondMaxNo) {
    // 1 < "" = false, 3>4, (10 > 4 && 10 < 6), (222 > 10 && 222 < 11)
    thirdMaxNo = currVal;
  }
}

console.log({ maxNo, secondMaxNo, thirdMaxNo }); // 222, 220, 11 || 222, 222, 220
