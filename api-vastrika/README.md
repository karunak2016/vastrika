# House of Vastrikaa — Backend API

ASP.NET Core 9 Web API for a saree eCommerce platform. Built with clean architecture, Dapper + stored procedures, JWT authentication, Razorpay payments, and Shiprocket shipping.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | ASP.NET Core 9 Web API |
| ORM | Dapper 2.1.35 (no EF Core) |
| Database | SQL Server (stored procedures only) |
| Auth | JWT Bearer (Microsoft.AspNetCore.Authentication.JwtBearer 9.0.4) |
| Payments | Razorpay SDK 3.0.2 |
| Shipping | Shiprocket REST API |
| Logging | Serilog.AspNetCore 8.0.3 |
| Docs | Swashbuckle.AspNetCore 10.1.7 (Swagger UI) |

---

## Architecture

5-project clean architecture solution:

```
HouseOfVastrikaa.sln
├── HouseOfVastrikaa.Domain          # Entities, Enums (no dependencies)
├── HouseOfVastrikaa.Application     # Interfaces, Services, DTOs
├── HouseOfVastrikaa.Infrastructure  # Repositories, External services, DB
├── HouseOfVastrikaa.API             # Controllers, Middleware, Program.cs
└── HouseOfVastrikaa.Tests           # Test project
```

**Key rules:**
- All DB access goes through stored procedures — no raw SQL anywhere
- Repositories call SPs via Dapper; services call repositories; controllers call services
- Navigation properties are removed from entities (Dapper maps flat rows)

---

## Project Structure

```
HouseOfVastrikaa.API/
├── Controllers/
│   ├── AuthController.cs          POST /api/auth/register, /login, /refresh, /admin/login
│   ├── ProductsController.cs      GET/POST/PUT/DELETE /api/products
│   ├── CategoriesController.cs    GET/POST/PUT/DELETE /api/categories
│   ├── CartController.cs          GET/POST/PUT/DELETE /api/cart
│   ├── WishlistController.cs      GET/POST/DELETE /api/wishlist
│   ├── OrdersController.cs        GET/POST/PUT /api/orders
│   ├── PaymentController.cs       POST /api/payment/create-order, /verify
│   ├── ShippingController.cs      GET/POST /api/shipping
│   ├── AddressController.cs       GET/POST/PUT/DELETE /api/addresses
│   └── AdminController.cs         GET /api/admin/dashboard, /customers
├── Middleware/
│   ├── ExceptionMiddleware.cs     Global exception → HTTP response mapping
│   └── RequestLoggingMiddleware.cs  Log method, path, status, elapsed ms
├── Extensions/
│   ├── ServiceExtensions.cs       DI registrations, JWT, CORS
│   └── SwaggerExtensions.cs       Swagger with JWT support
└── Program.cs

HouseOfVastrikaa.Application/
├── DTOs/                          Auth, Cart, Order, Payment, Product DTOs
├── Interfaces/                    IAuthService, ICartService, IOrderService, etc.
└── Services/
    ├── AuthService.cs             Register, Login, AdminLogin, RefreshToken
    ├── ProductService.cs          CRUD + image management
    ├── CartService.cs             Get, Add, Update, Remove, Clear
    ├── WishlistService.cs         Add, Remove, Get, Check
    ├── OrderService.cs            Place, Cancel, Get, UpdateStatus
    ├── PaymentService.cs          Razorpay order creation + HMAC verification
    └── ShippingService.cs         Serviceability check, create shipment, track

HouseOfVastrikaa.Infrastructure/
├── Data/
│   └── DbConnectionFactory.cs     IDbConnectionFactory → SqlConnection
├── Repositories/
│   ├── UserRepository.cs          sp_Users_*
│   ├── ProductRepository.cs       sp_Products_*, sp_ProductImages_*
│   ├── OrderRepository.cs         sp_Orders_*
│   ├── CartRepository.cs          sp_Carts_*, sp_CartItems_*
│   ├── WishlistRepository.cs      sp_Wishlists_*
│   └── AddressRepository.cs       sp_Addresses_*
└── ExternalServices/
    ├── RazorpayService.cs         Razorpay SDK wrapper
    └── ShiprocketService.cs       Shiprocket REST client (token auth)

HouseOfVastrikaa.Domain/
├── Entities/                      User, Product, ProductImage, Category,
│                                  Order, OrderItem, Cart, CartItem,
│                                  Wishlist, Address
└── Enums/                         UserRole, OrderStatus, PaymentMethod, PaymentStatus
```

---

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Register new customer |
| POST | `/login` | Public | Customer login → JWT |
| POST | `/admin/login` | Public | Admin login → JWT |
| POST | `/refresh` | Public | Refresh JWT token |

### Products — `/api/products`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List with filters (category, price, color, fabric, sortBy) |
| GET | `/{id}` | Public | Get product with images |
| GET | `/search?q=` | Public | Full-text search |
| POST | `/` | Admin | Create product |
| PUT | `/{id}` | Admin | Update product |
| DELETE | `/{id}` | Admin | Deactivate product |
| POST | `/{id}/images` | Admin | Add image |
| DELETE | `/{id}/images/{imageId}` | Admin | Remove image |

### Categories — `/api/categories`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List categories |
| POST | `/` | Admin | Create category |
| PUT | `/{id}` | Admin | Update category |
| DELETE | `/{id}` | Admin | Delete category |

