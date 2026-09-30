using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FinSync.Features.Auth;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    IAuthService authService,
    IConfiguration configuration,
    IWebHostEnvironment? environment = null) : ControllerBase
{
    [EnableRateLimiting("AuthLimiter")]
    [HttpPost("registrar")]
    public async Task<ActionResult<AuthResponse>> Registrar(RegistrarRequest request)
    {
        var (response, error) = await authService.RegistrarAsync(request);
        if (error is not null) return BadRequest(new { error });

        if (response?.Token is not null)
        {
            SetAuthCookie(response.Token);
        }

        return Ok(response);
    }

    [EnableRateLimiting("AuthLimiter")]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var (response, error) = await authService.LoginAsync(request);
        if (error is not null) return Unauthorized(new { error });

        if (response?.Token is not null)
        {
            SetAuthCookie(response.Token);
        }

        return Ok(response);
    }

    [EnableRateLimiting("AuthLimiter")]
    [HttpPost("google")]
    public async Task<ActionResult<AuthResponse>> LoginGoogle(GoogleLoginRequest request)
    {
        var (response, error) = await authService.LoginGoogleAsync(request);
        if (error is not null) return Unauthorized(new { error });

        if (response?.Token is not null)
        {
            SetAuthCookie(response.Token);
        }

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<AuthResponse>> ObterUsuarioAtual()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(claim, out var usuarioId))
        {
            return Unauthorized();
        }

        var (response, error) = await authService.ObterUsuarioAsync(usuarioId);
        if (error is not null) return Unauthorized(new { error });

        if (response?.Token is not null)
        {
            SetAuthCookie(response.Token);
        }

        return Ok(response);
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        ClearAuthCookie();
        return NoContent();
    }

    [Authorize]
    [HttpPut("alterar-senha")]
    public async Task<IActionResult> AlterarSenha(AlterarSenhaRequest request)
    {
        var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var (success, error) = await authService.AlterarSenhaAsync(usuarioId, request);
        if (!success) return BadRequest(new { error });
        return NoContent();
    }

    [Authorize]
    [HttpPut("definir-senha")]
    public async Task<IActionResult> DefinirSenha(DefinirSenhaRequest request)
    {
        var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var (success, error) = await authService.DefinirSenhaAsync(usuarioId, request);
        if (!success) return BadRequest(new { error });
        return NoContent();
    }

    [Authorize]
    [HttpPut("perfil")]
    public async Task<ActionResult<AuthResponse>> AtualizarPerfil(AtualizarPerfilRequest request)
    {
        var usuarioId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var (response, error) = await authService.AtualizarPerfilAsync(usuarioId, request);
        if (error is not null) return BadRequest(new { error });

        if (response?.Token is not null)
        {
            SetAuthCookie(response.Token);
        }

        return Ok(response);
    }

    private void SetAuthCookie(string token)
    {
        if (string.IsNullOrWhiteSpace(token)) return;

        var expiryDays = configuration?.GetValue<int?>("Jwt:ExpiryInDays") ?? 7;
        var isDev = environment?.IsDevelopment() ?? true;

        var sameSiteConfig = configuration?["Jwt:CookieSameSite"];
        var sameSiteMode = sameSiteConfig?.ToLowerInvariant() switch
        {
            "strict" => SameSiteMode.Strict,
            "none" => SameSiteMode.None,
            _ => SameSiteMode.Lax
        };

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = sameSiteMode == SameSiteMode.None || !isDev,
            SameSite = sameSiteMode,
            Expires = DateTimeOffset.UtcNow.AddDays(expiryDays),
            Path = "/"
        };

        Response.Cookies.Append("finsync_token", token, cookieOptions);
    }

    private void ClearAuthCookie()
    {
        var isDev = environment?.IsDevelopment() ?? true;
        var sameSiteConfig = configuration?["Jwt:CookieSameSite"];
        var sameSiteMode = sameSiteConfig?.ToLowerInvariant() switch
        {
            "strict" => SameSiteMode.Strict,
            "none" => SameSiteMode.None,
            _ => SameSiteMode.Lax
        };

        Response.Cookies.Delete("finsync_token", new CookieOptions
        {
            HttpOnly = true,
            Secure = sameSiteMode == SameSiteMode.None || !isDev,
            SameSite = sameSiteMode,
            Path = "/"
        });
    }
}