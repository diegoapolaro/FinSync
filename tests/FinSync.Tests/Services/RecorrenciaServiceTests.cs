using FinSync.Enums;
using FinSync.Features.Categorias;
using FinSync.Features.Contas;
using FinSync.Features.Recorrencias;
using FinSync.Tests.Helpers;
using Xunit;

namespace FinSync.Tests.Services;

public class RecorrenciaServiceTests : ServiceTestBase
{
    [Fact]
    public async Task CreateAsync_DeveCriarRegraEProjetarTransacoesFuturas()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta Rec", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        var categoria = new Categoria { Nome = "Assinaturas", Cor = "#1C6CFF", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);
        Context.Categorias.Add(categoria);
        await Context.SaveChangesAsync();

        var service = new RecorrenciaService(Context);
        var dto = new CreateRecorrenciaDto
        {
            Descricao = "Netflix",
            Valor = 55.90m,
            Tipo = TipoTransacao.Saida,
            Frequencia = FrequenciaRecorrencia.Mensal,
            DataInicio = new DateOnly(2026, 8, 1),
            StatusPadrao = StatusTransacao.Pendente,
            ContaId = conta.Id,
            CategoriaId = categoria.Id
        };

        var (result, error) = await service.CreateAsync(dto, usuario.Id);

        Assert.Null(error);
        Assert.NotNull(result);
        Assert.Equal("Netflix", result!.Descricao);
        Assert.Equal(55.90m, result.Valor);
        Assert.Equal(FrequenciaRecorrencia.Mensal, result.Frequencia);
        Assert.True(result.TotalTransacoesGeradas >= 12);

        Context.ChangeTracker.Clear();
        var transacoes = Context.Transacoes.Where(t => t.RecorrenciaId == result.Id).ToList();
        Assert.True(transacoes.Count >= 12);
        Assert.All(transacoes, t => Assert.Equal(55.90m, t.Valor));
        Assert.All(transacoes, t => Assert.Equal(conta.Id, t.ContaId));
    }

    [Fact]
    public async Task GetResumoAsync_DeveCalcularMetricasMensais()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta Principal", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        var service = new RecorrenciaService(Context);

        // Salário mensal R$ 5.000
        await service.CreateAsync(new CreateRecorrenciaDto
        {
            Descricao = "Salário",
            Valor = 5000m,
            Tipo = TipoTransacao.Entrada,
            Frequencia = FrequenciaRecorrencia.Mensal,
            DataInicio = new DateOnly(2026, 8, 1),
            ContaId = conta.Id
        }, usuario.Id);

        // Aluguel mensal R$ 1.500
        await service.CreateAsync(new CreateRecorrenciaDto
        {
            Descricao = "Aluguel",
            Valor = 1500m,
            Tipo = TipoTransacao.Saida,
            Frequencia = FrequenciaRecorrencia.Mensal,
            DataInicio = new DateOnly(2026, 8, 1),
            ContaId = conta.Id
        }, usuario.Id);

        // Spotify anual R$ 240 / 12 = R$ 20/mês
        await service.CreateAsync(new CreateRecorrenciaDto
        {
            Descricao = "Spotify Anual",
            Valor = 240m,
            Tipo = TipoTransacao.Saida,
            Frequencia = FrequenciaRecorrencia.Anual,
            DataInicio = new DateOnly(2026, 8, 1),
            ContaId = conta.Id
        }, usuario.Id);

        var resumo = await service.GetResumoAsync(usuario.Id);

        Assert.Equal(5000m, resumo.TotalReceitasFixas);
        Assert.Equal(1520m, resumo.TotalDespesasFixas);
        Assert.Equal(3480m, resumo.SaldoFixo);
        Assert.Equal(3, resumo.TotalAtivas);
        Assert.Equal(0, resumo.TotalPausadas);
    }

    [Fact]
    public async Task ToggleAtivoAsync_DeveAlternarStatus()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        var service = new RecorrenciaService(Context);
        var (criado, _) = await service.CreateAsync(new CreateRecorrenciaDto
        {
            Descricao = "Gympass",
            Valor = 89.90m,
            Tipo = TipoTransacao.Saida,
            Frequencia = FrequenciaRecorrencia.Mensal,
            DataInicio = new DateOnly(2026, 8, 1),
            ContaId = conta.Id
        }, usuario.Id);

        Assert.True(criado!.Ativo);

        var (found, error) = await service.ToggleAtivoAsync(criado.Id, usuario.Id);
        Assert.True(found);
        Assert.Null(error);

        var atualizado = await service.GetByIdAsync(criado.Id, usuario.Id);
        Assert.False(atualizado!.Ativo);
    }

    [Fact]
    public async Task DeleteAsync_ComExcluirFuturas_DeveRemoverRecorrenciaETransacoesFuturas()
    {
        var usuario = await CriarUsuarioAsync();
        var conta = new Conta { Nome = "Conta Del Rec", Tipo = TipoConta.Pessoal, UsuarioId = usuario.Id };
        Context.Contas.Add(conta);
        await Context.SaveChangesAsync();

        var service = new RecorrenciaService(Context);
        var (criado, _) = await service.CreateAsync(new CreateRecorrenciaDto
        {
            Descricao = "Streaming",
            Valor = 30m,
            Tipo = TipoTransacao.Saida,
            Frequencia = FrequenciaRecorrencia.Mensal,
            DataInicio = new DateOnly(2026, 8, 1),
            ContaId = conta.Id
        }, usuario.Id);

        var (found, error) = await service.DeleteAsync(criado!.Id, excluirTransacoesFuturas: true, usuario.Id);

        Assert.True(found);
        Assert.Null(error);

        Context.ChangeTracker.Clear();
        Assert.Null(await Context.Recorrencias.FindAsync(criado.Id));
        var transacoesRestantes = Context.Transacoes.Where(t => t.RecorrenciaId == criado.Id).ToList();
        Assert.Empty(transacoesRestantes);
    }
}
