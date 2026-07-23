using FinSync.Dtos;
using FinSync.Models;
using FinSync.Services;
using FinSync.Tests.Helpers;
using Xunit;

namespace FinSync.Tests.Services;

public class TransacaoServiceTests : ServiceTestBase
{
    [Fact]
    public async Task CreateAsync_DeveCriarTransacaoVinculadaAContaECategoria()
    {
        var conta = new Conta { Nome = "Conta Teste", Tipo = TipoConta.Pessoal };
        var categoria = new Categoria { Nome = "Alimentacao", Cor = "#FF5733", Tipo = TipoTransacao.Saida };
        Context.Contas.Add(conta);
        Context.Categorias.Add(categoria);
        await Context.SaveChangesAsync();

        var service = new TransacaoService(Context);
        var dto = new CreateTransacaoDto
        {
            Descricao = "Compra mercado",
            Valor = 150.00m,
            Tipo = TipoTransacao.Saida,
            Data = new DateOnly(2026, 7, 1),
            ContaId = conta.Id,
            CategoriaId = categoria.Id
        };

        var (result, error) = await service.CreateAsync(dto);

        Assert.Null(error);
        Assert.NotNull(result);
        Assert.Equal("Compra mercado", result!.Descricao);
        Assert.Equal(150.00m, result.Valor);
        Assert.Equal(TipoTransacao.Saida, result.Tipo);
        Assert.Equal(conta.Id, result.ContaId);
        Assert.Equal(conta.Nome, result.ContaNome);
        Assert.Equal(categoria.Id, result.CategoriaId);
        Assert.Equal(categoria.Nome, result.CategoriaNome);
        Assert.Equal(categoria.Cor, result.CategoriaCor);

        Context.ChangeTracker.Clear();
        var persistedTransaction = await Context.Transacoes.FindAsync(result.Id);
        Assert.NotNull(persistedTransaction);
        Assert.Equal("Compra mercado", persistedTransaction!.Descricao);
    }

    [Fact]
    public async Task CreateAsync_ContaInexistente_DeveRetornarErro()
    {
        var service = new TransacaoService(Context);
        var dto = new CreateTransacaoDto
        {
            Descricao = "Teste",
            Valor = 100m,
            Tipo = TipoTransacao.Entrada,
            Data = new DateOnly(2026, 7, 1),
            ContaId = 999
        };

        var (result, error) = await service.CreateAsync(dto);

        Assert.Null(result);
        Assert.Contains("999", error);
    }

    [Fact]
    public async Task GetResumoPeriodoAsync_DeveSomarEntradasESaidasCorretamente()
    {
        var conta = new Conta { Nome = "Conta Resumo", Tipo = TipoConta.Pessoal };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        Context.Transacoes.AddRange(
            new Transacao { Descricao = "Salario", Valor = 5000m, Tipo = TipoTransacao.Entrada, Data = new DateOnly(2026, 7, 10), ContaId = conta.Id },
            new Transacao { Descricao = "Freela", Valor = 1200m, Tipo = TipoTransacao.Entrada, Data = new DateOnly(2026, 7, 15), ContaId = conta.Id },
            new Transacao { Descricao = "Aluguel", Valor = 1800m, Tipo = TipoTransacao.Saida, Data = new DateOnly(2026, 7, 5), ContaId = conta.Id },
            new Transacao { Descricao = "Mercado", Valor = 450m, Tipo = TipoTransacao.Saida, Data = new DateOnly(2026, 7, 8), ContaId = conta.Id }
        );
        await Context.SaveChangesAsync();

        var service = new TransacaoService(Context);
        var result = await service.GetResumoPeriodoAsync(
            null,
            new DateOnly(2026, 7, 1),
            new DateOnly(2026, 7, 31)
        );

        var totalEntradas = (decimal)result.GetType().GetProperty("TotalEntradas")!.GetValue(result)!;
        var totalSaidas = (decimal)result.GetType().GetProperty("TotalSaidas")!.GetValue(result)!;
        var saldo = (decimal)result.GetType().GetProperty("Saldo")!.GetValue(result)!;

        Assert.Equal(6200m, totalEntradas);
        Assert.Equal(2250m, totalSaidas);
        Assert.Equal(3950m, saldo);
    }

