const participants = [
  {
    id: 1,
    name: "Shruti",
    image: "Link",
  },
  {
    id: 2,
    name: "Abhishek",
    image: "Link",
  },
  {
    id: 2,
    name: "Rakshit",
    image: "Link",
  },
];

for (let i = 0; i < participants.length; i++) {
  const currentElem = participants[i];

  console.log("Id:", currentElem.id);
  console.log("Name:", currentElem.name);
  console.log("Image", currentElem.image);
}

const calculator = {
  result: 0,
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiple: (a, b) => a * b,
  divide: (a, b) => a / b,
  remainder: (a, b) => a % b,
};
