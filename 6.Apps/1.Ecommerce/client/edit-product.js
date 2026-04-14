// js/edit-product.js

// Step 1: URL se product ID nikalo
// URL hogi: edit-product.html?id=5
function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id"); // "5" return karega
}

// Step 2: Status message dikhao
function setStatus(message, isError = false) {
  const statusText = document.getElementById("statusText");
  statusText.textContent = message;
  statusText.className = isError ? "status-text error" : "status-text success";
}

// Step 3: Product data form mein fill karo
function fillForm(product) {
  document.getElementById("title").value = product.title;
  document.getElementById("description").value = product.description;
  document.getElementById("price").value = product.price;
  document.getElementById("category").value = product.category;
  document.getElementById("brand").value = product.brand;
  document.getElementById("rating").value = product.rating ?? "";
  document.getElementById("stock").value = product.stock ?? "";
}

// Step 4: Product load karo API se
async function loadProduct(id) {
  try {
    setStatus("Loading product...");
    const product = await apiGet(`/products/${id}`);
    fillForm(product);
    setStatus(""); // Clear karo message
  } catch (error) {
    setStatus(`Error: ${error.message}`, true);
  }
}

// Step 5: Form se updated data uthao
function getFormData() {
  return {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    price: Number(document.getElementById("price").value),
    category: document.getElementById("category").value,
    brand: document.getElementById("brand").value.trim(),
    rating: Number(document.getElementById("rating").value),
    stock: Number(document.getElementById("stock").value),
  };
}

// Step 6: Update button click
document.getElementById("updateBtn").addEventListener("click", async () => {
  const id = getIdFromUrl();

  if (!id) {
    setStatus("Product ID not found in URL", true);
    return;
  }

  const data = getFormData();

  // Sirf filled fields bhejo
  const payload = {};
  if (data.title) payload.title = data.title;
  if (data.description) payload.description = data.description;
  if (data.price) payload.price = data.price;
  if (data.category) payload.category = data.category;
  if (data.brand) payload.brand = data.brand;
  if (data.rating) payload.rating = data.rating;
  if (data.stock) payload.stock = data.stock;

  try {
    setStatus("Updating...");
    await apiPatch(`/products/${id}`, payload);
    setStatus("Product updated successfully! ✅");

    // 1 second baad products page pe jao
    setTimeout(() => {
      window.location.href = "products.html";
    }, 1000);
  } catch (error) {
    setStatus(`Error: ${error.message}`, true);
  }
});

// Page load hote hi
const productId = getIdFromUrl();

if (productId) {
  loadProduct(productId);
} else {
  setStatus("Product ID not found in URL", true);
}
