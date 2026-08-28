using System.ComponentModel.DataAnnotations;
using FinSync.Enums;
using FinSync.Features.Categorias;
using FinSync.Features.Contas;
using FinSync.Features.Recorrencias;

namespace FinSync.Features.Transacoes;

public class Transacao
{
    public int Id { get; set; }

    [Required]
    [StringLength(120)]
    public string Descricao { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue)]
    public decimal Valor { get; set; }

    public TipoTransacao Tipo { get; set; }

    public StatusTransacao Status { get; set; } = StatusTransacao.Pago;

    public DateOnly Data { get; set; } = DateOnly.FromDateTime(DateTime.Now);

    public int ContaId { get; set; }
    public Conta? Conta { get; set; }

    public int? CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }

    public Guid? ParcelamentoId { get; set; }
    public int? NumeroParcela { get; set; }
    public int? TotalParcelas { get; set; }

    public int? RecorrenciaId { get; set; }
    public Recorrencia? Recorrencia { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}