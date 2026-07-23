using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using FinSync.Data;

namespace FinSync.Tests.Helpers;

public abstract class ServiceTestBase : IDisposable
{
    private readonly SqliteConnection _connection;
    private bool _disposed;

    protected ServiceTestBase()
    {
        _connection = new SqliteConnection("Data Source=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<FinSyncDbContext>()
            .UseSqlite(_connection)
            .Options;

        Context = new FinSyncDbContext(options);
        Context.Database.EnsureCreated();
    }

    protected FinSyncDbContext Context { get; }

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;
        Context.Dispose();
        _connection.Dispose();
    }
}