### Cart — `/api/cart`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Customer | Get cart with items |
| POST | `/items` | Customer | Add item to cart |
| PUT | `/items/{id}` | Customer | Update item quantity |
| DELETE | `/items/{id}` | Customer | Remove item |
| DELETE | `/` | Customer | Clear cart |

### Wishlist — `/api/wishlist`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Customer | Get wishlist |
| POST | `/items` | Customer | Add product |
| DELETE | `/items/{productId}` | Customer | Remove product |
| GET | `/check/{productId}` | Customer | Check if wishlisted |

### Orders — `/api/orders`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Customer | My orders |
| GET | `/{id}` | Customer | Order detail |
| POST | `/` | Customer | Place order (from cart) |
| PUT | `/{id}/cancel` | Customer | Cancel order |
| GET | `/admin` | Admin | All orders (paginated) |
| PUT | `/admin/{id}/status` | Admin | Update order status |

### Payment — `/api/payment`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create-order` | Customer | Create Razorpay order |
| POST | `/verify` | Customer | Verify payment signature (HMAC-SHA256) |

### Shipping — `/api/shipping`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/serviceability?pincode=` | Public | Check pin serviceability |
| POST | `/create-shipment` | Admin | Create Shiprocket shipment |
| GET | `/track/{awbCode}` | Any | Track shipment |

### Addresses — `/api/addresses`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Customer | My addresses |
| POST | `/` | Customer | Add address |
| PUT | `/{id}` | Customer | Update address |
| DELETE | `/{id}` | Customer | Delete address |

### Admin — `/api/admin`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard/stats` | Admin | Revenue + monthly stats |
| GET | `/customers` | Admin | All customers (paginated) |
| GET | `/customers/{id}` | Admin | Customer detail |

---

## Configuration

Update `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=KARUNA\\SQLEXPRESS;Database=HouseOfVastrikaaDb;Trusted_Connection=True;TrustServerCertificate=True;"
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

---

## Running the API

```bash
# Restore packages
dotnet restore

# Build
dotnet build

# Run (HTTP only, port 5095)
dotnet run --project HouseOfVastrikaa.API
```

Swagger UI opens at: [http://localhost:5095/swagger](http://localhost:5095/swagger)

---

## Database

- SQL Server instance: `KARUNA\SQLEXPRESS`
- Database: `HouseOfVastrikaaDb`
- **All queries use stored procedures** — no raw SQL or LINQ in codebase
- Output parameters use `DynamicParameters` with `ParameterDirection.Output`
- Multi-result queries use `conn.QueryMultipleAsync`

### Stored Procedures

| Group | Procedures |
|---|---|
| Users | sp_Users_Create, sp_Users_GetByEmail, sp_Users_GetById, sp_Users_GetAll |
| Products | sp_Products_GetAll, sp_Products_GetById, sp_Products_Create, sp_Products_Update, sp_Products_Deactivate, sp_Products_Search |
| ProductImages | sp_ProductImages_Add, sp_ProductImages_Delete |
| Categories | sp_Categories_GetAll, sp_Categories_Create, sp_Categories_Update, sp_Categories_Delete |
| Orders | sp_Orders_GetByUser, sp_Orders_GetById, sp_Orders_Place, sp_Orders_Cancel, sp_Orders_GetAll, sp_Orders_UpdateStatus |
| Cart | sp_Carts_GetOrCreate, sp_Carts_GetWithItems, sp_Carts_Clear |
| CartItems | sp_CartItems_AddOrUpdate, sp_CartItems_UpdateQuantity, sp_CartItems_Remove, sp_CartItems_GetCount |
| Wishlist | sp_Wishlists_Add, sp_Wishlists_Remove, sp_Wishlists_GetByUser, sp_Wishlists_Check |
| Addresses | sp_Addresses_Create, sp_Addresses_GetByUser, sp_Addresses_GetById, sp_Addresses_Update, sp_Addresses_Delete |
| Admin | sp_Dashboard_GetStats |

---

## Payment Flow (Razorpay)

1. Customer places order → `POST /api/orders` → order created with status `Pending`
2. Frontend calls `POST /api/payment/create-order` → Razorpay order created, returns `razorpay_order_id` + `key_id`
3. Customer completes payment in Razorpay checkout
4. Frontend calls `POST /api/payment/verify` with `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`
5. Backend verifies HMAC-SHA256 signature → order status updated to `Confirmed` + `Paid`

---

## Error Handling & Logging

**Global middleware** (`ExceptionMiddleware`) maps exceptions to HTTP responses:

| Exception | HTTP Status |
|---|---|
| `KeyNotFoundException` | 404 Not Found |
| `UnauthorizedAccessException` | 401 Unauthorized |
| `InvalidOperationException` | 400 Bad Request |
| `Exception` (any other) | 500 Internal Server Error |

**Serilog** is configured in `Program.cs` and used throughout all services and controllers via `ILogger<T>`:
- `LogInformation` — key operations (login, order placed, shipment created, etc.)
- `LogWarning` — non-error anomalies (payment signature mismatch)
- `LogError(ex, ...)` — all caught exceptions with full stack trace

**Request logging** (`RequestLoggingMiddleware`) logs every HTTP request: method, path, status code, elapsed milliseconds.

---

## Security

- Passwords hashed with `IPasswordHasher<User>` (ASP.NET Core Identity)
- JWT tokens signed with HMAC-SHA256, validated on every request
- Role-based authorization: `Customer` and `Admin` roles
- Payment signatures verified server-side with HMAC-SHA256 (Razorpay standard)
- CORS restricted to configured `AllowedOrigins`
