namespace FinSync.Features.Contas;

public interface IContaService
{
    Task<List<ContaDto>> GetAllAsync(int usuarioId);
    Task<ContaDto?> GetByIdAsync(int id, int usuarioId);
    Task<bool> ExistsAsync(int id, int usuarioId);
    Task<ContaDto> CreateAsync(CreateContaDto dto, int usuarioId);
    Task<bool> UpdateAsync(int id, UpdateContaDto dto, int usuarioId);
    Task<bool> ToggleArchiveAsync(int id, int usuarioId);
    Task<(bool Success, string? Error)> DeleteAsync(int id, int usuarioId);
    Task<object?> GetResumoAsync(int id, int usuarioId);
}
