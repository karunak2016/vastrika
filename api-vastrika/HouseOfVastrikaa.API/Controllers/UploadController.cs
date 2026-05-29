using HouseOfVastrikaa.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HouseOfVastrikaa.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly BlobStorageService _blobService;

    public UploadController(BlobStorageService blobService)
    {
        _blobService = blobService;
    }

    [HttpPost("image")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType))
            return BadRequest("Only JPEG, PNG and WebP images are allowed");

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

        using var stream = file.OpenReadStream();
        var url = await _blobService.UploadImageAsync(stream, fileName, file.ContentType);

        return Ok(new { url });
    }

}
