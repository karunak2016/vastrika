using HouseOfVastrikaa.Application.DTOs.Coupon;
using HouseOfVastrikaa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HouseOfVastrikaa.API.Controllers;

[ApiController]
[Route("api/coupons")]
public class CouponController(ICouponService coupons, ILogger<CouponController> logger) : ControllerBase
{
    // ── Customer endpoints ────────────────────────────────────────────────────

    [HttpPost("validate")]
    public async Task<IActionResult> Validate([FromBody] ValidateCouponDto dto)
    {
        try
        {
            var result = await coupons.ValidateAsync(dto.Code, dto.CartTotal);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Coupon validate failed");
            throw;
        }
    }

    [HttpGet("active-offers")]
    public async Task<IActionResult> GetActiveOffers()
    {
        try
        {
            var offers = await coupons.GetActiveAutoOffersAsync();
            return Ok(offers);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Get active offers failed");
            throw;
        }
    }

    // ── Admin endpoints ───────────────────────────────────────────────────────

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            return Ok(await coupons.GetAllAsync());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Get all coupons failed");
            throw;
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateCouponDto dto)
    {
        try
        {
            var result = await coupons.CreateAsync(dto);
            logger.LogInformation("Coupon created: {Code}", result.Code);
            return CreatedAtAction(nameof(GetAll), result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Create coupon failed");
            throw;
        }
    }

    [HttpPost("update/{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCouponDto dto)
    {
        try
        {
            var result = await coupons.UpdateAsync(id, dto, dto.IsActive);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Update coupon {Id} failed", id);
            throw;
        }
    }

    [HttpPost("delete/{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Deactivate(int id)
    {
        try
        {
            await coupons.UpdateAsync(id, new CreateCouponDto(), false);
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Deactivate coupon {Id} failed", id);
            throw;
        }
    }
}
