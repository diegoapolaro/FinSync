using System.Security.Claims;
using FinSync.Enums;
using FinSync.Features.Contas;
using FinSync.Features.OpenFinance;
using FinSync.Features.Transacoes;
using FinSync.Services.OpenFinance;
using FinSync.Tests.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace FinSync.Tests.Controllers;

public class OpenFinanceControllerTests : ServiceTestBase
{
    private OpenFinanceController CriarController(int usuarioId, IOpenFinanceProvider provider)
    {
        var contaService = new ContaService(Context);
        var syncService = new OpenFinanceSyncService(
            Context, provider, NullLogger<OpenFinanceSyncService>.Instance);
        var transacaoService = new TransacaoService(Context);
        var controller = new OpenFinanceController(
            provider, contaService, syncService, transacaoService);

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
    public async Task OpenFinanceController_ListarInstituicoes_DeveRetornarBancos()
    {
        var usuario = await CriarUsuarioAsync();
        var provider = new FakeOpenFinanceProvider
        {
            Instituicoes =
            [
                new InstituicaoBancariaDto
                {
                    Codigo = "341", Nome = "Itaú", NomeOficial = "Itaú Unibanco S.A.",
                    Cor = "#EC7000", LogoUrl = "https://cdn.finsync.com.br/341.png"
                },
                new InstituicaoBancariaDto
                {
                    Codigo = "260", Nome = "Nubank", NomeOficial = "Nu Pagamentos S.A.",
                    Cor = "#820AD1", LogoUrl = "https://cdn.finsync.com.br/260.png"
                },
                new InstituicaoBancariaDto
                {
                    Codigo = "001", Nome = "Banco do Brasil", NomeOficial = "Banco do Brasil S.A.",
                    Cor = "#FFDF00", LogoUrl = "https://cdn.finsync.com.br/001.png"
                }
            ]
        };

        var controller = CriarController(usuario.Id, provider);
        var result = await controller.ListarInstituicoes();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var bancos = Assert.IsType<List<InstituicaoBancariaDto>>(ok.Value);

        Assert.Equal(3, bancos.Count);
        Assert.Contains(bancos, b => b.Codigo == "341" && b.Nome == "Itaú");
        Assert.Contains(bancos, b => b.Codigo == "260");
        Assert.All(bancos, b =>
        {
            Assert.False(string.IsNullOrWhiteSpace(b.NomeOficial));
            Assert.False(string.IsNullOrWhiteSpace(b.Cor));
            Assert.False(string.IsNullOrWhiteSpace(b.LogoUrl));
        });
    }

    [Fact]
    public async Task OpenFinanceController_Conectar_DeveCriarContaEImportarTransacoes()
    {
        var usuario = await CriarUsuarioAsync();
        var ontem = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

        var provider = new FakeOpenFinanceProvider
        {
            ExternalItemId = "item_conectado_123",
            Saldo = 2500m,
            Instituicao = new InstituicaoBancariaDto
            {
                Codigo = "341",
                Nome = "Itaú",
                NomeOficial = "Itaú Unibanco S.A.",
                Cor = "#EC7000",
                LogoUrl = "https://cdn.finsync.com.br/341.png"
            },
            Transacoes =
            [
                NovaTransacao("of_tx_1", "PIX recebido", 800m, TipoTransacao.Entrada, ontem),
                NovaTransacao("of_tx_2", "Compra no débito", 150m, TipoTransacao.Saida, ontem)
            ]
        };

        var dto = new ConectarContaOpenFinanceDto
        {
            InstituicaoCodigo = "341",
            TipoConta = TipoConta.Pessoal,
            NomePersonalizado = "Minha conta Itaú",
            CenarioSandbox = true
        };

        var controller = CriarController(usuario.Id, provider);
        var result = await controller.Conectar(dto);

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var response = Assert.IsType<ConectarContaOpenFinanceResponse>(created.Value);

        Assert.True(response.Sincronizacao.Sucesso);
        Assert.Equal(2, response.Sincronizacao.NovasTransacoes);
        Assert.Equal(2500m, response.Sincronizacao.SaldoConsolidado, 2);
        Assert.Equal("Minha conta Itaú", response.Conta.Nome);
        Assert.Equal(TipoConta.Pessoal, response.Conta.Tipo);
        Assert.Equal(ProvedorOpenFinance.MockSandbox, response.Conta.Provedor);
        Assert.Equal("item_conectado_123", response.Conta.ExternalItemId);
        Assert.Equal("341", response.Instituicao?.Codigo);
        Assert.Equal(2, response.TransacoesImportadas.Count);
        Assert.All(response.TransacoesImportadas, t => Assert.Equal(response.Conta.Id, t.ContaId));

        Context.ChangeTracker.Clear();

        var contaNoBanco = Assert.Single(await Context.Contas.ToListAsync());
        Assert.Equal(usuario.Id, contaNoBanco.UsuarioId);
        Assert.Equal(StatusSincronizacao.Sincronizado, contaNoBanco.StatusSincronizacao);
        Assert.Equal("item_conectado_123", contaNoBanco.ExternalItemId);
        Assert.Equal(2, await Context.Transacoes.CountAsync());
    }

    [Fact]
    public async Task OpenFinanceController_Conectar_ComFalhaDoProvedor_DeveRetornarBadRequest()
    {
        var usuario = await CriarUsuarioAsync();
        var provider = new FakeOpenFinanceProvider
        {
            ConexaoSucesso = false,
            MensagemConexao = "Código de instituição inválido."
        };

        var controller = CriarController(usuario.Id, provider);
        var result = await controller.Conectar(new ConectarContaOpenFinanceDto
        {
            InstituicaoCodigo = "999",
            TipoConta = TipoConta.Pessoal
        });

        Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal(0, await Context.Contas.CountAsync());
        Assert.Equal(0, await Context.Transacoes.CountAsync());
    }
}
