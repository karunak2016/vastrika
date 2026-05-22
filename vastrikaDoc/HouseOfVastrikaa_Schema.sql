-- ============================================================
--  House of Vastrikaa — SQL Server Database Schema
--  Database : HouseOfVastrikaaDb
--  Created  : 2025
-- ============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'HouseOfVastrikaaDb')
    CREATE DATABASE HouseOfVastrikaaDb;
GO

USE HouseOfVastrikaaDb;
GO

-- ============================================================
--  DROP TABLES (safe re-run — reverse FK order)
-- ============================================================
IF OBJECT_ID('dbo.Wishlists',      'U') IS NOT NULL DROP TABLE dbo.Wishlists;
IF OBJECT_ID('dbo.CartItems',      'U') IS NOT NULL DROP TABLE dbo.CartItems;
IF OBJECT_ID('dbo.Carts',          'U') IS NOT NULL DROP TABLE dbo.Carts;
IF OBJECT_ID('dbo.OrderItems',     'U') IS NOT NULL DROP TABLE dbo.OrderItems;
IF OBJECT_ID('dbo.Orders',         'U') IS NOT NULL DROP TABLE dbo.Orders;
IF OBJECT_ID('dbo.Addresses',      'U') IS NOT NULL DROP TABLE dbo.Addresses;
IF OBJECT_ID('dbo.ProductImages',  'U') IS NOT NULL DROP TABLE dbo.ProductImages;
IF OBJECT_ID('dbo.Products',       'U') IS NOT NULL DROP TABLE dbo.Products;
IF OBJECT_ID('dbo.Categories',     'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID('dbo.Users',          'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- ============================================================
--  1. USERS
-- ============================================================
CREATE TABLE dbo.Users (
    Id              INT             IDENTITY(1,1)   PRIMARY KEY,
    Name            NVARCHAR(150)   NOT NULL,
    Email           NVARCHAR(256)   NOT NULL,
    PasswordHash    NVARCHAR(512)   NOT NULL,
    Phone           NVARCHAR(15)    NULL,
    Role            NVARCHAR(20)    NOT NULL    DEFAULT 'Customer',   -- Customer | Admin
    IsActive        BIT             NOT NULL    DEFAULT 1,
    CreatedAt       DATETIME2       NOT NULL    DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2       NULL,

    CONSTRAINT UQ_Users_Email   UNIQUE (Email),
    CONSTRAINT CHK_Users_Role   CHECK  (Role IN ('Customer', 'Admin'))
);
GO

-- ============================================================
--  2. CATEGORIES
-- ============================================================
CREATE TABLE dbo.Categories (
    Id              INT             IDENTITY(1,1)   PRIMARY KEY,
    Name            NVARCHAR(100)   NOT NULL,
    Slug            NVARCHAR(100)   NOT NULL,           -- e.g. silk-sarees
    ImageUrl        NVARCHAR(500)   NULL,
    DisplayOrder    INT             NOT NULL    DEFAULT 0,
    IsActive        BIT             NOT NULL    DEFAULT 1,
    CreatedAt       DATETIME2       NOT NULL    DEFAULT SYSUTCDATETIME(),

    CONSTRAINT UQ_Categories_Slug   UNIQUE (Slug)
);
GO

-- ============================================================
--  3. PRODUCTS
-- ============================================================
CREATE TABLE dbo.Products (
    Id                  INT             IDENTITY(1,1)   PRIMARY KEY,
    Name                NVARCHAR(200)   NOT NULL,
    Description         NVARCHAR(MAX)   NULL,
    Price               DECIMAL(10,2)   NOT NULL,
    DiscountedPrice     DECIMAL(10,2)   NULL,
    StockQuantity       INT             NOT NULL    DEFAULT 0,
    Fabric              NVARCHAR(100)   NULL,           -- Silk, Cotton, Georgette ...
    Color               NVARCHAR(100)   NULL,
    HasBlousePiece      BIT             NOT NULL    DEFAULT 0,
    CareInstructions    NVARCHAR(500)   NULL,
    DeliveryDays        INT             NOT NULL    DEFAULT 7,
    CategoryId          INT             NOT NULL,
    IsActive            BIT             NOT NULL    DEFAULT 1,
    CreatedAt           DATETIME2       NOT NULL    DEFAULT SYSUTCDATETIME(),
    UpdatedAt           DATETIME2       NULL,

    CONSTRAINT FK_Products_Category
        FOREIGN KEY (CategoryId) REFERENCES dbo.Categories(Id),
    CONSTRAINT CHK_Products_Price
        CHECK (Price >= 0),
    CONSTRAINT CHK_Products_Stock
        CHECK (StockQuantity >= 0)
);
GO

-- ============================================================
--  4. PRODUCT IMAGES
-- ============================================================
CREATE TABLE dbo.ProductImages (
    Id              INT             IDENTITY(1,1)   PRIMARY KEY,
    ProductId       INT             NOT NULL,
    ImageUrl        NVARCHAR(500)   NOT NULL,
    IsDefault       BIT             NOT NULL    DEFAULT 0,   -- Cover / thumbnail
    DisplayOrder    INT             NOT NULL    DEFAULT 0,
    CreatedAt       DATETIME2       NOT NULL    DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_ProductImages_Product
        FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id) ON DELETE CASCADE
);
GO

