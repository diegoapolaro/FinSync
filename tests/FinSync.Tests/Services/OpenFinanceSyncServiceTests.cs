using FinSync.Enums;
using FinSync.Features.Auth;
using FinSync.Features.Contas;
using FinSync.Features.Transacoes;
using FinSync.Services.OpenFinance;
using FinSync.Tests.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace FinSync.Tests.Services;

public class OpenFinanceSyncServiceTests : ServiceTestBase
{
    [Fact]
    public async Task SincronizarContaAsync_DeveImportarTransacoesEAtualizarConta()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = await CriarContaOpenFinanceAsync(usuario);
        var ontem = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));
        var anteontem = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-2));

        var provider = new FakeOpenFinanceProvider
        {
            Saldo = 1500.75m,
            Transacoes =
            [
                NovaTransacao("tx_1", "PIX recebido", 200m, TipoTransacao.Entrada, ontem),
                NovaTransacao("tx_2", "Pagamento cartão", 50m, TipoTransacao.Saida, anteontem)
            ]
        };

        var service = new OpenFinanceSyncService(Context, provider, NullLogger<OpenFinanceSyncService>.Instance);

        var resultado = await service.SincronizarContaAsync(conta.Id, usuario.Id);

        Assert.True(resultado.Sucesso);
        Assert.Equal(conta.Id, resultado.ContaId);
        Assert.Equal(conta.Nome, resultado.ContaNome);
        Assert.Equal(2, resultado.NovasTransacoes);
        Assert.Equal(0, resultado.TransacoesDuplicadasIgnoradas);
        Assert.Equal(1500.75m, resultado.SaldoConsolidado, 2);
        Assert.Null(resultado.MensagemErro);
        Assert.True(resultado.TempoRespostaMs >= 0);

        Context.ChangeTracker.Clear();

        var transacoes = await Context.Transacoes.Where(t => t.ContaId == conta.Id).ToListAsync();
        Assert.Equal(2, transacoes.Count);

        var entrada = Assert.Single(transacoes, t => t.ExternalTransactionId == "tx_1");
        Assert.Equal("PIX recebido", entrada.Descricao);
        Assert.Equal(200m, entrada.Valor, 2);
        Assert.Equal(TipoTransacao.Entrada, entrada.Tipo);
        Assert.Equal(StatusTransacao.Pago, entrada.Status);
        Assert.Equal(ontem, entrada.Data);
        Assert.Equal(conta.Id, entrada.ContaId);

        var saida = Assert.Single(transacoes, t => t.ExternalTransactionId == "tx_2");
        Assert.Equal("Pagamento cartão", saida.Descricao);
        Assert.Equal(50m, saida.Valor, 2);
        Assert.Equal(TipoTransacao.Saida, saida.Tipo);
        Assert.Equal(StatusTransacao.Pago, saida.Status);
        Assert.Equal(anteontem, saida.Data);

        var contaAtualizada = await Context.Contas.FindAsync(conta.Id);
        Assert.NotNull(contaAtualizada);
        Assert.Equal(StatusSincronizacao.Sincronizado, contaAtualizada!.StatusSincronizacao);
        Assert.NotNull(contaAtualizada.UltimaSincronizacaoEm);
        Assert.Null(contaAtualizada.MensagemErroSincronizacao);
    }

    [Fact]
    public async Task SincronizarContaAsync_SegundaChamada_NaoDeveDuplicar()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = await CriarContaOpenFinanceAsync(usuario);
        var provider = new FakeOpenFinanceProvider
        {
            Saldo = 1000m,
            Transacoes =
            [
                NovaTransacao("tx_1", "PIX recebido", 100m, TipoTransacao.Entrada, DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1))),
                NovaTransacao("tx_2", "Tarifa", 10m, TipoTransacao.Saida, DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-2)))
            ]
        };

        var service = new OpenFinanceSyncService(Context, provider, NullLogger<OpenFinanceSyncService>.Instance);

        var primeiro = await service.SincronizarContaAsync(conta.Id, usuario.Id);
        var segundo = await service.SincronizarContaAsync(conta.Id, usuario.Id);

        Assert.True(primeiro.Sucesso);
        Assert.Equal(2, primeiro.NovasTransacoes);

        Assert.True(segundo.Sucesso);
        Assert.Equal(0, segundo.NovasTransacoes);
        Assert.Equal(2, segundo.TransacoesDuplicadasIgnoradas);
        Assert.Equal(2, await Context.Transacoes.CountAsync(t => t.ContaId == conta.Id));
    }

    [Fact]
    public async Task SincronizarContaAsync_ComIdsRepetidosNoExtrato_DeveImportarApenasUm()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = await CriarContaOpenFinanceAsync(usuario);
        var provider = new FakeOpenFinanceProvider
        {
            Saldo = 100m,
            Transacoes =
            [
                NovaTransacao("tx_repetido", "Primeiro lançamento", 50m, TipoTransacao.Saida, DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1))),
                NovaTransacao("tx_repetido", "Segundo lançamento", 75m, TipoTransacao.Saida, DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-2)))
            ]
        };

        var service = new OpenFinanceSyncService(Context, provider, NullLogger<OpenFinanceSyncService>.Instance);

        var resultado = await service.SincronizarContaAsync(conta.Id, usuario.Id);

        Assert.True(resultado.Sucesso);
        Assert.Equal(1, resultado.NovasTransacoes);
        Assert.Equal(1, await Context.Transacoes.CountAsync(t => t.ContaId == conta.Id));
    }

    [Fact]
    public async Task SincronizarContaAsync_ContaDeOutroUsuario_DeveFalharSemGravar()
    {
        var usuario = await CriarUsuarioAsync();
        var outroUsuario = await CriarUsuarioAsync("outro@finsync.com");
        var conta = await CriarContaOpenFinanceAsync(outroUsuario, "Conta alheia");

        var provider = new FakeOpenFinanceProvider
        {
            Saldo = 100m,
            Transacoes =
            [
                NovaTransacao("tx_alheia", "LANÇAMENTO INDEVIDO", 10m, TipoTransacao.Saida, DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)))
            ]
        };

        var service = new OpenFinanceSyncService(Context, provider, NullLogger<OpenFinanceSyncService>.Instance);

        var resultado = await service.SincronizarContaAsync(conta.Id, usuario.Id);

        Assert.False(resultado.Sucesso);
        Assert.False(string.IsNullOrWhiteSpace(resultado.MensagemErro));
        Assert.Equal(0, resultado.NovasTransacoes);
        Assert.Equal(0, await Context.Transacoes.CountAsync());
    }

    [Fact]
    public async Task SincronizarContaAsync_QuandoProviderFalha_DeveMarcarContaComoFalha()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = await CriarContaOpenFinanceAsync(usuario);
        var provider = new FakeOpenFinanceProvider { LancarExcecao = true };

        var service = new OpenFinanceSyncService(Context, provider, NullLogger<OpenFinanceSyncService>.Instance);

        var resultado = await service.SincronizarContaAsync(conta.Id, usuario.Id);

        Assert.False(resultado.Sucesso);
        Assert.False(string.IsNullOrWhiteSpace(resultado.MensagemErro));
        Assert.Equal(0, resultado.NovasTransacoes);

        Context.ChangeTracker.Clear();

        var contaAtualizada = await Context.Contas.FindAsync(conta.Id);
        Assert.NotNull(contaAtualizada);
        Assert.Equal(StatusSincronizacao.Falha, contaAtualizada!.StatusSincronizacao);
        Assert.False(string.IsNullOrWhiteSpace(contaAtualizada.MensagemErroSincronizacao));
        Assert.Equal(0, await Context.Transacoes.CountAsync());
    }

    [Fact]
    public async Task SincronizarTodasAsync_DeveAgregarEIgnorarContasManuaisEArquivadas()
    {
        var usuario = await CriarUsuarioAsync();
        var contaA = await CriarContaOpenFinanceAsync(usuario, "Conta A", "item_a");
        var contaB = await CriarContaOpenFinanceAsync(usuario, "Conta B", "item_b");

        Context.Contas.AddRange(
            new Conta
            {
                Nome = "Conta Manual",
                Tipo = TipoConta.Pessoal,
                Provedor = ProvedorOpenFinance.Manual,
                UsuarioId = usuario.Id
            },
            new Conta
            {
                Nome = "Conta Arquivada",
                Tipo = TipoConta.Pessoal,
                Provedor = ProvedorOpenFinance.MockSandbox,
                ExternalItemId = "item_arquivada",
                Arquivada = true,
                UsuarioId = usuario.Id
            }
        );
        await Context.SaveChangesAsync();

        var ontem = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));
        var provider = new FakeOpenFinanceProvider { Saldo = 500m };
        provider.TransacoesPorItem["item_a"] =
        [
            NovaTransacao("tx_a1", "PIX A1", 100m, TipoTransacao.Entrada, ontem),
            NovaTransacao("tx_a2", "Pagamento A2", 25m, TipoTransacao.Saida, ontem)
        ];
        provider.TransacoesPorItem["item_b"] =
        [
            NovaTransacao("tx_b1", "PIX B1", 200m, TipoTransacao.Entrada, ontem)
        ];

        var service = new OpenFinanceSyncService(Context, provider, NullLogger<OpenFinanceSyncService>.Instance);

        var relatorio = await service.SincronizarTodasAsync(usuario.Id);

        Assert.Equal(2, relatorio.TotalContas);
        Assert.Equal(2, relatorio.ContasSincronizadas);
        Assert.Equal(0, relatorio.ContasComFalha);
        Assert.Equal(3, relatorio.TotalNovasTransacoes);
        Assert.Equal(2, relatorio.Resultados.Count);
        Assert.All(relatorio.Resultados, r => Assert.True(r.Sucesso));
        Assert.Contains(relatorio.Resultados, r => r.ContaId == contaA.Id);
        Assert.Contains(relatorio.Resultados, r => r.ContaId == contaB.Id);
        Assert.Equal(3, await Context.Transacoes.CountAsync());
    }

    private async Task<Conta> CriarContaOpenFinanceAsync(
        Usuario usuario,
        string nome = "Conta Open Finance",
        string externalItemId = "item_teste",
        bool arquivada = false)
    {
        var conta = new Conta
        {
            Nome = nome,
            Tipo = TipoConta.Pessoal,
            Provedor = ProvedorOpenFinance.MockSandbox,
            ExternalItemId = externalItemId,
            StatusSincronizacao = StatusSincronizacao.Sincronizado,
            Arquivada = arquivada,
            UsuarioId = usuario.Id
        };

        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();
        return conta;
    }

    private static TransacaoBancariaDto NovaTransacao(
        string externalId,
        string descricao,
        decimal valor,
        TipoTransacao tipo,
        DateOnly data) => new()
        {
            ExternalTransactionId = externalId,
            Descricao = descricao,
            Valor = valor,
            Tipo = tipo,
            Data = data
        };

    private sealed class FakeOpenFinanceProvider : IOpenFinanceProvider
    {
        public List<TransacaoBancariaDto> Transacoes { get; set; } = [];

        public Dictionary<string, List<TransacaoBancariaDto>> TransacoesPorItem { get; } = new();

        public decimal Saldo { get; set; }

        public bool LancarExcecao { get; set; }

        public Task<List<InstituicaoBancariaDto>> ListarInstituicoesAsync()
            => Task.FromResult(new List<InstituicaoBancariaDto>());

        public Task<OpenFinanceConnectResult> ConectarAsync(ConectarInstituicaoRequest request, int usuarioId)
            => Task.FromResult(new OpenFinanceConnectResult
            {
                Sucesso = true,
                ExternalItemId = "item_fake",
                Provedor = "MockSandbox"
            });

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
            {
                throw new InvalidOperationException("Falha simulada do provedor.");
            }
        }
    }
}
