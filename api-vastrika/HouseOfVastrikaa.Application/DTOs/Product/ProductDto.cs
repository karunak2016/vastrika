namespace HouseOfVastrikaa.Application.DTOs.Product;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountedPrice { get; set; }
    public int StockQuantity { get; set; }
    public string Fabric { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public bool HasBlousePiece { get; set; }
    public string? CareInstructions { get; set; }
    public int DeliveryDays { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public List<string> ImageUrls { get; set; } = new();
    public string? DefaultImageUrl { get; set; }
}
