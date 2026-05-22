using HouseOfVastrikaa.Domain.Enums;

namespace HouseOfVastrikaa.Application.DTOs.Order;

public class PlaceOrderDto
{
    public int AddressId { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string? CouponCode { get; set; }
}
