using System.Data;
using Dapper;
using HouseOfVastrikaa.Application.Services;
using HouseOfVastrikaa.Domain.Entities;
using HouseOfVastrikaa.Infrastructure.Data;

namespace HouseOfVastrikaa.Infrastructure.Repositories;

public class WishlistRepository : IWishlistRepository
{
    private readonly IDbConnectionFactory _db;

    public WishlistRepository(IDbConnectionFactory db) => _db = db;

    public async Task AddAsync(int userId, int productId)
    {
        using var conn = _db.Create();
        await conn.ExecuteAsync("sp_Wishlists_Add",
            new { UserId = userId, ProductId = productId },
            commandType: CommandType.StoredProcedure);
    }

    public async Task RemoveAsync(int userId, int productId)
    {
        using var conn = _db.Create();
        await conn.ExecuteAsync("sp_Wishlists_Remove",
            new { UserId = userId, ProductId = productId },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<IEnumerable<dynamic>> GetByUserAsync(int userId)
    {
        using var conn = _db.Create();
        return await conn.QueryAsync("sp_Wishlists_GetByUser",
            new { UserId = userId },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<bool> CheckAsync(int userId, int productId)
    {
        using var conn = _db.Create();
        var p = new DynamicParameters();
        p.Add("@UserId", userId);
        p.Add("@ProductId", productId);
        p.Add("@IsWishlisted", dbType: DbType.Boolean, direction: ParameterDirection.Output);

        await conn.ExecuteAsync("sp_Wishlists_Check", p, commandType: CommandType.StoredProcedure);
        return p.Get<bool>("@IsWishlisted");
    }
}
