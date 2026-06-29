using HouseOfVastrikaa.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HouseOfVastrikaa.API.Controllers;

[ApiController]
[Route("api/settings")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsRepository _repo;

    public SettingsController(ISettingsRepository repo) => _repo = repo;

    [HttpGet("shipping")]
    public async Task<IActionResult> GetShipping()
    {
        var fee = await _repo.GetByKeyAsync("ShippingFee");
        var threshold = await _repo.GetByKeyAsync("FreeShippingThreshold");
        return Ok(new
        {
            shippingFee = decimal.Parse(fee?.Value ?? "99"),
            freeShippingThreshold = decimal.Parse(threshold?.Value ?? "1999")
        });
    }

    [HttpGet("{key}")]
    public async Task<IActionResult> Get(string key)
    {
        var setting = await _repo.GetByKeyAsync(key);
        if (setting == null) return NotFound();
        return Ok(new { key = setting.Key, value = setting.Value });
    }

    [HttpPost("{key}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Set(string key, [FromBody] SettingValueDto dto)
    {
        await _repo.SetAsync(key, dto.Value);
        return Ok(new { key, value = dto.Value });
    }
}

public class SettingValueDto
{
    public string Value { get; set; } = string.Empty;
}
