-- ============================================================
--  COUPONS & OFFERS MIGRATION
--  Run this in SSMS against HouseOfVastrikaaDb
-- ============================================================

-- ---- Table ------------------------------------------------
CREATE TABLE dbo.Coupons (
    Id              INT             PRIMARY KEY IDENTITY,
    Code            NVARCHAR(50)    NULL,           -- NULL = auto-apply festival offer
    Description     NVARCHAR(200)   NOT NULL DEFAULT '',
    DiscountType    NVARCHAR(20)    NOT NULL,        -- 'Percentage' | 'Fixed'
    DiscountValue   DECIMAL(10,2)   NOT NULL,        -- e.g. 20 for 20% or 200 for ₹200
    MinCartAmount   DECIMAL(10,2)   NULL,            -- minimum cart value required
    MaxDiscount     DECIMAL(10,2)   NULL,            -- cap for percentage discounts
    StartDate       DATETIME2       NULL,
    EndDate         DATETIME2       NULL,
    IsActive        BIT             NOT NULL DEFAULT 1,
    UsageLimit      INT             NULL,            -- NULL = unlimited
    UsedCount       INT             NOT NULL DEFAULT 0,
    FestivalName    NVARCHAR(100)   NULL,            -- e.g. 'Diwali', 'Navratri'
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT UQ_Coupons_Code UNIQUE (Code),
    CONSTRAINT CHK_Coupons_DiscountType CHECK (DiscountType IN ('Percentage', 'Fixed')),
    CONSTRAINT CHK_Coupons_DiscountValue CHECK (DiscountValue > 0)
);
GO

CREATE INDEX IX_Coupons_Code     ON dbo.Coupons(Code)     WHERE Code IS NOT NULL;
CREATE INDEX IX_Coupons_IsActive ON dbo.Coupons(IsActive);
GO

-- ---- Seed: festival offers --------------------------------
INSERT INTO dbo.Coupons (Code, Description, DiscountType, DiscountValue, MinCartAmount, MaxDiscount, StartDate, EndDate, FestivalName)
VALUES
  ('DIWALI20',   'Diwali Special — 20% off',             'Percentage', 20,  999,  2000, '2025-10-15', '2025-11-05', 'Diwali'),
  ('NAVRATRI15', 'Navratri Celebration — 15% off',       'Percentage', 15,  799,  1500, '2025-10-02', '2025-10-12', 'Navratri'),
  ('WELCOME200', 'Welcome Offer — ₹200 off on ₹1499+',   'Fixed',      200, 1499,  NULL, NULL,         NULL,         NULL),
  ('FLAT500',    'Flat ₹500 off on orders above ₹2999',  'Fixed',      500, 2999,  NULL, NULL,         NULL,         NULL);
GO

-- ---- sp_Coupons_GetAll (admin) ----------------------------
CREATE OR ALTER PROCEDURE dbo.sp_Coupons_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Code, Description, DiscountType, DiscountValue,
           MinCartAmount, MaxDiscount, StartDate, EndDate,
           IsActive, UsageLimit, UsedCount, FestivalName, CreatedAt
    FROM dbo.Coupons
    ORDER BY CreatedAt DESC;
END;
GO

-- ---- sp_Coupons_GetActive (auto-apply festival offers) ----
CREATE OR ALTER PROCEDURE dbo.sp_Coupons_GetActive
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Code, Description, DiscountType, DiscountValue,
           MinCartAmount, MaxDiscount, StartDate, EndDate,
           IsActive, UsageLimit, UsedCount, FestivalName, CreatedAt
    FROM dbo.Coupons
    WHERE IsActive = 1
      AND Code IS NULL
      AND (StartDate IS NULL OR StartDate <= GETUTCDATE())
      AND (EndDate   IS NULL OR EndDate   >= GETUTCDATE())
      AND (UsageLimit IS NULL OR UsedCount < UsageLimit);
END;
GO

-- ---- sp_Coupons_GetByCode ---------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_Coupons_GetByCode
    @Code NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, Code, Description, DiscountType, DiscountValue,
           MinCartAmount, MaxDiscount, StartDate, EndDate,
           IsActive, UsageLimit, UsedCount, FestivalName, CreatedAt
    FROM dbo.Coupons
    WHERE Code = @Code;
END;
GO

-- ---- sp_Coupons_Create ------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_Coupons_Create
    @Code           NVARCHAR(50),
    @Description    NVARCHAR(200),
    @DiscountType   NVARCHAR(20),
    @DiscountValue  DECIMAL(10,2),
    @MinCartAmount  DECIMAL(10,2),
    @MaxDiscount    DECIMAL(10,2),
    @StartDate      DATETIME2,
    @EndDate        DATETIME2,
    @UsageLimit     INT,
    @FestivalName   NVARCHAR(100),
    @NewCouponId    INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Coupons
        (Code, Description, DiscountType, DiscountValue, MinCartAmount, MaxDiscount,
         StartDate, EndDate, UsageLimit, FestivalName)
    VALUES
        (NULLIF(@Code,''), @Description, @DiscountType, @DiscountValue, @MinCartAmount,
         @MaxDiscount, @StartDate, @EndDate, @UsageLimit, NULLIF(@FestivalName,''));

    SET @NewCouponId = SCOPE_IDENTITY();
END;
GO

-- ---- sp_Coupons_Update ------------------------------------
CREATE OR ALTER PROCEDURE dbo.sp_Coupons_Update
    @Id             INT,
    @Code           NVARCHAR(50),
    @Description    NVARCHAR(200),
    @DiscountType   NVARCHAR(20),
    @DiscountValue  DECIMAL(10,2),
    @MinCartAmount  DECIMAL(10,2),
    @MaxDiscount    DECIMAL(10,2),
    @StartDate      DATETIME2,
    @EndDate        DATETIME2,
    @UsageLimit     INT,
    @FestivalName   NVARCHAR(100),
    @IsActive       BIT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Coupons
    SET Code          = NULLIF(@Code,''),
        Description   = @Description,
        DiscountType  = @DiscountType,
        DiscountValue = @DiscountValue,
        MinCartAmount = @MinCartAmount,
        MaxDiscount   = @MaxDiscount,
        StartDate     = @StartDate,
        EndDate       = @EndDate,
        UsageLimit    = @UsageLimit,
        FestivalName  = NULLIF(@FestivalName,''),
        IsActive      = @IsActive
    WHERE Id = @Id;
END;
GO

-- ---- sp_Coupons_IncrementUsage ----------------------------
CREATE OR ALTER PROCEDURE dbo.sp_Coupons_IncrementUsage
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Coupons SET UsedCount = UsedCount + 1 WHERE Id = @Id;
END;
GO
