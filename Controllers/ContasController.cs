using FinSync.Data;
using FinSync.Dtos;
using FinSync.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinSync.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContasController(FinSyncDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContaDto>>> GetContas()
    {
        var contas = await context.Contas
            .Where(conta => !conta.Arquivada)
            .OrderBy(conta => conta.Nome)
            .Select(conta => new ContaDto
            {
                Id = conta.Id,
                Nome = conta.Nome,
                Tipo = conta.Tipo,
                Arquivada = conta.Arquivada
            })
            .ToListAsync();

        return Ok(contas);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ContaDto>> GetConta(int id)
    {
        var conta = await context.Contas.FindAsync(id);

        if (conta is null)
        {
            return NotFound();
        }

        return Ok(new ContaDto
        {
            Id = conta.Id,
            Nome = conta.Nome,
            Tipo = conta.Tipo,
            Arquivada = conta.Arquivada
        });
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
    public async Task<ActionResult<ContaDto>> PostConta(CreateContaDto dto)
    {
        var conta = new Conta
        {
            Nome = dto.Nome,
            Tipo = dto.Tipo
        };

        context.Contas.Add(conta);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetConta), new { id = conta.Id }, new ContaDto
        {
            Id = conta.Id,
            Nome = conta.Nome,
            Tipo = conta.Tipo,
            Arquivada = conta.Arquivada
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutConta(int id, UpdateContaDto dto)
    {
        var conta = await context.Contas.FindAsync(id);

        if (conta is null)
        {
            return NotFound();
        }

        conta.Nome = dto.Nome;
        conta.Tipo = dto.Tipo;
        conta.Arquivada = dto.Arquivada;

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
