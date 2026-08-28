using FinSync.Features.Auth;
using FinSync.Features.Categorias;
using FinSync.Features.Contas;
using FinSync.Features.Recorrencias;
using FinSync.Features.Transacoes;
using Microsoft.EntityFrameworkCore;

namespace FinSync.Data;

public class FinSyncDbContext(DbContextOptions<FinSyncDbContext> options) : DbContext(options)
{
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Transacao> Transacoes => Set<Transacao>();
    public DbSet<Conta> Contas => Set<Conta>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Recorrencia> Recorrencias => Set<Recorrencia>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.GoogleId).IsUnique()
                  .HasFilter("\"GoogleId\" IS NOT NULL");
        });

        modelBuilder.Entity<Conta>(entity =>
        {
            entity.HasIndex(c => c.Arquivada);

            entity.HasOne(c => c.Usuario)
                  .WithMany(u => u.Contas)
                  .HasForeignKey(c => c.UsuarioId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(c => c.UsuarioId);
        });

        modelBuilder.Entity<Transacao>(entity =>
        {
            entity.HasOne(t => t.Conta)
                  .WithMany(c => c.Transacoes)
                  .HasForeignKey(t => t.ContaId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(t => t.Categoria)
                  .WithMany(c => c.Transacoes)
                  .HasForeignKey(t => t.CategoriaId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(t => t.Recorrencia)
                  .WithMany(r => r.Transacoes)
                  .HasForeignKey(t => t.RecorrenciaId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(t => t.Data);
            entity.HasIndex(t => t.ParcelamentoId);
            entity.HasIndex(t => t.RecorrenciaId);
        });

        modelBuilder.Entity<Categoria>(entity =>
        {
            entity.HasOne(c => c.Usuario)
                  .WithMany(u => u.Categorias)
                  .HasForeignKey(c => c.UsuarioId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(c => c.UsuarioId);
        });

        modelBuilder.Entity<Recorrencia>(entity =>
        {
            entity.HasOne(r => r.Usuario)
                  .WithMany()
                  .HasForeignKey(r => r.UsuarioId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.Conta)
                  .WithMany()
                  .HasForeignKey(r => r.ContaId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.Categoria)
                  .WithMany()
                  .HasForeignKey(r => r.CategoriaId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(r => r.UsuarioId);
            entity.HasIndex(r => r.ContaId);
            entity.HasIndex(r => r.Ativo);
        });
    }

    public override int SaveChanges()
    {
        SetAuditTimestamps();
        return base.SaveChanges();
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        SetAuditTimestamps();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        SetAuditTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        SetAuditTimestamps();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void SetAuditTimestamps()
    {
        var entries = ChangeTracker
            .Entries()
            .Where(e => e.State is EntityState.Added or EntityState.Modified
                     && e.Properties.Any(p => p.Metadata.Name is "CreatedAt" or "UpdatedAt"));

        var now = DateTime.UtcNow;

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Property("CreatedAt").CurrentValue = now;
            }

            entry.Property("UpdatedAt").CurrentValue = now;
        }
    }
}
