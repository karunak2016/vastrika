using System.Text;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using HouseOfVastrikaa.Application.Interfaces;
using HouseOfVastrikaa.Application.Services;
using HouseOfVastrikaa.Domain.Entities;
using HouseOfVastrikaa.Infrastructure.Data;
using HouseOfVastrikaa.Infrastructure.ExternalServices;
using HouseOfVastrikaa.Infrastructure.Repositories;
using HouseOfVastrikaa.Infrastructure.Services;
using HouseOfVastrikaa.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace HouseOfVastrikaa.API.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration config)
    {
        var jwt = config.GetSection("JwtSettings");
        var key = Encoding.UTF8.GetBytes(jwt["SecretKey"]!);

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = jwt["Issuer"],
                    ValidateAudience = true,
                    ValidAudience = jwt["Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

        services.AddAuthorization();
        return services;
    }

    public static IServiceCollection AddCorsPolicy(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowClients", policy =>
                policy.WithOrigins(configuration.GetSection("AllowedOrigins").Get<string[]>()!)
                      .AllowAnyHeader()
                      .AllowAnyMethod());
        });
        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Infrastructure
        services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();
        services.AddSingleton<BlobStorageService>();
        services.AddScoped<IProductOptionsRepository, ProductOptionsRepository>();

        // Repositories
        services.AddScoped<UserRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ISettingsRepository, SettingsRepository>();
        services.AddScoped<ICampaignRepository, CampaignRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<ICartRepository, CartRepository>();
        services.AddScoped<IWishlistRepository, WishlistRepository>();
        services.AddScoped<AddressRepository>();

        // External services
        services.AddScoped<IRazorpayClient, RazorpayService>();
        services.AddHttpClient<IShiprocketClient, ShiprocketService>();

        // Application services
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IWishlistService, WishlistService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IShippingService, ShippingService>();
        services.AddScoped<ICouponRepository, CouponRepository>();
        services.AddScoped<ICouponService, CouponService>();

        services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
        // Switch to Msg91SmsService when SMS subscription is ready:
        // services.AddHttpClient<ISmsService, Msg91SmsService>();
        services.AddScoped<ISmsService, MockSmsService>();

        // Initialize Firebase once at startup
        InitializeFirebase(services.BuildServiceProvider().GetRequiredService<IConfiguration>());

        services.AddScoped<IAuthService>(sp =>
        {
            var config = sp.GetRequiredService<IConfiguration>();
            var hasher = sp.GetRequiredService<IPasswordHasher<User>>();
            var repo = sp.GetRequiredService<UserRepository>();
            var logger = sp.GetRequiredService<ILogger<AuthService>>();
            var sms = sp.GetRequiredService<ISmsService>();
            return new AuthService(
                config, hasher, logger, sms,
                async idToken =>
                {
                    var decoded = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
                    decoded.Claims.TryGetValue("phone_number", out var phone);
                    return phone?.ToString();
                },
                () => Task.FromResult(new List<User>()),
                repo.GetByEmailAsync,
                async u => { await repo.CreateAsync(u); });
        });

        return services;
    }

    private static void InitializeFirebase(IConfiguration config)
    {
        if (FirebaseApp.DefaultInstance != null) return;
        var projectId = config["Firebase:ProjectId"];
        if (string.IsNullOrEmpty(projectId)) return;
        FirebaseApp.Create(new AppOptions { ProjectId = projectId });
    }
}
