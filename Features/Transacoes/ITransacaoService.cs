using FinSync.Enums;

namespace FinSync.Features.Transacoes;

public interface ITransacaoService
{
    Task<PagedResponse<TransacaoDto>> GetAllAsync(
        int usuarioId,
        int? contaId,
        DateOnly? data = null,
        DateOnly? dataInicio = null,
        DateOnly? dataFim = null,
        int? categoriaId = null,
        StatusTransacao? status = null,
        int page = 1,
        int pageSize = 20);

    Task<TransacaoDto?> GetByIdAsync(int id, int usuarioId);
    Task<(TransacaoDto? Dto, string? Error)> CreateAsync(CreateTransacaoDto dto, int usuarioId);
    Task<(bool Found, string? Error)> UpdateAsync(int id, UpdateTransacaoDto dto, int usuarioId);
    Task<(bool Found, string? Error)> UpdateStatusAsync(int id, StatusTransacao status, int usuarioId);
    Task<bool> DeleteAsync(int id, int usuarioId, bool excluirTodasParcelas = false, bool excluirFuturasRecorrencias = false);
    Task<List<DetalhamentoCategoriaDto>> GetDetalhamentoAsync(int? contaId, DateOnly dataInicio, DateOnly dataFim, int usuarioId);
    Task<object> GetResumoPeriodoAsync(int? contaId, DateOnly dataInicio, DateOnly dataFim, int usuarioId);
    Task ExportarCsvAsync(int? contaId, string periodo, int usuarioId, Stream outputStream);
}
