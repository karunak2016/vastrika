using HouseOfVastrikaa.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace HouseOfVastrikaa.Infrastructure.ExternalServices;

public class Msg91SmsService : ISmsService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;
    private readonly ILogger<Msg91SmsService> _logger;

    public Msg91SmsService(HttpClient http, IConfiguration config, ILogger<Msg91SmsService> logger)
    {
        _http = http;
        _config = config;
        _logger = logger;
    }

    public async Task SendOtpAsync(string phone)
    {
        var authKey = _config["Msg91:AuthKey"]!;
        var templateId = _config["Msg91:TemplateId"]!;
        var mobile = $"91{phone}";

        var url = $"https://control.msg91.com/api/v5/otp?template_id={templateId}&mobile={mobile}&authkey={authKey}";
        var response = await _http.PostAsync(url, null);
        var body = await response.Content.ReadAsStringAsync();

        _logger.LogInformation("MSG91 SendOTP response for {Phone}: {Body}", phone, body);

        var doc = JsonDocument.Parse(body);
        if (doc.RootElement.GetProperty("type").GetString() != "success")
            throw new InvalidOperationException("Failed to send OTP. Please try again.");
    }

    public async Task VerifyOtpAsync(string phone, string otp)
    {
        var authKey = _config["Msg91:AuthKey"]!;
        var mobile = $"91{phone}";

        var url = $"https://control.msg91.com/api/v5/otp/verify?mobile={mobile}&otp={otp}&authkey={authKey}";
        var response = await _http.GetAsync(url);
        var body = await response.Content.ReadAsStringAsync();

        _logger.LogInformation("MSG91 VerifyOTP response for {Phone}: {Body}", phone, body);

        var doc = JsonDocument.Parse(body);
        if (doc.RootElement.GetProperty("type").GetString() != "success")
            throw new UnauthorizedAccessException("Invalid or expired OTP.");
    }
}
