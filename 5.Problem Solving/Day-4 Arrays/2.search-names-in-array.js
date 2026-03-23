const names = [
  "Vidhya Skill School",
  "Abhishek Garg",
  "Almas Chamadiya",
  "ANKIT RAJPUT",
  "Ashitosh Vidhate",
  "Aviral Jain",
  "Ayush Gupta",
  "Deepanshu Garg",
  "Pinky Thawani",
  "Prakash",
  "Pranav Khare",
  "Rakshit Dalal",
  "Shivani Vishwakarma",
  "Shruti Prajapati",
  "vikas vanve",
];

const matchedName = (arr, char) => {
  const results = arr.filter((item) => {
    const currentWordLC = item.toUpperCase();
    if (currentWordLC.search(char.toUpperCase()) !== -1) {
      return true;
    }
    return false;
  });

  return results;
};
