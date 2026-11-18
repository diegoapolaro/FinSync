using FinSync.Services.OpenFinance;

namespace FinSync.Tests.Helpers;

/// <summary>
/// Provedor determinístico usado pelos testes de controller/Open Finance.
/// Cada comportamento pode ser configurado pelas propriedades públicas.
/// </summary>
public sealed class FakeOpenFinanceProvider : IOpenFinanceProvider
{
    public List<InstituicaoBancariaDto> Instituicoes { get; set; } = [];
    public List<TransacaoBancariaDto> Transacoes { get; set; } = [];
    public Dictionary<string, List<TransacaoBancariaDto>> TransacoesPorItem { get; } = new();

    public decimal Saldo { get; set; }
    public bool ConexaoSucesso { get; set; } = true;
    public string? ExternalItemId { get; set; } = "item_fake";
    public string Provedor { get; set; } = "MockSandbox";
    public InstituicaoBancariaDto? Instituicao { get; set; }
    public string? MensagemConexao { get; set; } = "Conexão estabelecida.";
    public bool LancarExcecao { get; set; }

    public Task<List<InstituicaoBancariaDto>> ListarInstituicoesAsync()
        => Task.FromResult(Instituicoes.ToList());

    public Task<OpenFinanceConnectResult> ConectarAsync(
        ConectarInstituicaoRequest request, int usuarioId)
    {
        GarantirSemFalha();

        return Task.FromResult(new OpenFinanceConnectResult
        {
            Sucesso = ConexaoSucesso,
            ExternalItemId = ConexaoSucesso ? ExternalItemId : null,
            Instituicao = Instituicao,
            Mensagem = MensagemConexao,
            Provedor = Provedor
        });
    }

    public Task<ExtratoBancarioResult> ObterExtratoAsync(string externalItemId, DateTime desde)
    {
        GarantirSemFalha();

        var transacoes = TransacoesPorItem.TryGetValue(externalItemId, out var lista)
            ? lista
            : Transacoes;

        return Task.FromResult(new ExtratoBancarioResult
        {
            ExternalItemId = externalItemId,
            InstituicaoCodigo = "341",
            InstituicaoNome = "Banco Fake",
            SaldoAtual = Saldo,
            Transacoes = transacoes.ToList(),
            GeradoEm = DateTime.UtcNow
        });
    }

    public Task<decimal> ObterSaldoAtualAsync(string externalItemId)
    {
        GarantirSemFalha();
        return Task.FromResult(Saldo);
    }

    private void GarantirSemFalha()
    {
        if (LancarExcecao)
            throw new InvalidOperationException("Falha simulada do provedor.");
    }
}
