// Authentication functionality (Mock implementation)

let currentUser = null;
const DEFAULT_SELLER = {
  id: 1,
  name: "Seller",
  email: "seller@example.com",
  password: "Seller123!",
};

document.addEventListener("DOMContentLoaded", function () {
  // Seed default seller credentials for mock auth
  const users = getFromStorage("users") || [];
  if (!users.find((u) => u.email === DEFAULT_SELLER.email)) {
    users.push(DEFAULT_SELLER);
    setToStorage("users", users);
  }

  // Load user from storage
  currentUser = getFromStorage("currentUser");
  updateAuthUI();

  // Event listeners
  $("#login-btn").addEventListener("click", () => showModal("login-modal"));
  $("#signup-btn").addEventListener("click", () => showModal("signup-modal"));
//   $("#switch-to-signup").addEventListener("click", (e) => {
//     e.preventDefault();
//     hideModal("login-modal");
//     showModal("signup-modal");
//   });
//   $("#switch-to-login").addEventListener("click", (e) => {
//     e.preventDefault();
//     hideModal("signup-modal");
//     showModal("login-modal");
  });

const switchToSignup = $("#switch-to-signup");
if (switchToSignup) {
  switchToSignup.addEventListener("click", (e) => {
    e.preventDefault();
    hideModal("login-modal");
    showModal("signup-modal");
  });
}

const switchToLogin = $("#switch-to-login");
if (switchToLogin) {
  switchToLogin.addEventListener("click", (e) => {
    e.preventDefault();
    hideModal("signup-modal");
    showModal("login-modal");
  });

  // Form submissions
  $("#login-form").addEventListener("submit", handleLogin);
  $("#signup-form").addEventListener("submit", handleSignup);

  // Close modals when clicking outside
  $$(".modal").forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.classList.remove("show");
      }
    });
  });
};

function updateAuthUI() {
  const loginBtn = $("#login-btn");
  const signupBtn = $("#signup-btn");

  if (currentUser) {
    loginBtn.textContent = `Hi, ${currentUser.name}`;
    loginBtn.classList.remove("btn-secondary");
    loginBtn.classList.add("btn-success");
    signupBtn.textContent = "Logout";
    signupBtn.classList.remove("btn-primary");
    signupBtn.classList.add("btn-danger");

    // Change login button to profile
    loginBtn.removeEventListener("click", () => showModal("login-modal"));
    loginBtn.addEventListener("click", showProfile);

    // Change signup button to logout
    signupBtn.removeEventListener("click", () => showModal("signup-modal"));
    signupBtn.addEventListener("click", handleLogout);
  } else {
    loginBtn.textContent = "Login";
    loginBtn.classList.remove("btn-success");
    loginBtn.classList.add("btn-secondary");
    signupBtn.textContent = "Sign Up";
    signupBtn.classList.remove("btn-danger");
    signupBtn.classList.add("btn-primary");

    // Restore original event listeners
    loginBtn.removeEventListener("click", showProfile);
    loginBtn.addEventListener("click", () => showModal("login-modal"));

    signupBtn.removeEventListener("click", handleLogout);
    signupBtn.addEventListener("click", () => showModal("signup-modal"));
  }
}

function showProfile() {
  // For now, just show a notification
  showNotification(`Welcome back, ${currentUser.name}!`, "success");
}

function handleLogout() {
  currentUser = null;
  removeFromStorage("currentUser");
  updateAuthUI();
  showNotification("Logged out successfully", "success");
}

async function handleLogin(e) {
  e.preventDefault();

  const email = $("#login-email").value;
  const password = $("#login-password").value;

  // Mock authentication - in a real app, this would be an API call
  const users = getFromStorage("users") || [];
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    currentUser = { id: user.id, name: user.name, email: user.email };
    setToStorage("currentUser", currentUser);
    updateAuthUI();
    hideModal("login-modal");
    showNotification("Login successful!", "success");
    $("#login-form").reset();
  } else {
    showNotification("Invalid email or password", "error");
  }
}

async function handleSignup(e) {
  e.preventDefault();

  const name = $("#signup-name").value;
  const email = $("#signup-email").value;
  const password = $("#signup-password").value;

  // Check if user already exists
  const users = getFromStorage("users") || [];
  const existingUser = users.find((u) => u.email === email);

  if (existingUser) {
    showNotification("User with this email already exists", "error");
    return;
  }

  // Create new user
  const newUser = {
    id: Date.now(),
    name,
    email,
    password, // In a real app, this would be hashed
  };

  users.push(newUser);
  setToStorage("users", users);

  currentUser = { id: newUser.id, name: newUser.name, email: newUser.email };
  setToStorage("currentUser", currentUser);
  updateAuthUI();
  hideModal("signup-modal");
  showNotification("Account created successfully!", "success");
  $("#signup-form").reset();
}

function requireAuth() {
  if (!currentUser) {
    showModal("login-modal");
    return false;
  }
  return true;
};
