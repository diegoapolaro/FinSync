using System.ComponentModel.DataAnnotations;
using FinSync.Enums;

namespace FinSync.Features.Contas;

public class CreateContaDto
{
    [Required]
    [StringLength(80)]
    public string Nome { get; set; } = string.Empty;

    [EnumDataType(typeof(TipoConta))]
    public TipoConta Tipo { get; set; }

    [StringLength(10)]
    public string? InstituicaoCodigo { get; set; }

    [StringLength(80)]
    public string? InstituicaoNome { get; set; }

    [StringLength(20)]
    public string? Agencia { get; set; }

    [StringLength(30)]
    public string? NumeroConta { get; set; }

    [StringLength(120)]
    public string? ChavePix { get; set; }

    public ProvedorOpenFinance Provedor { get; set; } = ProvedorOpenFinance.Manual;

    [StringLength(120)]
    public string? ExternalItemId { get; set; }
}

public class UpdateContaDto
{
    [Required]
    [StringLength(80)]
    public string Nome { get; set; } = string.Empty;

    [EnumDataType(typeof(TipoConta))]
    public TipoConta Tipo { get; set; }

    public bool Arquivada { get; set; }

    [StringLength(10)]
    public string? InstituicaoCodigo { get; set; }

    [StringLength(80)]
    public string? InstituicaoNome { get; set; }

    [StringLength(20)]
    public string? Agencia { get; set; }

    [StringLength(30)]
    public string? NumeroConta { get; set; }

    [StringLength(120)]
    public string? ChavePix { get; set; }

    public ProvedorOpenFinance? Provedor { get; set; }
    public StatusSincronizacao? StatusSincronizacao { get; set; }
}

public class ContaDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public TipoConta Tipo { get; set; }
    public bool Arquivada { get; set; }

    public string? InstituicaoCodigo { get; set; }
    public string? InstituicaoNome { get; set; }
    public string? Agencia { get; set; }
    public string? NumeroConta { get; set; }
    public string? ChavePix { get; set; }
    public ProvedorOpenFinance Provedor { get; set; } = ProvedorOpenFinance.Manual;
    public string? ExternalItemId { get; set; }
    public StatusSincronizacao StatusSincronizacao { get; set; } = StatusSincronizacao.Manual;
    public DateTime? UltimaSincronizacaoEm { get; set; }
    public string? MensagemErroSincronizacao { get; set; }
}