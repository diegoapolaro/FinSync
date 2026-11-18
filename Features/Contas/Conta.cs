using System.ComponentModel.DataAnnotations;
using FinSync.Enums;
using FinSync.Features.Auth;
using FinSync.Features.Transacoes;
using FinSync.Shared.Interfaces;

namespace FinSync.Features.Contas;

public class Conta : IAuditableEntity
{
    public int Id { get; set; }

    [Required]
    [StringLength(80)]
    public string Nome { get; set; } = string.Empty;

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

    public ProvedorOpenFinance Provedor { get; set; } = ProvedorOpenFinance.Manual;

    [StringLength(120)]
    public string? ExternalItemId { get; set; }

    public StatusSincronizacao StatusSincronizacao { get; set; } = StatusSincronizacao.Manual;

    public DateTime? UltimaSincronizacaoEm { get; set; }

    [StringLength(255)]
    public string? MensagemErroSincronizacao { get; set; }

    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public ICollection<Transacao> Transacoes { get; set; } = [];

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}