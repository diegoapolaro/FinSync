using System.Security.Claims;
using FinSync.Enums;
using FinSync.Features.Auth;
using FinSync.Features.Contas;
using FinSync.Features.Transacoes;
using FinSync.Services.OpenFinance;
using FinSync.Tests.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace FinSync.Tests.Controllers;

public class ContasControllerTests : ServiceTestBase
{
    private ContasController CriarController(int usuarioId, IOpenFinanceProvider provider)
    {
        var contaService = new ContaService(Context);
        var syncService = new OpenFinanceSyncService(
            Context, provider, NullLogger<OpenFinanceSyncService>.Instance);
        var controller = new ContasController(contaService, syncService);

        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim(ClaimTypes.NameIdentifier, usuarioId.ToString()),
            new Claim(ClaimTypes.Name, "Usuario Teste")
        ], "mock"));

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };
        return controller;
    }

    private async Task<Conta> CriarContaOpenFinanceAsync(
        Usuario usuario,
        string nome = "Conta Open Finance",
        string externalItemId = "item_teste")
    {
        var conta = new Conta
        {
            Nome = nome,
            Tipo = TipoConta.Pessoal,
            Provedor = ProvedorOpenFinance.MockSandbox,
            ExternalItemId = externalItemId,
            StatusSincronizacao = StatusSincronizacao.Sincronizado,
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

    [Fact]
    public async Task ContasController_Sincronizar_DeveRetornarOkComMetricas()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = await CriarContaOpenFinanceAsync(usuario);
        var ontem = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

        var provider = new FakeOpenFinanceProvider
        {
            Saldo = 1234.56m,
            Transacoes =
            [
                NovaTransacao("tx_1", "PIX recebido", 500m, TipoTransacao.Entrada, ontem),
                NovaTransacao("tx_2", "Boleto pago", 120m, TipoTransacao.Saida, ontem)
            ]
        };

        var controller = CriarController(usuario.Id, provider);
        var result = await controller.Sincronizar(conta.Id);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var resumo = Assert.IsType<ResumoSincronizacaoDto>(ok.Value);

        Assert.True(resumo.Sucesso);
        Assert.Equal(conta.Id, resumo.ContaId);
        Assert.Equal(conta.Nome, resumo.ContaNome);
        Assert.Equal(2, resumo.NovasTransacoes);
        Assert.Equal(0, resumo.TransacoesDuplicadasIgnoradas);
        Assert.Equal(1234.56m, resumo.SaldoConsolidado, 2);
        Assert.Null(resumo.MensagemErro);
        Assert.True(resumo.SincronizadoEm > DateTime.UtcNow.AddMinutes(-1));
        Assert.True(resumo.TempoRespostaMs >= 0);

        Assert.Equal(2, await Context.Transacoes.CountAsync(t => t.ContaId == conta.Id));
    }

    [Fact]
    public async Task ContasController_Sincronizar_ContaDeOutroUsuario_DeveRetornarNotFound()
    {
        var usuario = await CriarUsuarioAsync();
        var outroUsuario = await CriarUsuarioAsync("outro@finsync.com");
        var contaAlheia = await CriarContaOpenFinanceAsync(outroUsuario, "Conta alheia");

        var controller = CriarController(usuario.Id, new FakeOpenFinanceProvider());
        var result = await controller.Sincronizar(contaAlheia.Id);

        Assert.IsType<NotFoundResult>(result.Result);
        Assert.Equal(0, await Context.Transacoes.CountAsync());
    }

    [Fact]
    public async Task ContasController_SincronizarTodas_DeveRetornarResumoConsolidado()
    {
        var usuario = await CriarUsuarioAsync();
        var contaA = await CriarContaOpenFinanceAsync(usuario, "Conta A", "item_a");
        var contaB = await CriarContaOpenFinanceAsync(usuario, "Conta B", "item_b");

        Context.Contas.Add(new Conta
        {
            Nome = "Conta Manual",
            Tipo = TipoConta.Pessoal,
            Provedor = ProvedorOpenFinance.Manual,
            UsuarioId = usuario.Id
        });
        await Context.SaveChangesAsync();

        var ontem = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));
        var provider = new FakeOpenFinanceProvider { Saldo = 900m };
        provider.TransacoesPorItem["item_a"] =
        [
            NovaTransacao("a_1", "PIX A1", 100m, TipoTransacao.Entrada, ontem),
            NovaTransacao("a_2", "Pagamento A2", 25m, TipoTransacao.Saida, ontem)
        ];
        provider.TransacoesPorItem["item_b"] =
        [
            NovaTransacao("b_1", "PIX B1", 200m, TipoTransacao.Entrada, ontem)
        ];

        var controller = CriarController(usuario.Id, provider);
        var result = await controller.SincronizarTodas();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var relatorio = Assert.IsType<RelatorioSincronizacaoDto>(ok.Value);

        Assert.Equal(2, relatorio.TotalContas);
        Assert.Equal(2, relatorio.ContasSincronizadas);
        Assert.Equal(0, relatorio.ContasComFalha);
        Assert.Equal(3, relatorio.TotalNovasTransacoes);
        Assert.Equal(2, relatorio.Resultados.Count);
        Assert.Contains(relatorio.Resultados, r => r.ContaId == contaA.Id);
        Assert.Contains(relatorio.Resultados, r => r.ContaId == contaB.Id);
        Assert.All(relatorio.Resultados, r => Assert.True(r.Sucesso));
        Assert.Equal(3, await Context.Transacoes.CountAsync());
    }

    [Fact]
    public async Task ContasController_Desconectar_DeveManterTransacoesEVoltarParaManual()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = await CriarContaOpenFinanceAsync(usuario);
        conta.MensagemErroSincronizacao = "erro anterior";
        await Context.SaveChangesAsync();

        Context.Transacoes.Add(new Transacao
        {
            Descricao = "Lançamento importado",
            Valor = 250m,
            Tipo = TipoTransacao.Saida,
            Status = StatusTransacao.Pago,
            Data = new DateOnly(2026, 11, 1),
            ContaId = conta.Id,
            ExternalTransactionId = "tx_pre_existente"
        });
        await Context.SaveChangesAsync();

        var controller = CriarController(usuario.Id, new FakeOpenFinanceProvider());
        var result = await controller.DesconectarOpenFinance(conta.Id);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<ContaDto>(ok.Value);

        Assert.Equal(ProvedorOpenFinance.Manual, dto.Provedor);
        Assert.Equal(StatusSincronizacao.Manual, dto.StatusSincronizacao);
        Assert.Null(dto.ExternalItemId);
        Assert.Null(dto.MensagemErroSincronizacao);

        Context.ChangeTracker.Clear();

        var contaNoBanco = await Context.Contas.FindAsync(conta.Id);
        Assert.NotNull(contaNoBanco);
        Assert.Equal(ProvedorOpenFinance.Manual, contaNoBanco!.Provedor);
        Assert.Equal(StatusSincronizacao.Manual, contaNoBanco.StatusSincronizacao);
        Assert.Null(contaNoBanco.ExternalItemId);
        Assert.Null(contaNoBanco.MensagemErroSincronizacao);

        var transacao = Assert.Single(
            await Context.Transacoes.Where(t => t.ContaId == conta.Id).ToListAsync());
        Assert.Equal("tx_pre_existente", transacao.ExternalTransactionId);
    }

    [Fact]
    public async Task ContasController_Desconectar_ContaDeOutroUsuario_DeveRetornarNotFound()
    {
        var usuario = await CriarUsuarioAsync();
        var outroUsuario = await CriarUsuarioAsync("outro@finsync.com");
        var contaAlheia = await CriarContaOpenFinanceAsync(outroUsuario);

        var controller = CriarController(usuario.Id, new FakeOpenFinanceProvider());
        var result = await controller.DesconectarOpenFinance(contaAlheia.Id);

        Assert.IsType<NotFoundResult>(result.Result);
    }
}
