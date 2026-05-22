# ⚙️ House of Vastrikaa — Backend API
**Domain:** `api.houseofvastrikaa.com`

RESTful Web API for the House of Vastrikaa saree eCommerce platform. Built with **ASP.NET Core 9** and **SQL Server**. Serves both the customer storefront (`houseofvastrikaa.com`) and the admin panel (`admin.houseofvastrikaa.com`).

---

## 📁 Project Structure

```
houseofvastrikaa-backend/
├── HouseOfVastrikaa.API/                  # Entry point — controllers, middleware, config
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── ProductsController.cs
│   │   ├── CategoriesController.cs
│   │   ├── CartController.cs
│   │   ├── WishlistController.cs
│   │   ├── OrdersController.cs
│   │   ├── PaymentController.cs
│   │   ├── ShippingController.cs
│   │   └── AdminController.cs             # Admin-only endpoints
│   ├── Middleware/
│   │   ├── ExceptionMiddleware.cs
│   │   └── RequestLoggingMiddleware.cs
│   ├── Extensions/
│   │   ├── ServiceExtensions.cs
│   │   ├── SwaggerExtensions.cs
│   │   └── CorsExtensions.cs
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── appsettings.Production.json
│   └── Program.cs
├── HouseOfVastrikaa.Application/          # Business logic & DTOs
│   ├── DTOs/
│   │   ├── Auth/
│   │   │   ├── LoginRequestDto.cs
│   │   │   ├── RegisterRequestDto.cs
│   │   │   └── AuthResponseDto.cs
│   │   ├── Product/
│   │   │   ├── ProductDto.cs
│   │   │   ├── ProductListDto.cs
│   │   │   └── CreateProductDto.cs
│   │   ├── Order/
│   │   │   ├── OrderDto.cs
│   │   │   ├── PlaceOrderDto.cs
│   │   │   └── UpdateOrderStatusDto.cs
│   │   ├── Cart/
│   │   │   ├── CartDto.cs
│   │   │   └── AddToCartDto.cs
│   │   └── Payment/
│   │       ├── CreatePaymentOrderDto.cs
│   │       └── VerifyPaymentDto.cs
│   ├── Interfaces/
│   │   ├── IProductService.cs
│   │   ├── IOrderService.cs
│   │   ├── IAuthService.cs
│   │   ├── ICartService.cs
│   │   ├── IWishlistService.cs
│   │   ├── IPaymentService.cs
│   │   └── IShippingService.cs
│   └── Services/
│       ├── ProductService.cs
│       ├── OrderService.cs
│       ├── AuthService.cs
│       ├── CartService.cs
│       ├── WishlistService.cs
│       ├── PaymentService.cs
│       └── ShippingService.cs
├── HouseOfVastrikaa.Domain/               # Entities & enums
│   ├── Entities/
│   │   ├── Product.cs
│   │   ├── ProductImage.cs
│   │   ├── Category.cs
│   │   ├── Order.cs
│   │   ├── OrderItem.cs
│   │   ├── Cart.cs
│   │   ├── CartItem.cs
│   │   ├── Wishlist.cs
│   │   ├── User.cs
│   │   └── Address.cs
│   └── Enums/
│       ├── OrderStatus.cs
│       ├── PaymentMethod.cs
│       ├── PaymentStatus.cs
│       └── UserRole.cs
├── HouseOfVastrikaa.Infrastructure/       # EF Core, migrations, external APIs
│   ├── Data/
│   │   ├── AppDbContext.cs
│   │   └── Migrations/
│   ├── Repositories/
│   │   ├── ProductRepository.cs
│   │   ├── OrderRepository.cs
│   │   └── UserRepository.cs
│   └── ExternalServices/
│       ├── RazorpayService.cs
│       └── ShiprocketService.cs
├── HouseOfVastrikaa.Tests/
│   ├── Services/
│   └── Controllers/
├── HouseOfVastrikaa.sln
└── README.md
```

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | ASP.NET Core 9 Web API |
| ORM | Entity Framework Core 9 |
| Database | SQL Server 2022 |
| Auth | JWT Bearer tokens |
| API Docs | Swagger / Swashbuckle |
| Payment | Razorpay .NET SDK |
| Shipping | Shiprocket REST API |
| Logging | Serilog |
| Validation | FluentValidation |