    [Fact]
    public async Task GetResumoPeriodoAsync_ComFiltroConta_DeveConsiderarApenasAquelaConta()
    {
        var conta1 = new Conta { Nome = "Conta A", Tipo = TipoConta.Pessoal };
        var conta2 = new Conta { Nome = "Conta B", Tipo = TipoConta.Comercial };
        Context.Contas.AddRange(conta1, conta2);
        await Context.SaveChangesAsync();

        Context.Transacoes.AddRange(
            new Transacao { Descricao = "Entrada A", Valor = 1000m, Tipo = TipoTransacao.Entrada, Data = new DateOnly(2026, 7, 1), ContaId = conta1.Id },
            new Transacao { Descricao = "Saida A", Valor = 300m, Tipo = TipoTransacao.Saida, Data = new DateOnly(2026, 7, 2), ContaId = conta1.Id },
            new Transacao { Descricao = "Entrada B", Valor = 2000m, Tipo = TipoTransacao.Entrada, Data = new DateOnly(2026, 7, 1), ContaId = conta2.Id }
        );
        await Context.SaveChangesAsync();

        var service = new TransacaoService(Context);
        var result = await service.GetResumoPeriodoAsync(
            conta1.Id,
            new DateOnly(2026, 7, 1),
            new DateOnly(2026, 7, 31)
        );

        var totalEntradas = (decimal)result.GetType().GetProperty("TotalEntradas")!.GetValue(result)!;
        var totalSaidas = (decimal)result.GetType().GetProperty("TotalSaidas")!.GetValue(result)!;

        Assert.Equal(1000m, totalEntradas);
        Assert.Equal(300m, totalSaidas);
    }

    [Fact]
    public async Task GetDetalhamentoAsync_DeveAgruparPorCategoriaComSinalCorreto()
    {
        var conta = new Conta { Nome = "Conta Det", Tipo = TipoConta.Pessoal };
        var catAlimentacao = new Categoria { Nome = "Alimentacao", Cor = "#FF0000", Tipo = TipoTransacao.Saida };
        var catTransporte = new Categoria { Nome = "Transporte", Cor = "#00FF00", Tipo = TipoTransacao.Saida };
        var catRenda = new Categoria { Nome = "Renda", Cor = "#0000FF", Tipo = TipoTransacao.Entrada };
        Context.Contas.Add(conta);
        Context.Categorias.AddRange(catAlimentacao, catTransporte, catRenda);
        await Context.SaveChangesAsync();

        Context.Transacoes.AddRange(
            new Transacao { Descricao = "Mercado", Valor = 200m, Tipo = TipoTransacao.Saida, Data = new DateOnly(2026, 7, 1), ContaId = conta.Id, CategoriaId = catAlimentacao.Id },
            new Transacao { Descricao = "Restaurante", Valor = 80m, Tipo = TipoTransacao.Saida, Data = new DateOnly(2026, 7, 2), ContaId = conta.Id, CategoriaId = catAlimentacao.Id },
            new Transacao { Descricao = "Uber", Valor = 35m, Tipo = TipoTransacao.Saida, Data = new DateOnly(2026, 7, 3), ContaId = conta.Id, CategoriaId = catTransporte.Id },
            new Transacao { Descricao = "Salario", Valor = 5000m, Tipo = TipoTransacao.Entrada, Data = new DateOnly(2026, 7, 5), ContaId = conta.Id, CategoriaId = catRenda.Id }
        );
        await Context.SaveChangesAsync();

        var service = new TransacaoService(Context);
        var result = await service.GetDetalhamentoAsync(
            null,
            new DateOnly(2026, 7, 1),
            new DateOnly(2026, 7, 31)
        );

        Assert.Equal(3, result.Count);

        var renda = result.First(r => r.CategoriaId == catRenda.Id);
        Assert.Equal(5000m, renda.Total);
        Assert.Equal("Renda", renda.CategoriaNome);

        var alimentacao = result.First(r => r.CategoriaId == catAlimentacao.Id);
        Assert.Equal(-280m, alimentacao.Total);
        Assert.Equal("Alimentacao", alimentacao.CategoriaNome);

        var transporte = result.First(r => r.CategoriaId == catTransporte.Id);
        Assert.Equal(-35m, transporte.Total);
        Assert.Equal("Transporte", transporte.CategoriaNome);
    }

