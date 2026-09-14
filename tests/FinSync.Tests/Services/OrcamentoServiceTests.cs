using FinSync.Enums;
using FinSync.Features.Categorias;
using FinSync.Features.Contas;
using FinSync.Features.Orcamentos;
using FinSync.Features.Transacoes;
using FinSync.Tests.Helpers;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace FinSync.Tests.Services;

public class OrcamentoServiceTests : ServiceTestBase
{
    [Fact]
    public async Task GetAllAsync_DeveRetornarApenasOrcamentosDoUsuario()
    {
        var usuario1 = await CriarUsuarioAsync("u1@teste.com");
        var usuario2 = await CriarUsuarioAsync("u2@teste.com");

        var cat1 = new Categoria { Nome = "Alimentação", Cor = "#FF0000", Tipo = TipoTransacao.Saida, UsuarioId = usuario1.Id };
        var cat2 = new Categoria { Nome = "Lazer", Cor = "#00FF00", Tipo = TipoTransacao.Saida, UsuarioId = usuario2.Id };
        Context.Categorias.AddRange(cat1, cat2);
        await Context.SaveChangesAsync();

        Context.Orcamentos.AddRange(
            new Orcamento { CategoriaId = cat1.Id, ValorLimite = 1000m, Mes = 9, Ano = 2026, UsuarioId = usuario1.Id },
            new Orcamento { CategoriaId = cat2.Id, ValorLimite = 500m, Mes = 9, Ano = 2026, UsuarioId = usuario2.Id }
        );
        await Context.SaveChangesAsync();

        var service = new OrcamentoService(Context);
        var result = await service.GetAllAsync(usuario1.Id);

        Assert.Single(result);
        Assert.Equal(1000m, result[0].ValorLimite);
        Assert.Equal(cat1.Id, result[0].CategoriaId);
    }

    [Fact]
    public async Task CreateAsync_DeveCriarOrcamentoComSucesso()
    {
        var usuario = await CriarUsuarioAsync();
        var cat = new Categoria { Nome = "Transporte", Cor = "#0000FF", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id };
        Context.Categorias.Add(cat);
        await Context.SaveChangesAsync();

        var service = new OrcamentoService(Context);
        var dto = new CreateOrcamentoDto(cat.Id, 600m, 9, 2026);

        var (criado, error) = await service.CreateAsync(dto, usuario.Id);

        Assert.Null(error);
        Assert.NotNull(criado);
        Assert.Equal(600m, criado!.ValorLimite);
        Assert.Equal(cat.Id, criado.CategoriaId);
    }

    [Fact]
    public async Task CreateAsync_NaoDevePermitirDuplicidadeMesAnoCategoria()
    {
        var usuario = await CriarUsuarioAsync();
        var cat = new Categoria { Nome = "Saúde", Cor = "#FFAA00", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id };
        Context.Categorias.Add(cat);
        await Context.SaveChangesAsync();

        var service = new OrcamentoService(Context);
        var dto = new CreateOrcamentoDto(cat.Id, 800m, 9, 2026);

        var (criado, error1) = await service.CreateAsync(dto, usuario.Id);
        Assert.Null(error1);
        Assert.NotNull(criado);

        var (duplicado, error2) = await service.CreateAsync(dto, usuario.Id);
        Assert.Null(duplicado);
        Assert.NotNull(error2);
        Assert.Contains("já existe", error2);
    }

    [Fact]
    public async Task UpdateAsync_DeveAtualizarValorLimite()
    {
        var usuario = await CriarUsuarioAsync();
        var cat = new Categoria { Nome = "Educação", Cor = "#00AAFF", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id };
        Context.Categorias.Add(cat);
        await Context.SaveChangesAsync();

        var orc = new Orcamento { CategoriaId = cat.Id, ValorLimite = 500m, Mes = 9, Ano = 2026, UsuarioId = usuario.Id };
        Context.Orcamentos.Add(orc);
        await Context.SaveChangesAsync();

        var service = new OrcamentoService(Context);
        var (found, error) = await service.UpdateAsync(orc.Id, new UpdateOrcamentoDto(750m), usuario.Id);

        Assert.True(found);
        Assert.Null(error);

        var atualizado = await Context.Orcamentos.FindAsync(orc.Id);
        Assert.Equal(750m, atualizado!.ValorLimite);
    }

