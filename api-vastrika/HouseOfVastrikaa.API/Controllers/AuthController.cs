using HouseOfVastrikaa.Application.DTOs.Auth;
using HouseOfVastrikaa.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HouseOfVastrikaa.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService auth, ILogger<AuthController> logger)
    {
        _auth = auth;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequestDto dto)
    {
        try
        {
            _logger.LogInformation("Register attempt for {Email}", dto.Email);
            var result = await _auth.RegisterAsync(dto);
            _logger.LogInformation("User registered: {Email}", dto.Email);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Register failed for {Email}", dto.Email);
            throw;
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequestDto dto)
    {
        try
        {
            _logger.LogInformation("Login attempt for {Email}", dto.Email);
            var result = await _auth.LoginAsync(dto);
            _logger.LogInformation("Login successful for {Email}", dto.Email);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login failed for {Email}", dto.Email);
            throw;
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] string token)
    {
        try
        {
            _logger.LogInformation("Token refresh requested");
            var result = await _auth.RefreshTokenAsync(token);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Token refresh failed");
            throw;
        }
    }

    [HttpPost("admin/login")]
    public async Task<IActionResult> AdminLogin(LoginRequestDto dto)
    {
        try
        {
            _logger.LogInformation("Admin login attempt for {Email}", dto.Email);
            var result = await _auth.AdminLoginAsync(dto);
            _logger.LogInformation("Admin login successful for {Email}", dto.Email);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Admin login failed for {Email}", dto.Email);
            throw;
        }
    }
}
