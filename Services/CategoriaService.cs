using FinSync.Data;
using FinSync.Dtos;
using FinSync.Models;
using Microsoft.EntityFrameworkCore;

namespace FinSync.Services;

public class CategoriaService(FinSyncDbContext context)
{
    public async Task<List<CategoriaDto>> GetAllAsync()
    {
        return await context.Categorias
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

    public async Task<(CategoriaDto? Dto, string? Error)> CreateAsync(CreateCategoriaDto dto)
    {
        var categoria = new Categoria
        {
            Nome = dto.Nome,
            Cor = dto.Cor,
            Tipo = dto.Tipo
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

    public async Task<(bool Found, string? Error)> UpdateAsync(int id, UpdateCategoriaDto dto)
    {
        var categoria = await context.Categorias.FindAsync(id);
        if (categoria is null) return (false, null);

        categoria.Nome = dto.Nome;
        categoria.Cor = dto.Cor;
        categoria.Tipo = dto.Tipo;

        await context.SaveChangesAsync();
        return (true, null);
    }
}