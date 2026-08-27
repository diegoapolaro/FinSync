using FinSync.Data;
using Microsoft.EntityFrameworkCore;

namespace FinSync.Features.Categorias;

public class CategoriaService(FinSyncDbContext context) : ICategoriaService
{
    public async Task<List<CategoriaDto>> GetAllAsync(int usuarioId)
    {
        return await context.Categorias
            .Where(c => c.UsuarioId == usuarioId)
            .OrderBy(c => c.Tipo)
            .ThenBy(c => c.Nome)
            .Select(c => new CategoriaDto
            {
                Id = c.Id,
                Nome = c.Nome,
                Cor = c.Cor,
                Tipo = c.Tipo
            })
            .ToListAsync();
    }

    public async Task<(CategoriaDto? Dto, string? Error)> CreateAsync(CreateCategoriaDto dto, int usuarioId)
    {
        var categoria = new Categoria
        {
            Nome = dto.Nome,
            Cor = dto.Cor,
            Tipo = dto.Tipo,
            UsuarioId = usuarioId
        };

        context.Categorias.Add(categoria);
        await context.SaveChangesAsync();

        return (new CategoriaDto
        {
            Id = categoria.Id,
            Nome = categoria.Nome,
            Cor = categoria.Cor,
            Tipo = categoria.Tipo
        }, null);
    }

    public async Task<CategoriaDto?> GetByIdAsync(int id, int usuarioId)
    {
        var categoria = await context.Categorias
            .FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == usuarioId);

        if (categoria is null) return null;

        return new CategoriaDto
        {
            Id = categoria.Id,
            Nome = categoria.Nome,
            Cor = categoria.Cor,
            Tipo = categoria.Tipo
        };
    }

    public async Task<bool> DeleteAsync(int id, int usuarioId)
    {
        var categoria = await context.Categorias
            .FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == usuarioId);
        if (categoria is null) return false;

        context.Categorias.Remove(categoria);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<(bool Found, string? Error)> UpdateAsync(int id, UpdateCategoriaDto dto, int usuarioId)
    {
        var categoria = await context.Categorias
            .FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == usuarioId);
        if (categoria is null) return (false, null);

        categoria.Nome = dto.Nome;
        categoria.Cor = dto.Cor;
        categoria.Tipo = dto.Tipo;

        await context.SaveChangesAsync();
        return (true, null);
    }
}