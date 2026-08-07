using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using FinSync.Data;
using FinSync.Features.Auth;

namespace FinSync.Tests.Helpers;

public abstract class ServiceTestBase : IDisposable
{
    private readonly SqliteConnection _connection;
    private bool _disposed;

    protected ServiceTestBase()
    {
        _connection = new SqliteConnection("Data Source=:memory:;Foreign Keys=True");
        _connection.Open();

        var options = new DbContextOptionsBuilder<FinSyncDbContext>()
            .UseSqlite(_connection)
            .Options;

        Context = new FinSyncDbContext(options);
        Context.Database.EnsureCreated();
    }

    protected FinSyncDbContext Context { get; }

    protected async Task<Usuario> CriarUsuarioAsync(string email = "teste@finsync.com")
    {
        var usuario = new Usuario
        {
            Nome = "Teste",
            Email = email,
            SenhaHash = "hash-fake"
        };
        Context.Usuarios.Add(usuario);
        await Context.SaveChangesAsync();
        return usuario;
    }

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;
        Context.Dispose();
        _connection.Dispose();
    }
}