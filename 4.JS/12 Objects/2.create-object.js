// Define directly
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

// Logs with labels
console.log("City:", profile.city);
console.log("State:", profile.state);
console.log("Education Object:", profile.education);
console.log("Is Graduated:", profile.education.isGraduated);

// Correct nested access
console.log("SubSubNested Array:", profile.nested.subNested.subSubNested);

// Accessing non-existing keys
console.log("Non-existing key (age):", profile.age);
console.log("Wrong nested path:", profile.education.nested.subNested);
console.log(
  "Deep non-existing:",
  profile.nested.subNested.superSubNested.habits.daily,
);
