using FinSync.Models;
using Microsoft.EntityFrameworkCore;

namespace FinSync.Data;

public class FinSyncDbContext(DbContextOptions<FinSyncDbContext> options) : DbContext(options)
{
    public DbSet<Transacao> Transacoes => Set<Transacao>();
    public DbSet<Conta> Contas => Set<Conta>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Transacao>()
            .HasOne(transacao => transacao.Conta)
            .WithMany(conta => conta.Transacoes)
            .HasForeignKey(transacao => transacao.ContaId)
            // Em sistema financeiro, apagar uma conta nao deve apagar o historico sem querer.
            .OnDelete(DeleteBehavior.Restrict);
    }
}
