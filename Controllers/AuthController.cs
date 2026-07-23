using FinSync.Dtos;
using FinSync.Services;
using Microsoft.AspNetCore.Mvc;

namespace FinSync.Controllers;

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
}