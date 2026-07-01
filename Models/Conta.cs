using System.ComponentModel.DataAnnotations;

namespace FinSync.Models;

public class Conta
{
    public int Id { get; set; }

    [Required]
    [StringLength(80)]
    public string Nome { get; set; } = string.Empty;

    public TipoConta Tipo { get; set; }

    public bool Arquivada { get; set; }

    // Propriedade de navegacao: permite acessar as transacoes ligadas a esta conta.
    public ICollection<Transacao> Transacoes { get; set; } = [];
}
