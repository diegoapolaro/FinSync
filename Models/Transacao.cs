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

    public DateTime Data { get; set; } = DateTime.Now;

    public int ContaId { get; set; }

    // Propriedade de navegacao: o EF Core usa junto com ContaId para montar o relacionamento.
    public Conta? Conta { get; set; }
}
