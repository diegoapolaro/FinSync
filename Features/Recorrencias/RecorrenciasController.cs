using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinSync.Features.Recorrencias;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class RecorrenciasController(IRecorrenciaService recorrenciaService) : ControllerBase
{
    private int UsuarioId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<RecorrenciaDto>>> GetAll()
    {
        return Ok(await recorrenciaService.GetAllAsync(UsuarioId));
    }

    [HttpGet("resumo")]
    public async Task<ActionResult<ResumoRecorrenciasDto>> GetResumo()
    {
        return Ok(await recorrenciaService.GetResumoAsync(UsuarioId));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RecorrenciaDto>> GetById(int id)
    {
        var item = await recorrenciaService.GetByIdAsync(id, UsuarioId);
        if (item is null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<RecorrenciaDto>> Create(CreateRecorrenciaDto dto)
    {
        var (result, error) = await recorrenciaService.CreateAsync(dto, UsuarioId);
        if (error is not null) return BadRequest(error);
        return CreatedAtAction(nameof(GetById), new { id = result!.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateRecorrenciaDto dto)
    {
        var (found, error) = await recorrenciaService.UpdateAsync(id, dto, UsuarioId);
        if (!found) return NotFound();
        if (error is not null) return BadRequest(error);
        return NoContent();
    }

    [HttpPatch("{id:int}/toggle-ativo")]
    public async Task<IActionResult> ToggleAtivo(int id)
    {
        var (found, error) = await recorrenciaService.ToggleAtivoAsync(id, UsuarioId);
        if (!found) return NotFound();
        if (error is not null) return BadRequest(error);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromQuery] bool excluirFuturas = true)
    {
        var (found, error) = await recorrenciaService.DeleteAsync(id, excluirFuturas, UsuarioId);
        if (!found) return NotFound();
        if (error is not null) return BadRequest(error);
        return NoContent();
    }

    [HttpPost("processar")]
    public async Task<ActionResult<object>> Processar()
    {
        var geradas = await recorrenciaService.ProcessarRecorrenciasAsync(UsuarioId);
        return Ok(new { NovasTransacoesGeradas = geradas });
    }
}
