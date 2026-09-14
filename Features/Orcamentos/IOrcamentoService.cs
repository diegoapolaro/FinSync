namespace FinSync.Features.Orcamentos;

public interface IOrcamentoService
{
    Task<List<OrcamentoDto>> GetAllAsync(int usuarioId);
    Task<OrcamentoDto?> GetByIdAsync(int id, int usuarioId);
    Task<(OrcamentoDto? Dto, string? Error)> CreateAsync(CreateOrcamentoDto dto, int usuarioId);
    Task<(bool Found, string? Error)> UpdateAsync(int id, UpdateOrcamentoDto dto, int usuarioId);
    Task<bool> DeleteAsync(int id, int usuarioId);
    Task<List<StatusOrcamentoDto>> ObterResumoOrcamentosAsync(int usuarioId, int mes, int ano);
}
