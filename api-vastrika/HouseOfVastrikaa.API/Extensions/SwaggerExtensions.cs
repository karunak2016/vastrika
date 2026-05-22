namespace HouseOfVastrikaa.API.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSwaggerWithJwt(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new()
            {
                Title = "House of Vastrikaa API",
                Version = "v1",
                Description = "RESTful API for House of Vastrikaa saree eCommerce platform"
            });
        });

        return services;
    }
}
