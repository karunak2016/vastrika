# 🛠️ House of Vastrikaa — Admin Panel
**Domain:** `admin.houseofvastrikaa.com`

Internal admin dashboard for managing the House of Vastrikaa saree store. Built with **React 18 + Vite** as a fully separate project. All data is fetched via the backend API at `api.houseofvastrikaa.com`.

> ⚠️ This panel is not publicly accessible. Access is restricted to users with the `Admin` role via JWT authentication.

---

## 📁 Project Structure

```
houseofvastrikaa-admin/
├── public/
│   └── assets/
├── src/
│   ├── api/                           # API layer — all calls go through here
│   │   ├── axiosClient.js             # Base Axios + JWT interceptor
│   │   ├── authApi.js
│   │   ├── productApi.js
│   │   ├── categoryApi.js
│   │   ├── orderApi.js
│   │   ├── customerApi.js
│   │   ├── shippingApi.js
│   │   └── dashboardApi.js
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx            # Navigation sidebar
│   │   │   ├── TopBar.jsx             # Header with admin name + logout
│   │   │   └── AdminLayout.jsx        # Sidebar + TopBar wrapper
│   │   ├── common/
│   │   │   ├── DataTable.jsx          # Reusable paginated table
│   │   │   ├── ConfirmModal.jsx       # Delete/action confirmation
│   │   │   ├── StatusBadge.jsx        # Order/payment status chips
│   │   │   ├── ImageUploader.jsx      # Product image upload with preview
│   │   │   └── Loader.jsx
│   │   ├── dashboard/
│   │   │   ├── StatsCards.jsx         # Revenue, orders, customers, products
│   │   │   ├── RevenueChart.jsx       # Daily/monthly revenue line chart
│   │   │   └── RecentOrders.jsx       # Latest orders table
│   │   ├── products/
│   │   │   ├── ProductForm.jsx        # Create / edit product form
│   │   │   └── ImageManager.jsx       # Manage product images
│   │   ├── orders/
│   │   │   ├── OrderTable.jsx
│   │   │   ├── OrderDetail.jsx
│   │   │   └── StatusUpdater.jsx      # Dropdown to change order status
│   │   └── customers/
│   │       ├── CustomerTable.jsx
│   │       └── CustomerDetail.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx              # Admin-only login
│   │   ├── DashboardPage.jsx
│   │   ├── products/
│   │   │   ├── ProductsListPage.jsx
│   │   │   ├── CreateProductPage.jsx
│   │   │   └── EditProductPage.jsx
│   │   ├── categories/
│   │   │   ├── CategoriesPage.jsx
│   │   │   └── EditCategoryPage.jsx
│   │   ├── orders/
│   │   │   ├── OrdersListPage.jsx
│   │   │   └── OrderDetailPage.jsx
│   │   └── customers/
│   │       ├── CustomersListPage.jsx
│   │       └── CustomerDetailPage.jsx
│   ├── context/
│   │   └── AdminAuthContext.jsx       # Admin JWT state
│   ├── hooks/
│   │   ├── useAdminAuth.js
│   │   └── usePagination.js
│   ├── utils/
│   │   ├── formatCurrency.js
│   │   ├── formatDate.js
│   │   └── constants.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .env.local
├── vite.config.js
├── package.json
└── README.md
```

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| HTTP Client | Axios |
| State | React Context API |
| Styling | Tailwind CSS |
| UI / Components | Ant Design (antd) |
| Charts | Recharts |
| Forms | React Hook Form + Yup |
| Notifications | Ant Design message/notification |
| Icons | Lucide React |

> Ant Design is chosen for the admin panel as it provides rich data-heavy components (tables, forms, modals, date pickers) out of the box — ideal for back-office use.

---

## ⚙️ Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Backend API running at `api.houseofvastrikaa.com` (or `localhost:7001` locally)

---

## 🛠️ Getting Started

```bash
git clone https://github.com/your-org/houseofvastrikaa-admin.git
cd houseofvastrikaa-admin
npm install
cp .env.example .env.local
npm run dev
```

Admin panel runs at `http://localhost:5174`

