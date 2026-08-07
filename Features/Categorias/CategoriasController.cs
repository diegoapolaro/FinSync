using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinSync.Features.Categorias;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class CategoriasController(CategoriaService categoriaService) : ControllerBase
{
    private int UsuarioId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoriaDto>>> GetCategorias()
    {
        return Ok(await categoriaService.GetAllAsync(UsuarioId));
    }

    [HttpPost]
    public async Task<ActionResult<CategoriaDto>> PostCategoria(CreateCategoriaDto dto)
    {
        var (categoria, error) = await categoriaService.CreateAsync(dto, UsuarioId);
        if (error is not null) return BadRequest(error);
        return CreatedAtAction(nameof(GetCategorias), new { id = categoria!.Id }, categoria);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutCategoria(int id, UpdateCategoriaDto dto)
    {
        var (found, error) = await categoriaService.UpdateAsync(id, dto, UsuarioId);
        if (!found) return NotFound();
        if (error is not null) return BadRequest(error);
        return NoContent();
    }
}