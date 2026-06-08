using HouseOfVastrikaa.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace HouseOfVastrikaa.Infrastructure.ExternalServices;

// Temporary: accepts fixed OTP "123456" for all numbers.
// To go live, replace registration in ServiceExtensions.cs:
//   services.AddHttpClient<ISmsService, Msg91SmsService>();
public class MockSmsService : ISmsService
{
    private const string FixedOtp = "123456";
    private readonly ILogger<MockSmsService> _logger;

    public MockSmsService(ILogger<MockSmsService> logger) => _logger = logger;

    public Task SendOtpAsync(string phone)
    {
        _logger.LogInformation("MockSms: OTP for {Phone} is {Otp}", phone, FixedOtp);
        return Task.CompletedTask;
    }

    public Task VerifyOtpAsync(string phone, string otp)
    {
        if (otp != FixedOtp)
            throw new UnauthorizedAccessException("Invalid OTP.");
        return Task.CompletedTask;
    }
}
