// Seller dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
  loadProducts();

  // Event listeners
  $('#add-product-form').addEventListener('submit', handleAddProduct);
  $('#edit-product-form').addEventListener('submit', handleEditProduct);
  $('#cancel-edit').addEventListener('click', () => hideModal('edit-product-modal'));

  // Event delegation for product actions
  addEventListenerToDynamicElements('click', '.edit-product-btn', handleEditProductClick);
  addEventListenerToDynamicElements('click', '.delete-product-btn', handleDeleteProduct);
});

async function loadProducts() {
  try {
    showLoading($('#products-list'));

    const response = await apiRequest('/products?limit=100'); // Load more products for seller
    const products = response.data;

    displayProducts(products);
  } catch (error) {
    console.error('Error loading products:', error);
    $('#products-list').innerHTML = '<div class="error">Failed to load products. Please try again later.</div>';
  }
}

function displayProducts(products) {
  const container = $('#products-list');

  if (products.length === 0) {
    container.innerHTML = '<div class="error">No products found.</div>';
    return;
  }

  container.innerHTML = `
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: var(--light-color);">
            <th style="padding: 1rem; text-align: left; border: 1px solid #ddd;">ID</th>
            <th style="padding: 1rem; text-align: left; border: 1px solid #ddd;">Title</th>
            <th style="padding: 1rem; text-align: left; border: 1px solid #ddd;">Category</th>
            <th style="padding: 1rem; text-align: left; border: 1px solid #ddd;">Brand</th>
            <th style="padding: 1rem; text-align: left; border: 1px solid #ddd;">Price</th>
            <th style="padding: 1rem; text-align: left; border: 1px solid #ddd;">Stock</th>
            <th style="padding: 1rem; text-align: left; border: 1px solid #ddd;">Rating</th>
            <th style="padding: 1rem; text-align: left; border: 1px solid #ddd;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(product => `
            <tr>
              <td style="padding: 1rem; border: 1px solid #ddd;">${product.id}</td>
              <td style="padding: 1rem; border: 1px solid #ddd;">${product.title}</td>
              <td style="padding: 1rem; border: 1px solid #ddd;">${product.category}</td>
              <td style="padding: 1rem; border: 1px solid #ddd;">${product.brand}</td>
              <td style="padding: 1rem; border: 1px solid #ddd;">${formatPrice(product.price)}</td>
              <td style="padding: 1rem; border: 1px solid #ddd;">${product.stock}</td>
              <td style="padding: 1rem; border: 1px solid #ddd;">${product.rating}</td>
              <td style="padding: 1rem; border: 1px solid #ddd;">
                <button class="edit-product-btn btn btn-secondary" data-product-id="${product.id}">Edit</button>
                <button class="delete-product-btn btn btn-danger" data-product-id="${product.id}" style="margin-left: 0.5rem;">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function handleAddProduct(e) {
  e.preventDefault();

  const productData = {
    title: $('#product-title').value,
    description: $('#product-description').value,
    price: parseFloat($('#product-price').value),
    category: $('#product-category').value,
    brand: $('#product-brand').value,
    stock: parseInt($('#product-stock').value),
    rating: parseFloat($('#product-rating').value) || 4.0
  };

  try {
    await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });

    showNotification('Product added successfully!', 'success');
    $('#add-product-form').reset();
    loadProducts(); // Reload the list
  } catch (error) {
    console.error('Error adding product:', error);
    showNotification('Failed to add product. Please try again.', 'error');
  }
}

async function handleEditProductClick(e) {
  const productId = parseInt(e.target.dataset.productId);

  try {
    const product = await apiRequest(`/products/${productId}`);

    // Populate edit form
    $('#edit-product-id').value = product.id;
    $('#edit-product-title').value = product.title;
    $('#edit-product-description').value = product.description;
    $('#edit-product-price').value = product.price;
    $('#edit-product-stock').value = product.stock;
    $('#edit-product-category').value = product.category;
    $('#edit-product-brand').value = product.brand;
    $('#edit-product-rating').value = product.rating;

    showModal('edit-product-modal');
  } catch (error) {
    console.error('Error loading product for edit:', error);
    showNotification('Failed to load product details.', 'error');
  }
}

async function handleEditProduct(e) {
  e.preventDefault();

  const productId = parseInt($('#edit-product-id').value);
  const productData = {
    title: $('#edit-product-title').value,
    description: $('#edit-product-description').value,
    price: parseFloat($('#edit-product-price').value),
    category: $('#edit-product-category').value,
    brand: $('#edit-product-brand').value,
    stock: parseInt($('#edit-product-stock').value),
    rating: parseFloat($('#edit-product-rating').value)
  };

  try {
    await apiRequest(`/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(productData)
    });

    showNotification('Product updated successfully!', 'success');
    hideModal('edit-product-modal');
    loadProducts(); // Reload the list
  } catch (error) {
    console.error('Error updating product:', error);
    showNotification('Failed to update product. Please try again.', 'error');
  }
}

async function handleDeleteProduct(e) {
  const productId = parseInt(e.target.dataset.productId);

  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }

  try {
    await apiRequest(`/products/${productId}`, {
      method: 'DELETE'
    });

    showNotification('Product deleted successfully!', 'success');
    loadProducts(); // Reload the list
  } catch (error) {
    console.error('Error deleting product:', error);
    showNotification('Failed to delete product. Please try again.', 'error');
  }
}