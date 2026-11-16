using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinSync.Services;

namespace FinSync.Features.Categorias;

public record SugerirCategoriasRequest(string? Negocio);

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class CategoriasController(ICategoriaService categoriaService, IGeminiService geminiService) : ControllerBase
{
    private int UsuarioId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost("sugerir-ia")]
    public async Task<ActionResult<List<SugestaoCategoriaIaDto>>> SugerirCategoriasIa([FromBody] SugerirCategoriasRequest request, CancellationToken cancellationToken)
    {
        var sugestoes = await geminiService.GerarSugestoesCategoriasAsync(request.Negocio ?? string.Empty, cancellationToken);
        return Ok(sugestoes);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoriaDto>>> GetCategorias()
    {
        return Ok(await categoriaService.GetAllAsync(UsuarioId));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoriaDto>> GetCategoria(int id)
    {
        var categoria = await categoriaService.GetByIdAsync(id, UsuarioId);
        if (categoria is null) return NotFound();
        return Ok(categoria);
    }

    [HttpPost]
    public async Task<ActionResult<CategoriaDto>> PostCategoria(CreateCategoriaDto dto)
    {
        var (categoria, error) = await categoriaService.CreateAsync(dto, UsuarioId);
        if (error is not null) return BadRequest(error);
        return CreatedAtAction(nameof(GetCategoria), new { id = categoria!.Id }, categoria);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutCategoria(int id, UpdateCategoriaDto dto)
    {
        var (found, error) = await categoriaService.UpdateAsync(id, dto, UsuarioId);
        if (!found) return NotFound();
        if (error is not null) return BadRequest(error);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCategoria(int id)
    {
        if (!await categoriaService.DeleteAsync(id, UsuarioId)) return NotFound();
        return NoContent();
    }
}