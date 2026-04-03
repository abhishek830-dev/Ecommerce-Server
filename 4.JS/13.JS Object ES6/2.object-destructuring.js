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

const { name, city, country } = profile;

// const name = profile.name;
// const state = profile.state;
// const country = profile.country;
// const userHobbies = profile.hobbies;
// const isMarried = profile.isMarried;
// const canDrive = profile.driveDetails.canDrive; // Error
// const canDriveV2 = profile.driveDetails?.canDrive; // Undefined due to optional chaining
