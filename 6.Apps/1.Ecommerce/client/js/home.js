// Home page functionality

let currentPage = 1;
let currentFilters = {};

document.addEventListener("DOMContentLoaded", function () {
  loadCategories();
  // 🔥 URL se data read karo
  const params = new URLSearchParams(window.location.search);

  currentPage = parseInt(params.get("page")) || 1;

  currentFilters = {
    category: params.get("category") || "",
    search: params.get("search") || "",
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
    rating: params.get("rating") || "",
    sortBy: params.get("sortBy") || "",
    sortOrder: params.get("sortOrder") || "",
  };

  // empty values remove karo
  Object.keys(currentFilters).forEach((key) => {
    if (!currentFilters[key]) delete currentFilters[key];
  });

  // 🔥 UI me values set karo (optional but important)
  $("#category-filter").value = params.get("category") || "";
  $("#search-filter").value = params.get("search") || "";
  $("#min-price-filter").value = params.get("minPrice") || "";
  $("#max-price-filter").value = params.get("maxPrice") || "";
  $("#rating-filter").value = params.get("rating") || "";

  // 🔥 FINAL CALL (IMPORTANT)
  loadProducts(currentPage, currentFilters);

  // Event listeners
  $("#apply-filters").addEventListener("click", applyFilters);
  $("#clear-filters").addEventListener("click", clearFilters);
  $("#search-filter").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      applyFilters();
    }
  });

  // Add to cart event delegation
  addEventListenerToDynamicElements(
    "click",
    ".add-to-cart-btn",
    handleAddToCart,
  );
  addEventListenerToDynamicElements(
    "click",
    ".product-card",
    handleProductClick,
  );
  addEventListenerToDynamicElements("click", ".close-modal", () =>
    hideModal("product-modal"),
  );

  // Close modal when clicking outside
  $("#product-modal").addEventListener("click", function (e) {
    if (e.target === this) {
      hideModal("product-modal");
    }
  });
});

