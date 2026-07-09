using FinSync.Dtos;
using FinSync.Services;
using Microsoft.AspNetCore.Mvc;

namespace FinSync.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriasController(CategoriaService categoriaService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoriaDto>>> GetCategorias()
    {
        return Ok(await categoriaService.GetAllAsync());
    }

    [HttpPost]
    public async Task<ActionResult<CategoriaDto>> PostCategoria(CreateCategoriaDto dto)
    {
        var (categoria, error) = await categoriaService.CreateAsync(dto);
        if (error is not null) return BadRequest(error);
        return CreatedAtAction(nameof(GetCategorias), new { id = categoria!.Id }, categoria);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutCategoria(int id, UpdateCategoriaDto dto)
    {
        var (found, error) = await categoriaService.UpdateAsync(id, dto);
        if (!found) return NotFound();
        if (error is not null) return BadRequest(error);
        return NoContent();
    }
}