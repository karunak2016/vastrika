using HouseOfVastrikaa.Application.DTOs.Order;
using HouseOfVastrikaa.Application.DTOs.Product;
using HouseOfVastrikaa.Application.Interfaces;
using HouseOfVastrikaa.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace HouseOfVastrikaa.Application.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _repo;
    private readonly ICartRepository _cartRepo;
    private readonly ICouponService _coupons;
    private readonly ILogger<OrderService> _logger;

    public OrderService(IOrderRepository repo, ICartRepository cartRepo, ICouponService coupons, ILogger<OrderService> logger)
    {
        _repo = repo;
        _cartRepo = cartRepo;
        _coupons = coupons;
        _logger = logger;
    }

    public async Task<List<OrderDto>> GetCustomerOrdersAsync(int userId)
    {
        try
        {
            _logger.LogInformation("Get orders for user {UserId}", userId);
            var (items, _) = await _repo.GetByUserAsync(userId, 1, 100);
            return items.Select(o => MapToDto(o)).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Get orders failed for user {UserId}", userId);
            throw;
        }
    }

    public async Task<OrderDto?> GetByIdAsync(int orderId, int userId)
    {
        try
        {
            _logger.LogInformation("Get order {OrderId} for user {UserId}", orderId, userId);
            var (header, items) = await _repo.GetByIdAsync(orderId);
            if (header == null || header.UserId != userId) return null;
            return MapToDto(header, items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Get order {OrderId} failed for user {UserId}", orderId, userId);
            throw;
        }
    }

    public async Task<OrderDto?> GetByIdAdminAsync(int orderId)
    {
        try
        {
            _logger.LogInformation("Admin get order {OrderId}", orderId);
            var (header, items) = await _repo.GetByIdAsync(orderId);
            if (header == null) return null;
            return MapToDto(header, items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Admin get order {OrderId} failed", orderId);
            throw;
        }
    }

    public async Task<OrderDto> PlaceOrderAsync(int userId, PlaceOrderDto dto)
    {
        try
        {
            _logger.LogInformation("Place order for user {UserId}", userId);
            var (_, cartItems) = await _cartRepo.GetWithItemsAsync(userId);
            var itemList = cartItems.ToList();
            if (!itemList.Any()) throw new InvalidOperationException("Cart is empty.");

            var total = itemList.Sum(i => i.UnitPrice * i.Quantity);

            // Apply coupon discount
            decimal discountAmount = 0;
            if (!string.IsNullOrWhiteSpace(dto.CouponCode))
            {
                var validation = await _coupons.ValidateAsync(dto.CouponCode, total);
                if (validation.IsValid)
                {
                    discountAmount = validation.DiscountAmount;
                    await _coupons.IncrementUsageAsync(validation.CouponId!.Value);
                    _logger.LogInformation("Coupon {Code} applied: ₹{Discount} off order for user {UserId}",
                        dto.CouponCode, discountAmount, userId);
                }
            }

            var finalAmount = total - discountAmount;

            var itemsJson = itemList.Select(i => (object)new
            {
                ProductId = i.ProductId,
                ProductName = i.ProductName ?? string.Empty,
                ProductImage = i.DefaultImage ?? string.Empty,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity
            }).ToArray();

            var orderId = await _repo.PlaceAsync(userId, dto.AddressId, dto.PaymentMethod,
                total, discountAmount, finalAmount, null, itemsJson);

            var (header, orderItems) = await _repo.GetByIdAsync(orderId);
            _logger.LogInformation("Order {OrderId} placed for user {UserId}", orderId, userId);
            return MapToDto(header!, orderItems);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Place order failed for user {UserId}", userId);
            throw;
        }
    }

    public async Task CancelOrderAsync(int orderId, int userId, string? reason = null)
    {
        try
        {
            _logger.LogInformation("Cancel order {OrderId} for user {UserId}", orderId, userId);
            var (success, error) = await _repo.CancelAsync(orderId, userId, reason);
            if (!success) throw new InvalidOperationException(error ?? "Cannot cancel order.");
            _logger.LogInformation("Order {OrderId} cancelled for user {UserId}", orderId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Cancel order {OrderId} failed for user {UserId}", orderId, userId);
            throw;
        }
    }

    public async Task<PagedResult<OrderDto>> GetAllOrdersAsync(int page, int pageSize)
    {
        try
        {
            _logger.LogInformation("Admin get all orders page={Page}", page);
            var (items, total) = await _repo.GetAllAsync(null, null, null, null, page, pageSize);
            return new PagedResult<OrderDto>
            {
                Items = items.Select(o => MapToDto(o)).ToList(),
                TotalCount = total, Page = page, PageSize = pageSize
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Get all orders failed");
            throw;
        }
    }

    public async Task UpdateOrderStatusAsync(int orderId, UpdateOrderStatusDto dto)
    {
        try
        {
            _logger.LogInformation("Update status of order {OrderId} to {Status}", orderId, dto.Status);
            await _repo.UpdateStatusAsync(orderId, dto.Status.ToString(), null, null, string.IsNullOrWhiteSpace(dto.AwbCode) ? null : dto.AwbCode);
            _logger.LogInformation("Order {OrderId} status updated to {Status}", orderId, dto.Status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Update order {OrderId} status failed", orderId);
            throw;
        }
    }

    private static OrderDto MapToDto(Order o, IEnumerable<OrderItem>? items = null) => new()
    {
        Id = o.Id,
        UserId = o.UserId,
        CustomerName = o.CustomerName,
        CustomerEmail = o.CustomerEmail,
        ItemCount = o.ItemCount,
        TotalAmount = o.TotalAmount,
        DiscountAmount = o.DiscountAmount,
        FinalAmount = o.FinalAmount,
        PaymentMethod = o.PaymentMethod,
        PaymentStatus = o.PaymentStatus,
        OrderStatus = o.OrderStatus,
        AWBCode = o.AWBCode,
        CreatedAt = o.CreatedAt,
        Items = (items ?? Enumerable.Empty<OrderItem>()).Select(i => new OrderItemDto
        {
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            ImageUrl = i.ProductImage,
            Quantity = i.Quantity,
            UnitPrice = i.UnitPrice,
            Subtotal = i.Subtotal
        }).ToList()
    };
}

public interface IOrderRepository
{
    Task<(IEnumerable<Order> Items, int Total)> GetByUserAsync(int userId, int page, int pageSize);
    Task<(Order? Header, IEnumerable<OrderItem> Items)> GetByIdAsync(int orderId);
    Task<int> PlaceAsync(int userId, int addressId, string paymentMethod,
        decimal totalAmount, decimal discountAmount, decimal finalAmount,
        string? notes, object[] items);
    Task<(bool Success, string? Error)> CancelAsync(int orderId, int userId, string? cancelReason);
    Task<(IEnumerable<Order> Items, int Total)> GetAllAsync(string? orderStatus, string? paymentStatus,
        DateTime? fromDate, DateTime? toDate, int page, int pageSize);
    Task UpdateStatusAsync(int orderId, string? orderStatus, string? paymentStatus,
        string? shiprocketOrderId, string? awbCode);
}
