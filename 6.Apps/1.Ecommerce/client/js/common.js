// Common utilities for E-commerce Client

const API_BASE = "http://localhost:3001";

// DOM utilities
function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

// API utilities
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const hasBody = options.body !== undefined;

  const config = {
    headers: {
      ...(hasBody && { "Content-Type": "application/json" }), // sirf tab jab body ho
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

// Local storage utilities
function getFromStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return null;
  }
}

function setToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error writing to localStorage:", error);
  }
}

function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
}

// Cart utilities
function getCart() {
  return getFromStorage("cart") || [];
}

function saveCart(cart) {
  setToStorage("cart", cart);
}

function addToCart(product) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  updateCartUI();
  showNotification("Product added to cart!", "success");
}

function updateCartItemQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find((item) => item.id === productId);

  if (item) {
    item.quantity = Math.max(0, quantity);
    if (item.quantity === 0) {
      removeCartItem(productId);
    } else {
      saveCart(cart);
      updateCartUI();
    }
  }
}

function removeCartItem(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  updateCartUI();
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}

// UI utilities
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;

  if (type === "success") {
    notification.style.backgroundColor = "#28a745";
  } else if (type === "error") {
    notification.style.backgroundColor = "#dc3545";
  } else {
    notification.style.backgroundColor = "#007bff";
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

function showLoading(element) {
  element.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  `;
}

function hideLoading(element) {
  // This will be overridden by actual content
}

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function formatRating(rating) {
  const stars =
    "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  return stars;
}

const categoryImages = {
  electronics: "https://cdn-icons-png.flaticon.com/512/1041/1041888.png",
  jewelry: "https://cdn-icons-png.flaticon.com/512/833/833472.png",
  jewelery: "https://cdn-icons-png.flaticon.com/512/833/833472.png",
  clothing: "https://cdn-icons-png.flaticon.com/512/892/892458.png",
  "men's clothing": "https://cdn-icons-png.flaticon.com/512/892/892458.png",
  "women's clothing": "https://cdn-icons-png.flaticon.com/512/892/892513.png",
  toys: "https://cdn-icons-png.flaticon.com/512/3082/3082031.png",
  books: "https://cdn-icons-png.flaticon.com/512/29/29302.png",
  furniture: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
  beauty: "https://cdn-icons-png.flaticon.com/512/3050/3050153.png",
  groceries: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png",
  automotive: "https://cdn-icons-png.flaticon.com/512/743/743007.png",
  tools: "https://cdn-icons-png.flaticon.com/512/3523/3523887.png",
  sports: "https://cdn-icons-png.flaticon.com/512/857/857455.png",
  outdoors: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  home: "https://cdn-icons-png.flaticon.com/512/25/25694.png",
};

function getCategoryImage(category, size = "400x300") {
  const normalized = (category || "product").toLowerCase().trim();
  return (
    categoryImages[normalized] ||
    "https://img.icons8.com/fluency/400/shopping-bag.png"
  );
}

function ensureToastContainer() {
  let container = $("#toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}

function showNotification(message, type = "info") {
  const container = ensureToastContainer();
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  container.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease forwards";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

function generateRandomDeliveryTime() {
  const times = [
    "10 minutes",
    "30 minutes",
    "1 hour",
    "2 hours",
    "4 hours",
    "6 hours",
    "12 hours",
    "1 day",
    "2 days",
    "3 days",
    "4 days",
    "5 days",
    "6 days",
    "7 days",
  ];
  return times[Math.floor(Math.random() * times.length)];
}

// Modal utilities
function showModal(modalId) {
  const modal = $(`#${modalId}`);
  if (modal) {
    modal.classList.add("show");
  }
}

function hideModal(modalId) {
  const modal = $(`#${modalId}`);
  if (modal) {
    modal.classList.remove("show");
  }
}

// Event delegation for dynamic elements
function addEventListenerToDynamicElements(eventType, selector, handler) {
  document.addEventListener(eventType, function (e) {
    if (e.target.matches(selector) || e.target.closest(selector)) {
      handler(e);
    }
  });
}

// Initialize common functionality
document.addEventListener("DOMContentLoaded", function () {
  // Add cart toggle functionality
  const cartToggle = $(".cart-toggle");
  const cartSidebar = $(".cart-sidebar");

  const cartBackdrop = $("#cart-backdrop");

  if (cartToggle && cartSidebar) {
    cartToggle.addEventListener("click", function (e) {
      e.preventDefault();
      const isOpen = cartSidebar.classList.toggle("open");
      cartBackdrop?.classList.toggle("show", isOpen);
    });

    cartBackdrop?.addEventListener("click", function () {
      cartSidebar.classList.remove("open");
      cartBackdrop.classList.remove("show");
    });

    // Close cart when clicking outside
    document.addEventListener("click", function (e) {
      if (
        cartSidebar.classList.contains("open") &&
        !cartSidebar.contains(e.target) &&
        !cartToggle.contains(e.target)
      ) {
        cartSidebar.classList.remove("open");
        cartBackdrop?.classList.remove("show");
      }
    });
  }
});
