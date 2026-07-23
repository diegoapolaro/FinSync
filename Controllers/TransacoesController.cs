using System.Security.Claims;
using FinSync.Dtos;
using FinSync.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinSync.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class TransacoesController(TransacaoService transacaoService) : ControllerBase
{
    private int UsuarioId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("detalhamento")]
    public async Task<ActionResult<IEnumerable<DetalhamentoCategoriaDto>>> GetDetalhamento(int? contaId, DateOnly dataInicio, DateOnly dataFim)
    {
        return Ok(await transacaoService.GetDetalhamentoAsync(contaId, dataInicio, dataFim, UsuarioId));
    }

    [HttpGet("resumo-periodo")]
    public async Task<IActionResult> GetResumoPeriodo(int? contaId, DateOnly dataInicio, DateOnly dataFim)
    {
        return Ok(await transacaoService.GetResumoPeriodoAsync(contaId, dataInicio, dataFim, UsuarioId));
    }

    [HttpGet("exportar")]
    public async Task<IActionResult> Exportar(int? contaId, string periodo = "mes_atual", string formato = "csv")
    {
        var bytes = await transacaoService.ExportarCsvAsync(contaId, periodo, UsuarioId);
        return File(bytes, "text/csv", $"extrato_{DateTime.Today:yyyyMMdd}.csv");
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<TransacaoDto>>> GetTransacoes(
        int? contaId,
        DateOnly? data,
        DateOnly? dataInicio,
        DateOnly? dataFim,
        int? categoriaId,
        int page = 1,
        int pageSize = 20)
    {
        pageSize = Math.Clamp(pageSize, 1, 100);
        page = Math.Max(1, page);
        return Ok(await transacaoService.GetAllAsync(UsuarioId, contaId, data, dataInicio, dataFim, categoriaId, page, pageSize));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TransacaoDto>> GetTransacao(int id)
    {
        var transacao = await transacaoService.GetByIdAsync(id, UsuarioId);
        if (transacao is null) return NotFound();
        return Ok(transacao);
    }

    [HttpPost]
    public async Task<ActionResult<TransacaoDto>> PostTransacao(CreateTransacaoDto dto)
    {
        var (transacao, error) = await transacaoService.CreateAsync(dto, UsuarioId);
        if (error is not null) return BadRequest(error);
        return CreatedAtAction(nameof(GetTransacao), new { id = transacao!.Id }, transacao);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutTransacao(int id, UpdateTransacaoDto dto)
    {
        var (found, error) = await transacaoService.UpdateAsync(id, dto, UsuarioId);
        if (!found) return NotFound();
        if (error is not null) return BadRequest(error);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTransacao(int id)
    {
        var deleted = await transacaoService.DeleteAsync(id, UsuarioId);
        if (!deleted) return NotFound();
        return NoContent();
    }
}