# E-Commerce Client

A responsive e-commerce client application built with vanilla JavaScript, HTML, and CSS. This client works with the E-Commerce API server to provide a complete shopping experience.

## Features

### Customer Features

- **Product Browsing**: View all products with filtering and search capabilities
- **Advanced Filtering**: Filter by category, price range, rating, and search terms
- **Sorting Options**: Sort by date, price, rating, or name
- **Product Details**: Click on any product to view detailed information
- **Shopping Cart**: Add products to cart, update quantities, and remove items
- **User Authentication**: Login and signup functionality (mock implementation)
- **Checkout Process**: Complete checkout with address form and receipt generation
- **Responsive Design**: Works on mobile, tablet, laptop, desktop, and 4K displays

### Seller Features

- **Product Management**: Add, edit, and delete products
- **Product Listing**: View all products in a table format
- **Authentication**: Same login/signup system as customers

## Project Structure

```
client/
├── css/
│   └── style.css          # Common styles with responsive design
├── js/
│   ├── common.js          # Shared utilities and API functions
│   ├── home.js            # Home page functionality
│   ├── auth.js            # Authentication logic
│   ├── cart.js            # Cart and checkout functionality
│   └── seller.js          # Seller dashboard functionality
├── index.html             # Main customer page
├── seller.html            # Seller dashboard page
└── README.md              # This file
```

## Setup Instructions

### Prerequisites

- Node.js and npm (for the server)
- A modern web browser
- The E-Commerce API server running on `http://localhost:3001`

### Installation

1. **Start the Server**:

   ```bash
   cd ../server
   pnpm install
   pnpm dev
   ```

2. **Seed the Database** (if not already done):

   ```bash
   cd ../server
   node seed.js
   ```

3. **Open the Client**:
   - Open `index.html` in your web browser for the customer view
   - Open `seller.html` in your web browser for the seller dashboard

### Alternative: Serve Static Files

If you want to serve the client files from a web server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve . -p 8080
```

Then visit `http://localhost:8080/index.html`

## Usage

### For Customers

1. **Browse Products**:
   - View products on the home page
   - Use filters to search by category, price range, or keywords
   - Products are displayed in a responsive grid

2. **Shopping Cart**:
   - Click "Add to Cart" on any product
   - View cart by clicking the cart button in the header
   - Update quantities or remove items in the cart sidebar

3. **Checkout Process**:
   - Click "Checkout" in the cart
   - Login or sign up if not already authenticated
   - Fill in shipping address
   - Generate and print receipt

### For Sellers

1. **Access Seller Dashboard**:
   - Open `seller.html` in your browser

2. **Seller Credentials**:
   - Email: `seller@example.com`
   - Password: `Seller123!`

3. **Manage Products**:
   - View all products in a table
   - Add new products using the form
   - Edit existing products by clicking "Edit"
   - Delete products with confirmation

## API Integration

The client communicates with the server API at `http://localhost:3001`:

- `GET /products` - Fetch products with filters
- `GET /products/:id` - Get single product
- `POST /products` - Create new product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `GET /categories` - Get all categories

## Image Handling

The application uses reliable, category-consistent images from external services:

- **Primary Source**: Picsum.photos API with seed-based consistency
- **Secondary Fallback**: Placeholder.com for additional reliability
- **Consistency**: All products in the same category show identical images using seed parameter
- **Reliability**: Picsum.photos is highly available and consistent
- **Error Handling**: Automatic fallback on image load errors
- **Database**: All product images stored in products.json with category-based URLs

All 220+ products now have category-consistent image URLs that are reliable and always available.

## Responsive Design

The application uses CSS media queries for different screen sizes:

- **Mobile**: < 768px - Single column layout
- **Tablet**: 768px - 1023px - 2 columns
- **Laptop**: 1024px - 1199px - 3 columns
- **Desktop**: 1200px - 2559px - 4 columns
- **4K**: 2560px+ - 5 columns

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Development

### Adding New Features

1. **Styles**: Add to `css/style.css`
2. **Common functionality**: Add to `js/common.js`
3. **Page-specific logic**: Create new JS files and include in HTML

### Code Style

- Use modern JavaScript (ES6+)
- Follow consistent naming conventions
- Add comments for complex logic
- Use semantic HTML

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure the server is running on `http://localhost:3001`
   - Check that CORS is enabled in the server

2. **Products Not Loading**:
   - Verify the server is running
   - Check browser console for errors
   - Ensure database is seeded

3. **Images Not Displaying**:
   - Product images use reliable services (Picsum.photos + Placeholder.com)
   - Check browser console for any error messages
   - Images automatically fallback if primary service fails
   - All products in database have image URLs stored
   - Category images are consistent across all views (grid, modal, cart)

4. **Cart Not Working**:
   - Check browser localStorage support
   - Clear browser data if issues persist

5. **Responsive Issues**:
   - Check CSS media queries
   - Test on different devices/browsers

### Debug Mode

Open browser developer tools (F12) to:

- View console errors
- Inspect network requests
- Check localStorage data

## Development Challenges

This project faced several development challenges that were overcome during implementation. See `CHALLENGES.md` for a detailed breakdown of issues encountered and solutions implemented, including:

- UI sizing and responsiveness issues
- External service integration (image loading)
- JavaScript runtime errors
- Cross-browser compatibility
- Performance optimization
- Code maintainability

## Future Enhancements

- Real user authentication with JWT
- Payment integration (Stripe, PayPal)
- Order history and tracking
- Product reviews and ratings
- Wishlist functionality
- Advanced search with autocomplete
- Product image upload
- Inventory management
- Analytics dashboard for sellers
- Email notifications
- Mobile app version
- User profile management
- Recently viewed products
- Product comparison
- Social sharing
- Multi-language support
- Dark mode theme
- Progressive Web App (PWA) features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Feel free to use and modify as needed.