    [Fact]
    public async Task DeleteAsync_DeveRemoverOrcamento()
    {
        var usuario = await CriarUsuarioAsync();
        var cat = new Categoria { Nome = "Mercado", Cor = "#00FF00", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id };
        Context.Categorias.Add(cat);
        await Context.SaveChangesAsync();

        var orc = new Orcamento { CategoriaId = cat.Id, ValorLimite = 1200m, Mes = 9, Ano = 2026, UsuarioId = usuario.Id };
        Context.Orcamentos.Add(orc);
        await Context.SaveChangesAsync();

        var service = new OrcamentoService(Context);
        var deletado = await service.DeleteAsync(orc.Id, usuario.Id);

        Assert.True(deletado);
        Assert.Null(await Context.Orcamentos.FindAsync(orc.Id));
    }

    [Fact]
    public async Task ObterResumoOrcamentosAsync_DeveCalcularGastosDoMesAnoCorretamente()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Principal", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);

        var catMercado = new Categoria { Nome = "Mercado", Cor = "#00FF00", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id };
        var catLazer = new Categoria { Nome = "Lazer", Cor = "#FF00FF", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id };
        Context.Categorias.AddRange(catMercado, catLazer);
        await Context.SaveChangesAsync();

        Context.Orcamentos.AddRange(
            new Orcamento { CategoriaId = catMercado.Id, ValorLimite = 1000m, Mes = 9, Ano = 2026, UsuarioId = usuario.Id },
            new Orcamento { CategoriaId = catLazer.Id, ValorLimite = 400m, Mes = 9, Ano = 2026, UsuarioId = usuario.Id }
        );

        // Transações no mês correto
        Context.Transacoes.AddRange(
            new Transacao { Descricao = "Compras 1", Valor = 350m, Tipo = TipoTransacao.Saida, Data = new DateOnly(2026, 9, 5), ContaId = conta.Id, CategoriaId = catMercado.Id },
            new Transacao { Descricao = "Compras 2", Valor = 150m, Tipo = TipoTransacao.Saida, Data = new DateOnly(2026, 9, 10), ContaId = conta.Id, CategoriaId = catMercado.Id },
            // Entrada não deve somar ao gasto
            new Transacao { Descricao = "Reembolso Mercado", Valor = 50m, Tipo = TipoTransacao.Entrada, Data = new DateOnly(2026, 9, 11), ContaId = conta.Id, CategoriaId = catMercado.Id },
            // Transação em outro mês não deve somar
            new Transacao { Descricao = "Mercado Agosto", Valor = 200m, Tipo = TipoTransacao.Saida, Data = new DateOnly(2026, 8, 20), ContaId = conta.Id, CategoriaId = catMercado.Id }
        );
        await Context.SaveChangesAsync();

        var service = new OrcamentoService(Context);
        var resumo = await service.ObterResumoOrcamentosAsync(usuario.Id, 9, 2026);

        Assert.Equal(2, resumo.Count);

        var resumoMercado = resumo.First(r => r.CategoriaId == catMercado.Id);
        Assert.Equal(500m, resumoMercado.TotalGasto);
        Assert.Equal(1000m, resumoMercado.ValorLimite);
        Assert.Equal(50m, resumoMercado.PercentualUso);

        var resumoLazer = resumo.First(r => r.CategoriaId == catLazer.Id);
        Assert.Equal(0m, resumoLazer.TotalGasto);
        Assert.Equal(400m, resumoLazer.ValorLimite);
        Assert.Equal(0m, resumoLazer.PercentualUso);
    }
}
