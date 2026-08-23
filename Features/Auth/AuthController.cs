using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinSync.Features.Auth;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("registrar")]
    public async Task<ActionResult<AuthResponse>> Registrar(RegistrarRequest request)
    {
        var (response, error) = await authService.RegistrarAsync(request);
        if (error is not null) return BadRequest(new { error });
        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var (response, error) = await authService.LoginAsync(request);
        if (error is not null) return Unauthorized(new { error });
        return Ok(response);
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
}