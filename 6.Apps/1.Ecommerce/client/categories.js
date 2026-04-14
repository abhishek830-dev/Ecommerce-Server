// js/categories.js

// Step 1: Saari categories load karo
async function loadCategories() {
  try {
    const categories = await apiGet("/categories");
    renderCategories(categories);
  } catch (error) {
    document.getElementById("categoriesList").innerHTML =
      `<p class="error">Error: ${error.message}</p>`;
  }
}

// Step 2: Category cards render karo
function renderCategories(categories) {
  const categoriesList = document.getElementById("categoriesList");

  categoriesList.innerHTML = categories
    .map(
      (category) => `
      <div class="category-card" onclick="loadCategoryProducts('${category}')">
        <h3>${category}</h3>
        <p>Click to view products</p>
      </div>
    `,
    )
    .join("");
}

// Step 3: Kisi category pe click karo toh uske products load karo
async function loadCategoryProducts(category) {
  try {
    // Category products section dikhao
    const categoryProducts = document.getElementById("categoryProducts");
    categoryProducts.style.display = "block";

    // Title set karo
    document.getElementById("categoryTitle").textContent =
      `${category} Products`;

    // Dono parallel load karo — products aur stats
    const [data, stats] = await Promise.all([
      apiGet(`/categories/${category.toLowerCase()}/products?limit=20`),
      apiGet(`/categories/${category.toLowerCase()}/stats`),
    ]);

    renderCategoryStats(stats);
    renderCategoryProducts(data.data);

    // Scroll karke section dikhao
    categoryProducts.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    document.getElementById("categoryProductsGrid").innerHTML =
      `<p class="error">Error: ${error.message}</p>`;
  }
}

// Step 4: Category stats render karo
function renderCategoryStats(stats) {
  const categoryStats = document.getElementById("categoryStats");

  const cards = [
    { label: "Total Products", value: stats.totalProducts },
    { label: "Avg Price", value: `$${Number(stats.avgPrice).toFixed(2)}` },
    { label: "Min Price", value: `$${Number(stats.minPrice).toFixed(2)}` },
    { label: "Max Price", value: `$${Number(stats.maxPrice).toFixed(2)}` },
    { label: "Avg Rating", value: Number(stats.avgRating).toFixed(2) },
    { label: "Total Stock", value: stats.totalStock },
  ];

  categoryStats.innerHTML = cards
    .map(
      (card) => `
      <div class="stat-card">
        <span class="stat-value">${card.value}</span>
        <span class="stat-label">${card.label}</span>
      </div>
    `,
    )
    .join("");
}

// Step 5: Category products render karo
function renderCategoryProducts(products) {
  const grid = document.getElementById("categoryProductsGrid");

  if (products.length === 0) {
    grid.innerHTML = "<p>Koi product nahi mila.</p>";
    return;
  }

  grid.innerHTML = products
    .map(
      (product) => `
      <div class="product-card">
        <h3>${product.title}</h3>
        <p><strong>Brand:</strong> ${product.brand}</p>
        <p><strong>Price:</strong> $${Number(product.price).toFixed(2)}</p>
        <p><strong>Rating:</strong> ${product.rating ?? "N/A"}</p>
        <p><strong>Stock:</strong> ${product.stock ?? "N/A"}</p>
      </div>
    `,
    )
    .join("");
}

// Close button — category products section hide karo
document.getElementById("closeBtn").addEventListener("click", () => {
  document.getElementById("categoryProducts").style.display = "none";
});

// Page load hote hi
loadCategories();
