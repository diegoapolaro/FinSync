using FinSync.Enums;
using FinSync.Services.OpenFinance;
using Xunit;

namespace FinSync.Tests.Services;

public class MockOpenFinanceProviderTests
{
    [Fact]
    public async Task ListarInstituicoesAsync_DeveConterNoveBancosComCodigosCompe()
    {
        var provider = new MockOpenFinanceProvider();

        var instituicoes = await provider.ListarInstituicoesAsync();

        Assert.Equal(9, instituicoes.Count);

        string[] codigosEsperados = ["341", "260", "001", "237", "077", "033", "104", "208", "336"];
        foreach (var codigo in codigosEsperados)
        {
            Assert.Contains(instituicoes, i => i.Codigo == codigo);
        }

        foreach (var instituicao in instituicoes)
        {
            Assert.False(string.IsNullOrWhiteSpace(instituicao.Nome));
            Assert.False(string.IsNullOrWhiteSpace(instituicao.Cor));
            Assert.False(string.IsNullOrWhiteSpace(instituicao.LogoUrl));
        }

        // A lista devolvida deve ser uma cópia: alterá-la não pode corromper o catálogo interno.
        instituicoes.Clear();
        var segundaConsulta = await provider.ListarInstituicoesAsync();
        Assert.Equal(9, segundaConsulta.Count);
    }

    [Fact]
    public async Task ObterExtratoAsync_DeveSerDeterministico()
    {
        var provider = new MockOpenFinanceProvider();
        var itemId = await ObterItemIdValidoAsync(provider);
        var desde = DateTime.UtcNow.AddDays(-90);

        var primeiro = await provider.ObterExtratoAsync(itemId, desde);
        var segundo = await provider.ObterExtratoAsync(itemId, desde);

        Assert.Equal(primeiro.Transacoes.Count, segundo.Transacoes.Count);
        Assert.Equal(primeiro.SaldoAtual, segundo.SaldoAtual, 2);

        var primeiraOrdenada = primeiro.Transacoes.OrderBy(t => t.ExternalTransactionId).ToList();
        var segundaOrdenada = segundo.Transacoes.OrderBy(t => t.ExternalTransactionId).ToList();

        for (var i = 0; i < primeiraOrdenada.Count; i++)
        {
            Assert.Equal(primeiraOrdenada[i].ExternalTransactionId, segundaOrdenada[i].ExternalTransactionId);
            Assert.Equal(primeiraOrdenada[i].Descricao, segundaOrdenada[i].Descricao);
            Assert.Equal(primeiraOrdenada[i].Valor, segundaOrdenada[i].Valor, 2);
            Assert.Equal(primeiraOrdenada[i].Tipo, segundaOrdenada[i].Tipo);
            Assert.Equal(primeiraOrdenada[i].Data, segundaOrdenada[i].Data);
        }
    }

    [Fact]
    public async Task ObterExtratoAsync_DeveGerarIdsUnicos()
    {
        var provider = new MockOpenFinanceProvider();
        var itemId = await ObterItemIdValidoAsync(provider);
        var desde = DateTime.UtcNow.AddDays(-90);

        var extrato = await provider.ObterExtratoAsync(itemId, desde);

        Assert.NotEmpty(extrato.Transacoes);

        var ids = extrato.Transacoes.Select(t => t.ExternalTransactionId).ToList();
        Assert.Equal(ids.Count, ids.Distinct().Count());

        var desdeData = DateOnly.FromDateTime(desde);
        var hoje = DateOnly.FromDateTime(DateTime.UtcNow);

        foreach (var transacao in extrato.Transacoes)
        {
            Assert.False(string.IsNullOrWhiteSpace(transacao.ExternalTransactionId));
            Assert.True(transacao.ExternalTransactionId.Length <= 150);
            Assert.False(string.IsNullOrWhiteSpace(transacao.Descricao));
            Assert.True(transacao.Descricao.Length <= 120);
            Assert.True(transacao.Valor > 0);
            Assert.True(transacao.Tipo is TipoTransacao.Entrada or TipoTransacao.Saida);
            Assert.InRange(transacao.Data, desdeData, hoje);
        }
    }

