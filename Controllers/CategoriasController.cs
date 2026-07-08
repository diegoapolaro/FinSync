using FinSync.Data;
using FinSync.Dtos;
using FinSync.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinSync.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriasController(FinSyncDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoriaDto>>> GetCategorias()
    {
        var categorias = await context.Categorias
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

        return Ok(categorias);
    }

    [HttpPost]
    public async Task<ActionResult<CategoriaDto>> PostCategoria(CreateCategoriaDto dto)
    {
        var categoria = new Categoria
        {
            Nome = dto.Nome,
            Cor = dto.Cor,
            Tipo = dto.Tipo
        };

        context.Categorias.Add(categoria);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategorias), new { id = categoria.Id }, new CategoriaDto
        {
            Id = categoria.Id,
            Nome = categoria.Nome,
            Cor = categoria.Cor,
            Tipo = categoria.Tipo
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutCategoria(int id, UpdateCategoriaDto dto)
    {
        var categoria = await context.Categorias.FindAsync(id);

        if (categoria is null)
        {
            return NotFound();
        }

        categoria.Nome = dto.Nome;
        categoria.Cor = dto.Cor;
        categoria.Tipo = dto.Tipo;

        await context.SaveChangesAsync();

        return NoContent();
    }
}
