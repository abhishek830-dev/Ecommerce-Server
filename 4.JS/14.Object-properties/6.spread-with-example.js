const original = {
  name: "Alice",
  isMarried: true,
  isActive: true,
  phone: "99999999",
  address: {
    city: "Delhi",
    pin: 110001,
  },
};

// Shallow copy - Spread operators
const cpData = {
  ...original,
  skills: ["html", "css", "js", "python", "genai", "agentic ai"],
};

// Rest operator
const { name, phone, ...MerabachaHuaData } = cpData;

console.log("MerabachaHuaData: ", MerabachaHuaData);