    [Fact]
    public async Task GetDetalhamentoAsync_SemCategoria_DeveAgruparComoSemCategoria()
    {
        var conta = new Conta { Nome = "Conta SC", Tipo = TipoConta.Pessoal };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        Context.Transacoes.AddRange(
            new Transacao { Descricao = "Gasto sem cat", Valor = 100m, Tipo = TipoTransacao.Saida, Data = new DateOnly(2026, 7, 1), ContaId = conta.Id, CategoriaId = null },
            new Transacao { Descricao = "Outro sem cat", Valor = 50m, Tipo = TipoTransacao.Saida, Data = new DateOnly(2026, 7, 2), ContaId = conta.Id, CategoriaId = null }
        );
        await Context.SaveChangesAsync();

        var service = new TransacaoService(Context);
        var result = await service.GetDetalhamentoAsync(
            null,
            new DateOnly(2026, 7, 1),
            new DateOnly(2026, 7, 31)
        );

        Assert.Single(result);
        Assert.Null(result[0].CategoriaId);
        Assert.Equal("Sem Categoria", result[0].CategoriaNome);
        Assert.Equal("#747874", result[0].CategoriaCor);
        Assert.Equal(-150m, result[0].Total);
    }

    [Fact]
    public async Task GetDetalhamentoAsync_DeveOrdenarPorValorAbsolutoDecrescente()
    {
        var conta = new Conta { Nome = "Conta Ord", Tipo = TipoConta.Pessoal };
        var cat1 = new Categoria { Nome = "Cat1", Cor = "#111111", Tipo = TipoTransacao.Entrada };
        var cat2 = new Categoria { Nome = "Cat2", Cor = "#222222", Tipo = TipoTransacao.Saida };
        var cat3 = new Categoria { Nome = "Cat3", Cor = "#333333", Tipo = TipoTransacao.Saida };
        Context.Contas.Add(conta);
        Context.Categorias.AddRange(cat1, cat2, cat3);
        await Context.SaveChangesAsync();

        Context.Transacoes.AddRange(
            new Transacao { Descricao = "T1", Valor = 100m, Tipo = TipoTransacao.Entrada, Data = new DateOnly(2026, 7, 1), ContaId = conta.Id, CategoriaId = cat1.Id },
            new Transacao { Descricao = "T2", Valor = 500m, Tipo = TipoTransacao.Saida, Data = new DateOnly(2026, 7, 2), ContaId = conta.Id, CategoriaId = cat2.Id },
            new Transacao { Descricao = "T3", Valor = 30m, Tipo = TipoTransacao.Saida, Data = new DateOnly(2026, 7, 3), ContaId = conta.Id, CategoriaId = cat3.Id }
        );
        await Context.SaveChangesAsync();

        var service = new TransacaoService(Context);
        var result = await service.GetDetalhamentoAsync(
            null,
            new DateOnly(2026, 7, 1),
            new DateOnly(2026, 7, 31)
        );

        Assert.True(Math.Abs(result[0].Total) >= Math.Abs(result[1].Total));
        Assert.True(Math.Abs(result[1].Total) >= Math.Abs(result[2].Total));
        Assert.Equal(3, result.Count);
    }

    [Fact]
    public async Task DeleteAsync_DeveRemoverENaoDeixarOrfao()
    {
        var conta = new Conta { Nome = "Conta Del", Tipo = TipoConta.Pessoal };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        var transacao = new Transacao
        {
            Descricao = "Serah deletada",
            Valor = 99m,
            Tipo = TipoTransacao.Saida,
            Data = new DateOnly(2026, 7, 1),
            ContaId = conta.Id
        };
        Context.Transacoes.Add(transacao);
        await Context.SaveChangesAsync();
        var transacaoId = transacao.Id;

        var service = new TransacaoService(Context);
        var deleted = await service.DeleteAsync(transacaoId);

        Assert.True(deleted);

        Context.ChangeTracker.Clear();
        Assert.Null(await Context.Transacoes.FindAsync(transacaoId));
        Assert.NotNull(await Context.Contas.FindAsync(conta.Id));
    }

    [Fact]
    public async Task DeleteAsync_IdInexistente_DeveRetornarFalse()
    {
        var service = new TransacaoService(Context);
        var result = await service.DeleteAsync(999);
        Assert.False(result);
    }
}
