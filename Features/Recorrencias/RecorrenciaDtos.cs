using System.ComponentModel.DataAnnotations;
using FinSync.Enums;

namespace FinSync.Features.Recorrencias;

public class CreateRecorrenciaDto
{
    [Required]
    [StringLength(120)]
    public string Descricao { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue)]
    public decimal Valor { get; set; }

    [EnumDataType(typeof(TipoTransacao))]
    public TipoTransacao Tipo { get; set; }

    [EnumDataType(typeof(FrequenciaRecorrencia))]
    public FrequenciaRecorrencia Frequencia { get; set; } = FrequenciaRecorrencia.Mensal;

    public DateOnly DataInicio { get; set; } = DateOnly.FromDateTime(DateTime.Now);

    public DateOnly? DataFim { get; set; }

    [EnumDataType(typeof(StatusTransacao))]
    public StatusTransacao StatusPadrao { get; set; } = StatusTransacao.Pendente;

    public int ContaId { get; set; }

    public int? CategoriaId { get; set; }
}

public class UpdateRecorrenciaDto
{
    [Required]
    [StringLength(120)]
    public string Descricao { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue)]
    public decimal Valor { get; set; }

    [EnumDataType(typeof(TipoTransacao))]
    public TipoTransacao Tipo { get; set; }

    [EnumDataType(typeof(FrequenciaRecorrencia))]
    public FrequenciaRecorrencia Frequencia { get; set; }

    public DateOnly DataInicio { get; set; }

    public DateOnly? DataFim { get; set; }

    [EnumDataType(typeof(StatusTransacao))]
    public StatusTransacao StatusPadrao { get; set; }

    public bool Ativo { get; set; }

    public int ContaId { get; set; }

    public int? CategoriaId { get; set; }

    public bool AtualizarTransacoesFuturas { get; set; } = true;
}

public class RecorrenciaDto
{
    public int Id { get; init; }
    public string Descricao { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public TipoTransacao Tipo { get; set; }
    public FrequenciaRecorrencia Frequencia { get; set; }
    public DateOnly DataInicio { get; set; }
    public DateOnly? DataFim { get; set; }
    public StatusTransacao StatusPadrao { get; set; }
    public bool Ativo { get; set; }
    public DateOnly? ProximoVencimento { get; set; }
    public int ContaId { get; set; }
    public string ContaNome { get; set; } = string.Empty;
    public int? CategoriaId { get; set; }
    public string CategoriaNome { get; set; } = string.Empty;
    public string CategoriaCor { get; set; } = string.Empty;
    public int TotalTransacoesGeradas { get; set; }
}

public class ResumoRecorrenciasDto
{
    public decimal TotalReceitasFixas { get; set; }
    public decimal TotalDespesasFixas { get; set; }
    public decimal SaldoFixo => TotalReceitasFixas - TotalDespesasFixas;
    public int TotalAtivas { get; set; }
    public int TotalPausadas { get; set; }
}
