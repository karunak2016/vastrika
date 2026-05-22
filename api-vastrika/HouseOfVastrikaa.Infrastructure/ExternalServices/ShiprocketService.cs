using System.Net.Http.Json;
using System.Text.Json;
using HouseOfVastrikaa.Application.Services;
using HouseOfVastrikaa.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace HouseOfVastrikaa.Infrastructure.ExternalServices;

public class ShiprocketService : IShiprocketClient
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;
    private readonly ILogger<ShiprocketService> _logger;
    private string? _token;

    public ShiprocketService(HttpClient http, IConfiguration config, ILogger<ShiprocketService> logger)
    {
        _http = http;
        _config = config;
        _logger = logger;
        _http.BaseAddress = new Uri(config["Shiprocket:BaseUrl"]!);
    }

    private async Task EnsureAuthenticatedAsync()
    {
        if (_token != null) return;

        try
        {
            _logger.LogInformation("Authenticating with Shiprocket");
            var response = await _http.PostAsJsonAsync("/auth/login", new
            {
                email = _config["Shiprocket:Email"],
                password = _config["Shiprocket:Password"]
            });
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            _token = json.GetProperty("token").GetString();
            _http.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _token);
            _logger.LogInformation("Shiprocket authentication successful");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Shiprocket authentication failed");
            throw;
        }
    }

    public async Task<bool> CheckServiceabilityAsync(string pincode)
    {
        try
        {
            _logger.LogInformation("Shiprocket check serviceability for pincode {Pincode}", pincode);
            await EnsureAuthenticatedAsync();
            var response = await _http.GetAsync(
                $"/courier/serviceability/?pickup_postcode=110001&delivery_postcode={pincode}&cod=0&weight=1");
            var serviceable = response.IsSuccessStatusCode;
            _logger.LogInformation("Shiprocket serviceability for {Pincode}: {Result}", pincode, serviceable);
            return serviceable;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Shiprocket check serviceability failed for pincode {Pincode}", pincode);
            throw;
        }
    }

    public async Task<string> CreateShipmentAsync(Order order)
    {
        try
        {
            _logger.LogInformation("Shiprocket create shipment for order {OrderId}", order.Id);
            await EnsureAuthenticatedAsync();

            var payload = new
            {
                order_id = order.Id.ToString(),
                order_date = order.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
                pickup_location = "Primary",
                payment_method = order.PaymentMethod == "CashOnDelivery" ? "COD" : "Prepaid",
                sub_total = order.FinalAmount,
                length = 30, breadth = 20, height = 5, weight = 0.5
            };

            var response = await _http.PostAsJsonAsync("/orders/create/adhoc", payload);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            var awbCode = json.GetProperty("awb_code").GetString() ?? string.Empty;
            _logger.LogInformation("Shiprocket shipment created AWB={AWBCode} for order {OrderId}", awbCode, order.Id);
            return awbCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Shiprocket create shipment failed for order {OrderId}", order.Id);
            throw;
        }
    }

    public async Task<object> TrackAsync(string awbCode)
    {
        try
        {
            _logger.LogInformation("Shiprocket track AWB={AWBCode}", awbCode);
            await EnsureAuthenticatedAsync();
            var response = await _http.GetAsync($"/courier/track/awb/{awbCode}");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<object>() ?? new { };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Shiprocket track failed for AWB={AWBCode}", awbCode);
            throw;
        }
    }
}
