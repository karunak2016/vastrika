using HouseOfVastrikaa.Domain.Enums;

namespace HouseOfVastrikaa.Application.DTOs.Order;

public class UpdateOrderStatusDto
{
    public OrderStatus Status { get; set; }
}
