using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;

namespace FinSync.Handlers;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IHostEnvironment environment) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (statusCode, title, detail) = exception switch
        {
            DbUpdateConcurrencyException => (
                409,
                "Conflito de concorrencia",
                "O registro foi modificado por outro usuario. Recarregue os dados e tente novamente."
            ),
            DbUpdateException dbEx => (
                400,
                "Erro ao salvar",
                environment.IsDevelopment()
                    ? $"Nao foi possivel salvar os dados: {dbEx.InnerException?.Message ?? dbEx.Message}"
                    : "Nao foi possivel salvar os dados informados devido a uma restricao de integridade. Verifique as informacoes e tente novamente."
            ),
            _ => (
                500,
                "Erro interno do servidor",
                "Ocorreu um erro inesperado. Tente novamente mais tarde."
            )
        };

        logger.LogError(exception, "Request failed: {Status} {Title} - {Path}", statusCode, title, httpContext.Request.Path);

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/problem+json";

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };

        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
        return true;
    }
}
