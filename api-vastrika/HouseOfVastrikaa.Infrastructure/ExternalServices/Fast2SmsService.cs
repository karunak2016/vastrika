using System.Text.Json;
using HouseOfVastrikaa.Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace HouseOfVastrikaa.Infrastructure.ExternalServices;

public class Fast2SmsService : ISmsService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;
    private readonly IMemoryCache _cache;
    private readonly ILogger<Fast2SmsService> _logger;

    public Fast2SmsService(HttpClient http, IConfiguration config, IMemoryCache cache, ILogger<Fast2SmsService> logger)
    {
        _http = http;
        _config = config;
        _cache = cache;
        _logger = logger;
    }

    public async Task SendOtpAsync(string phone)
    {
        var apiKey = _config["Fast2Sms:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException("SMS service is not configured.");

        var otp = Random.Shared.Next(100000, 999999).ToString();
        _cache.Set($"otp:{phone}", otp, TimeSpan.FromMinutes(10));

        var url = $"https://www.fast2sms.com/dev/bulkV2?authorization={apiKey}&route=otp&numbers={phone}&variables_values={otp}&flash=0";

        var response = await _http.GetAsync(url);
        var body = await response.Content.ReadAsStringAsync();
        _logger.LogInformation("Fast2SMS response for {Phone}: {Body}", phone, body);

        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException("Failed to send OTP. Please try again.");

        using var doc = JsonDocument.Parse(body);
        var success = doc.RootElement.TryGetProperty("return", out var ret) && ret.GetBoolean();
        if (!success)
        {
            var message = doc.RootElement.TryGetProperty("message", out var msg) ? msg.ToString() : body;
            _logger.LogWarning("Fast2SMS rejected request for {Phone}: {Message}", phone, message);
            throw new InvalidOperationException("Failed to send OTP. Please try again.");
        }
    }

    public Task VerifyOtpAsync(string phone, string otp)
    {
        if (!_cache.TryGetValue($"otp:{phone}", out string? stored) || stored != otp)
            throw new UnauthorizedAccessException("Invalid or expired OTP.");

        _cache.Remove($"otp:{phone}");
        return Task.CompletedTask;
    }
}
