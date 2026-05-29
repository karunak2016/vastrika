using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;

namespace HouseOfVastrikaa.Infrastructure.Services;

public class BlobStorageService
{
    private readonly string? _connectionString;
    private readonly string _containerName;

    public BlobStorageService(IConfiguration configuration)
    {
        _connectionString = configuration["AzureStorage:ConnectionString"];
        _containerName = configuration["AzureStorage:ContainerName"] ?? "products";
    }

    private BlobContainerClient GetContainer()
    {
        if (string.IsNullOrWhiteSpace(_connectionString))
            throw new InvalidOperationException("AzureStorage:ConnectionString is not configured.");
        return new BlobContainerClient(_connectionString, _containerName);
    }

    public async Task<string> UploadImageAsync(Stream imageStream, string fileName, string contentType)
    {
        var blobClient = GetContainer().GetBlobClient(fileName);

        await blobClient.UploadAsync(imageStream, new BlobHttpHeaders
        {
            ContentType = contentType
        });

        return blobClient.Uri.ToString();
    }

    public async Task DeleteImageAsync(string imageUrl)
    {
        var uri = new Uri(imageUrl);
        var fileName = Path.GetFileName(uri.LocalPath);
        var blobClient = GetContainer().GetBlobClient(fileName);
        await blobClient.DeleteIfExistsAsync();
    }
}
