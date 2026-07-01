using FinSync.Data;
using FinSync.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinSync.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriasController(FinSyncDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Categoria>>> GetCategorias()
    {
        var categorias = await context.Categorias
            .OrderBy(c => c.Tipo)
            .ThenBy(c => c.Nome)
            .ToListAsync();

        return Ok(categorias);
    }

    [HttpPost]
    public async Task<ActionResult<Categoria>> PostCategoria(Categoria categoria)
    {
        context.Categorias.Add(categoria);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategorias), new { id = categoria.Id }, categoria);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutCategoria(int id, Categoria categoria)
    {
        if (id != categoria.Id)
        {
            return BadRequest("O id da URL precisa ser igual ao id da categoria.");
        }

        var existe = await context.Categorias.AnyAsync(c => c.Id == id);
        if (!existe)
        {
            return NotFound();
        }

        context.Entry(categoria).State = EntityState.Modified;
        await context.SaveChangesAsync();

        return NoContent();
    }
}
