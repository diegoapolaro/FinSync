namespace FinSync.Features.Recorrencias;

public interface IRecorrenciaService
{
    Task<List<RecorrenciaDto>> GetAllAsync(int usuarioId);
    Task<ResumoRecorrenciasDto> GetResumoAsync(int usuarioId);
    Task<RecorrenciaDto?> GetByIdAsync(int id, int usuarioId);
    Task<(RecorrenciaDto? Dto, string? Error)> CreateAsync(CreateRecorrenciaDto dto, int usuarioId);
    Task<(bool Found, string? Error)> UpdateAsync(int id, UpdateRecorrenciaDto dto, int usuarioId);
    Task<(bool Found, string? Error)> ToggleAtivoAsync(int id, int usuarioId);
    Task<(bool Found, string? Error)> DeleteAsync(int id, bool excluirTransacoesFuturas, int usuarioId);
    Task<int> ProcessarRecorrenciasAsync(int usuarioId);
}
