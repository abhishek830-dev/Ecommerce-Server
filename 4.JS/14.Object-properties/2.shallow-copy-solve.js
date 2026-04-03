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

// Creating a fresh copy
const cpProfile = { ...profile, name: "Prakash", isActive: true };

delete cpProfile.city;
delete cpProfile.state;

console.log("Profile: ", profile);
console.log("cpProfile: ", cpProfile);
