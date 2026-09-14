import { useState, useCallback, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle2, ArrowRight, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { importarArquivoCsv, createTransacoesLote } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { cn } from '@/lib/utils';

export default function ImportarPage() {
  const { contaSelecionadaId, categorias } = useOutletContext() || {};
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [dragAtivo, setDragAtivo] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [previewData, setPreviewData] = useState([]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragAtivo(true);
    } else if (e.type === 'dragleave') {
      setDragAtivo(false);
    }
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragAtivo(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processarArquivo(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processarArquivo(e.target.files[0]);
    }
  };

  async function processarArquivo(file) {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      addToast('Por favor, envie apenas arquivos CSV.', 'error');
      return;
    }

    setCarregando(true);
    try {
      const data = await importarArquivoCsv(file);
      // Map to add frontend state like selected category and a temp id
      const mapped = data.map((item, idx) => ({
        ...item,
        tempId: idx,
        categoriaId: '',
        incluir: true,
      }));
      setPreviewData(mapped);
      addToast(`${data.length} linhas lidas com sucesso.`, 'success');
    } catch (err) {
      addToast(err.message || 'Erro ao processar o arquivo CSV.', 'error');
    } finally {
      setCarregando(false);
    }
  }

  const handleUpdateCategoria = (tempId, catId) => {
    setPreviewData((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, categoriaId: catId } : item)),
    );
  };

  const handleToggleIncluir = (tempId) => {
    setPreviewData((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, incluir: !item.incluir } : item)),
    );
  };

  const hasMissingCategories = useMemo(() => {
    return previewData.some((item) => item.incluir && !item.categoriaId);
  }, [previewData]);

  async function handleConfirmarLote() {
    if (!contaSelecionadaId) {
      addToast('Selecione uma conta no menu lateral primeiro.', 'error');
      return;
    }

    if (hasMissingCategories) {
      addToast(
        'Por favor, selecione uma categoria para todas as transações que deseja incluir.',
        'warning',
      );
      return;
    }

    const payload = previewData
      .filter((item) => item.incluir)
      .map((item) => ({
        contaId: parseInt(contaSelecionadaId, 10),
        categoriaId: parseInt(item.categoriaId, 10),
        descricao: item.descricao,
        valor: item.valor,
        tipo: item.tipo,
        data: item.data,
        status: 'Pago', // Assumimos pago por vir do extrato
      }));

    if (payload.length === 0) {
      addToast('Nenhuma transação selecionada.', 'warning');
      return;
    }

    setSalvando(true);
    try {
      await createTransacoesLote(payload);
      addToast(`${payload.length} transações salvas com sucesso!`, 'success');
      setPreviewData([]);
      navigate('/extrato');
    } catch (err) {
      addToast(err.message || 'Erro ao salvar em lote.', 'error');
    } finally {
      setSalvando(false);
    }
  }

  const categoriasEntrada = categorias?.filter((c) => c.tipo === 'Entrada') || [];
  const categoriasSaida = categorias?.filter((c) => c.tipo === 'Saida') || [];

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto pb-32 md:pb-12 pt-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Conciliação Inteligente
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Importe seus extratos bancários em massa
        </p>
      </header>

      {previewData.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card
            className={cn(
              'p-12 border-dashed border-2 transition-all flex flex-col items-center justify-center text-center bg-background/40 backdrop-blur-md rounded-3xl cursor-pointer',
              dragAtivo ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-primary/50',
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('csvUpload').click()}
          >
            <input
              id="csvUpload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6 shadow-inner">
              <UploadCloud className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Arraste e solte seu arquivo CSV
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              O FinSync fará a leitura automática das datas, valores e descrições do seu banco. Após
              isso, você poderá categorizá-los.
            </p>
            {carregando && (
              <div className="mt-6 flex items-center text-primary font-medium text-sm animate-pulse">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
                Lendo arquivo...
              </div>
            )}
          </Card>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70 pointer-events-none">
            <Card className="p-6 bg-card/40 border-white/5 rounded-3xl">
              <div className="flex items-center gap-3 mb-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                <h4 className="font-bold text-foreground">Formato Esperado</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                O CSV deve conter as colunas Data, Descricao, Valor e Tipo. Separador vírgula ou
                ponto e vírgula.
              </p>
            </Card>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="bg-card/60 backdrop-blur-md border-white/5 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Planilha Lida com Sucesso
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Revise os lançamentos e defina a categoria para cada um.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button variant="ghost" onClick={() => setPreviewData([])} className="rounded-xl">
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmarLote}
                  disabled={salvando}
                  className="rounded-xl font-bold gap-2 px-6 shadow-lg shadow-primary/20 w-full sm:w-auto"
                >
                  {salvando ? 'Salvando...' : 'Importar Lote'}
                  {!salvando && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Incluir</th>
                    <th className="px-6 py-4 font-semibold">Data</th>
                    <th className="px-6 py-4 font-semibold">Descrição</th>
                    <th className="px-6 py-4 font-semibold text-right">Valor</th>
                    <th className="px-6 py-4 font-semibold">Categoria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {previewData.map((item) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        key={item.tempId}
                        className={cn(
                          'hover:bg-white/5 transition-colors',
                          !item.incluir && 'opacity-40',
                        )}
                      >
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleIncluir(item.tempId)}
                            className={cn(
                              'w-5 h-5 rounded-md border flex items-center justify-center transition-colors',
                              item.incluir
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-muted-foreground',
                            )}
                          >
                            {item.incluir && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                        <td className="px-6 py-4 font-medium text-foreground">
                          {formatDate(item.data)}
                        </td>
                        <td
                          className="px-6 py-4 font-medium max-w-[200px] truncate"
                          title={item.descricao}
                        >
                          {item.descricao}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={cn(
                              'numeric-mono font-bold',
                              item.tipo === 'Entrada' ? 'text-emerald-500' : 'text-rose-500',
                            )}
                          >
                            {item.tipo === 'Entrada' ? '+' : '-'}
                            {formatCurrency(item.valor)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            disabled={!item.incluir}
                            value={item.categoriaId}
                            onChange={(e) => handleUpdateCategoria(item.tempId, e.target.value)}
                            className={cn(
                              'h-9 rounded-lg border bg-background/50 px-3 py-1 text-xs w-full max-w-[180px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
                              !item.categoriaId && item.incluir
                                ? 'border-rose-500/50 text-rose-500 focus-visible:ring-rose-500'
                                : 'border-input text-foreground',
                            )}
                          >
                            <option value="" disabled>
                              Selecione...
                            </option>
                            {(item.tipo === 'Entrada' ? categoriasEntrada : categoriasSaida).map(
                              (c) => (
                                <option key={c.id} value={c.id}>
                                  {c.nome}
                                </option>
                              ),
                            )}
                          </select>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
