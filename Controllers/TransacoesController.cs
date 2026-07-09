using FinSync.Dtos;
using FinSync.Services;
using Microsoft.AspNetCore.Mvc;

namespace FinSync.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransacoesController(TransacaoService transacaoService) : ControllerBase
{
    [HttpGet("exportar")]
    public async Task<IActionResult> Exportar(int? contaId, string periodo = "mes_atual", string formato = "csv")
    {
        var bytes = await transacaoService.ExportarCsvAsync(contaId, periodo);
        return File(bytes, "text/csv", $"extrato_{DateTime.Today:yyyyMMdd}.csv");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransacaoDto>>> GetTransacoes(int? contaId, DateOnly? data)
    {
        return Ok(await transacaoService.GetAllAsync(contaId, data));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TransacaoDto>> GetTransacao(int id)
    {
        var transacao = await transacaoService.GetByIdAsync(id);
        if (transacao is null) return NotFound();
        return Ok(transacao);
    }

    [HttpPost]
    public async Task<ActionResult<TransacaoDto>> PostTransacao(CreateTransacaoDto dto)
    {
        var (transacao, error) = await transacaoService.CreateAsync(dto);
        if (error is not null) return BadRequest(error);
        return CreatedAtAction(nameof(GetTransacao), new { id = transacao!.Id }, transacao);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutTransacao(int id, UpdateTransacaoDto dto)
    {
        var (found, error) = await transacaoService.UpdateAsync(id, dto);
        if (!found) return NotFound();
        if (error is not null) return BadRequest(error);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTransacao(int id)
    {
        var deleted = await transacaoService.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}