    [Fact]
    public async Task ObterExtratoAsync_DeveGerarLancamentosRealistas()
    {
        var provider = new MockOpenFinanceProvider();
        var itemId = await ObterItemIdValidoAsync(provider);
        var desde = DateTime.UtcNow.AddDays(-90);

        var extrato = await provider.ObterExtratoAsync(itemId, desde);

        Assert.Contains(extrato.Transacoes, t => t.Tipo == TipoTransacao.Saida);
        Assert.Contains(extrato.Transacoes, t => t.Descricao.Contains("PIX", StringComparison.OrdinalIgnoreCase));
        Assert.Contains(extrato.Transacoes, t =>
            t.Descricao.Contains("Tarifa", StringComparison.OrdinalIgnoreCase) ||
            t.Descricao.Contains("Pagamento", StringComparison.OrdinalIgnoreCase) ||
            t.Descricao.Contains("Cartão", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task ObterSaldoAtualAsync_DeveSerConsistenteComExtrato()
    {
        var provider = new MockOpenFinanceProvider();
        var itemId = await ObterItemIdValidoAsync(provider);
        var desde = DateTime.UtcNow.AddDays(-90);

        var extrato = await provider.ObterExtratoAsync(itemId, desde);
        var saldoAtual = await provider.ObterSaldoAtualAsync(itemId);

        var liquido = extrato.Transacoes.Sum(t => t.Tipo == TipoTransacao.Entrada ? t.Valor : -t.Valor);

        // O saldo final = saldo inicial determinístico da conta + líquido dos lançamentos.
        Assert.Equal(saldoAtual, extrato.SaldoAtual, 2);
        Assert.NotEqual(0m, liquido);
        Assert.True(saldoAtual - liquido >= 2000m);

        // A mesma janela deve produzir exatamente o mesmo saldo e o mesmo líquido.
        var segundoExtrato = await provider.ObterExtratoAsync(itemId, desde);
        var segundoSaldo = await provider.ObterSaldoAtualAsync(itemId);
        var segundoLiquido = segundoExtrato.Transacoes.Sum(t => t.Tipo == TipoTransacao.Entrada ? t.Valor : -t.Valor);

        Assert.Equal(saldoAtual, segundoSaldo, 2);
        Assert.Equal(liquido, segundoLiquido, 2);
    }

    [Fact]
    public async Task ConectarAsync_ComInstituicaoValida_DeveRetornarItemExternoDeterministico()
    {
        var provider = new MockOpenFinanceProvider();
        var request = new ConectarInstituicaoRequest
        {
            InstituicaoCodigo = "341",
            NomeConta = "Conta de teste",
            Agencia = "0001",
            NumeroConta = "12345-6",
            ChavePix = "teste@finsync.com",
            TipoConta = TipoConta.Comercial
        };

        var primeiro = await provider.ConectarAsync(request, usuarioId: 1);
        var segundo = await provider.ConectarAsync(request, usuarioId: 1);

        Assert.True(primeiro.Sucesso);
        Assert.False(string.IsNullOrWhiteSpace(primeiro.ExternalItemId));
        Assert.Equal(primeiro.ExternalItemId, segundo.ExternalItemId);
        Assert.NotNull(primeiro.Instituicao);
        Assert.Equal("341", primeiro.Instituicao!.Codigo);
    }

    [Fact]
    public async Task ConectarAsync_ComInstituicaoInvalida_DeveRetornarFalhaComMensagem()
    {
        var provider = new MockOpenFinanceProvider();

        var resultado = await provider.ConectarAsync(
            new ConectarInstituicaoRequest { InstituicaoCodigo = "000" },
            usuarioId: 1);

        Assert.False(resultado.Sucesso);
        Assert.False(string.IsNullOrWhiteSpace(resultado.Mensagem));
    }

    private static async Task<string> ObterItemIdValidoAsync(MockOpenFinanceProvider provider)
    {
        var conexao = await provider.ConectarAsync(
            new ConectarInstituicaoRequest
            {
                InstituicaoCodigo = "341",
                NomeConta = "Conta de teste",
                Agencia = "0001",
                NumeroConta = "12345-6",
                ChavePix = "teste@finsync.com",
                TipoConta = TipoConta.Comercial
            },
            usuarioId: 1);

        Assert.True(conexao.Sucesso);
        Assert.False(string.IsNullOrWhiteSpace(conexao.ExternalItemId));

        return conexao.ExternalItemId!;
    }
}
