namespace FinSync.Features.Auth;

public interface IAuthService
{
    Task<(AuthResponse? Response, string? Error)> RegistrarAsync(RegistrarRequest request);
    Task<(AuthResponse? Response, string? Error)> LoginAsync(LoginRequest request);
    Task<(AuthResponse? Response, string? Error)> LoginGoogleAsync(GoogleLoginRequest request);
    Task<(bool Success, string? Error)> DefinirSenhaAsync(int usuarioId, DefinirSenhaRequest request);
    Task<(bool Success, string? Error)> AlterarSenhaAsync(int usuarioId, AlterarSenhaRequest request);
    Task<(AuthResponse? Response, string? Error)> AtualizarPerfilAsync(int usuarioId, AtualizarPerfilRequest request);
}
