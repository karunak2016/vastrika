using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;

namespace HouseOfVastrikaa.Infrastructure.Services;

public class BlobStorageService
{
    private readonly string? _connectionString;
    private readonly string _containerName;
    private BlobContainerClient? _client;

    public BlobStorageService(IConfiguration configuration)
    {
        _connectionString = configuration["AzureStorage:ConnectionString"];
        _containerName = configuration["AzureStorage:ContainerName"] ?? "products";
    }

    private async Task<BlobContainerClient> GetContainerAsync()
    {
        if (string.IsNullOrWhiteSpace(_connectionString))
            throw new InvalidOperationException("AzureStorage:ConnectionString is not configured.");

        if (_client is null)
        {
            _client = new BlobContainerClient(_connectionString, _containerName);
            await _client.CreateIfNotExistsAsync(PublicAccessType.Blob);
        }

        return _client;
    }

    public async Task<string> UploadImageAsync(Stream imageStream, string fileName, string contentType)
    {
        var container = await GetContainerAsync();
        var blobClient = container.GetBlobClient(fileName);

        await blobClient.UploadAsync(imageStream, new BlobHttpHeaders
        {
            ContentType = contentType
        });

        return blobClient.Uri.ToString();
    }

    public async Task DeleteImageAsync(string imageUrl)
    {
        var container = await GetContainerAsync();
        var uri = new Uri(imageUrl);
        var fileName = Path.GetFileName(uri.LocalPath);
        await container.GetBlobClient(fileName).DeleteIfExistsAsync();
    }
}
