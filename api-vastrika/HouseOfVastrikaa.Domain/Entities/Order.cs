namespace HouseOfVastrikaa.Domain.Entities;

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int AddressId { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = "Pending";
    public string? RazorpayOrderId { get; set; }
    public string? RazorpayPaymentId { get; set; }
    public string? RazorpaySignature { get; set; }
    public string OrderStatus { get; set; } = "Pending";
    public string? ShiprocketOrderId { get; set; }
    public string? AWBCode { get; set; }
    public string? Notes { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancelReason { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
