using FinSync.Dtos;
using FinSync.Services;
using Microsoft.AspNetCore.Mvc;

namespace FinSync.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContasController(ContaService contaService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContaDto>>> GetContas()
    {
        return Ok(await contaService.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ContaDto>> GetConta(int id)
    {
        var conta = await contaService.GetByIdAsync(id);
        if (conta is null) return NotFound();
        return Ok(conta);
    }

    [HttpGet("{id:int}/resumo")]
    public async Task<ActionResult<object>> GetResumo(int id)
    {
        var resumo = await contaService.GetResumoAsync(id);
        if (resumo is null) return NotFound();
        return Ok(resumo);
    }

    [HttpPost]
    public async Task<ActionResult<ContaDto>> PostConta(CreateContaDto dto)
    {
        var conta = await contaService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetConta), new { id = conta.Id }, conta);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutConta(int id, UpdateContaDto dto)
    {
        var updated = await contaService.UpdateAsync(id, dto);
        if (!updated) return NotFound();
        return NoContent();
    }

    [HttpPatch("{id:int}/arquivar")]
    public async Task<IActionResult> ToggleArchive(int id)
    {
        var toggled = await contaService.ToggleArchiveAsync(id);
        if (!toggled) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteConta(int id)
    {
        var (success, error) = await contaService.DeleteAsync(id);
        if (!success)
        {
            if (error is null) return NotFound();
            return BadRequest(error);
        }
        return NoContent();
    }
}