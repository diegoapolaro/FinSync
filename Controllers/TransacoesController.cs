using System.Globalization;
using System.Text;
using FinSync.Data;
using FinSync.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinSync.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransacoesController(FinSyncDbContext context) : ControllerBase
{
    [HttpGet("exportar")]
    public async Task<IActionResult> Exportar(int? contaId, string periodo = "mes_atual", string formato = "csv")
    {
        var query = context.Transacoes.AsQueryable();

        if (contaId is not null)
        {
            query = query.Where(t => t.ContaId == contaId);
        }

        var hoje = DateOnly.FromDateTime(DateTime.Today);
        DateOnly inicio = periodo switch
        {
            "mes_passado" => new DateOnly(hoje.Year, hoje.Month, 1).AddMonths(-1),
            "ultimos_90" => hoje.AddDays(-89),
            "todos" => DateOnly.MinValue,
            _ => new DateOnly(hoje.Year, hoje.Month, 1),
        };

        DateOnly fim = periodo switch
        {
            "mes_passado" => new DateOnly(hoje.Year, hoje.Month, 1),
            "ultimos_90" => hoje.AddDays(1),
            "todos" => DateOnly.MaxValue,
            _ => new DateOnly(hoje.Year, hoje.Month, 1).AddMonths(1),
        };

        query = query.Where(t => t.Data >= inicio && t.Data < fim);
        query = query.OrderByDescending(t => t.Data);

        var transacoes = await query.ToListAsync();

        var sb = new StringBuilder();
        sb.AppendLine("Id,Descricao,Valor,Tipo,Data,ContaId");

        foreach (var t in transacoes)
        {
            sb.AppendLine($"{t.Id},\"{t.Descricao}\",{t.Valor.ToString(CultureInfo.InvariantCulture)},{t.Tipo},{t.Data:yyyy-MM-dd},{t.ContaId}");
        }

        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        return File(bytes, "text/csv", $"extrato_{DateTime.Today:yyyyMMdd}.csv");
    }
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transacao>>> GetTransacoes(int? contaId)
    {
        var query = context.Transacoes.AsQueryable();

        if (contaId is not null)
        {
            query = query.Where(transacao => transacao.ContaId == contaId);
        }

        var transacoes = await query
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
