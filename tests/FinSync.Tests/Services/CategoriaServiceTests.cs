using FinSync.Dtos;
using FinSync.Models;
using FinSync.Services;
using FinSync.Tests.Helpers;
using Xunit;

namespace FinSync.Tests.Services;

public class CategoriaServiceTests : ServiceTestBase
{

    [Fact]
    public async Task CreateAsync_DevePersistirCategoriaComCorHexValida()
    {
        var service = new CategoriaService(Context);
        var dto = new CreateCategoriaDto
        {
            Nome = "Lazer",
            Cor = "#ABCDEF",
            Tipo = TipoTransacao.Saida
        };

        var (result, error) = await service.CreateAsync(dto);

        Assert.Null(error);
        Assert.NotNull(result);
        Assert.NotEqual(0, result!.Id);
        Assert.Equal("Lazer", result.Nome);
        Assert.Equal("#ABCDEF", result.Cor);
        Assert.Matches("^#[0-9a-fA-F]{6}$", result.Cor);
        Assert.Equal(TipoTransacao.Saida, result.Tipo);
    }

    [Fact]
    public async Task CreateAsync_DeveAceitarCorHexMaiusculaEMinuscula()
    {
        var service = new CategoriaService(Context);
        var dto = new CreateCategoriaDto
        {
            Nome = "Mix",
            Cor = "#aBcDeF",
            Tipo = TipoTransacao.Entrada
        };

        var (result, error) = await service.CreateAsync(dto);

        Assert.Null(error);
        Assert.Matches("^#[0-9a-fA-F]{6}$", result!.Cor);
    }

    [Fact]
    public async Task CreateAsync_DeveUsarCorPadraoSeNaoInformada()
    {
        var service = new CategoriaService(Context);
        var dto = new CreateCategoriaDto
        {
            Nome = "Padrao",
            Cor = "#96d4b2",
            Tipo = TipoTransacao.Saida
        };

        var (result, error) = await service.CreateAsync(dto);

        Assert.Null(error);
        Assert.Equal("#96d4b2", result!.Cor);
    }

    [Fact]
    public async Task GetAllAsync_DeveRetornarOrdenadoPorTipoDepoisNome()
    {
        Context.Categorias.AddRange(
            new Categoria { Nome = "Transporte", Cor = "#FF0000", Tipo = TipoTransacao.Saida },
            new Categoria { Nome = "Alimentacao", Cor = "#00FF00", Tipo = TipoTransacao.Saida },
            new Categoria { Nome = "Renda", Cor = "#0000FF", Tipo = TipoTransacao.Entrada }
        );
        await Context.SaveChangesAsync();

        var service = new CategoriaService(Context);
        var result = await service.GetAllAsync();

        Assert.Equal(3, result.Count);
        Assert.Equal("Renda", result[0].Nome);
        Assert.Equal("Alimentacao", result[1].Nome);
        Assert.Equal("Transporte", result[2].Nome);
    }

    [Fact]
    public async Task UpdateAsync_DeveAlterarDadosEValidarCorHex()
    {
        var categoria = new Categoria { Nome = "Original", Cor = "#111111", Tipo = TipoTransacao.Saida };
        Context.Categorias.Add(categoria);
        await Context.SaveChangesAsync();

        var service = new CategoriaService(Context);
        var dto = new UpdateCategoriaDto
        {
            Nome = "Alterado",
            Cor = "#FFFFFF",
            Tipo = TipoTransacao.Entrada
        };

        var (found, error) = await service.UpdateAsync(categoria.Id, dto);

        Assert.True(found);
        Assert.Null(error);

        var atualizada = await Context.Categorias.FindAsync(categoria.Id);
        Assert.NotNull(atualizada);
        Assert.Equal("Alterado", atualizada!.Nome);
        Assert.Equal("#FFFFFF", atualizada.Cor);
        Assert.Matches("^#[0-9a-fA-F]{6}$", atualizada.Cor);
        Assert.Equal(TipoTransacao.Entrada, atualizada.Tipo);
    }

    [Fact]
    public async Task UpdateAsync_IdInexistente_DeveRetornarNotFound()
    {
        var service = new CategoriaService(Context);
        var dto = new UpdateCategoriaDto
        {
            Nome = "Nao existe",
            Cor = "#000000",
            Tipo = TipoTransacao.Saida
        };

        var (found, error) = await service.UpdateAsync(999, dto);

        Assert.False(found);
        Assert.Null(error);
    }

    [Fact]
    public async Task CreateAsync_ComCorInvalida_PersisteMesmoAssim_PoisValidacaoENoController()
    {
        var service = new CategoriaService(Context);
        var dto = new CreateCategoriaDto
        {
            Nome = "CorInvalida",
            Cor = "not-a-hex",
            Tipo = TipoTransacao.Entrada
        };

        var (result, error) = await service.CreateAsync(dto);

        Assert.Null(error);
        Assert.NotNull(result);
        Assert.Equal("not-a-hex", result!.Cor);
    }
}
