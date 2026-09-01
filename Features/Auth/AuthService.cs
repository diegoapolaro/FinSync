using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FinSync.Data;
using FinSync.Enums;
using FinSync.Features.Categorias;
using FinSync.Features.Contas;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace FinSync.Features.Auth;

public class AuthService(FinSyncDbContext context, IConfiguration configuration) : IAuthService
{
    private static readonly string DummyHash =
        BCrypt.Net.BCrypt.HashPassword("timing-attack-prevention");

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
        try
        {
            await context.SaveChangesAsync();
            await ProvisionarDadosIniciaisAsync(usuario.Id);
        }
        catch (DbUpdateException)
        {
            if (await context.Usuarios.AnyAsync(u => u.Email == request.Email))
            {
                return (null, "Este email já está cadastrado.");
            }
            throw;
        }

        var token = GerarToken(usuario);

        return (new AuthResponse
        {
            Token = token,
            Nome = usuario.Nome,
            Email = usuario.Email,
            FotoUrl = null,
            TemSenha = true
        }, null);
    }

    public async Task<(AuthResponse? Response, string? Error)> LoginAsync(LoginRequest request)
    {
        var usuario = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (usuario is null)
        {
            BCrypt.Net.BCrypt.Verify(request.Senha, DummyHash);
            return (null, "Email ou senha inválidos.");
        }

        if (string.IsNullOrEmpty(usuario.SenhaHash))
        {
            return (null, "Esta conta utiliza login com Google. Use o botão 'Continuar com Google'.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Senha, usuario.SenhaHash))
        {
            return (null, "Email ou senha inválidos.");
        }

        var token = GerarToken(usuario);

        return (new AuthResponse
        {
            Token = token,
            Nome = usuario.Nome,
            Email = usuario.Email,
            FotoUrl = usuario.FotoUrl,
            TemSenha = true
        }, null);
    }

    public async Task<(AuthResponse? Response, string? Error)> LoginGoogleAsync(GoogleLoginRequest request)
    {
        GoogleJsonWebSignature.Payload payload;
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [configuration["Google:ClientId"]!]
            };
            payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
        }
        catch (InvalidJwtException)
        {
            return (null, "Token do Google inválido.");
        }

        var usuario = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == payload.Email);

        if (usuario is null)
        {
            usuario = new Usuario
            {
                Nome = payload.Name ?? payload.Email,
                Email = payload.Email,
                GoogleId = payload.Subject,
                FotoUrl = payload.Picture,
                SenhaHash = null,
                DataCriacao = DateTime.UtcNow
            };
            context.Usuarios.Add(usuario);
            await context.SaveChangesAsync();
            await ProvisionarDadosIniciaisAsync(usuario.Id);
        }
        else if (usuario.GoogleId is null)
        {
            usuario.GoogleId = payload.Subject;
            usuario.FotoUrl ??= payload.Picture;
            await context.SaveChangesAsync();
        }

        var token = GerarToken(usuario);
        return (new AuthResponse
        {
            Token = token,
            Nome = usuario.Nome,
            Email = usuario.Email,
            FotoUrl = usuario.FotoUrl,
            TemSenha = !string.IsNullOrEmpty(usuario.SenhaHash)
        }, null);
    }

    public async Task<(bool Success, string? Error)> DefinirSenhaAsync(int usuarioId, DefinirSenhaRequest request)
    {
        var usuario = await context.Usuarios.FindAsync(usuarioId);
        if (usuario is null)
        {
            return (false, "Usuário não encontrado.");
        }

        if (!string.IsNullOrEmpty(usuario.SenhaHash))
        {
            return (false, "Este usuário já possui uma senha definida. Use a opção de alterar senha.");
        }

        usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.NovaSenha);
        await context.SaveChangesAsync();

        return (true, null);
    }

    public async Task<(bool Success, string? Error)> AlterarSenhaAsync(int usuarioId, AlterarSenhaRequest request)
    {
        var usuario = await context.Usuarios.FindAsync(usuarioId);
        if (usuario is null)
        {
            return (false, "Usuário não encontrado.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.SenhaAtual, usuario.SenhaHash))
        {
            return (false, "Senha atual incorreta.");
        }

        usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.NovaSenha);
        await context.SaveChangesAsync();

        return (true, null);
    }

    private async Task ProvisionarDadosIniciaisAsync(int usuarioId)
    {
        var contaPadrao = new Conta
        {
            Nome = "Pessoal",
            Tipo = TipoConta.Pessoal,
            UsuarioId = usuarioId
        };
        context.Contas.Add(contaPadrao);

        var categoriasPadrao = new List<Categoria>
        {
            new() { Nome = "Alimentação", Cor = "#10b981", Tipo = TipoTransacao.Saida, UsuarioId = usuarioId },
            new() { Nome = "Transporte", Cor = "#f43f5e", Tipo = TipoTransacao.Saida, UsuarioId = usuarioId },
            new() { Nome = "Moradia", Cor = "#3b82f6", Tipo = TipoTransacao.Saida, UsuarioId = usuarioId },
            new() { Nome = "Lazer", Cor = "#a855f7", Tipo = TipoTransacao.Saida, UsuarioId = usuarioId },
            new() { Nome = "Saúde", Cor = "#ec4899", Tipo = TipoTransacao.Saida, UsuarioId = usuarioId },
            new() { Nome = "Outros", Cor = "#64748b", Tipo = TipoTransacao.Saida, UsuarioId = usuarioId },
            new() { Nome = "Salário", Cor = "#f59e0b", Tipo = TipoTransacao.Entrada, UsuarioId = usuarioId },
            new() { Nome = "Vendas", Cor = "#22c55e", Tipo = TipoTransacao.Entrada, UsuarioId = usuarioId },
            new() { Nome = "Investimentos", Cor = "#8b5cf6", Tipo = TipoTransacao.Entrada, UsuarioId = usuarioId },
            new() { Nome = "Outros", Cor = "#64748b", Tipo = TipoTransacao.Entrada, UsuarioId = usuarioId }
        };
        context.Categorias.AddRange(categoriasPadrao);

        await context.SaveChangesAsync();
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

        var expiryDays = configuration.GetValue<int?>("Jwt:ExpiryInDays") ?? 7;
        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expiryDays),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}