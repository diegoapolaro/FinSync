using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FinSync.Features.Auth;
using FinSync.Tests.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace FinSync.Tests.Services;

public class AuthServiceTests : ServiceTestBase
{
    private AuthService CreateService(IConfiguration configuration)
    {
        return new AuthService(Context, configuration);
    }

    private IConfiguration CreateConfiguration()
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "finsync-test-super-secret-key-1234567890-abc",
                ["Jwt:Issuer"] = "FinSync",
                ["Jwt:Audience"] = "FinSyncUsers",
                ["Google:ClientId"] = "test-google-client-id"
            })
            .Build();
    }

    [Fact]
    public async Task RegistrarAsync_DeveCriarUsuarioERetornarToken()
    {
        var configuration = CreateConfiguration();
        var service = CreateService(configuration);

        var request = new RegistrarRequest
        {
            Nome = "Teste",
            Email = "teste@finsync.com",
            Senha = "Senha123!"
        };

        var (response, error) = await service.RegistrarAsync(request);

        Assert.Null(error);
        Assert.NotNull(response);
        Assert.Equal(request.Nome, response!.Nome);
        Assert.Equal(request.Email, response.Email);
        Assert.False(string.IsNullOrWhiteSpace(response.Token));

        var usuario = await Context.Usuarios.FirstOrDefaultAsync(u => u.Email == request.Email);
        Assert.NotNull(usuario);
        Assert.NotEqual(request.Senha, usuario!.SenhaHash);
        Assert.True(BCrypt.Net.BCrypt.Verify(request.Senha, usuario.SenhaHash));

        // Provisionamento inicial
        var contaPadrao = await Context.Contas.FirstOrDefaultAsync(c => c.UsuarioId == usuario.Id);
        Assert.NotNull(contaPadrao);
        Assert.Equal("Pessoal", contaPadrao!.Nome);
        Assert.Equal(FinSync.Enums.TipoConta.Pessoal, contaPadrao.Tipo);

        var categorias = await Context.Categorias.Where(c => c.UsuarioId == usuario.Id).ToListAsync();
        Assert.NotEmpty(categorias);
        Assert.Contains(categorias, c => c.Nome == "Alimentação" && c.Tipo == FinSync.Enums.TipoTransacao.Saida);
        Assert.Contains(categorias, c => c.Nome == "Salário" && c.Tipo == FinSync.Enums.TipoTransacao.Entrada);
    }

    [Fact]
    public async Task RegistrarAsync_EmailDuplicado_DeveRetornarErroSemExcecao500()
    {
        var usuario = await CriarUsuarioAsync("duplicado@finsync.com");
        var configuration = CreateConfiguration();
        var service = CreateService(configuration);

        var request = new RegistrarRequest
        {
            Nome = "Outro",
            Email = usuario.Email,
            Senha = "Senha123!"
        };

        var (response, error) = await service.RegistrarAsync(request);

        Assert.Null(response);
        Assert.Equal("Este email já está cadastrado.", error);
    }

    [Fact]
    public async Task LoginAsync_DeveRetornarTokenParaCredenciaisValidas()
    {
        var configuration = CreateConfiguration();
        var service = CreateService(configuration);
        var senha = "Senha123!";
        var usuario = await CriarUsuarioAsync("login@finsync.com");
        usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(senha);
        await Context.SaveChangesAsync();

        var request = new LoginRequest
        {
            Email = usuario.Email,
            Senha = senha
        };

        var (response, error) = await service.LoginAsync(request);

        Assert.Null(error);
        Assert.NotNull(response);
        Assert.Equal(usuario.Email, response!.Email);
        Assert.Equal(usuario.Nome, response.Nome);
        Assert.False(string.IsNullOrWhiteSpace(response.Token));

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(response.Token);
        Assert.Equal(usuario.Id.ToString(), jwt.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value);
        Assert.Equal(usuario.Nome, jwt.Claims.First(c => c.Type == ClaimTypes.Name).Value);
        Assert.Equal(usuario.Email, jwt.Claims.First(c => c.Type == ClaimTypes.Email).Value);
        Assert.True(jwt.ValidTo > DateTime.UtcNow.AddDays(6));
    }

    [Fact]
    public async Task LoginAsync_ComExpiryInDaysCustomizado_DeveConfigurarExpiracaoCorreta()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "finsync-test-super-secret-key-1234567890-abc",
                ["Jwt:Issuer"] = "FinSync",
                ["Jwt:Audience"] = "FinSyncUsers",
                ["Jwt:ExpiryInDays"] = "14"
            })
            .Build();
        var service = CreateService(configuration);
        var senha = "Senha123!";
        var usuario = await CriarUsuarioAsync("expcustom@finsync.com");
        usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(senha);
        await Context.SaveChangesAsync();

        var (response, error) = await service.LoginAsync(new LoginRequest { Email = usuario.Email, Senha = senha });

        Assert.Null(error);
        Assert.NotNull(response);
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(response!.Token);
        Assert.True(jwt.ValidTo > DateTime.UtcNow.AddDays(13));
    }

    [Fact]
    public async Task LoginAsync_SenhaInvalida_DeveRetornarErro()
    {
        var configuration = CreateConfiguration();
        var service = CreateService(configuration);
        var usuario = await CriarUsuarioAsync("loginfail@finsync.com");
        usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword("Senha123!");
        await Context.SaveChangesAsync();

        var request = new LoginRequest
        {
            Email = usuario.Email,
            Senha = "SenhaErrada"
        };

        var (response, error) = await service.LoginAsync(request);

        Assert.Null(response);
        Assert.Equal("Email ou senha inválidos.", error);
    }

    [Fact]
    public async Task AlterarSenhaAsync_SenhaAtualCorreta_DeveAtualizarSenhaComSucesso()
    {
        var configuration = CreateConfiguration();
        var service = CreateService(configuration);
        var senhaAntiga = "Senha123!";
        var senhaNova = "NovaSenha456!";
        var usuario = await CriarUsuarioAsync("alterarsenha@finsync.com");
        usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(senhaAntiga);
        await Context.SaveChangesAsync();

        var request = new AlterarSenhaRequest
        {
            SenhaAtual = senhaAntiga,
            NovaSenha = senhaNova
        };

        var (success, error) = await service.AlterarSenhaAsync(usuario.Id, request);

        Assert.True(success);
        Assert.Null(error);

        var usuarioAtualizado = await Context.Usuarios.FindAsync(usuario.Id);
        Assert.NotNull(usuarioAtualizado);
        Assert.True(BCrypt.Net.BCrypt.Verify(senhaNova, usuarioAtualizado!.SenhaHash));
    }

    [Fact]
    public async Task AlterarSenhaAsync_SenhaAtualIncorreta_DeveRetornarErro()
    {
        var configuration = CreateConfiguration();
        var service = CreateService(configuration);
        var usuario = await CriarUsuarioAsync("alterarsenhainvalida@finsync.com");
        usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword("SenhaCorreta123!");
        await Context.SaveChangesAsync();

        var request = new AlterarSenhaRequest
        {
            SenhaAtual = "SenhaErrada!",
            NovaSenha = "NovaSenha456!"
        };

        var (success, error) = await service.AlterarSenhaAsync(usuario.Id, request);

        Assert.False(success);
        Assert.Equal("Senha atual incorreta.", error);
    }

    [Fact]
    public async Task AlterarSenhaAsync_UsuarioInexistente_DeveRetornarErro()
    {
        var configuration = CreateConfiguration();
        var service = CreateService(configuration);

        var request = new AlterarSenhaRequest
        {
            SenhaAtual = "QualquerSenha",
            NovaSenha = "NovaSenha456!"
        };

        var (success, error) = await service.AlterarSenhaAsync(99999, request);

        Assert.False(success);
        Assert.Equal("Usuário não encontrado.", error);
    }

    [Fact]
    public async Task LoginAsync_ContaSemSenha_DeveRetornarErroEspecifico()
    {
        var configuration = CreateConfiguration();
        var service = CreateService(configuration);
        var usuario = await CriarUsuarioAsync("google@finsync.com");
        usuario.SenhaHash = null;
        await Context.SaveChangesAsync();

        var request = new LoginRequest
        {
            Email = usuario.Email,
            Senha = "QualquerSenha123"
        };

        var (response, error) = await service.LoginAsync(request);

        Assert.Null(response);
        Assert.Contains("Google", error);
    }

    [Fact]
    public async Task LoginAsync_UsuarioInexistente_NaoDeveLancarExcecao()
    {
        var configuration = CreateConfiguration();
        var service = CreateService(configuration);

        var request = new LoginRequest
        {
            Email = "naoexiste@finsync.com",
            Senha = "QualquerSenha123"
        };

        var (response, error) = await service.LoginAsync(request);

        Assert.Null(response);
        Assert.Equal("Email ou senha inválidos.", error);
    }

    [Fact]
    public async Task DefinirSenhaAsync_ContaSemSenha_DeveDefinirComSucesso()
    {
        var configuration = CreateConfiguration();
        var service = CreateService(configuration);
        var usuario = await CriarUsuarioAsync("definirsenha@finsync.com");
        usuario.SenhaHash = null;
        await Context.SaveChangesAsync();

        var request = new DefinirSenhaRequest
        {
            NovaSenha = "NovaSenha123!"
        };

        var (success, error) = await service.DefinirSenhaAsync(usuario.Id, request);

        Assert.True(success);
        Assert.Null(error);

        var usuarioAtualizado = await Context.Usuarios.FindAsync(usuario.Id);
        Assert.NotNull(usuarioAtualizado);
        Assert.True(BCrypt.Net.BCrypt.Verify("NovaSenha123!", usuarioAtualizado!.SenhaHash!));
    }

    [Fact]
    public async Task DefinirSenhaAsync_ContaComSenha_DeveRetornarErro()
    {
        var configuration = CreateConfiguration();
        var service = CreateService(configuration);
        var usuario = await CriarUsuarioAsync("jacomsenha@finsync.com");
        usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword("SenhaExistente123");
        await Context.SaveChangesAsync();

        var request = new DefinirSenhaRequest
        {
            NovaSenha = "NovaSenha123!"
        };

        var (success, error) = await service.DefinirSenhaAsync(usuario.Id, request);

        Assert.False(success);
        Assert.Contains("já possui", error);
    }
}
