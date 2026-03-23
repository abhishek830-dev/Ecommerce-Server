const arr = [12, 3, 4, 5, 7, 55, 7, 4, 7];

console.log("For Loop normal started");
for (let index = 0; index < arr.length; index++) {
  console.log("index: ", index, "Value", arr[index]);
}

console.log("For of Loop normal started");
for (let item of arr) {
  console.log("Item: ", item);
}

console.log("Foreach loop normal func");
arr.forEach(function (item, index) {
  console.log("Value", item, index);
});

console.log("Foreach loop arrow func");
arr.forEach((item, index) => {
  console.log("Value", item, index);
});

console.log("Foreach loop short arrow func");
arr.forEach((item) => console.log("Value", item));
