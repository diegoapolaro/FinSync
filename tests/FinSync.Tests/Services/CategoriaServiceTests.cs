using FinSync.Enums;
using FinSync.Features.Categorias;
using FinSync.Tests.Helpers;
using Xunit;

namespace FinSync.Tests.Services;

public class CategoriaServiceTests : ServiceTestBase
{
    [Fact]
    public async Task CreateAsync_DevePersistirCategoriaComCorHexValida()
    {
        var usuario = await CriarUsuarioAsync();
        var service = new CategoriaService(Context);
        var dto = new CreateCategoriaDto
        {
            Nome = "Lazer",
            Cor = "#ABCDEF",
            Tipo = TipoTransacao.Saida
        };

        var (result, error) = await service.CreateAsync(dto, usuario.Id);

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
        var usuario = await CriarUsuarioAsync();
        var service = new CategoriaService(Context);
        var dto = new CreateCategoriaDto
        {
            Nome = "Mix",
            Cor = "#aBcDeF",
            Tipo = TipoTransacao.Entrada
        };

        var (result, error) = await service.CreateAsync(dto, usuario.Id);

        Assert.Null(error);
        Assert.Matches("^#[0-9a-fA-F]{6}$", result!.Cor);
    }

    [Fact]
    public async Task CreateAsync_DeveUsarCorPadraoSeNaoInformada()
    {
        var usuario = await CriarUsuarioAsync();
        var service = new CategoriaService(Context);
        var dto = new CreateCategoriaDto
        {
            Nome = "Padrao",
            Tipo = TipoTransacao.Saida
        };

        var (result, error) = await service.CreateAsync(dto, usuario.Id);

        Assert.Null(error);
        Assert.Equal("#96d4b2", result!.Cor);
    }

    [Fact]
    public async Task GetAllAsync_DeveRetornarOrdenadoPorTipoDepoisNome()
    {
        var usuario = await CriarUsuarioAsync();
        Context.Categorias.AddRange(
            new Categoria { Nome = "Transporte", Cor = "#FF0000", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id },
            new Categoria { Nome = "Alimentacao", Cor = "#00FF00", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id },
            new Categoria { Nome = "Renda", Cor = "#0000FF", Tipo = TipoTransacao.Entrada, UsuarioId = usuario.Id }
        );
        await Context.SaveChangesAsync();

        var service = new CategoriaService(Context);
        var result = await service.GetAllAsync(usuario.Id);

        Assert.Equal(3, result.Count);
        Assert.Equal("Renda", result[0].Nome);
        Assert.Equal("Alimentacao", result[1].Nome);
        Assert.Equal("Transporte", result[2].Nome);
    }

    [Fact]
    public async Task GetAllAsync_NaoDeveRetornarCategoriasDeOutroUsuario()
    {
        var usuario = await CriarUsuarioAsync();
        var outroUsuario = await CriarUsuarioAsync("outro@finsync.com");
        Context.Categorias.AddRange(
            new Categoria { Nome = "Minha", Cor = "#111111", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id },
            new Categoria { Nome = "De Outro", Cor = "#222222", Tipo = TipoTransacao.Saida, UsuarioId = outroUsuario.Id }
        );
        await Context.SaveChangesAsync();

        var service = new CategoriaService(Context);
        var result = await service.GetAllAsync(usuario.Id);

        Assert.Single(result);
        Assert.Equal("Minha", result[0].Nome);
    }

    [Fact]
    public async Task UpdateAsync_DeveAlterarDadosEValidarCorHex()
    {
        var usuario = await CriarUsuarioAsync();
        var categoria = new Categoria { Nome = "Original", Cor = "#111111", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id };
        Context.Categorias.Add(categoria);
        await Context.SaveChangesAsync();

        var service = new CategoriaService(Context);
        var dto = new UpdateCategoriaDto
        {
            Nome = "Alterado",
            Cor = "#FFFFFF",
            Tipo = TipoTransacao.Entrada
        };

        var (found, error) = await service.UpdateAsync(categoria.Id, dto, usuario.Id);

        Assert.True(found);
        Assert.Null(error);

        Context.ChangeTracker.Clear();
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
        var usuario = await CriarUsuarioAsync();
        var service = new CategoriaService(Context);
        var dto = new UpdateCategoriaDto
        {
            Nome = "Nao existe",
            Cor = "#000000",
            Tipo = TipoTransacao.Saida
        };

        var (found, error) = await service.UpdateAsync(999, dto, usuario.Id);

        Assert.False(found);
        Assert.Null(error);
    }

    [Fact]
    public async Task UpdateAsync_CategoriaDeOutroUsuario_DeveRetornarNotFound()
    {
        var usuario = await CriarUsuarioAsync();
        var outroUsuario = await CriarUsuarioAsync("outro@finsync.com");
        var categoria = new Categoria { Nome = "Alheia", Cor = "#111111", Tipo = TipoTransacao.Saida, UsuarioId = outroUsuario.Id };
        Context.Categorias.Add(categoria);
        await Context.SaveChangesAsync();

        var service = new CategoriaService(Context);
        var dto = new UpdateCategoriaDto
        {
            Nome = "Invasao",
            Cor = "#000000",
            Tipo = TipoTransacao.Saida
        };

        var (found, error) = await service.UpdateAsync(categoria.Id, dto, usuario.Id);

        Assert.False(found);
        Assert.Null(error);
    }

    [Fact]
    public async Task DeleteAsync_DeveRemoverCategoriaPropria()
    {
        var usuario = await CriarUsuarioAsync();
        var categoria = new Categoria { Nome = "DeleteMe", Cor = "#ABCDEF", Tipo = TipoTransacao.Saida, UsuarioId = usuario.Id };
        Context.Categorias.Add(categoria);
        await Context.SaveChangesAsync();

        var service = new CategoriaService(Context);
        var removed = await service.DeleteAsync(categoria.Id, usuario.Id);

        Assert.True(removed);
        Assert.Null(await Context.Categorias.FindAsync(categoria.Id));
    }

    [Fact]
    public async Task DeleteAsync_CategoriaDeOutroUsuario_DeveRetornarFalse()
    {
        var usuario = await CriarUsuarioAsync();
        var outroUsuario = await CriarUsuarioAsync("outro@finsync.com");
        var categoria = new Categoria { Nome = "Alheia", Cor = "#112233", Tipo = TipoTransacao.Saida, UsuarioId = outroUsuario.Id };
        Context.Categorias.Add(categoria);
        await Context.SaveChangesAsync();

        var service = new CategoriaService(Context);
        var removed = await service.DeleteAsync(categoria.Id, usuario.Id);

        Assert.False(removed);
        Assert.NotNull(await Context.Categorias.FindAsync(categoria.Id));
    }

    [Fact]
    public async Task CreateAsync_ComCorInvalida_PersisteMesmoAssim_PoisValidacaoENoController()
    {
        var usuario = await CriarUsuarioAsync();
        var service = new CategoriaService(Context);
        var dto = new CreateCategoriaDto
        {
            Nome = "CorInvalida",
            Cor = "not-a-hex",
            Tipo = TipoTransacao.Entrada
        };

        var (result, error) = await service.CreateAsync(dto, usuario.Id);

        Assert.Null(error);
        Assert.NotNull(result);
        Assert.Equal("not-a-hex", result!.Cor);
    }
}