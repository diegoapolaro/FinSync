using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FinSync.Data;
using FinSync.Dtos;
using FinSync.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace FinSync.Services;

public class AuthService(FinSyncDbContext context, IConfiguration configuration)
{
    public async Task<(AuthResponse? Response, string? Error)> RegistrarAsync(RegistrarRequest request)
    {
        if (await context.Usuarios.AnyAsync(u => u.Email == request.Email))
        {
            return (null, "Este email já está cadastrado.");
        }

        var usuario = new Usuario
        {
            Nome = request.Nome,
            Email = request.Email,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.Senha),
            DataCriacao = DateTime.UtcNow
        };

        context.Usuarios.Add(usuario);
        await context.SaveChangesAsync();

        var token = GerarToken(usuario);

        return (new AuthResponse
        {
            Token = token,
            Nome = usuario.Nome,
            Email = usuario.Email
        }, null);
    }

    public async Task<(AuthResponse? Response, string? Error)> LoginAsync(LoginRequest request)
    {
        var usuario = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (usuario is null || !BCrypt.Net.BCrypt.Verify(request.Senha, usuario.SenhaHash))
        {
            return (null, "Email ou senha inválidos.");
        }

        var token = GerarToken(usuario);

        return (new AuthResponse
        {
            Token = token,
            Nome = usuario.Nome,
            Email = usuario.Email
        }, null);
    }

    private string GerarToken(Usuario usuario)
    {
        var jwtSettings = configuration.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.Nome),
            new Claim(ClaimTypes.Email, usuario.Email)
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}