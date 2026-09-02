import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export default function DeleteLancamentoModal({ deleteModal, onConfirmDelete, onCancel }) {
  if (!deleteModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md p-6 space-y-4 border border-border shadow-2xl">
        <h3 className="text-base font-semibold text-foreground">
          {deleteModal.tipo === 'parcelamento'
            ? 'Excluir Compra Parcelada'
            : 'Excluir Lançamento Recorrente'}
        </h3>
        <p className="text-xs text-muted-foreground">
          {deleteModal.tipo === 'parcelamento'
            ? `Esta transação faz parte de um parcelamento em ${deleteModal.transacao.totalParcelas}x. Deseja excluir apenas esta parcela ou todas as parcelas deste parcelamento?`
            : 'Esta transação é originada de uma regra recorrente periódica. Deseja excluir apenas este lançamento ou todas as ocorrências futuras pendentes?'}
        </p>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            variant="destructive"
            onClick={() =>
              onConfirmDelete(deleteModal.transacao.id, {
                excluirTodasParcelas: deleteModal.tipo === 'parcelamento',
                excluirFuturas: deleteModal.tipo === 'recorrencia',
              })
            }
            className="w-full rounded-xl text-xs font-semibold"
          >
            {deleteModal.tipo === 'parcelamento'
              ? 'Excluir Todas as Parcelas'
              : 'Excluir Esta e Todas as Futuras'}
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              onConfirmDelete(deleteModal.transacao.id, {
                excluirTodasParcelas: false,
                excluirFuturas: false,
              })
            }
            className="w-full rounded-xl text-xs font-semibold"
          >
            Excluir Apenas Este Registro
          </Button>
          <Button
            variant="ghost"
            onClick={onCancel}
            className="w-full rounded-xl text-xs text-muted-foreground"
          >
            Cancelar
          </Button>
        </div>
      </Card>
    </div>
  );
}
