using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace FinSync.Features.Recorrencias;

public class ProcessadorRecorrenciasWorker(
    ILogger<ProcessadorRecorrenciasWorker> logger,
    IServiceProvider serviceProvider) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Background Worker de Recorrências iniciado.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = serviceProvider.CreateScope();
                var recorrenciaService = scope.ServiceProvider.GetRequiredService<IRecorrenciaService>();

                logger.LogInformation("Iniciando processamento em lote de recorrências...");
                
                var geradas = await recorrenciaService.ProcessarTodasRecorrenciasAsync();
                
                logger.LogInformation($"Processamento concluído. {geradas} novas transações foram projetadas.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erro ao processar recorrências no background worker.");
            }

            // Aguarda até o próximo ciclo (ex: a cada 12 horas)
            await Task.Delay(TimeSpan.FromHours(12), stoppingToken);
        }
    }
}