-- ============================================================
--  5. ADDRESSES
-- ============================================================
CREATE TABLE dbo.Addresses (
    Id              INT             IDENTITY(1,1)   PRIMARY KEY,
    UserId          INT             NOT NULL,
    FullName        NVARCHAR(150)   NOT NULL,
    Phone           NVARCHAR(15)    NOT NULL,
    Line1           NVARCHAR(250)   NOT NULL,
    Line2           NVARCHAR(250)   NULL,
    City            NVARCHAR(100)   NOT NULL,
    State           NVARCHAR(100)   NOT NULL,
    Pincode         NVARCHAR(10)    NOT NULL,
    IsDefault       BIT             NOT NULL    DEFAULT 0,
    CreatedAt       DATETIME2       NOT NULL    DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Addresses_User
        FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE
);
GO

-- ============================================================
--  6. ORDERS
-- ============================================================
CREATE TABLE dbo.Orders (
    Id                  INT             IDENTITY(1,1)   PRIMARY KEY,
    UserId              INT             NOT NULL,
    AddressId           INT             NOT NULL,

    -- Amounts
    TotalAmount         DECIMAL(10,2)   NOT NULL,           -- Before discount
    DiscountAmount      DECIMAL(10,2)   NOT NULL    DEFAULT 0,
    FinalAmount         DECIMAL(10,2)   NOT NULL,           -- Amount charged

    -- Payment
    PaymentMethod       NVARCHAR(20)    NOT NULL    DEFAULT 'COD',
    PaymentStatus       NVARCHAR(20)    NOT NULL    DEFAULT 'Pending',
    RazorpayOrderId     NVARCHAR(100)   NULL,
    RazorpayPaymentId   NVARCHAR(100)   NULL,
    RazorpaySignature   NVARCHAR(256)   NULL,

    -- Fulfillment
    OrderStatus         NVARCHAR(20)    NOT NULL    DEFAULT 'Pending',
    ShiprocketOrderId   NVARCHAR(100)   NULL,
    AWBCode             NVARCHAR(100)   NULL,               -- Courier tracking code

    Notes               NVARCHAR(500)   NULL,
    CancelledAt         DATETIME2       NULL,
    CancelReason        NVARCHAR(300)   NULL,
    CreatedAt           DATETIME2       NOT NULL    DEFAULT SYSUTCDATETIME(),
    UpdatedAt           DATETIME2       NULL,

    CONSTRAINT FK_Orders_User
        FOREIGN KEY (UserId)    REFERENCES dbo.Users(Id),
    CONSTRAINT FK_Orders_Address
        FOREIGN KEY (AddressId) REFERENCES dbo.Addresses(Id),
    CONSTRAINT CHK_Orders_PaymentMethod
        CHECK (PaymentMethod    IN ('COD','UPI','Card','NetBanking','Wallet')),
    CONSTRAINT CHK_Orders_PaymentStatus
        CHECK (PaymentStatus    IN ('Pending','Paid','Failed','Refunded')),
    CONSTRAINT CHK_Orders_OrderStatus
        CHECK (OrderStatus      IN ('Pending','Paid','Processing','Shipped','Delivered','Cancelled'))
);
GO

