using FinSync.Data;
using FinSync.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinSync.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransacoesController(FinSyncDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transacao>>> GetTransacoes()
    {
        var transacoes = await context.Transacoes
            .OrderByDescending(transacao => transacao.Data)
            .ToListAsync();

        return Ok(transacoes);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Transacao>> GetTransacao(int id)
    {
        var transacao = await context.Transacoes.FindAsync(id);

        if (transacao is null)
        {
            return NotFound();
        }

        return Ok(transacao);
    }

    [HttpPost]
    public async Task<ActionResult<Transacao>> PostTransacao(Transacao transacao)
    {
        context.Transacoes.Add(transacao);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTransacao), new { id = transacao.Id }, transacao);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutTransacao(int id, Transacao transacao)
    {
        if (id != transacao.Id)
        {
            return BadRequest("O id da URL precisa ser igual ao id da transacao.");
        }

        var transacaoExiste = await context.Transacoes.AnyAsync(item => item.Id == id);

        if (!transacaoExiste)
        {
            return NotFound();
        }

        context.Entry(transacao).State = EntityState.Modified;
        await context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTransacao(int id)
    {
        var transacao = await context.Transacoes.FindAsync(id);

        if (transacao is null)
        {
            return NotFound();
        }

        context.Transacoes.Remove(transacao);
        await context.SaveChangesAsync();

        return NoContent();
    }
}
