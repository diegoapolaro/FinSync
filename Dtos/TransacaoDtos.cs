using FinSync.Models;
using System.ComponentModel.DataAnnotations;

namespace FinSync.Dtos;

public class CreateTransacaoDto
{
    [Required]
    [StringLength(120)]
    public string Descricao { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue)]
    public decimal Valor { get; set; }

    [EnumDataType(typeof(TipoTransacao))]
    public TipoTransacao Tipo { get; set; }

    public DateOnly Data { get; set; } = DateOnly.FromDateTime(DateTime.Now);

    public int ContaId { get; set; }
}

public class UpdateTransacaoDto
{
    [Required]
    [StringLength(120)]
    public string Descricao { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue)]
    public decimal Valor { get; set; }

    [EnumDataType(typeof(TipoTransacao))]
    public TipoTransacao Tipo { get; set; }

    public DateOnly Data { get; set; } = DateOnly.FromDateTime(DateTime.Now);

    public int ContaId { get; set; }
}

public class TransacaoDto
{
    public int Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public TipoTransacao Tipo { get; set; }
    public DateOnly Data { get; set; }
    public int ContaId { get; set; }
    public string ContaNome { get; set; } = string.Empty;
}