-- ============================================================
--  7. ORDER ITEMS
-- ============================================================
CREATE TABLE dbo.OrderItems (
    Id              INT             IDENTITY(1,1)   PRIMARY KEY,
    OrderId         INT             NOT NULL,
    ProductId       INT             NOT NULL,
    ProductName     NVARCHAR(200)   NOT NULL,       -- Snapshot at time of purchase
    ProductImage    NVARCHAR(500)   NULL,            -- Snapshot
    UnitPrice       DECIMAL(10,2)   NOT NULL,
    Quantity        INT             NOT NULL,
    Subtotal        AS (UnitPrice * Quantity) PERSISTED,

    CONSTRAINT FK_OrderItems_Order
        FOREIGN KEY (OrderId)   REFERENCES dbo.Orders(Id)   ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Product
        FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id),
    CONSTRAINT CHK_OrderItems_Qty
        CHECK (Quantity > 0)
);
GO

-- ============================================================
--  8. CARTS
-- ============================================================
CREATE TABLE dbo.Carts (
    Id          INT         IDENTITY(1,1)   PRIMARY KEY,
    UserId      INT         NOT NULL,
    CreatedAt   DATETIME2   NOT NULL    DEFAULT SYSUTCDATETIME(),
    UpdatedAt   DATETIME2   NULL,

    CONSTRAINT FK_Carts_User
        FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_Carts_User
        UNIQUE (UserId)         -- One active cart per customer
);
GO

-- ============================================================
--  9. CART ITEMS
-- ============================================================
CREATE TABLE dbo.CartItems (
    Id          INT         IDENTITY(1,1)   PRIMARY KEY,
    CartId      INT         NOT NULL,
    ProductId   INT         NOT NULL,
    Quantity    INT         NOT NULL    DEFAULT 1,
    AddedAt     DATETIME2   NOT NULL    DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_CartItems_Cart
        FOREIGN KEY (CartId)    REFERENCES dbo.Carts(Id)    ON DELETE CASCADE,
    CONSTRAINT FK_CartItems_Product
        FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id),
    CONSTRAINT UQ_CartItems_CartProduct
        UNIQUE (CartId, ProductId),     -- No duplicate product in same cart
    CONSTRAINT CHK_CartItems_Qty
        CHECK (Quantity > 0)
);
GO

-- ============================================================
--  10. WISHLISTS
-- ============================================================
CREATE TABLE dbo.Wishlists (
    Id          INT         IDENTITY(1,1)   PRIMARY KEY,
    UserId      INT         NOT NULL,
    ProductId   INT         NOT NULL,
    AddedAt     DATETIME2   NOT NULL    DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Wishlists_User
        FOREIGN KEY (UserId)    REFERENCES dbo.Users(Id)    ON DELETE CASCADE,
    CONSTRAINT FK_Wishlists_Product
        FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id),
    CONSTRAINT UQ_Wishlists_UserProduct
        UNIQUE (UserId, ProductId)
);
GO

-- ============================================================
--  INDEXES
-- ============================================================

-- Products
CREATE INDEX IX_Products_CategoryId     ON dbo.Products(CategoryId);
CREATE INDEX IX_Products_IsActive       ON dbo.Products(IsActive);
CREATE INDEX IX_Products_Price          ON dbo.Products(Price);
CREATE INDEX IX_Products_Fabric         ON dbo.Products(Fabric);
CREATE INDEX IX_Products_Color          ON dbo.Products(Color);