---

## ⚙️ Prerequisites

- .NET 9 SDK
- SQL Server 2019 / 2022 (or Express)
- Visual Studio 2022 / VS Code / Rider

---

## 🛠️ Getting Started

```bash
git clone https://github.com/your-org/houseofvastrikaa-backend.git
cd houseofvastrikaa-backend
```

Edit `HouseOfVastrikaa.API/appsettings.Development.json` with your local config (see Environment Variables below), then:

```bash
dotnet ef database update --project HouseOfVastrikaa.Infrastructure --startup-project HouseOfVastrikaa.API
dotnet run --project HouseOfVastrikaa.API
```

API: `https://localhost:7001`
Swagger: `https://localhost:7001/swagger`

---

## 🌍 Environment Variables

**appsettings.Development.json**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=HouseOfVastrikaaDb;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "JwtSettings": {
    "SecretKey": "YOUR_SUPER_SECRET_KEY_MIN_32_CHARS_HERE",
    "Issuer": "HouseOfVastrikaaAPI",
    "Audience": "HouseOfVastrikaaClients",
    "ExpiryMinutes": 1440
  },
  "Razorpay": {
    "KeyId": "rzp_test_xxxxxxxxxxxx",
    "KeySecret": "your_razorpay_secret"
  },
  "Shiprocket": {
    "Email": "your@email.com",
    "Password": "your_shiprocket_password",
    "BaseUrl": "https://apiv2.shiprocket.in/v1/external"
  },
  "AllowedOrigins": [
    "http://localhost:5173",
    "http://localhost:5174"
  ]
}
```

**appsettings.Production.json**
```json
{
  "AllowedOrigins": [
    "https://houseofvastrikaa.com",
    "https://admin.houseofvastrikaa.com"
  ]
}
```

> All secrets in production should be stored in **Azure Key Vault** or environment variables, never in committed config files.

---

## 🔐 CORS Policy

Two origins are whitelisted — the storefront and the admin panel:

```csharp
// Extensions/CorsExtensions.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClients", policy =>
        policy.WithOrigins(configuration.GetSection("AllowedOrigins").Get<string[]>()!)
              .AllowAnyHeader()
              .AllowAnyMethod());
});
```

---

## 📖 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/register` | Register new customer | No |
| POST | `/login` | Login, returns JWT | No |
| POST | `/refresh` | Refresh JWT | No |
| POST | `/admin/login` | Admin login | No |

### Products — `/api/products`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | Paginated list with filters | No |
| GET | `/{id}` | Product detail | No |
| GET | `/search?q=` | Full-text search | No |
| POST | `/` | Create product | Admin |
| PUT | `/{id}` | Update product | Admin |
| DELETE | `/{id}` | Soft-delete product | Admin |
| POST | `/{id}/images` | Upload product images | Admin |
| DELETE | `/{id}/images/{imageId}` | Remove product image | Admin |

**GET `/api/products` query params:**
```
?page=1&pageSize=12
&categoryId=2
&minPrice=500&maxPrice=10000
&color=red&fabric=silk
&sortBy=price_asc|price_desc|newest|popular
```

### Categories — `/api/categories`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | All categories | No |
| POST | `/` | Create category | Admin |
| PUT | `/{id}` | Update category | Admin |
| DELETE | `/{id}` | Delete category | Admin |

### Cart — `/api/cart`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | Get user's cart | Customer |
| POST | `/items` | Add item | Customer |
| PUT | `/items/{id}` | Update quantity | Customer |
| DELETE | `/items/{id}` | Remove item | Customer |
| DELETE | `/` | Clear cart | Customer |

### Wishlist — `/api/wishlist`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | Get wishlist | Customer |
| POST | `/items` | Add product | Customer |
| DELETE | `/items/{productId}` | Remove product | Customer |

### Orders — `/api/orders`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | Customer order history | Customer |
| GET | `/{id}` | Order details | Customer |
| POST | `/` | Place order | Customer |
| PUT | `/{id}/cancel` | Cancel order | Customer |
| GET | `/admin` | All orders (paginated) | Admin |
| PUT | `/admin/{id}/status` | Update order status | Admin |

