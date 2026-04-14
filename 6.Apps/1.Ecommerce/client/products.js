// js/products.js

// Step 1: Saari categories load karo dropdown mein
async function loadCategories() {
  try {
    const categories = await apiGet("/categories");

    const select = document.getElementById("categorySelect");

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      select.appendChild(option);
    });
  } catch (error) {
    console.log("Categories load nahi hui:", error.message);
  }
}

// Step 2: Filters se query string banao
function buildQuery() {
  const search = document.getElementById("searchInput").value.trim();
  const category = document.getElementById("categorySelect").value;
  const minPrice = document.getElementById("minPrice").value;
  const maxPrice = document.getElementById("maxPrice").value;

  // URLSearchParams automatically query string banata hai
  const params = new URLSearchParams({ page: 1, limit: 30 });

  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (minPrice) params.set("minPrice", minPrice);
  if (maxPrice) params.set("maxPrice", maxPrice);

  return params.toString();
  // Example output: "page=1&limit=30&search=laptop&category=Electronics"
}

// Step 3: Products load karo
async function loadProducts() {
  const statusText = document.getElementById("statusText");
  const productsGrid = document.getElementById("productsGrid");

  statusText.textContent = "Loading...";

  try {
    const query = buildQuery();
    const data = await apiGet(`/products?${query}`);

    statusText.textContent = `${data.total} products found`;
    renderProducts(data.data);
  } catch (error) {
    statusText.textContent = `Error: ${error.message}`;
  }
}

// Step 4: Products ko cards mein render karo
function renderProducts(products) {
  const productsGrid = document.getElementById("productsGrid");

  if (products.length === 0) {
    productsGrid.innerHTML = "<p>Koi product nahi mila.</p>";
    return;
  }

  productsGrid.innerHTML = products
    .map(
      (product) => `
      <div class="product-card">
        <h3>${product.title}</h3>
        <p><strong>Brand:</strong> ${product.brand}</p>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Price:</strong> $${Number(product.price).toFixed(2)}</p>
        <p><strong>Rating:</strong> ${product.rating ?? "N/A"}</p>
        <p><strong>Stock:</strong> ${product.stock ?? "N/A"}</p>
        <div class="card-actions">
          <button 
            class="btn btn-secondary" 
            onclick="goToEdit(${product.id})">
            ✏️ Edit
          </button>
          <button 
            class="btn btn-danger" 
            onclick="deleteProduct(${product.id})">
            🗑️ Delete
          </button>
        </div>
      </div>
    `,
    )
    .join("");
}

// Step 5: Edit page pe jao product id ke saath
function goToEdit(id) {
  // URL mein id daalo taaki edit page use kar sake
  window.location.href = `edit-product.html?id=${id}`;
}

// Step 6: Product delete karo
async function deleteProduct(id) {
  // Pehle confirm karo user se
  const confirmed = confirm("Are you sure you want to delete this product?");
  if (!confirmed) return;

  try {
    await apiDelete(`/products/${id}`);
    alert("Product deleted successfully!u");
    loadProducts(); // List refresh karo
  } catch (error) {
    alert(`Delete failed: ${error.message}`);
  }
}

// Event Listeners
document.getElementById("filterBtn").addEventListener("click", loadProducts);

document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  document.getElementById("categorySelect").value = "";
  document.getElementById("minPrice").value = "";
  document.getElementById("maxPrice").value = "";
  loadProducts();
});

// Page load hote hi
loadCategories();
loadProducts();