-- Product Images
CREATE INDEX IX_ProductImages_ProductId ON dbo.ProductImages(ProductId);

-- Addresses
CREATE INDEX IX_Addresses_UserId        ON dbo.Addresses(UserId);

-- Orders
CREATE INDEX IX_Orders_UserId           ON dbo.Orders(UserId);
CREATE INDEX IX_Orders_OrderStatus      ON dbo.Orders(OrderStatus);
CREATE INDEX IX_Orders_PaymentStatus    ON dbo.Orders(PaymentStatus);
CREATE INDEX IX_Orders_CreatedAt        ON dbo.Orders(CreatedAt DESC);
CREATE INDEX IX_Orders_RazorpayOrderId  ON dbo.Orders(RazorpayOrderId)
    WHERE RazorpayOrderId IS NOT NULL;

-- Order Items
CREATE INDEX IX_OrderItems_OrderId      ON dbo.OrderItems(OrderId);
CREATE INDEX IX_OrderItems_ProductId    ON dbo.OrderItems(ProductId);

-- Cart Items
CREATE INDEX IX_CartItems_CartId        ON dbo.CartItems(CartId);

-- Wishlists
CREATE INDEX IX_Wishlists_UserId        ON dbo.Wishlists(UserId);
GO

-- ============================================================
--  VIEWS
-- ============================================================

-- Active products with category + default image
CREATE OR ALTER VIEW dbo.vw_ActiveProducts AS
SELECT
    p.Id,
    p.Name,
    p.Price,
    p.DiscountedPrice,
    CASE
        WHEN p.DiscountedPrice IS NOT NULL AND p.DiscountedPrice < p.Price
        THEN CAST(ROUND((p.Price - p.DiscountedPrice) / p.Price * 100, 0) AS INT)
        ELSE 0
    END                             AS DiscountPercent,
    p.StockQuantity,
    p.Fabric,
    p.Color,
    p.HasBlousePiece,
    p.DeliveryDays,
    p.CategoryId,
    c.Name                          AS CategoryName,
    c.Slug                          AS CategorySlug,
    pi_def.ImageUrl                 AS DefaultImage,
    p.CreatedAt
FROM       dbo.Products      p
INNER JOIN dbo.Categories    c      ON c.Id = p.CategoryId AND c.IsActive = 1
LEFT  JOIN dbo.ProductImages pi_def ON pi_def.ProductId = p.Id
                                    AND pi_def.IsDefault  = 1
WHERE p.IsActive = 1;
GO

-- Order summary with customer + delivery address
CREATE OR ALTER VIEW dbo.vw_OrderSummary AS
SELECT
    o.Id                AS OrderId,
    o.CreatedAt,
    o.FinalAmount,
    o.PaymentMethod,
    o.PaymentStatus,
    o.OrderStatus,
    o.AWBCode,
    u.Id                AS CustomerId,
    u.Name              AS CustomerName,
    u.Email             AS CustomerEmail,
    u.Phone             AS CustomerPhone,
    a.Line1             AS AddressLine1,
    a.City,
    a.State,
    a.Pincode,
    (SELECT COUNT(*)
     FROM dbo.OrderItems oi
     WHERE oi.OrderId = o.Id)       AS ItemCount
FROM       dbo.Orders    o
INNER JOIN dbo.Users     u  ON u.Id = o.UserId
INNER JOIN dbo.Addresses a  ON a.Id = o.AddressId;
GO

-- ============================================================
--  STORED PROCEDURES
-- ============================================================

