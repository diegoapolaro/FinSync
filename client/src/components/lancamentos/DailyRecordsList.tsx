import React from 'react';
import LancamentoItemCard from './LancamentoItemCard';
import { formatLabel } from '../../utils/dateHelpers';
import type { TransacaoDto, CategoriaDto, ContaDto } from '@/types';

interface Props {
  dataSelecionada: string;
  transacoes: TransacaoDto[];
  carregando: boolean;
  editandoId: number | null;
  onToggleStatus: (transacao: TransacaoDto) => void;
  onEditar: (transacao: TransacaoDto) => void;
  onConfirmarExclusao: (transacao: TransacaoDto) => void;
  categoriasPorTipo: Record<string, CategoriaDto[]>;
  contas: ContaDto[];
  onSalvarEdicao: (transacao: Partial<TransacaoDto>) => void;
  onCancelarEdicao: () => void;
  salvandoEdicao: boolean;
}

export default function DailyRecordsList({
  dataSelecionada,
  transacoes,
  carregando,
  editandoId,
  onToggleStatus,
  onEditar,
  onConfirmarExclusao,
  categoriasPorTipo,
  contas,
  onSalvarEdicao,
  onCancelarEdicao,
  salvandoEdicao,
}: Props): React.ReactElement {
  const labelData = formatLabel(new Date(dataSelecionada + 'T12:00:00'));

  return (
    <div className="mt-8 flex flex-col gap-4">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-forest-ink dark:text-paper font-sans">
            Lançamentos de {labelData}
          </h2>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-fog dark:bg-spruce/60 text-charcoal dark:text-pebble border border-pebble/20">
            {dataSelecionada}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs numeric-mono text-charcoal dark:text-pebble font-bold">
            Total: {transacoes.length} {transacoes.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>
      </div>

      {/* Estado de Carregamento */}
      {carregando && (
        <div className="bg-paper dark:bg-card rounded-[20px] p-10 text-center text-charcoal dark:text-pebble text-sm border border-pebble/20 shadow-xs flex flex-col items-center justify-center gap-3">
          <span className="w-6 h-6 border-2 border-forest-ink dark:border-lime-voltage border-t-transparent rounded-full animate-spin" />
          <span className="font-bold">Carregando registros...</span>
        </div>
      )}

      {/* Estado Vazio */}
      {!carregando && transacoes.length === 0 && (
        <div className="bg-fog/60 dark:bg-card/40 rounded-[20px] p-10 text-center text-sm text-charcoal dark:text-pebble border border-dashed border-pebble/40">
          <p className="font-semibold">Nenhum lançamento registrado nesta data.</p>
          <p className="text-xs text-pebble mt-1">
            Preencha o formulário acima para registrar uma nova movimentação financeira.
          </p>
        </div>
      )}

      {/* Lista de Registros */}
      {!carregando && transacoes.length > 0 && (
        <div className="space-y-3">
          {transacoes.map((t) => (
            <LancamentoItemCard
              key={t.id}
              transacao={t}
              isEditingThis={editandoId === t.id}
              onToggleStatus={onToggleStatus}
              onEditar={onEditar}
              onConfirmarExclusao={onConfirmarExclusao}
              categoriasPorTipo={categoriasPorTipo}
              contas={contas}
              onSalvarEdicao={onSalvarEdicao}
              onCancelarEdicao={onCancelarEdicao}
              salvandoEdicao={salvandoEdicao}
            />
          ))}
        </div>
      )}
    </div>
  );
}
