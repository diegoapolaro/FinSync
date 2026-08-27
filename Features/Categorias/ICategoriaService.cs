namespace FinSync.Features.Categorias;

public interface ICategoriaService
{
    Task<List<CategoriaDto>> GetAllAsync(int usuarioId);
    Task<(CategoriaDto? Dto, string? Error)> CreateAsync(CreateCategoriaDto dto, int usuarioId);
    Task<CategoriaDto?> GetByIdAsync(int id, int usuarioId);
    Task<bool> DeleteAsync(int id, int usuarioId);
    Task<(bool Found, string? Error)> UpdateAsync(int id, UpdateCategoriaDto dto, int usuarioId);
}