-- ---- sp_GetProducts ----------------------------------------
--  Paginated product listing with optional filters & sort
-- -----------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_GetProducts
    @CategoryId     INT             = NULL,
    @MinPrice       DECIMAL(10,2)   = NULL,
    @MaxPrice       DECIMAL(10,2)   = NULL,
    @Color          NVARCHAR(100)   = NULL,
    @Fabric         NVARCHAR(100)   = NULL,
    @SearchTerm     NVARCHAR(200)   = NULL,
    @SortBy         NVARCHAR(30)    = 'newest',  -- newest|price_asc|price_desc
    @Page           INT             = 1,
    @PageSize       INT             = 12,
    @TotalCount     INT             OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@Page - 1) * @PageSize;

    SELECT @TotalCount = COUNT(*)
    FROM dbo.vw_ActiveProducts
    WHERE (@CategoryId  IS NULL OR CategoryId  = @CategoryId)
      AND (@MinPrice    IS NULL OR Price        >= @MinPrice)
      AND (@MaxPrice    IS NULL OR Price        <= @MaxPrice)
      AND (@Color       IS NULL OR Color        LIKE '%' + @Color   + '%')
      AND (@Fabric      IS NULL OR Fabric       LIKE '%' + @Fabric  + '%')
      AND (@SearchTerm  IS NULL OR Name         LIKE '%' + @SearchTerm + '%');

    SELECT *
    FROM dbo.vw_ActiveProducts
    WHERE (@CategoryId  IS NULL OR CategoryId  = @CategoryId)
      AND (@MinPrice    IS NULL OR Price        >= @MinPrice)
      AND (@MaxPrice    IS NULL OR Price        <= @MaxPrice)
      AND (@Color       IS NULL OR Color        LIKE '%' + @Color   + '%')
      AND (@Fabric      IS NULL OR Fabric       LIKE '%' + @Fabric  + '%')
      AND (@SearchTerm  IS NULL OR Name         LIKE '%' + @SearchTerm + '%')
    ORDER BY
        CASE WHEN @SortBy = 'price_asc'  THEN COALESCE(DiscountedPrice, Price) END ASC,
        CASE WHEN @SortBy = 'price_desc' THEN COALESCE(DiscountedPrice, Price) END DESC,
        CASE WHEN @SortBy = 'newest'     THEN CreatedAt END DESC,
        CreatedAt DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END;
GO

-- ---- sp_PlaceOrder -----------------------------------------
--  Creates order + items, decrements stock, clears cart
--  Uses a JSON parameter for order items
-- -----------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_PlaceOrder
    @UserId         INT,
    @AddressId      INT,
    @PaymentMethod  NVARCHAR(20),
    @TotalAmount    DECIMAL(10,2),
    @DiscountAmount DECIMAL(10,2),
    @FinalAmount    DECIMAL(10,2),
    @ItemsJson      NVARCHAR(MAX),
    -- Example:
    -- [
    --   {"ProductId":1,"ProductName":"Kanjivaram Silk","ProductImage":"https://...","UnitPrice":10999.00,"Quantity":1},
    --   {"ProductId":3,"ProductName":"Banarasi Bridal","ProductImage":"https://...","UnitPrice":19500.00,"Quantity":1}
    -- ]
    @NewOrderId     INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY

        INSERT INTO dbo.Orders
            (UserId, AddressId, TotalAmount, DiscountAmount, FinalAmount, PaymentMethod)
        VALUES
            (@UserId, @AddressId, @TotalAmount, @DiscountAmount, @FinalAmount, @PaymentMethod);

        SET @NewOrderId = SCOPE_IDENTITY();

        -- Insert order items from JSON array
        INSERT INTO dbo.OrderItems
            (OrderId, ProductId, ProductName, ProductImage, UnitPrice, Quantity)
        SELECT
            @NewOrderId,
            j.ProductId,
            j.ProductName,
            j.ProductImage,
            j.UnitPrice,
            j.Quantity
        FROM OPENJSON(@ItemsJson) WITH (
            ProductId       INT             '$.ProductId',
            ProductName     NVARCHAR(200)   '$.ProductName',
            ProductImage    NVARCHAR(500)   '$.ProductImage',
            UnitPrice       DECIMAL(10,2)   '$.UnitPrice',
            Quantity        INT             '$.Quantity'
        ) AS j;

        -- Decrement product stock
        UPDATE p
        SET
            p.StockQuantity = p.StockQuantity - j.Quantity,
            p.UpdatedAt     = SYSUTCDATETIME()
        FROM dbo.Products p
        INNER JOIN OPENJSON(@ItemsJson) WITH (
            ProductId   INT '$.ProductId',
            Quantity    INT '$.Quantity'
        ) AS j ON j.ProductId = p.Id;

        -- Clear the customer's cart after successful order
        DELETE ci
        FROM dbo.CartItems ci
        INNER JOIN dbo.Carts c ON c.Id = ci.CartId
        WHERE c.UserId = @UserId;

        COMMIT TRANSACTION;

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- ---- sp_UpdateOrderStatus ----------------------------------
--  Admin updates order status + optional shipping fields
-- -----------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_UpdateOrderStatus
    @OrderId            INT,
    @OrderStatus        NVARCHAR(20),
    @PaymentStatus      NVARCHAR(20)    = NULL,
    @ShiprocketOrderId  NVARCHAR(100)   = NULL,
    @AWBCode            NVARCHAR(100)   = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Orders
    SET
        OrderStatus         = @OrderStatus,
        PaymentStatus       = ISNULL(@PaymentStatus,      PaymentStatus),
        ShiprocketOrderId   = ISNULL(@ShiprocketOrderId,  ShiprocketOrderId),
        AWBCode             = ISNULL(@AWBCode,             AWBCode),
        CancelledAt         = CASE WHEN @OrderStatus = 'Cancelled'
                                   THEN SYSUTCDATETIME() ELSE CancelledAt END,
        UpdatedAt           = SYSUTCDATETIME()
    WHERE Id = @OrderId;
