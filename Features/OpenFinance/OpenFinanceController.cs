using System.Security.Claims;
using FinSync.Enums;
using FinSync.Features.Contas;
using FinSync.Features.Transacoes;
using FinSync.Services.OpenFinance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinSync.Features.OpenFinance;

/// <summary>
/// Entrada HTTP para descoberta de instituições e estabelecimento de novas
/// conexões de Open Finance. O primeiro extrato é importado já no ato da conexão.
/// </summary>
[ApiController]
[Authorize]
[Route("api/[controller]")]
public class OpenFinanceController(
    IOpenFinanceProvider provider,
    IContaService contaService,
    IOpenFinanceSyncService syncService,
    ITransacaoService transacaoService) : ControllerBase
{
    private int UsuarioId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Lista os bancos suportados para exibição no front-end.</summary>
    [HttpGet("instituicoes")]
    public async Task<ActionResult<List<InstituicaoBancariaDto>>> ListarInstituicoes()
    {
        return Ok(await provider.ListarInstituicoesAsync());
    }

    /// <summary>
    /// Conecta uma nova conta, persiste o item externo e dispara o primeiro
    /// sincronismo de extrato antes de responder.
    /// </summary>
    [HttpPost("conectar")]
    public async Task<ActionResult<ConectarContaOpenFinanceResponse>> Conectar(
        ConectarContaOpenFinanceDto dto)
    {
        var conexao = await provider.ConectarAsync(new ConectarInstituicaoRequest
        {
            InstituicaoCodigo = dto.InstituicaoCodigo,
            NomeConta = dto.NomePersonalizado,
            Agencia = dto.Agencia,
            NumeroConta = dto.NumeroConta,
            ChavePix = dto.ChavePix,
            TipoConta = dto.TipoConta,
            CenarioSandbox = dto.CenarioSandbox
        }, UsuarioId);

        if (!conexao.Sucesso || string.IsNullOrWhiteSpace(conexao.ExternalItemId))
        {
            return BadRequest(new
            {
                mensagem = conexao.Mensagem ?? "Não foi possível conectar à instituição informada."
            });
        }

        var provedor = Enum.TryParse<ProvedorOpenFinance>(
            conexao.Provedor, ignoreCase: true, out var provedorParseado)
            ? provedorParseado
            : ProvedorOpenFinance.MockSandbox;

        var nomeConta = string.IsNullOrWhiteSpace(dto.NomePersonalizado)
            ? conexao.Instituicao?.Nome ?? "Conta Open Finance"
            : dto.NomePersonalizado!;

        var conta = await contaService.CreateAsync(new CreateContaDto
        {
            Nome = nomeConta,
            Tipo = dto.TipoConta,
            InstituicaoCodigo = conexao.Instituicao?.Codigo ?? dto.InstituicaoCodigo,
            InstituicaoNome = conexao.Instituicao?.NomeOficial ?? conexao.Instituicao?.Nome,
            Agencia = dto.Agencia,
            NumeroConta = dto.NumeroConta,
            ChavePix = dto.ChavePix,
            Provedor = provedor,
            ExternalItemId = conexao.ExternalItemId
        }, UsuarioId);

        var sincronizacao = await syncService.SincronizarContaAsync(conta.Id, UsuarioId);

        List<TransacaoDto> importadas = [];
        if (sincronizacao.Sucesso)
        {
            var pagina = await transacaoService.GetAllAsync(
                UsuarioId, conta.Id, page: 1, pageSize: 100);
            importadas = pagina.Data;
        }

        var response = new ConectarContaOpenFinanceResponse
        {
            Conta = conta,
            Sincronizacao = sincronizacao,
            Instituicao = conexao.Instituicao,
            TransacoesImportadas = importadas,
            Mensagem = conexao.Mensagem,
            Provedor = conexao.Provedor
        };

        return CreatedAtAction(
            nameof(ContasController.GetConta), "Contas", new { id = conta.Id }, response);
    }
}
