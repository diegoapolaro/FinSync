using System.Security.Claims;
using FinSync.Services.OpenFinance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinSync.Features.Contas;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ContasController(
    IContaService contaService,
    IOpenFinanceSyncService openFinanceSyncService) : ControllerBase
{
    private int UsuarioId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContaDto>>> GetContas()
    {
        return Ok(await contaService.GetAllAsync(UsuarioId));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ContaDto>> GetConta(int id)
    {
        var conta = await contaService.GetByIdAsync(id, UsuarioId);
        if (conta is null) return NotFound();
        return Ok(conta);
    }

    [HttpGet("{id:int}/resumo")]
    public async Task<ActionResult<object>> GetResumo(int id)
    {
        var resumo = await contaService.GetResumoAsync(id, UsuarioId);
        if (resumo is null) return NotFound();
        return Ok(resumo);
    }

    [HttpPost]
    public async Task<ActionResult<ContaDto>> PostConta(CreateContaDto dto)
    {
        var conta = await contaService.CreateAsync(dto, UsuarioId);
        return CreatedAtAction(nameof(GetConta), new { id = conta.Id }, conta);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutConta(int id, UpdateContaDto dto)
    {
        var updated = await contaService.UpdateAsync(id, dto, UsuarioId);
        if (!updated) return NotFound();
        return NoContent();
    }

    [HttpPatch("{id:int}/arquivar")]
    public async Task<IActionResult> ToggleArchive(int id)
    {
        var toggled = await contaService.ToggleArchiveAsync(id, UsuarioId);
        if (!toggled) return NotFound();
        return NoContent();
    }

    /// <summary>Importa o extrato mais recente de uma conta conectada.</summary>
    [HttpPost("{id:int}/sincronizar")]
    public async Task<ActionResult<ResumoSincronizacaoDto>> Sincronizar(int id)
    {
        if (!await contaService.ExistsAsync(id, UsuarioId)) return NotFound();

        var resumo = await openFinanceSyncService.SincronizarContaAsync(id, UsuarioId);
        return Ok(resumo);
    }

    /// <summary>Sincroniza em lote todas as contas com Open Finance do usuário.</summary>
    [HttpPost("sincronizar-todas")]
    public async Task<ActionResult<RelatorioSincronizacaoDto>> SincronizarTodas()
    {
        return Ok(await openFinanceSyncService.SincronizarTodasAsync(UsuarioId));
    }

    /// <summary>
    /// Desconecta a conta do provedor preservando os lançamentos já importados.
    /// </summary>
    [HttpPost("{id:int}/desconectar-open-finance")]
    public async Task<ActionResult<ContaDto>> DesconectarOpenFinance(int id)
    {
        var conta = await contaService.DesconectarOpenFinanceAsync(id, UsuarioId);
        if (conta is null) return NotFound();

        return Ok(conta);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteConta(int id)
    {
        var (success, error) = await contaService.DeleteAsync(id, UsuarioId);
        if (!success)
        {
            if (error is null) return NotFound();
            return BadRequest(error);
        }
        return NoContent();
    }
}