END;
GO

-- ---- sp_VerifyAndCompletePayment ---------------------------
--  Called after Razorpay signature is verified in the API
-- -----------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_VerifyAndCompletePayment
    @OrderId            INT,
    @RazorpayOrderId    NVARCHAR(100),
    @RazorpayPaymentId  NVARCHAR(100),
    @RazorpaySignature  NVARCHAR(256)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Orders
    SET
        RazorpayOrderId   = @RazorpayOrderId,
        RazorpayPaymentId = @RazorpayPaymentId,
        RazorpaySignature = @RazorpaySignature,
        PaymentStatus     = 'Paid',
        OrderStatus       = 'Paid',
        UpdatedAt         = SYSUTCDATETIME()
    WHERE Id = @OrderId;
END;
GO

-- ---- sp_GetDashboardStats ----------------------------------
--  Admin panel dashboard — summary cards + monthly revenue
-- -----------------------------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_GetDashboardStats
AS
BEGIN
    SET NOCOUNT ON;

    -- Summary cards
    SELECT
        (SELECT COUNT(*)
         FROM dbo.Orders
         WHERE PaymentStatus = 'Paid')                              AS TotalOrders,

        (SELECT ISNULL(SUM(FinalAmount), 0)
         FROM dbo.Orders
         WHERE PaymentStatus = 'Paid')                              AS TotalRevenue,

        (SELECT COUNT(*)
         FROM dbo.Orders
         WHERE CAST(CreatedAt AS DATE) = CAST(SYSUTCDATETIME() AS DATE))
                                                                    AS OrdersToday,

        (SELECT ISNULL(SUM(FinalAmount), 0)
         FROM dbo.Orders
         WHERE PaymentStatus = 'Paid'
           AND CAST(CreatedAt AS DATE) = CAST(SYSUTCDATETIME() AS DATE))
                                                                    AS RevenueToday,

        (SELECT COUNT(*)
         FROM dbo.Products
         WHERE IsActive = 1)                                        AS TotalProducts,

        (SELECT COUNT(*)
         FROM dbo.Products
         WHERE IsActive = 1 AND StockQuantity <= 5)                 AS LowStockProducts,

        (SELECT COUNT(*)
         FROM dbo.Users
         WHERE Role = 'Customer')                                   AS TotalCustomers;

    -- Monthly revenue — last 6 months
    SELECT
        FORMAT(CreatedAt, 'yyyy-MM')    AS Month,
        SUM(FinalAmount)                AS Revenue,
        COUNT(*)                        AS OrderCount
    FROM dbo.Orders
    WHERE PaymentStatus = 'Paid'
      AND CreatedAt >= DATEADD(MONTH, -6, SYSUTCDATETIME())
    GROUP BY FORMAT(CreatedAt, 'yyyy-MM')
    ORDER BY Month ASC;
