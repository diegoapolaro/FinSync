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
                ["Jwt:Audience"] = "FinSyncUsers"
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
}