### Payment — `/api/payment`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/create-order` | Create Razorpay order | Customer |
| POST | `/verify` | Verify payment signature | Customer |

### Shipping — `/api/shipping`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/serviceability?pincode=` | Check pincode | No |
| POST | `/create-shipment` | Create Shiprocket shipment | Admin |
| GET | `/track/{awbCode}` | Track shipment | Customer |

### Admin Dashboard — `/api/admin`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/dashboard/stats` | Revenue, orders, products count | Admin |
| GET | `/dashboard/recent-orders` | Latest 10 orders | Admin |
| GET | `/customers` | All customers (paginated) | Admin |
| GET | `/customers/{id}` | Customer detail + orders | Admin |

---

## 🗃️ Database Schema

```sql
Categories   (Id, Name, Slug, ImageUrl, DisplayOrder, IsActive)

Products     (Id, Name, Description, Price, DiscountedPrice,
              StockQuantity, Fabric, Color, HasBlouePiece,
              CareInstructions, DeliveryDays, CategoryId,
              IsActive, CreatedAt, UpdatedAt)

ProductImages (Id, ProductId, ImageUrl, IsDefault, DisplayOrder)

Users        (Id, Name, Email, PasswordHash, Phone,
              Role [Customer|Admin], CreatedAt)

Addresses    (Id, UserId, Name, Phone, Line1, Line2,
              City, State, Pincode, IsDefault)

Orders       (Id, UserId, AddressId, TotalAmount, DiscountAmount,
              FinalAmount, PaymentMethod, PaymentStatus,
              OrderStatus, RazorpayOrderId, RazorpayPaymentId,
              AWBCode, ShiprocketOrderId, CreatedAt)

OrderItems   (Id, OrderId, ProductId, Quantity, UnitPrice, Subtotal)

Carts        (Id, UserId, CreatedAt, UpdatedAt)
CartItems    (Id, CartId, ProductId, Quantity)

Wishlists    (Id, UserId, ProductId, AddedAt)
```

---

## 💳 Razorpay Payment Flow

```
Customer Frontend              Backend API
       |                           |
       |-- POST /orders ---------> |  (OrderStatus: Pending)
       |<-- orderId ---------------|
       |                           |
       |-- POST /payment/create-order --> |
       |<-- { razorpayOrderId, amount } --|
       |                           |
       |  [Razorpay popup]         |
       |                           |
       |-- POST /payment/verify -->|
       |   { paymentId, orderId,   |
       |     signature }           |
       |<-- { success, orderId } --|  (OrderStatus: Paid)
```

**Signature verification:**
```csharp
var payload = $"{razorpayOrderId}|{razorpayPaymentId}";
using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_razorpaySecret));
var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
var computed = BitConverter.ToString(hash).Replace("-", "").ToLower();
if (computed != razorpaySignature) return BadRequest("Invalid signature");
```

---

## 🔐 JWT Roles

```csharp
public enum UserRole { Customer, Admin }
```

Controllers use `[Authorize(Roles = "Admin")]` or `[Authorize(Roles = "Customer")]` as needed.

---

## 📖 Swagger

Swagger is enabled in all environments.
Access at: `https://localhost:7001/swagger`

Click **Authorize** → paste your JWT token to test protected endpoints.

---

## 🗄️ EF Migrations

```bash
# Add migration
dotnet ef migrations add <Name> \
  --project HouseOfVastrikaa.Infrastructure \
  --startup-project HouseOfVastrikaa.API

# Apply
dotnet ef database update \
  --project HouseOfVastrikaa.Infrastructure \
  --startup-project HouseOfVastrikaa.API
```

---

## 🧪 Tests

```bash
dotnet test HouseOfVastrikaa.Tests
```

---

## 🔮 Planned Features

- Product reviews & ratings
- Return / refund management
- GST invoice PDF generation
- Multi-vendor / seller system
- WhatsApp notifications (Meta Cloud API)
- AI recommendation engine
- Referral code system

---

## 📝 License

MIT
