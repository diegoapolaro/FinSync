using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinSync.Features.Orcamentos;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class OrcamentosController(IOrcamentoService orcamentoService) : ControllerBase
{
    private int UsuarioId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrcamentoDto>>> GetOrcamentos()
    {
        return Ok(await orcamentoService.GetAllAsync(UsuarioId));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrcamentoDto>> GetOrcamento(int id)
    {
        var orcamento = await orcamentoService.GetByIdAsync(id, UsuarioId);
        if (orcamento is null) return NotFound();
        return Ok(orcamento);
    }

    [HttpGet("resumo")]
    public async Task<ActionResult<IEnumerable<StatusOrcamentoDto>>> GetResumo([FromQuery] int mes, [FromQuery] int ano)
    {
        if (mes < 1 || mes > 12) return BadRequest("Mês inválido.");
        if (ano < 2000 || ano > 2100) return BadRequest("Ano inválido.");
        return Ok(await orcamentoService.ObterResumoOrcamentosAsync(UsuarioId, mes, ano));
    }

    [HttpPost]
    public async Task<ActionResult<OrcamentoDto>> PostOrcamento(CreateOrcamentoDto dto)
    {
        var (orcamento, error) = await orcamentoService.CreateAsync(dto, UsuarioId);
        if (error is not null) return BadRequest(error);
        return CreatedAtAction(nameof(GetOrcamento), new { id = orcamento!.Id }, orcamento);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutOrcamento(int id, UpdateOrcamentoDto dto)
    {
        var (found, error) = await orcamentoService.UpdateAsync(id, dto, UsuarioId);
        if (!found) return NotFound();
        if (error is not null) return BadRequest(error);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteOrcamento(int id)
    {
        if (!await orcamentoService.DeleteAsync(id, UsuarioId)) return NotFound();
        return NoContent();
    }
}
