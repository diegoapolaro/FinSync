using System.Security.Claims;
using FinSync.Enums;
using FinSync.Features.Contas;
using FinSync.Features.Transacoes;
using FinSync.Tests.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace FinSync.Tests.Controllers;

public class TransacoesControllerTests : ServiceTestBase
{
    private TransacoesController CriarController(int usuarioId)
    {
        var service = new TransacaoService(Context);
        var controller = new TransacoesController(service);

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

    [Fact]
    public async Task GetTransacoes_DeveFiltrarPorStatus()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta Controller", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        Context.Transacoes.AddRange(
            new Transacao { Descricao = "T1", Valor = 100m, Tipo = TipoTransacao.Saida, Status = StatusTransacao.Pago, Data = new DateOnly(2026, 7, 1), ContaId = conta.Id },
            new Transacao { Descricao = "T2", Valor = 200m, Tipo = TipoTransacao.Saida, Status = StatusTransacao.Pendente, Data = new DateOnly(2026, 7, 2), ContaId = conta.Id }
        );
        await Context.SaveChangesAsync();

        var controller = CriarController(usuario.Id);
        var result = await controller.GetTransacoes(conta.Id, null, null, null, null, StatusTransacao.Pendente, 1, 20);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var paged = Assert.IsType<PagedResponse<TransacaoDto>>(okResult.Value);
        Assert.Single(paged.Data);
        Assert.Equal("T2", paged.Data[0].Descricao);
        Assert.Equal(StatusTransacao.Pendente, paged.Data[0].Status);
    }

    [Fact]
    public async Task PatchStatus_Sucesso_DeveRetornarNoContentEAtualizarBanco()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta Controller", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        var transacao = new Transacao
        {
            Descricao = "Boleto",
            Valor = 300m,
            Tipo = TipoTransacao.Saida,
            Status = StatusTransacao.Pendente,
            Data = new DateOnly(2026, 7, 5),
            ContaId = conta.Id
        };
        Context.Transacoes.Add(transacao);
        await Context.SaveChangesAsync();

        var controller = CriarController(usuario.Id);
        var dto = new UpdateStatusTransacaoDto { Status = StatusTransacao.Pago };
        var result = await controller.PatchStatus(transacao.Id, dto);

        Assert.IsType<NoContentResult>(result);

        Context.ChangeTracker.Clear();
        var atualizada = await Context.Transacoes.FindAsync(transacao.Id);
        Assert.NotNull(atualizada);
        Assert.Equal(StatusTransacao.Pago, atualizada!.Status);
    }

    [Fact]
    public async Task PatchStatus_NaoEncontrado_DeveRetornarNotFound()
    {
        var usuario = await CriarUsuarioAsync();
        var controller = CriarController(usuario.Id);
        var dto = new UpdateStatusTransacaoDto { Status = StatusTransacao.Pago };

        var result = await controller.PatchStatus(999, dto);
        Assert.IsType<NotFoundResult>(result);
    }
}
