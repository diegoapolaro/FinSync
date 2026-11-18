using System.ComponentModel.DataAnnotations;
using FinSync.Enums;
using FinSync.Features.Contas;
using FinSync.Features.Transacoes;

namespace FinSync.Services.OpenFinance;

/// <summary>Instituição financeira disponível para conexão via Open Finance.</summary>
public sealed class InstituicaoBancariaDto
{
    /// <summary>Código COMPE (3 dígitos) da instituição.</summary>
    public string Codigo { get; set; } = string.Empty;

    /// <summary>Nome comercial exibido ao usuário.</summary>
    public string Nome { get; set; } = string.Empty;

    /// <summary>Razão social / nome oficial da instituição.</summary>
    public string NomeOficial { get; set; } = string.Empty;

    /// <summary>Cor da marca em hexadecimal.</summary>
    public string Cor { get; set; } = "#1C6CFF";

    /// <summary>URL do logotipo da instituição.</summary>
    public string LogoUrl { get; set; } = string.Empty;

    public bool Disponivel { get; set; } = true;
}

/// <summary>Dados necessários para conectar uma conta a uma instituição.</summary>
public sealed class ConectarInstituicaoRequest
{
    public string InstituicaoCodigo { get; set; } = string.Empty;
    public string? NomeConta { get; set; }
    public string? Agencia { get; set; }
    public string? NumeroConta { get; set; }
    public string? ChavePix { get; set; }
    public TipoConta TipoConta { get; set; } = TipoConta.Pessoal;

    /// <summary>
    /// Indica que a conexão deve usar o ambiente sandbox do provedor.
    /// O provedor mock opera sempre em sandbox; o campo é repassado para
    /// futuros provedores reais (Pluggy/Belvo/Klavi).
    /// </summary>
    public bool CenarioSandbox { get; set; } = true;
}

/// <summary>
/// Payload público do endpoint <c>POST /api/open-finance/conectar</c>.
/// </summary>
public sealed class ConectarContaOpenFinanceDto
{
    [Required]
    [StringLength(10)]
    public string InstituicaoCodigo { get; set; } = string.Empty;

    public TipoConta TipoConta { get; set; } = TipoConta.Pessoal;

    /// <summary>Nome amigável escolhido pelo usuário para a nova conta.</summary>
    [StringLength(80)]
    public string? NomePersonalizado { get; set; }

    /// <summary>Opcional; quando true (padrão) usa o ambiente de testes do provedor.</summary>
    public bool CenarioSandbox { get; set; } = true;

    [StringLength(20)]
    public string? Agencia { get; set; }

    [StringLength(30)]
    public string? NumeroConta { get; set; }

    [StringLength(120)]
    public string? ChavePix { get; set; }
}

/// <summary>
/// Resposta do primeiro sincronismo disparado automaticamente após conectar.
/// </summary>
public sealed class ConectarContaOpenFinanceResponse
{
    public ContaDto Conta { get; set; } = new();
    public ResumoSincronizacaoDto Sincronizacao { get; set; } = new();
    public InstituicaoBancariaDto? Instituicao { get; set; }
    public List<TransacaoDto> TransacoesImportadas { get; set; } = [];
    public string? Mensagem { get; set; }
    public string Provedor { get; set; } = "MockSandbox";
}

/// <summary>Resultado do estabelecimento da conexão com a instituição.</summary>
public sealed class OpenFinanceConnectResult
{
    public bool Sucesso { get; set; }
    public string? ExternalItemId { get; set; }
    public InstituicaoBancariaDto? Instituicao { get; set; }
    public string? Mensagem { get; set; }
    public string Provedor { get; set; } = "MockSandbox";
}

/// <summary>Lançamento devolvido pelo extrato da instituição financeira.</summary>
public sealed class TransacaoBancariaDto
{
    public string ExternalTransactionId { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public TipoTransacao Tipo { get; set; }
    public DateOnly Data { get; set; }
    public DateTime? DataHora { get; set; }
    public string? CategoriaSugerida { get; set; }
    public string Moeda { get; set; } = "BRL";
}

/// <summary>Extrato bancário normalizado devolvido por um provedor.</summary>
public sealed class ExtratoBancarioResult
{
    public string ExternalItemId { get; set; } = string.Empty;
    public string InstituicaoCodigo { get; set; } = string.Empty;
    public string InstituicaoNome { get; set; } = string.Empty;
    public decimal SaldoAtual { get; set; }
    public string Moeda { get; set; } = "BRL";
    public List<TransacaoBancariaDto> Transacoes { get; set; } = [];
    public DateTime? GeradoEm { get; set; }
}

/// <summary>Resumo do sincronismo de uma única conta.</summary>
public sealed class ResumoSincronizacaoDto
{
    public int ContaId { get; set; }
    public string ContaNome { get; set; } = string.Empty;
    public bool Sucesso { get; set; }
    public int NovasTransacoes { get; set; }
    public int TransacoesDuplicadasIgnoradas { get; set; }
    public decimal SaldoConsolidado { get; set; }
    public long TempoRespostaMs { get; set; }
    public string? MensagemErro { get; set; }
    public DateTime SincronizadoEm { get; set; } = DateTime.UtcNow;
}

/// <summary>Relatório consolidado do sincronismo em lote.</summary>
public sealed class RelatorioSincronizacaoDto
{
    public int TotalContas { get; set; }
    public int ContasSincronizadas { get; set; }
    public int ContasComFalha { get; set; }
    public int TotalNovasTransacoes { get; set; }
    public long TempoTotalMs { get; set; }
    public List<ResumoSincronizacaoDto> Resultados { get; set; } = [];
    public DateTime GeradoEm { get; set; } = DateTime.UtcNow;
}
