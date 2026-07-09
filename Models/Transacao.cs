using System.ComponentModel.DataAnnotations;

namespace FinSync.Models;

public class Transacao
{
    public int Id { get; set; }

    [Required]
    [StringLength(120)]
    public string Descricao { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue)]
    public decimal Valor { get; set; }

    public TipoTransacao Tipo { get; set; }

    public DateOnly Data { get; set; } = DateOnly.FromDateTime(DateTime.Now);

    public int ContaId { get; set; }
    public Conta? Conta { get; set; }

    public int? CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
