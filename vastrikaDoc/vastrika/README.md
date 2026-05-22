# 🛍️ House of Vastrikaa — Frontend
**Domain:** `houseofvastrikaa.com`

Customer-facing storefront for the House of Vastrikaa saree eCommerce platform. Built with **React 18 + Vite**. Communicates exclusively with the backend via REST APIs at `api.houseofvastrikaa.com`.

---

## 📁 Project Structure

```
houseofvastrikaa-frontend/
├── public/
│   └── assets/                      # Favicon, OG images, static icons
├── src/
│   ├── api/                         # All API calls — no fetch/axios elsewhere
│   │   ├── axiosClient.js           # Base Axios instance + JWT interceptor
│   │   ├── authApi.js
│   │   ├── productApi.js
│   │   ├── categoryApi.js
│   │   ├── cartApi.js
│   │   ├── wishlistApi.js
│   │   ├── orderApi.js
│   │   └── paymentApi.js
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── Breadcrumb.jsx
│   │   │   └── WhatsAppButton.jsx
│   │   ├── home/
│   │   │   ├── HeroBanner.jsx
│   │   │   ├── FeaturedSarees.jsx
│   │   │   └── CategoryGrid.jsx
│   │   ├── product/
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductImageGallery.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   └── FilterSidebar.jsx
│   │   ├── cart/
│   │   │   ├── CartItem.jsx
│   │   │   └── CartSummary.jsx
│   │   └── checkout/
│   │       ├── AddressForm.jsx
│   │       ├── PaymentOptions.jsx
│   │       └── OrderSummary.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── ShopPage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── WishlistPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── OrderConfirmationPage.jsx
│   │   ├── OrderHistoryPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── WishlistContext.jsx
│   ├── hooks/
│   │   ├── useProducts.js
│   │   ├── useCart.js
│   │   └── useAuth.js
│   ├── utils/
│   │   ├── formatCurrency.js        # ₹ Indian number formatting
│   │   ├── razorpay.js              # Razorpay popup helper
│   │   └── constants.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .env.local                       # Never commit this
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
| State | React Context API + useReducer |
| Styling | Tailwind CSS |
| UI Library | shadcn/ui |
| Payment | Razorpay JS SDK |
| Forms | React Hook Form + Yup |
| Notifications | React Toastify |
| Icons | Lucide React |

---

## ⚙️ Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Backend API running at `api.houseofvastrikaa.com` (or `localhost:7001` locally)

---

## 🛠️ Getting Started

```bash
git clone https://github.com/your-org/houseofvastrikaa-frontend.git
cd houseofvastrikaa-frontend
npm install
cp .env.example .env.local
npm run dev
```

App runs at `http://localhost:5173`

---

## 🌍 Environment Variables

**.env.example**
```env
# Backend API base URL
VITE_API_BASE_URL=https://api.houseofvastrikaa.com/api

# Razorpay publishable key
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx

# WhatsApp support number (with country code, no +)
VITE_WHATSAPP_NUMBER=919876543210
```

**Local development override (`.env.local`):**
```env
VITE_API_BASE_URL=https://localhost:7001/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

---

## 📄 Pages & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | HomePage | No |
| `/shop` | ShopPage | No |
| `/shop/:categorySlug` | ShopPage (filtered) | No |
| `/product/:id` | ProductDetailPage | No |
| `/cart` | CartPage | No |
| `/wishlist` | WishlistPage | Yes |
| `/checkout` | CheckoutPage | Yes |
| `/order-confirmation/:id` | OrderConfirmationPage | Yes |
| `/orders` | OrderHistoryPage | Yes |
| `/login` | LoginPage | No |
| `/register` | RegisterPage | No |

---

## 🌐 API Communication

All API calls live in `src/api/`. The Axios client auto-attaches the JWT token:

```js
// src/api/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosClient;
```

---

## 💳 Razorpay Integration

```js
// src/utils/razorpay.js
export const initiatePayment = (orderData, onSuccess, onFailure) => {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: orderData.amountInPaise,
    currency: "INR",
    name: "House of Vastrikaa",
    description: "Saree Purchase",
    order_id: orderData.razorpayOrderId,
    handler: (response) => onSuccess(response),
    prefill: {
      name: orderData.customerName,
      email: orderData.customerEmail,
      contact: orderData.customerPhone,
    },
    theme: { color: "#8B1A4A" },
  };
  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", onFailure);
  rzp.open();
};
```

---

## 🏗️ Build & Deploy

```bash
npm run build        # Output → dist/
npm run preview      # Preview production build locally
```

**Deployment target:** `houseofvastrikaa.com`
Deploy the `dist/` folder to Vercel / Netlify / Nginx.

For Nginx, add a rewrite rule so React Router works:
```nginx
location / {
    try_files $uri /index.html;
}
```

---

## 🔮 Planned Features

- Product reviews & ratings
- Return request flow
- WhatsApp order notifications
- AI saree recommendations
- GST invoice download
- Referral system

---

## 📝 License

MIT
