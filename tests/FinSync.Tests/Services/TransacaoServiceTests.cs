using FinSync.Enums;
using FinSync.Features.Categorias;
using FinSync.Features.Contas;
using FinSync.Features.Transacoes;
using FinSync.Tests.Helpers;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace FinSync.Tests.Services;

public class TransacaoServiceTests : ServiceTestBase
{
    [Fact]
    public async Task CreateAsync_DeveCriarTransacaoVinculadaAContaECategoria()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta Teste", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        var categoria = new Categoria { Nome = "Alimentacao", Cor = "#FF5733", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id };
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

        var (result, error) = await service.CreateAsync(dto, usuario.Id);

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
        var usuario = await CriarUsuarioAsync();
        var service = new TransacaoService(Context);
        var dto = new CreateTransacaoDto
        {
            Descricao = "Teste",
            Valor = 100m,
            Tipo = TipoTransacao.Entrada,
            Data = new DateOnly(2026, 7, 1),
            ContaId = 999
        };

        var (result, error) = await service.CreateAsync(dto, usuario.Id);

        Assert.Null(result);
        Assert.Contains("999", error);
    }

    [Fact]
    public async Task GetResumoPeriodoAsync_DeveSomarEntradasESaidasCorretamente()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta Resumo", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
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
            new DateOnly(2026, 7, 31),
            usuario.Id
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
        var usuario = await CriarUsuarioAsync();
        var conta1 = new Conta { Nome = "Conta A", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        var conta2 = new Conta { Nome = "Conta B", Tipo = TipoConta.Comercial, UsuarioId = usuario.Id };
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
            new DateOnly(2026, 7, 31),
            usuario.Id
        );

        var totalEntradas = (decimal)result.GetType().GetProperty("TotalEntradas")!.GetValue(result)!;
        var totalSaidas = (decimal)result.GetType().GetProperty("TotalSaidas")!.GetValue(result)!;

        Assert.Equal(1000m, totalEntradas);
        Assert.Equal(300m, totalSaidas);
    }

    [Fact]
    public async Task GetDetalhamentoAsync_DeveAgruparPorCategoriaComSinalCorreto()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta Det", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        var catAlimentacao = new Categoria { Nome = "Alimentacao", Cor = "#FF0000", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id };
        var catTransporte = new Categoria { Nome = "Transporte", Cor = "#00FF00", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id };
        var catRenda = new Categoria { Nome = "Renda", Cor = "#0000FF", Tipo = TipoTransacao.Entrada, UsuarioId = usuario.Id };
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
            new DateOnly(2026, 7, 31),
            usuario.Id
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
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta SC", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
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
            new DateOnly(2026, 7, 31),
            usuario.Id
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
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta Ord", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        var cat1 = new Categoria { Nome = "Cat1", Cor = "#111111", Tipo = TipoTransacao.Entrada, UsuarioId = usuario.Id };
        var cat2 = new Categoria { Nome = "Cat2", Cor = "#222222", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id };
        var cat3 = new Categoria { Nome = "Cat3", Cor = "#333333", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id };
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
            new DateOnly(2026, 7, 31),
            usuario.Id
        );

        Assert.True(Math.Abs(result[0].Total) >= Math.Abs(result[1].Total));
        Assert.True(Math.Abs(result[1].Total) >= Math.Abs(result[2].Total));
        Assert.Equal(3, result.Count);
    }

    [Fact]
    public async Task DeleteAsync_DeveRemoverENaoDeixarOrfao()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta Del", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
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
        var deleted = await service.DeleteAsync(transacaoId, usuario.Id);

        Assert.True(deleted);

        Context.ChangeTracker.Clear();
        Assert.Null(await Context.Transacoes.FindAsync(transacaoId));
        Assert.NotNull(await Context.Contas.FindAsync(conta.Id));
    }

    [Fact]
    public async Task DeleteAsync_IdInexistente_DeveRetornarFalse()
    {
        var usuario = await CriarUsuarioAsync();
        var service = new TransacaoService(Context);
        var result = await service.DeleteAsync(999, usuario.Id);
        Assert.False(result);
    }

    [Fact]
    public async Task CreateAsync_ComStatusPendente_DevePersistirCorretamente()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta Pendente", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        var service = new TransacaoService(Context);
        var dto = new CreateTransacaoDto
        {
            Descricao = "Boleto luz",
            Valor = 200m,
            Tipo = TipoTransacao.Saida,
            Status = StatusTransacao.Pendente,
            Data = new DateOnly(2026, 7, 10),
            ContaId = conta.Id
        };

        var (result, error) = await service.CreateAsync(dto, usuario.Id);

        Assert.Null(error);
        Assert.NotNull(result);
        Assert.Equal(StatusTransacao.Pendente, result!.Status);

        Context.ChangeTracker.Clear();
        var persisted = await Context.Transacoes.FindAsync(result.Id);
        Assert.NotNull(persisted);
        Assert.Equal(StatusTransacao.Pendente, persisted!.Status);
    }

    [Fact]
    public async Task GetAllAsync_ComFiltroStatus_DeveRetornarApenasStatusSolicitado()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta Status", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        Context.Transacoes.AddRange(
            new Transacao { Descricao = "Pago 1", Valor = 100m, Tipo = TipoTransacao.Saida, Status = StatusTransacao.Pago, Data = new DateOnly(2026, 7, 1), ContaId = conta.Id },
            new Transacao { Descricao = "Pendente 1", Valor = 200m, Tipo = TipoTransacao.Saida, Status = StatusTransacao.Pendente, Data = new DateOnly(2026, 7, 2), ContaId = conta.Id },
            new Transacao { Descricao = "Pago 2", Valor = 300m, Tipo = TipoTransacao.Entrada, Status = StatusTransacao.Pago, Data = new DateOnly(2026, 7, 3), ContaId = conta.Id }
        );
        await Context.SaveChangesAsync();

        var service = new TransacaoService(Context);

        var resultadoPendentes = await service.GetAllAsync(usuario.Id, conta.Id, status: StatusTransacao.Pendente);
        Assert.Single(resultadoPendentes.Data);
        Assert.Equal("Pendente 1", resultadoPendentes.Data[0].Descricao);
        Assert.Equal(StatusTransacao.Pendente, resultadoPendentes.Data[0].Status);

        var resultadoPagos = await service.GetAllAsync(usuario.Id, conta.Id, status: StatusTransacao.Pago);
        Assert.Equal(2, resultadoPagos.Data.Count);
        Assert.All(resultadoPagos.Data, t => Assert.Equal(StatusTransacao.Pago, t.Status));

        var resultadoTodos = await service.GetAllAsync(usuario.Id, conta.Id, status: null);
        Assert.Equal(3, resultadoTodos.Data.Count);
    }

    [Fact]
    public async Task GetByIdAsync_DeveRetornarStatusCorretamente()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta GetById", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        var transacao = new Transacao
        {
            Descricao = "Boleto",
            Valor = 150m,
            Tipo = TipoTransacao.Saida,
            Status = StatusTransacao.Pendente,
            Data = new DateOnly(2026, 7, 15),
            ContaId = conta.Id
        };
        Context.Transacoes.Add(transacao);
        await Context.SaveChangesAsync();

        var service = new TransacaoService(Context);
        var result = await service.GetByIdAsync(transacao.Id, usuario.Id);

        Assert.NotNull(result);
        Assert.Equal(StatusTransacao.Pendente, result!.Status);
    }

    [Fact]
    public async Task UpdateAsync_DeveAtualizarStatus()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta Upd", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        var transacao = new Transacao
        {
            Descricao = "Boleto",
            Valor = 150m,
            Tipo = TipoTransacao.Saida,
            Status = StatusTransacao.Pendente,
            Data = new DateOnly(2026, 7, 15),
            ContaId = conta.Id
        };
        Context.Transacoes.Add(transacao);
        await Context.SaveChangesAsync();

        var service = new TransacaoService(Context);
        var dto = new UpdateTransacaoDto
        {
            Descricao = "Boleto Pago",
            Valor = 150m,
            Tipo = TipoTransacao.Saida,
            Status = StatusTransacao.Pago,
            Data = new DateOnly(2026, 7, 15),
            ContaId = conta.Id
        };

        var (found, error) = await service.UpdateAsync(transacao.Id, dto, usuario.Id);

        Assert.True(found);
        Assert.Null(error);

        Context.ChangeTracker.Clear();
        var persisted = await Context.Transacoes.FindAsync(transacao.Id);
        Assert.NotNull(persisted);
        Assert.Equal(StatusTransacao.Pago, persisted!.Status);
        Assert.Equal("Boleto Pago", persisted.Descricao);
    }

    [Fact]
    public async Task UpdateStatusAsync_DeveAtualizarApenasOStatus()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta Status", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        var transacao = new Transacao
        {
            Descricao = "Fatura Cartao",
            Valor = 1500m,
            Tipo = TipoTransacao.Saida,
            Status = StatusTransacao.Pendente,
            Data = new DateOnly(2026, 7, 20),
            ContaId = conta.Id
        };
        Context.Transacoes.Add(transacao);
        await Context.SaveChangesAsync();

        var service = new TransacaoService(Context);
        var (found, error) = await service.UpdateStatusAsync(transacao.Id, StatusTransacao.Pago, usuario.Id);

        Assert.True(found);
        Assert.Null(error);

        Context.ChangeTracker.Clear();
        var persisted = await Context.Transacoes.FindAsync(transacao.Id);
        Assert.NotNull(persisted);
        Assert.Equal(StatusTransacao.Pago, persisted!.Status);
        Assert.Equal("Fatura Cartao", persisted.Descricao);
        Assert.Equal(1500m, persisted.Valor);
    }

    [Fact]
    public async Task UpdateStatusAsync_TransacaoInexistente_DeveRetornarNotFound()
    {
        var usuario = await CriarUsuarioAsync();
        var service = new TransacaoService(Context);
        var (found, error) = await service.UpdateStatusAsync(999, StatusTransacao.Pago, usuario.Id);

        Assert.False(found);
        Assert.Null(error);
    }

    [Fact]
    public async Task UpdateStatusAsync_OutroUsuario_DeveRetornarErroOuNotFound()
    {
        var usuario1 = await CriarUsuarioAsync("u1@finsync.com");
        var usuario2 = await CriarUsuarioAsync("u2@finsync.com");
        var conta = new Conta { Nome = "Conta U1", Tipo = TipoConta.Pessoal, UsuarioId = usuario1.Id };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        var transacao = new Transacao
        {
            Descricao = "Privado",
            Valor = 100m,
            Tipo = TipoTransacao.Saida,
            Status = StatusTransacao.Pendente,
            Data = new DateOnly(2026, 7, 20),
            ContaId = conta.Id
        };
        Context.Transacoes.Add(transacao);
        await Context.SaveChangesAsync();

        var service = new TransacaoService(Context);
        var (found, error) = await service.UpdateStatusAsync(transacao.Id, StatusTransacao.Pago, usuario2.Id);

        Assert.False(found);
        Assert.Equal("Transação não encontrada.", error);
    }

    [Fact]
    public async Task ExportarCsvAsync_DeveConterCabecalhoEColunaStatus()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta CSV", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);
        var categoria = new Categoria { Nome = "Utilidades", Cor = "#FF0000", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id };
        Context.Categorias.Add(categoria);
        await Context.SaveChangesAsync();

        Context.Transacoes.AddRange(
            new Transacao { Descricao = "Luz", Valor = 120m, Tipo = TipoTransacao.Saida, Status = StatusTransacao.Pendente, Data = new DateOnly(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 5), ContaId = conta.Id, CategoriaId = categoria.Id },
            new Transacao { Descricao = "Salario", Valor = 5000m, Tipo = TipoTransacao.Entrada, Status = StatusTransacao.Pago, Data = new DateOnly(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1), ContaId = conta.Id }
        );
        await Context.SaveChangesAsync();

        var service = new TransacaoService(Context);
        using var ms = new MemoryStream();
        await service.ExportarCsvAsync(conta.Id, "mes_atual", usuario.Id, ms);
        var csv = System.Text.Encoding.UTF8.GetString(ms.ToArray());

        Assert.Contains("Id,Data,Descricao,Categoria,Conta,Tipo,Valor,Status,Parcela", csv);
        Assert.Contains("Conta CSV", csv);
        Assert.Contains("Utilidades", csv);
        Assert.Contains("Pendente", csv);
        Assert.Contains("Pago", csv);
    }

    [Fact]
    public async Task ExportarCsvAsync_ComPeriodo30dEComDataCustomizada_DeveFiltrarCorretamente()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta Teste", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        var hoje = DateOnly.FromDateTime(DateTime.Today);
        Context.Transacoes.AddRange(
            new Transacao { Descricao = "Dentro 30d", Valor = 50m, Tipo = TipoTransacao.Saida, Status = StatusTransacao.Pago, Data = hoje.AddDays(-10), ContaId = conta.Id },
            new Transacao { Descricao = "Fora 30d", Valor = 100m, Tipo = TipoTransacao.Saida, Status = StatusTransacao.Pago, Data = hoje.AddDays(-60), ContaId = conta.Id }
        );
        await Context.SaveChangesAsync();

        var service = new TransacaoService(Context);

        // Teste com periodo 30d
        using var ms30d = new MemoryStream();
        await service.ExportarCsvAsync(conta.Id, "30d", usuario.Id, ms30d);
        var csv30d = System.Text.Encoding.UTF8.GetString(ms30d.ToArray());
        Assert.Contains("Dentro 30d", csv30d);
        Assert.DoesNotContain("Fora 30d", csv30d);

        // Teste com datas customizadas
        using var msCustom = new MemoryStream();
        await service.ExportarCsvAsync(conta.Id, "mes_atual", usuario.Id, msCustom, dataInicio: hoje.AddDays(-70), dataFim: hoje.AddDays(-50));
        var csvCustom = System.Text.Encoding.UTF8.GetString(msCustom.ToArray());
        Assert.Contains("Fora 30d", csvCustom);
        Assert.DoesNotContain("Dentro 30d", csvCustom);
    }

    [Fact]
    public async Task CreateAsync_ComParcelamento_DeveCriarTodasAsParcelasComDatasESaldoCorretos()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta Cartao", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        var service = new TransacaoService(Context);
        var dto = new CreateTransacaoDto
        {
            Descricao = "Notebook Dell",
            Valor = 100m,
            Tipo = TipoTransacao.Saida,
            Status = StatusTransacao.Pago,
            Data = new DateOnly(2026, 8, 15),
            ContaId = conta.Id,
            Parcelado = true,
            TotalParcelas = 3,
            ModoValorParcelamento = "Total"
        };

        var (result, error) = await service.CreateAsync(dto, usuario.Id);

        Assert.Null(error);
        Assert.NotNull(result);
        Assert.Equal("Notebook Dell (01/03)", result!.Descricao);
        Assert.Equal(33.34m, result.Valor); // 100 / 3 = 33.33 + 0.01 resto
        Assert.Equal(StatusTransacao.Pago, result.Status);
        Assert.NotNull(result.ParcelamentoId);
        Assert.Equal(1, result.NumeroParcela);
        Assert.Equal(3, result.TotalParcelas);

        Context.ChangeTracker.Clear();
        var parcelas = Context.Transacoes
            .Where(t => t.ParcelamentoId == result.ParcelamentoId)
            .OrderBy(t => t.NumeroParcela)
            .ToList();

        Assert.Equal(3, parcelas.Count);
        Assert.Equal(33.34m, parcelas[0].Valor);
        Assert.Equal(33.33m, parcelas[1].Valor);
        Assert.Equal(33.33m, parcelas[2].Valor);
        Assert.Equal(StatusTransacao.Pago, parcelas[0].Status);
        Assert.Equal(StatusTransacao.Pendente, parcelas[1].Status);
        Assert.Equal(StatusTransacao.Pendente, parcelas[2].Status);
        Assert.Equal(new DateOnly(2026, 8, 15), parcelas[0].Data);
        Assert.Equal(new DateOnly(2026, 9, 15), parcelas[1].Data);
        Assert.Equal(new DateOnly(2026, 10, 15), parcelas[2].Data);
    }

    [Fact]
    public async Task DeleteAsync_ComExcluirTodasParcelas_DeveRemoverTodoOLote()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta Lote", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        var service = new TransacaoService(Context);
        var (result, _) = await service.CreateAsync(new CreateTransacaoDto
        {
            Descricao = "Celular",
            Valor = 1000m,
            Tipo = TipoTransacao.Saida,
            Data = new DateOnly(2026, 8, 1),
            ContaId = conta.Id,
            Parcelado = true,
            TotalParcelas = 2
        }, usuario.Id);

        var deleted = await service.DeleteAsync(result!.Id, usuario.Id, excluirTodasParcelas: true);
        Assert.True(deleted);

        Context.ChangeTracker.Clear();
        var parcelasRestantes = Context.Transacoes.Where(t => t.ParcelamentoId == result.ParcelamentoId).ToList();
        Assert.Empty(parcelasRestantes);
    }

    [Fact]
    public async Task GetSugestoesDescricaoAsync_DeveRetornarMaisFrequentesNoTopo()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta Teste", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        var categoria = new Categoria { Nome = "Alimentacao", Cor = "#FF0000", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);
        Context.Categorias.Add(categoria);
        await Context.SaveChangesAsync();

        // 3x Mercado, 2x Padaria, 1x Farmacia
        for (int i = 0; i < 3; i++)
        {
            Context.Transacoes.Add(new Transacao { Descricao = "Mercado", Valor = 100m, Tipo = TipoTransacao.Saida, ContaId = conta.Id, CategoriaId = categoria.Id, Data = new DateOnly(2026, 8, 1 + i) });
        }
        for (int i = 0; i < 2; i++)
        {
            Context.Transacoes.Add(new Transacao { Descricao = "Padaria", Valor = 30m, Tipo = TipoTransacao.Saida, ContaId = conta.Id, CategoriaId = categoria.Id, Data = new DateOnly(2026, 8, 10 + i) });
        }
        Context.Transacoes.Add(new Transacao { Descricao = "Farmacia", Valor = 50m, Tipo = TipoTransacao.Saida, ContaId = conta.Id, CategoriaId = categoria.Id, Data = new DateOnly(2026, 8, 20) });
        await Context.SaveChangesAsync();

        var service = new TransacaoService(Context);
        var sugestoes = await service.GetSugestoesDescricaoAsync(usuario.Id, conta.Id, TipoTransacao.Saida);

        Assert.Equal(3, sugestoes.Count);
        Assert.Equal("Mercado", sugestoes[0].Descricao);
        Assert.Equal(3, sugestoes[0].TotalUsos);
        Assert.Equal(categoria.Id, sugestoes[0].CategoriaId);

        Assert.Equal("Padaria", sugestoes[1].Descricao);
        Assert.Equal(2, sugestoes[1].TotalUsos);

        Assert.Equal("Farmacia", sugestoes[2].Descricao);
        Assert.Equal(1, sugestoes[2].TotalUsos);
    }

    [Fact]
    public async Task GetSugestoesDescricaoAsync_DeveFiltrarPorTipoEIsolarUsuario()
    {
        var usuario1 = await CriarUsuarioAsync("u1@teste.com");
        var usuario2 = await CriarUsuarioAsync("u2@teste.com");

        var conta1 = new Conta { Nome = "Conta 1", Tipo = TipoConta.Pessoal, UsuarioId = usuario1.Id };
        var conta2 = new Conta { Nome = "Conta 2", Tipo = TipoConta.Pessoal, UsuarioId = usuario2.Id };
        Context.Contas.AddRange(conta1, conta2);
        await Context.SaveChangesAsync();

        Context.Transacoes.Add(new Transacao { Descricao = "Salário Empresa", Valor = 5000m, Tipo = TipoTransacao.Entrada, ContaId = conta1.Id, Data = new DateOnly(2026, 8, 1) });
        Context.Transacoes.Add(new Transacao { Descricao = "Aluguel", Valor = 1500m, Tipo = TipoTransacao.Saida, ContaId = conta1.Id, Data = new DateOnly(2026, 8, 5) });
        Context.Transacoes.Add(new Transacao { Descricao = "Salário Outro Usuário", Valor = 7000m, Tipo = TipoTransacao.Entrada, ContaId = conta2.Id, Data = new DateOnly(2026, 8, 1) });
        await Context.SaveChangesAsync();

        var service = new TransacaoService(Context);

        // Filtrando por Entrada para usuario1
        var sugestoesEntrada = await service.GetSugestoesDescricaoAsync(usuario1.Id, conta1.Id, TipoTransacao.Entrada);
        Assert.Single(sugestoesEntrada);
        Assert.Equal("Salário Empresa", sugestoesEntrada[0].Descricao);

        // Termo de busca
        var sugestoesTermo = await service.GetSugestoesDescricaoAsync(usuario1.Id, null, null, termo: "alug");
        Assert.Single(sugestoesTermo);
        Assert.Equal("Aluguel", sugestoesTermo[0].Descricao);
    }

    [Fact]
    public async Task CriarEmLoteAsync_DeveCriarTransacoesValidasEIsolarUsuario()
    {
        var usuario = await CriarUsuarioAsync();
        var outroUsuario = await CriarUsuarioAsync("outro@teste.com");

        var conta = new Conta { Nome = "Minha Conta", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        var contaOutro = new Conta { Nome = "Conta Outro", Tipo = TipoConta.Pessoal, UsuarioId = outroUsuario.Id };
        Context.Contas.AddRange(conta, contaOutro);

        var categoria = new Categoria { Nome = "Mercado", Cor = "#00FF00", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id };
        Context.Categorias.Add(categoria);
        await Context.SaveChangesAsync();

        var dtos = new List<CreateTransacaoDto>
        {
            new() { Descricao = "Compra 1", Valor = 100m, Tipo = TipoTransacao.Saida, Status = StatusTransacao.Pago, Data = new DateOnly(2026, 9, 1), ContaId = conta.Id, CategoriaId = categoria.Id },
            new() { Descricao = "Compra 2", Valor = 50m, Tipo = TipoTransacao.Saida, Status = StatusTransacao.Pago, Data = new DateOnly(2026, 9, 2), ContaId = conta.Id, CategoriaId = null },
            new() { Descricao = "Tentativa Invasão", Valor = 999m, Tipo = TipoTransacao.Saida, Status = StatusTransacao.Pago, Data = new DateOnly(2026, 9, 3), ContaId = contaOutro.Id }
        };

        var service = new TransacaoService(Context);
        var result = await service.CriarEmLoteAsync(dtos, usuario.Id);

        // Deve criar apenas as 2 transações da conta do usuário, ignorando a conta do outro usuário
        Assert.Equal(2, result.Count);
        Assert.Contains(result, t => t.Descricao == "Compra 1");
        Assert.Contains(result, t => t.Descricao == "Compra 2");
        Assert.DoesNotContain(result, t => t.Descricao == "Tentativa Invasão");

        var noBanco = await Context.Transacoes.Where(t => t.ContaId == conta.Id).ToListAsync();
        Assert.Equal(2, noBanco.Count);
    }
}