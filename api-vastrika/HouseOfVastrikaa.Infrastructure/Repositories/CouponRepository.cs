using System.Data;
using Dapper;
using HouseOfVastrikaa.Application.Interfaces;
using HouseOfVastrikaa.Domain.Entities;
using HouseOfVastrikaa.Infrastructure.Data;

namespace HouseOfVastrikaa.Infrastructure.Repositories;

public class CouponRepository(IDbConnectionFactory db) : ICouponRepository
{
    public async Task<List<Coupon>> GetAllAsync()
    {
        using var conn = db.Create();
        var rows = await conn.QueryAsync<Coupon>("sp_Coupons_GetAll", commandType: CommandType.StoredProcedure);
        return rows.ToList();
    }

    public async Task<List<Coupon>> GetActiveAutoOffersAsync()
    {
        using var conn = db.Create();
        var rows = await conn.QueryAsync<Coupon>("sp_Coupons_GetActive", commandType: CommandType.StoredProcedure);
        return rows.ToList();
    }

    public async Task<Coupon?> GetByCodeAsync(string code)
    {
        using var conn = db.Create();
        return await conn.QuerySingleOrDefaultAsync<Coupon>(
            "sp_Coupons_GetByCode", new { Code = code }, commandType: CommandType.StoredProcedure);
    }

    public async Task<int> CreateAsync(Coupon coupon)
    {
        using var conn = db.Create();
        var p = new DynamicParameters();
        p.Add("@Code",          coupon.Code);
        p.Add("@Description",   coupon.Description);
        p.Add("@DiscountType",  coupon.DiscountType);
        p.Add("@DiscountValue", coupon.DiscountValue);
        p.Add("@MinCartAmount", coupon.MinCartAmount);
        p.Add("@MaxDiscount",   coupon.MaxDiscount);
        p.Add("@StartDate",     coupon.StartDate);
        p.Add("@EndDate",       coupon.EndDate);
        p.Add("@UsageLimit",    coupon.UsageLimit);
        p.Add("@FestivalName",  coupon.FestivalName);
        p.Add("@NewCouponId",   dbType: DbType.Int32, direction: ParameterDirection.Output);

        await conn.ExecuteAsync("sp_Coupons_Create", p, commandType: CommandType.StoredProcedure);
        return p.Get<int>("@NewCouponId");
    }

    public async Task UpdateAsync(Coupon coupon)
    {
        using var conn = db.Create();
        await conn.ExecuteAsync("sp_Coupons_Update", new
        {
            coupon.Id, coupon.Code, coupon.Description, coupon.DiscountType,
            coupon.DiscountValue, coupon.MinCartAmount, coupon.MaxDiscount,
            coupon.StartDate, coupon.EndDate, coupon.UsageLimit,
            coupon.FestivalName, coupon.IsActive
        }, commandType: CommandType.StoredProcedure);
    }

    public async Task IncrementUsageAsync(int id)
    {
        using var conn = db.Create();
        await conn.ExecuteAsync("sp_Coupons_IncrementUsage", new { Id = id }, commandType: CommandType.StoredProcedure);
    }
}
