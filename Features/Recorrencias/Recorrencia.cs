using System.ComponentModel.DataAnnotations;
using FinSync.Enums;
using FinSync.Features.Auth;
using FinSync.Features.Categorias;
using FinSync.Features.Contas;
using FinSync.Features.Transacoes;

namespace FinSync.Features.Recorrencias;

public class Recorrencia
{
    public int Id { get; set; }

    [Required]
    [StringLength(120)]
    public string Descricao { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue)]
    public decimal Valor { get; set; }

    public TipoTransacao Tipo { get; set; }

    public FrequenciaRecorrencia Frequencia { get; set; } = FrequenciaRecorrencia.Mensal;

    public DateOnly DataInicio { get; set; } = DateOnly.FromDateTime(DateTime.Now);

    public DateOnly? DataFim { get; set; }

    public StatusTransacao StatusPadrao { get; set; } = StatusTransacao.Pendente;

    public bool Ativo { get; set; } = true;

    public DateOnly? UltimaDataGerada { get; set; }

    public int ContaId { get; set; }
    public Conta? Conta { get; set; }

    public int? CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }

    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public ICollection<Transacao> Transacoes { get; set; } = [];

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
