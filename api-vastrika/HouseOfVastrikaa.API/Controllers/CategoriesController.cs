using System.Data;
using Dapper;
using HouseOfVastrikaa.Domain.Entities;
using HouseOfVastrikaa.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HouseOfVastrikaa.API.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly IDbConnectionFactory _db;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(IDbConnectionFactory db, ILogger<CategoriesController> logger)
    {
        _db = db;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool includeInactive = false)
    {
        try
        {
            _logger.LogInformation("GetAll categories includeInactive={IncludeInactive}", includeInactive);
            using var conn = _db.Create();
            var result = await conn.QueryAsync<Category>("sp_Categories_GetAll",
                new { IncludeInactive = includeInactive },
                commandType: CommandType.StoredProcedure);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetAll categories failed");
            throw;
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(CreateCategoryDto dto)
    {
        try
        {
            _logger.LogInformation("Creating category: {Name}", dto.Name);
            using var conn = _db.Create();
            var p = new DynamicParameters();
            p.Add("@Name", dto.Name);
            p.Add("@Slug", dto.Slug);
            p.Add("@ImageUrl", dto.ImageUrl);
            p.Add("@DisplayOrder", dto.DisplayOrder);
            p.Add("@NewCategoryId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            await conn.ExecuteAsync("sp_Categories_Create", p, commandType: CommandType.StoredProcedure);
            var newId = p.Get<int>("@NewCategoryId");
            _logger.LogInformation("Category created with Id {Id}", newId);
            return Ok(new { id = newId });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Create category failed: {Name}", dto.Name);
            throw;
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, UpdateCategoryDto dto)
    {
        try
        {
            _logger.LogInformation("Updating category {Id}", id);
            using var conn = _db.Create();
            await conn.ExecuteAsync("sp_Categories_Update", new
            {
                CategoryId = id,
                dto.Name, dto.Slug, dto.ImageUrl, dto.DisplayOrder, dto.IsActive
            }, commandType: CommandType.StoredProcedure);
            _logger.LogInformation("Category {Id} updated", id);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Update category {Id} failed", id);
            throw;
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            _logger.LogInformation("Deleting category {Id}", id);
            using var conn = _db.Create();
            var p = new DynamicParameters();
            p.Add("@CategoryId", id);
            p.Add("@ErrorMessage", dbType: DbType.String, size: 200, direction: ParameterDirection.Output);

            await conn.ExecuteAsync("sp_Categories_Delete", p, commandType: CommandType.StoredProcedure);
            var error = p.Get<string?>("@ErrorMessage");
            if (!string.IsNullOrEmpty(error)) return BadRequest(new { error });
            _logger.LogInformation("Category {Id} deleted", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Delete category {Id} failed", id);
            throw;
        }
    }
}

public record CreateCategoryDto(string Name, string Slug, string? ImageUrl, int DisplayOrder);
public record UpdateCategoryDto(string Name, string Slug, string? ImageUrl, int DisplayOrder, bool IsActive);
