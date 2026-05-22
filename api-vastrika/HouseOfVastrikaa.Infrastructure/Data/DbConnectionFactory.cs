using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace HouseOfVastrikaa.Infrastructure.Data;

public interface IDbConnectionFactory
{
    SqlConnection Create();
}

public class DbConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public DbConnectionFactory(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection is missing.");
    }

    public SqlConnection Create() => new(_connectionString);
}
