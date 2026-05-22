using HouseOfVastrikaa.API.Extensions;
using HouseOfVastrikaa.API.Middleware;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((ctx, cfg) =>
        cfg.ReadFrom.Configuration(ctx.Configuration).WriteTo.Console());

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();

    builder.Services.AddJwtAuthentication(builder.Configuration);
    builder.Services.AddCorsPolicy(builder.Configuration);
    builder.Services.AddSwaggerWithJwt();
    builder.Services.AddApplicationServices();

    var app = builder.Build();

    app.UseMiddleware<ExceptionMiddleware>();
    app.UseMiddleware<RequestLoggingMiddleware>();

    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "House of Vastrikaa API v1");
        options.RoutePrefix = "swagger";
    });

    app.UseCors("AllowClients");
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Host terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
