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

// const cpProfile = { ...profile };

const cpProfile = profile;

delete cpProfile.city;
delete cpProfile.state;

console.log("Profile: ", profile);
console.log("cpProfile: ", cpProfile);
