import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import {
  exportarTransacoes,
  getResumoPeriodo,
  getDetalhamento,
  getTransacoesRange,
} from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import SettingsSection from './SettingsSection';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import RelatorioPdfModal from '../reports/RelatorioPdfModal';

function calcularDatasPeriodo(periodo) {
  const hoje = new Date();
  if (periodo === 'ano') {
    const ano = hoje.getFullYear();
    return {
      dataInicio: `${ano}-01-01`,
      dataFim: `${ano}-12-31`,
      nome: `Este Ano (${ano})`,
    };
  }
  if (periodo === 'todo') {
    return {
      dataInicio: '2000-01-01',
      dataFim: '2099-12-31',
      nome: 'Todo o Histórico',
    };
  }
  // Padrão 30d
  const ini = new Date(hoje);
  ini.setDate(hoje.getDate() - 29);
  return {
    dataInicio: ini.toISOString().slice(0, 10),
    dataFim: hoje.toISOString().slice(0, 10),
    nome: 'Últimos 30 dias',
  };
}

export default function ExportarSection() {
  const { addToast } = useToast();
  const [exportPeriodo, setExportPeriodo] = useState('30d');
  const [exportFormato, setExportFormato] = useState('csv');
  const [exportando, setExportando] = useState(false);
  const [modalPdfAberto, setModalPdfAberto] = useState(false);
  const [pdfData, setPdfData] = useState({
    periodoNome: 'Últimos 30 dias',
    resumo: {},
    detalhamento: [],
    transacoes: [],
  });

  async function handleExportar() {
    setExportando(true);
    try {
      if (exportFormato === 'csv') {
        const blob = await exportarTransacoes(null, exportPeriodo, 'csv');
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exportacao_${exportPeriodo}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        addToast('Arquivo CSV exportado com sucesso!', 'success');
      } else {
        const { dataInicio, dataFim, nome } = calcularDatasPeriodo(exportPeriodo);
        const [resumoData, detalheData, txnsData] = await Promise.all([
          getResumoPeriodo(null, dataInicio, dataFim),
          getDetalhamento(null, dataInicio, dataFim),
          getTransacoesRange({ dataInicio, dataFim, pageSize: 100 }),
        ]);

        setPdfData({
          periodoNome: nome,
          resumo: resumoData || {},
          detalhamento: detalheData || [],
          transacoes: txnsData?.data || [],
        });
        setModalPdfAberto(true);
      }
    } catch (err) {
      addToast(err.message || 'Erro ao processar exportação', 'error');
    } finally {
      setExportando(false);
    }
  }

  const anoAtual = new Date().getFullYear();

  return (
    <SettingsSection id="exportar" title="Exportação de Relatórios" icon={Download}>
      <Card className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Período do Relatório
            </label>
            <select
              className="flex h-11 w-full rounded-xl border border-border bg-secondary px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={exportPeriodo}
              onChange={(e) => setExportPeriodo(e.target.value)}
              disabled={exportando}
            >
              <option value="30d">Últimos 30 dias</option>
              <option value="ano">Este Ano ({anoAtual})</option>
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
          {exportFormato === 'pdf' ? (
            <>
              <FileText className="w-4 h-4 mr-2" />
              {exportando ? 'Preparando Relatório...' : 'Visualizar e Salvar PDF'}
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              {exportando ? 'Exportando...' : 'Baixar Arquivo'}
            </>
          )}
        </Button>
      </Card>

      {modalPdfAberto && (
        <RelatorioPdfModal
          aberto={modalPdfAberto}
          onFechar={() => setModalPdfAberto(false)}
          periodoNome={pdfData.periodoNome}
          resumo={pdfData.resumo}
          detalhamento={pdfData.detalhamento}
          transacoes={pdfData.transacoes}
          contaNome="Todas as Contas"
        />
      )}
    </SettingsSection>
  );
}
