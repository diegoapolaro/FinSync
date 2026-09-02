using System.Security.Claims;
using FinSync.Features.Auth;
using FinSync.Tests.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace FinSync.Tests.Controllers;

public class AuthControllerTests : ServiceTestBase
{
    private (AuthController Controller, AuthService Service) CriarController(int usuarioId)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "finsync-test-super-secret-key-1234567890-abc",
                ["Jwt:Issuer"] = "FinSync",
                ["Jwt:Audience"] = "FinSyncUsers",
                ["Google:ClientId"] = "test-google-client-id"
            })
            .Build();

        var service = new AuthService(Context, configuration);
        var controller = new AuthController(service);

        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim(ClaimTypes.NameIdentifier, usuarioId.ToString()),
            new Claim(ClaimTypes.Name, "Usuario Teste")
        ], "mock"));

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };

        return (controller, service);
    }

    [Fact]
    public async Task AtualizarPerfil_ComDadosValidos_DeveRetornarOkComAuthResponse()
    {
        var usuario = await CriarUsuarioAsync("controller-perfil@finsync.com");
        var (controller, _) = CriarController(usuario.Id);

        var request = new AtualizarPerfilRequest
        {
            Nome = "Nome Novo Controller",
            FotoUrl = "https://images.unsplash.com/nova-foto.jpg"
        };

        var result = await controller.AtualizarPerfil(request);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var authResponse = Assert.IsType<AuthResponse>(okResult.Value);
        Assert.Equal("Nome Novo Controller", authResponse.Nome);
        Assert.Equal("https://images.unsplash.com/nova-foto.jpg", authResponse.FotoUrl);
        Assert.False(string.IsNullOrWhiteSpace(authResponse.Token));
    }

    [Fact]
    public async Task AtualizarPerfil_UsuarioInexistente_DeveRetornarBadRequest()
    {
        var (controller, _) = CriarController(99999);

        var request = new AtualizarPerfilRequest
        {
            Nome = "Fantasma",
            FotoUrl = null
        };

        var result = await controller.AtualizarPerfil(request);

        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.NotNull(badRequestResult.Value);
    }
}
