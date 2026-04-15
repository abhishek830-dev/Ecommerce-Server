// Home page functionality

let currentPage = 1;
let currentFilters = {};

document.addEventListener("DOMContentLoaded", function () {
  loadCategories();
  loadProducts();

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

  let paginationHTML =
    '<div style="display: flex; justify-content: center; gap: 0.5rem; margin-top: 2rem;">';

  // Previous button
  if (currentPage > 1) {
    paginationHTML += `<button class="btn btn-secondary pagination-btn" data-page="${currentPage - 1}">Previous</button>`;
  }

  // Page numbers
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    const activeClass = i === currentPage ? "btn-primary" : "btn-secondary";
    paginationHTML += `<button class="btn ${activeClass} pagination-btn" data-page="${i}">${i}</button>`;
  }

  // Next button
  if (currentPage < totalPages) {
    paginationHTML += `<button class="btn btn-secondary pagination-btn" data-page="${currentPage + 1}">Next</button>`;
  }

  paginationHTML += "</div>";
  container.innerHTML = paginationHTML;

  // Add event listeners to pagination buttons
  $$(".pagination-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const page = parseInt(this.dataset.page);
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
  loadProducts(1, currentFilters);
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
