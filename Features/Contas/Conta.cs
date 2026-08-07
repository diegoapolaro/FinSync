using System.ComponentModel.DataAnnotations;
using FinSync.Enums;
using FinSync.Features.Auth;
using FinSync.Features.Transacoes;

namespace FinSync.Features.Contas;

public class Conta
{
    public int Id { get; set; }

    [Required]
    [StringLength(80)]
    public string Nome { get; set; } = string.Empty;

    public TipoConta Tipo { get; set; }

    public bool Arquivada { get; set; }

    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public ICollection<Transacao> Transacoes { get; set; } = [];

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}