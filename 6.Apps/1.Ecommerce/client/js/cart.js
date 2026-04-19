// Cart functionality

document.addEventListener("DOMContentLoaded", function () {
  // Initialize cart UI
  updateCartUI();

  // Event listeners
  const closeCartBtn = $(".close-cart");
  const checkoutBtn = $("#checkout-btn");
  const addressForm = $("#address-form");
  const printReceiptBtn = $("#print-receipt");
  const closeReceiptBtn = $("#close-receipt");

  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", () =>
      $(".cart-sidebar").classList.remove("open"),
    );
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", handleCheckout);
  }

  if (addressForm) {
    addressForm.addEventListener("submit", handleAddressSubmit);
  }

  if (printReceiptBtn) {
    printReceiptBtn.addEventListener("click", () => window.print());
  }

  if (closeReceiptBtn) {
    closeReceiptBtn.addEventListener("click", () => hideModal("receipt-modal"));
  }

  // Event delegation for cart item actions
  addEventListenerToDynamicElements(
    "click",
    ".quantity-increase",
    handleQuantityIncrease,
  );
  addEventListenerToDynamicElements(
    "click",
    ".quantity-decrease",
    handleQuantityDecrease,
  );
  addEventListenerToDynamicElements("click", ".remove-item", handleRemoveItem);
});

//----------------------------------------------------------------------------------------------------------------
function updateCartUI() {
  const cart = getCart();
  const cartItemsContainer = $("#cart-items");
  const cartCount = $("#cart-count");
  const cartTotal = $("#cart-total");

  // Update cart count
  cartCount.textContent = getCartItemCount();

  // Update cart items
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty</p>";
    cartTotal.textContent = "0.00";
    $("#checkout-btn").disabled = true;
  } else {
    cartItemsContainer.innerHTML = cart
      .map((item) => {
        const imageUrl = getCategoryImage(item.category, "120x120");
        return `
      <div class="cart-item">
        <img src="${imageUrl}" alt="${item.title}" class="cart-item-image">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div class="cart-item-quantity">
            <button class="quantity-decrease btn quantity-btn" data-product-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-increase btn quantity-btn" data-product-id="${item.id}">+</button>
            <button class="remove-item btn btn-danger" data-product-id="${item.id}" style="margin-left: 0.5rem;">Remove</button>
          </div>
        </div>
      </div>
    `;
      })
      .join("");

    cartTotal.textContent = getCartTotal().toFixed(2);
    $("#checkout-btn").disabled = false;
  }
}

function handleQuantityIncrease(e) {
  const productId = parseInt(e.target.dataset.productId);
  const cart = getCart();
  const item = cart.find((item) => item.id === productId);

  if (item) {
    item.quantity += 1;
    saveCart(cart);
    updateCartUI();
  }
}

function handleQuantityDecrease(e) {
  const productId = parseInt(e.target.dataset.productId);
  const cart = getCart();
  const item = cart.find((item) => item.id === productId);

  if (item && item.quantity > 1) {
    item.quantity -= 1;
    saveCart(cart);
    updateCartUI();
  }
}

function handleRemoveItem(e) {
  const productId = parseInt(e.target.dataset.productId);
  removeCartItem(productId);
}

function handleCheckout() {
  if (!requireAuth()) {
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    showNotification("Your cart is empty", "error");
    return;
  }

  // Close cart sidebar
  $(".cart-sidebar").classList.remove("open");

  // Show address modal
  showModal("address-modal");
}

function handleAddressSubmit(e) {
  e.preventDefault();

  const addressData = {
    name: $("#address-name").value,
    street: $("#address-street").value,
    city: $("#address-city").value,
    state: $("#address-state").value,
    zip: $("#address-zip").value,
    phone: $("#address-phone").value,
  };

  // Validate address
  if (
    !addressData.name ||
    !addressData.street ||
    !addressData.city ||
    !addressData.state ||
    !addressData.zip ||
    !addressData.phone
  ) {
    showNotification("Please fill in all address fields", "error");
    return;
  }

  // Hide address modal
  hideModal("address-modal");

  // Generate receipt
  generateReceipt(addressData);

  // Show receipt modal
  showModal("receipt-modal");

  // Clear cart
  saveCart([]);

  // Reset form
  $("#address-form").reset();
}

function generateReceipt(addressData) {
  const cart = getCart();
  const total = getCartTotal();
  const deliveryTime = generateRandomDeliveryTime();
  const orderId = "ORD-" + Date.now();

  const receiptHTML = `
    <div class="receipt-header">
      <div class="receipt-title">E-Shop Receipt</div>
      <p>Order ID: ${orderId}</p>
      <p>Date: ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="receipt-details">
      <div class="receipt-section">
        <div class="receipt-section-title">Customer Information</div>
        <p><strong>Name:</strong> ${currentUser.name}</p>
        <p><strong>Email:</strong> ${currentUser.email}</p>
      </div>

      <div class="receipt-section">
        <div class="receipt-section-title">Shipping Address</div>
        <p>${addressData.name}</p>
        <p>${addressData.street}</p>
        <p>${addressData.city}, ${addressData.state} ${addressData.zip}</p>
        <p><strong>Phone:</strong> ${addressData.phone}</p>
      </div>

      <div class="receipt-section">
        <div class="receipt-section-title">Order Items</div>
        <div class="receipt-items">
          ${cart
            .map(
              (item) => `
            <div class="receipt-item">
              <div>
                <strong>${item.title}</strong><br>
                Quantity: ${item.quantity}
              </div>
              <div>${formatPrice(item.price * item.quantity)}</div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>

      <div class="receipt-total">
        <strong>Total: ${formatPrice(total)}</strong>
      </div>

      <div class="receipt-section">
        <div class="receipt-section-title">Delivery Information</div>
        <p>Estimated delivery time: <strong>${deliveryTime}</strong></p>
        <p>Thank you for shopping with E-Shop!</p>
      </div>
    </div>
  `;

  $("#receipt-content").innerHTML = receiptHTML;
}
