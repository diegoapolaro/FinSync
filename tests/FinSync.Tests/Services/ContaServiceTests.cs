using FinSync.Enums;
using FinSync.Features.Contas;
using FinSync.Features.Transacoes;
using FinSync.Tests.Helpers;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace FinSync.Tests.Services;

public class ContaServiceTests : ServiceTestBase
{
    [Fact]
    public async Task GetAllAsync_NaoDeveRetornarContasArquivadas()
    {
        var usuario = await CriarUsuarioAsync();
        Context.Contas.AddRange(
            new Conta { Nome = "Ativa", Tipo = TipoConta.Pessoal, Arquivada = false, UsuarioId = usuario.Id },
            new Conta { Nome = "Arquivada", Tipo = TipoConta.Comercial, Arquivada = true, UsuarioId = usuario.Id },
            new Conta { Nome = "Ativa2", Tipo = TipoConta.Pessoal, Arquivada = false, UsuarioId = usuario.Id }
        );
        await Context.SaveChangesAsync();

        var service = new ContaService(Context);
        var result = await service.GetAllAsync(usuario.Id);

        Assert.Equal(2, result.Count);
        Assert.DoesNotContain(result, c => c.Nome == "Arquivada");
    }

    [Fact]
    public async Task GetAllAsync_DeveOrdenarPorNome()
    {
        var usuario = await CriarUsuarioAsync();
        Context.Contas.AddRange(
            new Conta { Nome = "Zeta", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id },
            new Conta { Nome = "Alpha", Tipo = TipoConta.Comercial, UsuarioId = usuario.Id },
            new Conta { Nome = "Beta", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id }
        );
        await Context.SaveChangesAsync();

        var service = new ContaService(Context);
        var result = await service.GetAllAsync(usuario.Id);

        Assert.Equal("Alpha", result[0].Nome);
        Assert.Equal("Beta", result[1].Nome);
        Assert.Equal("Zeta", result[2].Nome);
    }

    [Fact]
    public async Task GetAllAsync_NaoDeveRetornarContasDeOutroUsuario()
    {
        var usuario = await CriarUsuarioAsync();
        var outroUsuario = await CriarUsuarioAsync("outro@finsync.com");
        Context.Contas.AddRange(
            new Conta { Nome = "Minha", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id },
            new Conta { Nome = "De Outro", Tipo = TipoConta.Pessoal, UsuarioId = outroUsuario.Id }
        );
        await Context.SaveChangesAsync();

        var service = new ContaService(Context);
        var result = await service.GetAllAsync(usuario.Id);

        Assert.Single(result);
        Assert.Equal("Minha", result[0].Nome);
    }

    [Fact]
    public async Task CreateAsync_DevePersistirERetornarDtoComId()
    {
        var usuario = await CriarUsuarioAsync();
        var service = new ContaService(Context);
        var dto = new CreateContaDto
        {
            Nome = "Nova Conta",
            Tipo = TipoConta.Comercial
        };

        var result = await service.CreateAsync(dto, usuario.Id);

        Assert.NotEqual(0, result.Id);
        Assert.Equal("Nova Conta", result.Nome);
        Assert.Equal(TipoConta.Comercial, result.Tipo);
        Assert.False(result.Arquivada);

        Context.ChangeTracker.Clear();
        var salva = await Context.Contas.FindAsync(result.Id);
        Assert.NotNull(salva);
        Assert.Equal("Nova Conta", salva.Nome);
        Assert.Equal(usuario.Id, salva.UsuarioId);
    }

    [Fact]
    public async Task GetByIdAsync_DeveRetornarContaCorreta()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Busca", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        var service = new ContaService(Context);
        var result = await service.GetByIdAsync(conta.Id, usuario.Id);

        Assert.NotNull(result);
        Assert.Equal(conta.Id, result!.Id);
        Assert.Equal("Busca", result.Nome);
    }

    [Fact]
    public async Task GetByIdAsync_IdInexistente_DeveRetornarNull()
    {
        var usuario = await CriarUsuarioAsync();
        var service = new ContaService(Context);
        var result = await service.GetByIdAsync(999, usuario.Id);
        Assert.Null(result);
    }

    [Fact]
    public async Task GetByIdAsync_ContaDeOutroUsuario_DeveRetornarNull()
    {
        var usuario = await CriarUsuarioAsync();
        var outroUsuario = await CriarUsuarioAsync("outro@finsync.com");
        var conta = new Conta { Nome = "Alheia", Tipo = TipoConta.Pessoal, UsuarioId = outroUsuario.Id };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        var service = new ContaService(Context);
        var result = await service.GetByIdAsync(conta.Id, usuario.Id);
        Assert.Null(result);
    }

    [Fact]
    public async Task ToggleArchiveAsync_DeveAlternarStatusArquivada()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Alternavel", Tipo = TipoConta.Pessoal, Arquivada = false, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        var service = new ContaService(Context);

        var toggle1 = await service.ToggleArchiveAsync(conta.Id, usuario.Id);
        Assert.True(toggle1);
        Assert.True((await Context.Contas.FindAsync(conta.Id))!.Arquivada);

        var toggle2 = await service.ToggleArchiveAsync(conta.Id, usuario.Id);
        Assert.True(toggle2);
        Assert.False((await Context.Contas.FindAsync(conta.Id))!.Arquivada);
    }

    [Fact]
    public async Task DeleteAsync_DeveRemoverContaETransacoesAssociadas()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Serah deletada", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        Context.Transacoes.AddRange(
            new Transacao { Descricao = "T1", Valor = 10m, Tipo = TipoTransacao.Entrada, Data = new DateOnly(2026, 7, 1), ContaId = conta.Id },
            new Transacao { Descricao = "T2", Valor = 20m, Tipo = TipoTransacao.Saida, Data = new DateOnly(2026, 7, 2), ContaId = conta.Id }
        );
        await Context.SaveChangesAsync();

        var service = new ContaService(Context);
        var (success, error) = await service.DeleteAsync(conta.Id, usuario.Id);

        Assert.True(success);
        Assert.Null(error);
        Assert.Null(await Context.Contas.FindAsync(conta.Id));
        Assert.Empty(await Context.Transacoes.Where(t => t.ContaId == conta.Id).ToListAsync());
    }

    [Fact]
    public async Task DeleteAsync_IdInexistente_DeveRetornarFalse()
    {
        var usuario = await CriarUsuarioAsync();
        var service = new ContaService(Context);
        var (success, error) = await service.DeleteAsync(999, usuario.Id);
        Assert.False(success);
        Assert.Null(error);
    }
}