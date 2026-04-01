const profile = {
  name: "Rakshit",
  city: "Updaipur",
  country: "India",
  state: "Rajasthan",
  education: {
    isGraduated: true,
    isPostGraduated: false,
  },
  hobbies: ["music", "travel", "food"],
  nested: {
    subNested: {
      subSubNested: [1, 2, 3, 4, 5],
      superSubNested: {
        habits: null,
      },
    },
  },
};

// Get
console.log("Name:", profile.name);
console.log("Nested Data: ", profile.nested);
console.log("Sub Nested Data: ", profile.nested.subNested);

// Add
profile.something = "Dummy";
profile["new-key"] = "New Val";
// profile.new-key = 'Dummy' // Won't work
// profile.7 = 10; // Won't work
profile[7] = 10;
profile.nested.newKey = "value";
profile.nested.subNested.subSubNested.push(55);

console.log(profile);

// Update
profile.name = "Tarun";
profile.city = "Bangalore";

// Remove
delete profile.something;
delete profile.education.isGraduated;
