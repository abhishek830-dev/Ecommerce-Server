// js/add-product.js

// Form se saari values uthao
function getFormData() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const price = document.getElementById("price").value;
  const category = document.getElementById("category").value;
  const brand = document.getElementById("brand").value.trim();
  const rating = document.getElementById("rating").value;
  const stock = document.getElementById("stock").value;

  return { title, description, price, category, brand, rating, stock };
}

// Required fields validate karo
function validate(data) {
  if (!data.title) return "Title required hai";
  if (!data.description) return "Description required hai";
  if (!data.price) return "Price required hai";
  if (!data.category) return "Category select karo";
  if (!data.brand) return "Brand required hai";
  return null; // null matlab koi error nahi
}

// Status message dikhao
function setStatus(message, isError = false) {
  const statusText = document.getElementById("statusText");
  statusText.textContent = message;
  statusText.className = isError ? "status-text error" : "status-text success";
}

// Submit button click hone par
document.getElementById("submitBtn").addEventListener("click", async () => {
  const data = getFormData();

  // Pehle validate karo
  const error = validate(data);
  if (error) {
    setStatus(error, true);
    return; // Aage mat jao
  }

  // Payload banao — sirf woh fields jo filled hain
  const payload = {
    title: data.title,
    description: data.description,
    price: Number(data.price),
    category: data.category,
    brand: data.brand,
  };

  // Optional fields — sirf tab add karo jab filled hon
  if (data.rating) payload.rating = Number(data.rating);
  if (data.stock) payload.stock = Number(data.stock);

  try {
    setStatus("Adding product...");

    await apiPost("/products", payload);

    setStatus("Product successfully add ho gaya! ✅");

    // Form reset karo
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("price").value = "";
    document.getElementById("category").value = "";
    document.getElementById("brand").value = "";
    document.getElementById("rating").value = "";
    document.getElementById("stock").value = "";
  } catch (error) {
    setStatus(`Error: ${error.message}`, true);
  }
});
