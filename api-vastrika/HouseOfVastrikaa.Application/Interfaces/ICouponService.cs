using HouseOfVastrikaa.Application.DTOs.Coupon;

namespace HouseOfVastrikaa.Application.Interfaces;

public interface ICouponService
{
    Task<List<CouponDto>> GetAllAsync();
    Task<List<CouponDto>> GetActiveAutoOffersAsync();
    Task<CouponValidationResult> ValidateAsync(string code, decimal cartTotal);
    Task<CouponDto> CreateAsync(CreateCouponDto dto);
    Task<CouponDto> UpdateAsync(int id, CreateCouponDto dto, bool isActive);
    Task IncrementUsageAsync(int couponId);
}
