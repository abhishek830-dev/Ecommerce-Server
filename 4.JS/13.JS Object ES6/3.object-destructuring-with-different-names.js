const profile = {
  name: "Rakshit",
  city: "Udaipur",
  state: "Rajasthan",
  country: "India",
  education: {
    isGraduated: true,
    isPostGraduated: false,
    isElligibleForPHD: false,
  },
  hobbies: ["music", "food"],
};

// const { name : newName, city, country } = profile;

// Name aliasing
const { name: userName, city: userCity, country } = profile;

console.log("Name: ", userName);
console.log("City", userCity);
console.log("Country: ", country);
