# ShopSphere – Complete E-Commerce & Inventory Management Platform

**ShopSphere** is an enterprise-grade, full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** platform designed for modern retail technology and inventory lifecycle management. Built specifically for academic presentation and B.Tech internship demonstrations.

---

## 🌟 Key Highlights & Features

### 🛒 1. Customer Storefront
- **Product Discovery:** Full catalog with live MongoDB search, category filters, price range filter, sorting (price, rating, newest), and pagination.
- **Product Details:** High-resolution product showcase, SKU identifiers, real-time stock indicator, quantity selectors, and customer rating/reviews.
- **Shopping Cart:** Persistent MongoDB database cart synchronized across customer devices. Stock limit checks prevent adding more units than available.
- **Checkout & Pricing Engine:** Server-side authoritative calculation. Prices, tax (5% GST), shipping rates, and promo codes are strictly calculated on the server to prevent client-side tampering.
- **Order Tracking & Cancellations:** Customer order history with live status timelines (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`). Cancellations trigger automatic compensating stock restoration.

### 🛡️ 2. Protected Admin Dashboard
- **Real-Time Analytics:** Live KPI metrics aggregated directly from MongoDB:
  - Total Paid Revenue (excluding unpaid/cancelled orders)
  - Total Order counts & Paid conversion
  - Active Products & Customer count
  - Real-time Low-Stock alert alerts
  - Best-selling products & Recent order timeline
- **Inventory & Audit Trail:** Stock overview with immediate visual indicators (`in_stock`, `low_stock`, `out_of_stock`). Manual stock adjustment with **mandatory reason prompts** logged into the `InventoryMovement` audit history.
- **Product Catalog Management:** Add new products with SKUs, category links, images, pricing, and reorder thresholds.
- **Order Lifecycle Fulfillment:** Inline order status progression (`confirmed` ➔ `processing` ➔ `shipped` ➔ `delivered`).
- **Promotional Coupons:** Create and manage percentage or flat discount promo codes with minimum cart thresholds and usage caps.

### 💳 3. Simulated Idempotent Mock Payment Gateway
- Academic demonstration gateway explicitly labeled as a simulation.
- Supports 3 real-world scenarios:
  1. **Simulate Successful Payment:** Marks order as confirmed and payment as successful.
  2. **Simulate Bank Decline / Failure:** Leaves order pending for customer retry.
  3. **Idempotency Protection:** Generates unique session keys (`idempotencyKey`) to prevent double-charging on duplicate network events.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Administrator** | `admin@shopsphere.com` | `admin123` | Full Admin Dashboard & Storefront |
| **Customer** | `customer@shopsphere.com` | `customer123` | Storefront, Cart, Checkout & Orders |

### Demo Promo Coupons
- **`WELCOME10`**: 10% discount up to ₹500 (Minimum cart: ₹1,000)
- **`FLAT200`**: Flat ₹200 discount (Minimum cart: ₹1,500)

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, React Router DOM v7, Lucide Icons, Pure Modern Blue CSS Design System
- **Backend:** Node.js, Express.js 5
- **Database:** MongoDB Community Server / MongoDB Atlas, Mongoose ORM
- **Security & Auth:** JSON Web Tokens (JWT), bcryptjs password hashing, Role-Based Access Control (RBAC)

---

## 📁 Project Structure

```text
ecommerce-inventory-management/
├── backend/
│   ├── config/          # MongoDB connection (db.js)
│   ├── controllers/     # Business logic (auth, product, cart, order, payment, inventory, analytics)
│   ├── middleware/      # JWT auth verification & admin authorization
│   ├── models/          # Mongoose Schemas (User, Product, Category, Cart, Order, Payment, InventoryMovement, Coupon, Review)
│   ├── routes/          # REST API endpoints
│   ├── seed/            # Automated database seed script (20 products, 5 categories, demo users)
│   ├── services/        # Atomic inventory reservation & restoration services
│   ├── server.js        # Main Express application entry point
│   ├── .env             # Environment configuration
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbar, Footer, ProductCard, AdminSidebar
│   │   ├── context/     # AuthContext, CartContext
│   │   ├── layouts/     # AdminLayout
│   │   ├── pages/       # Storefront (Home, Products, Details, Cart, Checkout, Payment, Orders)
│   │   │   └── admin/   # Dashboard, Inventory, Products, Orders, Coupons
│   │   ├── services/    # api.js (Fetch API client)
│   │   ├── styles/      # index.css (Modern Blue design tokens)
│   │   ├── App.jsx      # Route tree
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

---

## 🚀 Step-by-Step Run Instructions

### 1. Start Backend Server
Open a terminal in the `backend` directory:
```bash
cd backend
npm install
npm run seed      # Populates 20 products, categories, coupons & users
npm run dev       # Starts Express API at http://localhost:5000
```

### 2. Start Frontend Client
Open a second terminal in the `frontend` directory:
```bash
cd frontend
npm install
npm run dev       # Starts Vite dev server at http://localhost:5173
```

### 3. Open Application in Browser
Navigate to:
👉 **`http://localhost:5173`**

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT |
| `GET` | `/api/auth/me` | Private | Fetch logged-in user profile |
| `GET` | `/api/products` | Public | Search, filter, and paginate products |
| `GET` | `/api/products/:id` | Public | Get single product details |
| `POST` | `/api/products` | Admin | Create product |
| `GET` | `/api/categories` | Public | List active categories |
| `GET` | `/api/cart` | Private | Fetch customer's persistent cart |
| `POST` | `/api/cart/items` | Private | Add item to cart with stock validation |
| `PUT` | `/api/cart/items/:id` | Private | Update item quantity |
| `DELETE` | `/api/cart/items/:id` | Private | Remove item from cart |
| `POST` | `/api/orders` | Private | Create order with server price recalculation |
| `GET` | `/api/orders/my-orders` | Private | View customer order history |
| `POST` | `/api/orders/:id/cancel` | Private | Cancel order & restore inventory |
| `POST` | `/api/payments/simulate` | Private | Process mock payment (success/failure) |
| `GET` | `/api/inventory` | Admin | Get inventory overview & stock statuses |
| `POST` | `/api/inventory/:id/adjust` | Admin | Manual stock adjustment with audit reason |
| `GET` | `/api/inventory/movements` | Admin | Audit trail history of stock movements |
| `GET` | `/api/analytics/dashboard` | Admin | Real-time sales, revenue & order KPIs |
| `GET` | `/api/coupons/validate/:code` | Private | Validate discount promo code |

---

© Developed for Internship Evaluation.
