using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HouseOfVastrikaa.Application.DTOs.Auth;
using HouseOfVastrikaa.Application.Interfaces;
using HouseOfVastrikaa.Domain.Entities;
using HouseOfVastrikaa.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace HouseOfVastrikaa.Application.Services;

public class AuthService : IAuthService
{
    private readonly IConfiguration _config;
    private readonly IPasswordHasher<User> _hasher;
    private readonly ILogger<AuthService> _logger;
    private readonly Func<Task<List<User>>> _getAllUsers;
    private readonly Func<string, Task<User?>> _getUserByEmail;
    private readonly Func<User, Task> _createUser;

    public AuthService(
        IConfiguration config,
        IPasswordHasher<User> hasher,
        ILogger<AuthService> logger,
        Func<Task<List<User>>> getAllUsers,
        Func<string, Task<User?>> getUserByEmail,
        Func<User, Task> createUser)
    {
        _config = config;
        _hasher = hasher;
        _logger = logger;
        _getAllUsers = getAllUsers;
        _getUserByEmail = getUserByEmail;
        _createUser = createUser;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto)
    {
        try
        {
            _logger.LogInformation("Registering user {Email}", dto.Email);
            var existing = await _getUserByEmail(dto.Email);
            if (existing != null) throw new InvalidOperationException("Email already registered.");

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                Role = UserRole.Customer
            };
            user.PasswordHash = _hasher.HashPassword(user, dto.Password);

            await _createUser(user);
            _logger.LogInformation("User {Email} registered successfully", dto.Email);
            return BuildToken(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Register failed for {Email}", dto.Email);
            throw;
        }
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto)
    {
        try
        {
            _logger.LogInformation("Login attempt for {Email}", dto.Email);
            var user = await _getUserByEmail(dto.Email)
                ?? throw new UnauthorizedAccessException("Invalid credentials.");

            if (user.Role == UserRole.Admin)
                throw new UnauthorizedAccessException("Use admin login.");

            var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            if (result == PasswordVerificationResult.Failed)
                throw new UnauthorizedAccessException("Invalid credentials.");

            _logger.LogInformation("User {Email} logged in", dto.Email);
            return BuildToken(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login failed for {Email}", dto.Email);
            throw;
        }
    }

    public async Task<AuthResponseDto> AdminLoginAsync(LoginRequestDto dto)
    {
        try
        {
            _logger.LogInformation("Admin login attempt for {Email}", dto.Email);
            var user = await _getUserByEmail(dto.Email)
                ?? throw new UnauthorizedAccessException("Invalid credentials.");

            if (user.Role != UserRole.Admin)
                throw new UnauthorizedAccessException("Not an admin account.");

            var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            if (result == PasswordVerificationResult.Failed)
                throw new UnauthorizedAccessException("Invalid credentials.");

            _logger.LogInformation("Admin {Email} logged in", dto.Email);
            return BuildToken(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Admin login failed for {Email}", dto.Email);
            throw;
        }
    }

    public Task<AuthResponseDto> RefreshTokenAsync(string token)
    {
        try
        {
            _logger.LogInformation("Refreshing token");
            var principal = GetPrincipalFromToken(token);
            var email = principal.FindFirstValue(ClaimTypes.Email)
                ?? throw new UnauthorizedAccessException("Invalid token.");

            return _getUserByEmail(email).ContinueWith(t =>
            {
                var user = t.Result ?? throw new UnauthorizedAccessException("User not found.");
                _logger.LogInformation("Token refreshed for {Email}", email);
                return BuildToken(user);
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Token refresh failed");
            throw;
        }
    }

    private AuthResponseDto BuildToken(User user)
    {
        var jwt = _config.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SecretKey"]!));
        var expiry = DateTime.UtcNow.AddMinutes(double.Parse(jwt["ExpiryMinutes"]!));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: expiry,
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new AuthResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Name = user.Name,
            Email = user.Email,
            Role = user.Role.ToString(),
            ExpiresAt = expiry
        };
    }

    private ClaimsPrincipal GetPrincipalFromToken(string token)
    {
        var jwt = _config.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SecretKey"]!));
        var handler = new JwtSecurityTokenHandler();
        return handler.ValidateToken(token, new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = false
        }, out _);
    }
}
