using FinSync.Models;
using Microsoft.EntityFrameworkCore;

namespace FinSync.Data;

public class FinSyncDbContext(DbContextOptions<FinSyncDbContext> options) : DbContext(options)
{
    public DbSet<Transacao> Transacoes => Set<Transacao>();
}
