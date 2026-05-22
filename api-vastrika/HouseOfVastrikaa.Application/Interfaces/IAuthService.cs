using HouseOfVastrikaa.Application.DTOs.Auth;

namespace HouseOfVastrikaa.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto dto);
    Task<AuthResponseDto> AdminLoginAsync(LoginRequestDto dto);
    Task<AuthResponseDto> RefreshTokenAsync(string token);
}
