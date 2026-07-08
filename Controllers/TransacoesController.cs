using System.Globalization;
using System.Text;
using FinSync.Data;
using FinSync.Dtos;
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
    public async Task<ActionResult<IEnumerable<TransacaoDto>>> GetTransacoes(int? contaId)
    {
        var query = context.Transacoes
            .Include(t => t.Conta)
            .AsQueryable();

        if (contaId is not null)
        {
            query = query.Where(transacao => transacao.ContaId == contaId);
        }

        var transacoes = await query
            .OrderByDescending(transacao => transacao.Data)
            .Select(t => new TransacaoDto
            {
                Id = t.Id,
                Descricao = t.Descricao,
                Valor = t.Valor,
                Tipo = t.Tipo,
                Data = t.Data,
                ContaId = t.ContaId,
                ContaNome = t.Conta != null ? t.Conta.Nome : string.Empty
            })
            .ToListAsync();

        return Ok(transacoes);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TransacaoDto>> GetTransacao(int id)
    {
        var transacao = await context.Transacoes
            .Include(t => t.Conta)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transacao is null)
        {
            return NotFound();
        }

        return Ok(new TransacaoDto
        {
            Id = transacao.Id,
            Descricao = transacao.Descricao,
            Valor = transacao.Valor,
            Tipo = transacao.Tipo,
            Data = transacao.Data,
            ContaId = transacao.ContaId,
            ContaNome = transacao.Conta?.Nome ?? string.Empty
        });
    }

    [HttpPost]
    public async Task<ActionResult<TransacaoDto>> PostTransacao(CreateTransacaoDto dto)
    {
        var contaExiste = await context.Contas.AnyAsync(c => c.Id == dto.ContaId);
        if (!contaExiste)
        {
            return BadRequest($"A conta com id {dto.ContaId} nao existe.");
        }

        var transacao = new Transacao
        {
            Descricao = dto.Descricao,
            Valor = dto.Valor,
            Tipo = dto.Tipo,
            Data = dto.Data,
            ContaId = dto.ContaId
        };

        context.Transacoes.Add(transacao);
        await context.SaveChangesAsync();

        await context.Entry(transacao).Reference(t => t.Conta).LoadAsync();

        return CreatedAtAction(nameof(GetTransacao), new { id = transacao.Id }, new TransacaoDto
        {
            Id = transacao.Id,
            Descricao = transacao.Descricao,
            Valor = transacao.Valor,
            Tipo = transacao.Tipo,
            Data = transacao.Data,
            ContaId = transacao.ContaId,
            ContaNome = transacao.Conta?.Nome ?? string.Empty
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutTransacao(int id, UpdateTransacaoDto dto)
    {
        var transacao = await context.Transacoes.FindAsync(id);

        if (transacao is null)
        {
            return NotFound();
        }

        var contaExiste = await context.Contas.AnyAsync(c => c.Id == dto.ContaId);
        if (!contaExiste)
        {
            return BadRequest($"A conta com id {dto.ContaId} nao existe.");
        }

        transacao.Descricao = dto.Descricao;
        transacao.Valor = dto.Valor;
        transacao.Tipo = dto.Tipo;
        transacao.Data = dto.Data;
        transacao.ContaId = dto.ContaId;

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
