using HouseOfVastrikaa.Application.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Razorpay.Api;

namespace HouseOfVastrikaa.Infrastructure.ExternalServices;

public class RazorpayService : IRazorpayClient
{
    private readonly RazorpayClient _client;
    private readonly ILogger<RazorpayService> _logger;

    public RazorpayService(IConfiguration config, ILogger<RazorpayService> logger)
    {
        _client = new RazorpayClient(config["Razorpay:KeyId"], config["Razorpay:KeySecret"]);
        _logger = logger;
    }

    public Task<string> CreateOrderAsync(long amountInPaise, string currency, string receipt)
    {
        try
        {
            _logger.LogInformation("Creating Razorpay order amount={Amount} currency={Currency} receipt={Receipt}",
                amountInPaise, currency, receipt);
            var options = new Dictionary<string, object>
            {
                ["amount"] = amountInPaise,
                ["currency"] = currency,
                ["receipt"] = receipt
            };
            var order = _client.Order.Create(options);
            var orderId = (string)order["id"];
            _logger.LogInformation("Razorpay order created: {RazorpayOrderId}", orderId);
            return Task.FromResult(orderId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Razorpay CreateOrder failed for receipt={Receipt}", receipt);
            throw;
        }
    }
}
