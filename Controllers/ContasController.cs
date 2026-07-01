using FinSync.Data;
using FinSync.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinSync.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContasController(FinSyncDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Conta>>> GetContas()
    {
        var contas = await context.Contas
            .OrderBy(conta => conta.Nome)
            .ToListAsync();

        return Ok(contas);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Conta>> GetConta(int id)
    {
        var conta = await context.Contas.FindAsync(id);

        if (conta is null)
        {
            return NotFound();
        }

        return Ok(conta);
    }

    [HttpGet("{id:int}/resumo")]
    public async Task<ActionResult<object>> GetResumo(int id)
    {
        var contaExiste = await context.Contas.AnyAsync(conta => conta.Id == id);

        if (!contaExiste)
        {
            return NotFound();
        }

        var hoje = DateOnly.FromDateTime(DateTime.Today);
        var inicioDoMes = new DateOnly(hoje.Year, hoje.Month, 1);
        var inicioDoProximoMes = inicioDoMes.AddMonths(1);

        var totalEntradas = await context.Transacoes
            .Where(transacao => transacao.ContaId == id && transacao.Tipo == TipoTransacao.Entrada)
            .SumAsync(transacao => transacao.Valor);

        var totalSaidas = await context.Transacoes
            .Where(transacao => transacao.ContaId == id && transacao.Tipo == TipoTransacao.Saida)
            .SumAsync(transacao => transacao.Valor);

        var totalEntradasHoje = await context.Transacoes
            .Where(transacao =>
                transacao.ContaId == id
                && transacao.Tipo == TipoTransacao.Entrada
                && transacao.Data == hoje)
            .SumAsync(transacao => transacao.Valor);

        var totalSaidasHoje = await context.Transacoes
            .Where(transacao =>
                transacao.ContaId == id
                && transacao.Tipo == TipoTransacao.Saida
                && transacao.Data == hoje)
            .SumAsync(transacao => transacao.Valor);

        var totalEntradasMes = await context.Transacoes
            .Where(transacao =>
                transacao.ContaId == id
                && transacao.Tipo == TipoTransacao.Entrada
                && transacao.Data >= inicioDoMes
                && transacao.Data < inicioDoProximoMes)
            .SumAsync(transacao => transacao.Valor);

        var totalSaidasMes = await context.Transacoes
            .Where(transacao =>
                transacao.ContaId == id
                && transacao.Tipo == TipoTransacao.Saida
                && transacao.Data >= inicioDoMes
                && transacao.Data < inicioDoProximoMes)
            .SumAsync(transacao => transacao.Valor);

        var quantidadeTransacoes = await context.Transacoes
            .CountAsync(transacao => transacao.ContaId == id);

        return Ok(new
        {
            TotalEntradas = totalEntradas,
            TotalSaidas = totalSaidas,
            Saldo = totalEntradas - totalSaidas,
            TotalEntradasHoje = totalEntradasHoje,
            TotalSaidasHoje = totalSaidasHoje,
            SaldoDiario = totalEntradasHoje - totalSaidasHoje,
            TotalEntradasMes = totalEntradasMes,
            TotalSaidasMes = totalSaidasMes,
            SaldoMensal = totalEntradasMes - totalSaidasMes,
            QuantidadeTransacoes = quantidadeTransacoes
        });
    }

    [HttpPost]
    public async Task<ActionResult<Conta>> PostConta(Conta conta)
    {
        context.Contas.Add(conta);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetConta), new { id = conta.Id }, conta);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutConta(int id, Conta conta)
    {
        if (id != conta.Id)
        {
            return BadRequest("O id da URL precisa ser igual ao id da conta.");
        }

        var contaExiste = await context.Contas.AnyAsync(item => item.Id == id);

        if (!contaExiste)
        {
            return NotFound();
        }

        context.Entry(conta).State = EntityState.Modified;
        await context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteConta(int id)
    {
        var conta = await context.Contas.FindAsync(id);

        if (conta is null)
        {
            return NotFound();
        }

        var possuiTransacoes = await context.Transacoes.AnyAsync(transacao => transacao.ContaId == id);

        if (possuiTransacoes)
        {
            return BadRequest("Nao e possivel deletar uma conta que possui transacoes.");
        }

        context.Contas.Remove(conta);
        await context.SaveChangesAsync();

        return NoContent();
    }
}
