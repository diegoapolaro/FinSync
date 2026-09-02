import React from 'react';
import { Card } from '../ui/card';
import LancamentoItemCard from './LancamentoItemCard';
import { formatLabel } from '../../utils/dateHelpers';

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
}) {
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Lançamentos de {formatLabel(new Date(dataSelecionada + 'T12:00:00'))} ({dataSelecionada})
        </h3>
        <span className="text-xs numeric-mono text-muted-foreground font-medium">
          Total: {transacoes.length}
        </span>
      </div>

      {carregando && (
        <div className="text-center py-10 text-muted-foreground text-sm">
          <span className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin align-middle mr-2" />
          Carregando registros...
        </div>
      )}

      {!carregando && transacoes.length === 0 && (
        <Card className="p-8 text-center text-sm text-muted-foreground border-dashed border-border">
          Nenhum lançamento registrado nesta data.
        </Card>
      )}

      {!carregando && transacoes.length > 0 && (
        <div className="space-y-2.5">
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