async function loadCategories() {
  try {
    const categories = await apiRequest("/categories");
    const categoryFilter = $("#category-filter");

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

async function loadProducts(page = 1, filters = {}) {
  try {
    showLoading($("#products-container"));

    const queryParams = new URLSearchParams({
      page,
      limit: 12,
      ...filters,
    });

    const response = await apiRequest(`/products?${queryParams}`);
    const { data: products, total, page: currentPageNum, limit } = response;

    displayProducts(products);

    displayPagination(total, currentPageNum, limit);

    currentPage = currentPageNum;
  } catch (error) {
    console.error("Error loading products:", error);
    $("#products-container").innerHTML =
      '<div class="error">Failed to load products. Please try again later.</div>';
  }
}

function displayProducts(products) {
  const container = $("#products-container");

  if (products.length === 0) {
    container.innerHTML =
      '<div class="error">No products found matching your criteria.</div>';
    return;
  }

  container.innerHTML = products
    .map((product) => {
      const imageUrl = getCategoryImage(product.category, "400x240");
      return `
        <div class="product-card">
          <img src="${imageUrl}" alt="${product.title}" class="product-image">
          <div class="product-info">
            <span class="product-badge">${product.category}</span>
            <h3 class="product-title">${product.title}</h3>
            <div class="product-price">${formatPrice(product.price)}</div>
            <div class="product-rating">
              <span class="stars">${formatRating(product.rating)}</span>
              <span>${product.rating}</span>
            </div>
            <p class="product-description">${product.description}</p>
            <div class="product-stock">Stock: ${product.stock}</div>
            <button class="add-to-cart-btn btn btn-primary" data-product-id="${product.id}">Add to Cart</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function displayPagination(total, currentPage, limit) {
  const container = $("#pagination");
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = `<div class="pagination">`;

  // 🔹 Prev
  html += `
    <button class="page-btn nav-btn ${currentPage === 1 ? "disabled" : ""}" 
            data-page="${currentPage - 1}">
      Prev
    </button>
  `;

  // 🔹 Page range (clean)
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    html += `<button class="page-btn" data-page="1">1</button>`;
    if (startPage > 2) html += `<span>...</span>`;
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `
      <button class="page-btn ${i === currentPage ? "active" : ""}" 
              data-page="${i}">
        ${i}
      </button>
    `;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) html += `<span>...</span>`;
    html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
  }

  // 🔹 Next
  html += `
    <button class="page-btn nav-btn ${currentPage === totalPages ? "disabled" : ""}" 
            data-page="${currentPage + 1}">
      Next
    </button>
  `;

  html += `</div>`;
  container.innerHTML = html;

  // QuerySelector based active handling
  document.querySelectorAll(".page-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      if (this.classList.contains("disabled")) return;

      const page = parseInt(this.dataset.page);

      // 🔥 URL update karo
      const url = new URL(window.location);
      url.searchParams.set("page", page);
      window.history.pushState({}, "", url);

      // ✅ Load data
      loadProducts(page, currentFilters);
    });
  });
}

function applyFilters() {
  const category = $("#category-filter").value;
  const search = $("#search-filter").value.trim();
  const minPrice = $("#min-price-filter").value;
  const maxPrice = $("#max-price-filter").value;
  const rating = $("#rating-filter").value;
  const sortValue = $("#sort-filter").value;
  const [sortBy, sortOrder] = sortValue.split("_");

  currentFilters = {};

  if (category) currentFilters.category = category;
  if (search) currentFilters.search = search;
  if (minPrice) currentFilters.minPrice = minPrice;
  if (maxPrice) currentFilters.maxPrice = maxPrice;
  if (rating) currentFilters.rating = rating;
  if (sortBy) currentFilters.sortBy = sortBy;
  if (sortOrder) currentFilters.sortOrder = sortOrder;

  const url = new URL(window.location);

  // reset page
  url.searchParams.set("page", 1);

  // filters add karo
  Object.keys(currentFilters).forEach((key) => {
    url.searchParams.set(key, currentFilters[key]);
  });

  window.history.pushState({}, "", url);

  // load
  loadProducts(1, currentFilters);
}

function clearFilters() {
  $("#category-filter").value = "";
  $("#search-filter").value = "";
  $("#min-price-filter").value = "";
  $("#max-price-filter").value = "";
  $("#rating-filter").value = "";
  $("#sort-filter").value = "createdAt_DESC";

  currentFilters = {};

  const url = new URL(window.location);
  url.search = ""; // pura clean

  window.history.pushState({}, "", url);

  loadProducts(1, currentFilters);
}

async function handleAddToCart(e) {
  e.preventDefault();
  const productId = parseInt(e.target.dataset.productId);
  if (!productId) {
    showNotification("Invalid product selected.", "error");
    return;
  }

  try {
    const product = await apiRequest(`/products/${productId}`);
    addToCart(product);
  } catch (error) {
    console.error("Error adding product to cart:", error);
    showNotification("Failed to add product to cart", "error");
  }
}

async function handleProductClick(e) {
  // Don't open modal if clicking on add to cart button
  if (
    e.target.classList.contains("add-to-cart-btn") ||
    e.target.closest(".add-to-cart-btn")
  ) {
    return;
  }

  const productCard = e.target.closest(".product-card");
  if (!productCard) return;

  const productId = parseInt(
    productCard.querySelector(".add-to-cart-btn").dataset.productId,
  );

  try {
    const product = await apiRequest(`/products/${productId}`);
    showProductDetails(product);
  } catch (error) {
    console.error("Error loading product details:", error);
    showNotification("Failed to load product details", "error");
  }
}

function showProductDetails(product) {
  const detailsHTML = `
    <div class="product-details">
      <div class="product-details-image">
        <img src="${getCategoryImage(product.category, "500x400")}" alt="${product.title}">
      </div>
      <div class="product-details-info">
        <h2 class="product-details-title">${product.title}</h2>
        <div class="product-details-price">${formatPrice(product.price)}</div>
        <div class="product-details-rating">
          <span class="stars">${formatRating(product.rating)}</span>
          <span>${product.rating} (${Math.floor(Math.random() * 1000) + 50} reviews)</span>
        </div>
        <p class="product-details-description">${product.description}</p>

        <div class="product-details-meta">
          <div class="product-details-meta-item">
            <div class="product-details-meta-label">Category</div>
            <div class="product-details-meta-value">${product.category}</div>
          </div>
          <div class="product-details-meta-item">
            <div class="product-details-meta-label">Brand</div>
            <div class="product-details-meta-value">${product.brand}</div>
          </div>
          <div class="product-details-meta-item">
            <div class="product-details-meta-label">Stock</div>
            <div class="product-details-meta-value">${product.stock} available</div>
          </div>
          <div class="product-details-meta-item">
            <div class="product-details-meta-label">Rating</div>
            <div class="product-details-meta-value">${product.rating}/5</div>
          </div>
        </div>

        <button class="add-to-cart-btn btn btn-primary" data-product-id="${product.id}" style="width: 100%; padding: 0.9rem; font-size: 1rem;">
          Add to Cart - ${formatPrice(product.price)}
        </button>
      </div>
    </div>
  `;

  $("#product-details").innerHTML = detailsHTML;
  $("#product-modal-title").textContent = product.title;
  showModal("product-modal");
}
