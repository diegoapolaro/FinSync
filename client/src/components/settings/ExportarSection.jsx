import { useState } from 'react';
import { Download } from 'lucide-react';
import { exportarTransacoes } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import SettingsSection from './SettingsSection';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export default function ExportarSection() {
  const { addToast } = useToast();
  const [exportPeriodo, setExportPeriodo] = useState('30d');
  const [exportFormato, setExportFormato] = useState('csv');
  const [exportando, setExportando] = useState(false);

  async function handleExportar() {
    setExportando(true);
    try {
      const blob = await exportarTransacoes(null, exportPeriodo, exportFormato);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exportacao_${exportPeriodo}.${exportFormato}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      addToast('Arquivo exportado com sucesso!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setExportando(false);
    }
  }

  return (
    <SettingsSection id="exportar" title="Exportação de Relatórios" icon={Download}>
      <Card className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Período do Relatório
            </label>
            <select
              className="flex h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={exportPeriodo}
              onChange={(e) => setExportPeriodo(e.target.value)}
              disabled={exportando}
            >
              <option value="30d">Últimos 30 dias</option>
              <option value="ano">Este Ano (2026)</option>
              <option value="todo">Todo o Histórico</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Formato de Exportação
            </label>
            <div className="flex gap-4 h-11 items-center">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportFormato === 'csv'}
                  onChange={(e) => setExportFormato(e.target.value)}
                  className="accent-primary"
                  disabled={exportando}
                />
                Planilha CSV
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={exportFormato === 'pdf'}
                  onChange={(e) => setExportFormato(e.target.value)}
                  className="accent-primary"
                  disabled={exportando}
                />
                PDF
              </label>
            </div>
          </div>
        </div>

        <Button
          variant="default"
          size="lg"
          onClick={handleExportar}
          disabled={exportando}
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          {exportando ? 'Exportando...' : 'Baixar Arquivo'}
        </Button>
      </Card>
    </SettingsSection>
  );
}
