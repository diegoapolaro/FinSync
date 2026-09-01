using System.ComponentModel.DataAnnotations;
using FinSync.Features.Categorias;
using FinSync.Features.Contas;

namespace FinSync.Features.Auth;

public class Usuario
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Nome { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string Email { get; set; } = string.Empty;

    public string? SenhaHash { get; set; }

    [StringLength(100)]
    public string? GoogleId { get; set; }

    public string? FotoUrl { get; set; }

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    public ICollection<Conta> Contas { get; set; } = [];
    public ICollection<Categoria> Categorias { get; set; } = [];
}