> Note: The frontend storefront uses port `5173`. The admin panel uses `5174` to run both simultaneously during development.

---

## 🌍 Environment Variables

**.env.example**
```env
# Backend API base URL
VITE_API_BASE_URL=https://api.houseofvastrikaa.com/api
```

**Local development (`.env.local`):**
```env
VITE_API_BASE_URL=https://localhost:7001/api
```

---

## 📄 Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/login` | LoginPage | Admin authentication |
| `/` | DashboardPage | Stats, revenue chart, recent orders |
| `/products` | ProductsListPage | All products with search + pagination |
| `/products/create` | CreateProductPage | Add new saree |
| `/products/:id/edit` | EditProductPage | Edit product + manage images |
| `/categories` | CategoriesPage | Manage saree categories |
| `/categories/:id/edit` | EditCategoryPage | Edit category |
| `/orders` | OrdersListPage | All orders with filters |
| `/orders/:id` | OrderDetailPage | Order info + status update + shipping |
| `/customers` | CustomersListPage | All registered customers |
| `/customers/:id` | CustomerDetailPage | Customer info + order history |

All routes except `/login` require the admin to be authenticated. An `AdminRoute` wrapper redirects unauthenticated users to `/login`.

---

## 🔐 Authentication

The admin logs in via `POST /api/auth/admin/login`. A JWT token with `Role: Admin` is returned and stored in `localStorage`. The Axios client attaches it to every request.

```js
// src/api/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
```

---

## 📊 Dashboard

The dashboard fetches from `GET /api/admin/dashboard/stats` and displays:

| Card | Metric |
|---|---|
| Total Revenue | Sum of paid orders (₹) |
| Orders Today | Count of today's orders |
| Total Products | Active product count |
| Total Customers | Registered customers |

Plus a **Revenue Chart** (daily/monthly toggle via Recharts) and a **Recent Orders** table (last 10 orders with status badges).

---

## 📦 Product Management

- List all products with search, category filter, and pagination
- Create new product with fields:
  - Name, description, price, discounted price
  - Fabric, color, blouse piece included (yes/no)
  - Care instructions, delivery days
  - Category, stock quantity
  - Multiple image uploads (first image = default/cover)
- Edit existing product
- Soft-delete (sets `IsActive = false`, product disappears from storefront)
- Image manager: add / remove / reorder product images

---

## 🛒 Order Management

- View all orders with filters: status, date range, payment method
- Order statuses managed from admin:

| Status | Meaning |
|---|---|
| `Pending` | Order placed, payment not done |
| `Paid` | Payment confirmed |
| `Processing` | Being packed |
| `Shipped` | Handed to courier |
| `Delivered` | Customer received |
| `Cancelled` | Cancelled by customer or admin |

- **Create Shiprocket Shipment** button (visible when status is `Paid`)
- After shipment creation, AWB tracking code is saved and visible to the customer

---

## 🚚 Shipping Workflow

```
Order Paid  →  Admin clicks "Create Shipment"
           →  POST /api/shipping/create-shipment
           →  Shiprocket creates shipment & returns AWB code
           →  Order status updates to "Shipped"
           →  Customer can now track via AWB code
```

---

## 🌐 API Modules Used

| Module | Base Path |
|---|---|
| Auth | `/api/auth/admin/login` |
| Dashboard Stats | `/api/admin/dashboard/stats` |
| Products | `/api/products` |
| Categories | `/api/categories` |
| Orders | `/api/orders/admin` |
| Customers | `/api/admin/customers` |
| Shipping | `/api/shipping` |

---

## 🏗️ Build & Deploy

```bash
npm run build       # Output → dist/
```

**Deployment target:** `admin.houseofvastrikaa.com`
Deploy `dist/` to Nginx / Vercel. Add the React Router rewrite:

```nginx
server {
    server_name admin.houseofvastrikaa.com;

    root /var/www/houseofvastrikaa-admin/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

---

## 🔮 Planned Features

- Return / refund request management
- GST invoice PDF preview & download
- Bulk order export (CSV / Excel)
- Low stock alerts
- Product reviews moderation
- Vendor / seller management
- WhatsApp notification triggers

---

## 📝 License

MIT
