using System;
using System.Security.Claims;
using FinSync.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinSync.Features.Transacoes;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class TransacoesController(ITransacaoService transacaoService) : ControllerBase
{
    private int UsuarioId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("sugestoes-descricao")]
    public async Task<ActionResult<List<SugestaoDescricaoDto>>> GetSugestoesDescricao(
        [FromQuery] int? contaId,
        [FromQuery] TipoTransacao? tipo,
        [FromQuery] string? termo,
        [FromQuery] int limite = 50)
    {
        var sugestoes = await transacaoService.GetSugestoesDescricaoAsync(UsuarioId, contaId, tipo, termo, limite);
        return Ok(sugestoes);
    }

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
    public async Task Exportar(
        int? contaId,
        string periodo = "mes_atual",
        DateOnly? dataInicio = null,
        DateOnly? dataFim = null,
        string formato = "csv")
    {
        if (!string.Equals(formato, "csv", StringComparison.OrdinalIgnoreCase))
        {
            Response.StatusCode = StatusCodes.Status400BadRequest;
            await Response.WriteAsync("Formato não suportado.");
            return;
        }

        Response.ContentType = "text/csv";
        Response.Headers.Append("Content-Disposition", $"attachment; filename=extrato_{DateTime.Today:yyyyMMdd}.csv");
        await transacaoService.ExportarCsvAsync(contaId, periodo, UsuarioId, Response.Body, dataInicio, dataFim);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<TransacaoDto>>> GetTransacoes(
        int? contaId,
        DateOnly? data,
        DateOnly? dataInicio,
        DateOnly? dataFim,
        int? categoriaId,
        StatusTransacao? status,
        int page = 1,
        int pageSize = 20)
    {
        pageSize = Math.Clamp(pageSize, 1, 100);
        page = Math.Max(1, page);
        return Ok(await transacaoService.GetAllAsync(UsuarioId, contaId, data, dataInicio, dataFim, categoriaId, status, page, pageSize));
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

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> PatchStatus(int id, [FromBody] UpdateStatusTransacaoDto dto)
    {
        var (found, error) = await transacaoService.UpdateStatusAsync(id, dto.Status, UsuarioId);
        if (!found) return NotFound();
        if (error is not null) return BadRequest(error);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTransacao(
        int id,
        [FromQuery] bool excluirTodasParcelas = false,
        [FromQuery] bool excluirFuturas = false)
    {
        var deleted = await transacaoService.DeleteAsync(id, UsuarioId, excluirTodasParcelas, excluirFuturas);
        if (!deleted) return NotFound();
        return NoContent();
    }

    [HttpPost("importar")]
    public async Task<ActionResult<List<TransacaoPreviewDto>>> Importar(IFormFile arquivo)
    {
        if (arquivo == null || arquivo.Length == 0) return BadRequest("Arquivo inválido.");

        var preview = new List<TransacaoPreviewDto>();

        using var reader = new StreamReader(arquivo.OpenReadStream());
        var header = await reader.ReadLineAsync();
        if (string.IsNullOrWhiteSpace(header)) return BadRequest("Arquivo vazio.");

        while (await reader.ReadLineAsync() is { } line)
        {
            if (string.IsNullOrWhiteSpace(line)) continue;

            var cols = line.Split(',');
            if (cols.Length < 4) continue;

            if (DateOnly.TryParseExact(cols[0].Trim(), "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out var data) &&
                decimal.TryParse(cols[2].Trim(), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var valor) &&
                Enum.TryParse<TipoTransacao>(cols[3].Trim(), true, out var tipo))
            {
                preview.Add(new TransacaoPreviewDto
                {
                    Data = data,
                    Descricao = cols[1].Trim().Trim('"'),
                    Valor = valor,
                    Tipo = tipo
                });
            }
        }

        return Ok(preview);
    }

    [HttpPost("lote")]
    public async Task<ActionResult<List<TransacaoDto>>> CriarEmLote([FromBody] List<CreateTransacaoDto> transacoes)
    {
        if (transacoes == null || !transacoes.Any()) return BadRequest("Lista vazia.");

        var result = await transacaoService.CriarEmLoteAsync(transacoes, UsuarioId);
        return Ok(result);
    }
}