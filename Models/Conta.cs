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

    public ICollection<Transacao> Transacoes { get; set; } = [];

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
