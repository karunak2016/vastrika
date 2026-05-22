using HouseOfVastrikaa.Application.DTOs.Payment;

namespace HouseOfVastrikaa.Application.Interfaces;

public interface IPaymentService
{
    Task<PaymentOrderResponseDto> CreateRazorpayOrderAsync(int orderId);
    Task<bool> VerifyPaymentAsync(VerifyPaymentDto dto);
}