END;
GO

-- ============================================================
--  SEED DATA
-- ============================================================

-- Categories
INSERT INTO dbo.Categories (Name, Slug, DisplayOrder) VALUES
    ('Silk Sarees',     'silk-sarees',     1),
    ('Cotton Sarees',   'cotton-sarees',   2),
    ('Wedding Sarees',  'wedding-sarees',  3),
    ('Party Wear',      'party-wear',      4),
    ('Handloom Sarees', 'handloom-sarees', 5);
GO

-- Admin user  (replace PasswordHash with a real bcrypt hash before going live)
INSERT INTO dbo.Users (Name, Email, PasswordHash, Phone, Role)
VALUES (
    'Admin',
    'admin@houseofvastrikaa.com',
    '$2a$11$REPLACE_WITH_BCRYPT_HASH_OF_YOUR_PASSWORD',
    '9000000000',
    'Admin'
);
GO

-- Sample Products
INSERT INTO dbo.Products
    (Name, Description, Price, DiscountedPrice, StockQuantity,
     Fabric, Color, HasBlousePiece, CareInstructions, DeliveryDays, CategoryId)
VALUES
    ('Kanjivaram Silk Saree',
     'Pure Kanjivaram silk with zari border. Perfect for weddings and festivals.',
     12500.00, 10999.00, 20,
     'Silk', 'Red', 1, 'Dry clean only. Store in muslin cloth.', 5, 1),

    ('Handloom Cotton Saree',
     'Soft handwoven cotton saree ideal for daily wear. Lightweight and breathable.',
     1800.00, 1599.00, 50,
     'Cotton', 'Blue', 1, 'Hand wash in cold water. Do not bleach.', 4, 2),

    ('Banarasi Bridal Saree',
     'Heavy Banarasi silk with intricate gold zari weave. Perfect bridal choice.',
     22000.00, 19500.00, 10,
     'Silk', 'Maroon', 1, 'Dry clean only.', 6, 3),

    ('Georgette Party Wear Saree',
     'Embroidered georgette saree with sequin work. Great for parties and events.',
     4500.00, 3999.00, 35,
     'Georgette', 'Navy Blue', 1, 'Dry clean recommended.', 4, 4),

    ('Pochampally Ikat Saree',
     'Authentic Pochampally ikat weave with traditional geometric patterns.',
     3200.00, 2799.00, 25,
     'Cotton', 'Green', 0, 'Hand wash separately. Do not tumble dry.', 5, 5);
GO

-- ============================================================
--  VERIFY SETUP
-- ============================================================
SELECT 'Users'          AS [Table], COUNT(*) AS [Rows] FROM dbo.Users       UNION ALL
SELECT 'Categories',                COUNT(*)             FROM dbo.Categories  UNION ALL
SELECT 'Products',                  COUNT(*)             FROM dbo.Products    UNION ALL
SELECT 'ProductImages',             COUNT(*)             FROM dbo.ProductImages UNION ALL
SELECT 'Addresses',                 COUNT(*)             FROM dbo.Addresses   UNION ALL
SELECT 'Orders',                    COUNT(*)             FROM dbo.Orders      UNION ALL
SELECT 'OrderItems',                COUNT(*)             FROM dbo.OrderItems  UNION ALL
SELECT 'Carts',                     COUNT(*)             FROM dbo.Carts       UNION ALL
SELECT 'CartItems',                 COUNT(*)             FROM dbo.CartItems   UNION ALL
SELECT 'Wishlists',                 COUNT(*)             FROM dbo.Wishlists;
GO

PRINT '=================================================';
PRINT ' HouseOfVastrikaaDb schema created successfully!';
PRINT '=================================================';
GO
