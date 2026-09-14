using System.ComponentModel.DataAnnotations;
using FinSync.Features.Auth;
using FinSync.Features.Categorias;
using FinSync.Shared.Interfaces;

namespace FinSync.Features.Orcamentos;

public class Orcamento : IAuditableEntity
{
    public int Id { get; set; }

    public int CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }

    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    [Range(0.01, double.MaxValue)]
    public decimal ValorLimite { get; set; }

    [Range(1, 12)]
    public int Mes { get; set; }

    [Range(2000, 2100)]
    public int Ano { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
