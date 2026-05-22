namespace HouseOfVastrikaa.Application.Interfaces;

public interface IWishlistService
{
    Task<IEnumerable<dynamic>> GetWishlistAsync(int userId);
    Task AddToWishlistAsync(int userId, int productId);
    Task RemoveFromWishlistAsync(int userId, int productId);
    Task<bool> CheckAsync(int userId, int productId);
}
