import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '../ui/button';

export default function FloatingActions({ onEntrada, onSaida, empty }) {
  if (empty) {
    return (
      <div className="flex gap-3 mt-6 max-w-md mx-auto w-full">
        <Button
          onClick={onEntrada}
          variant="default"
          size="default"
          className="flex-1 rounded-full font-semibold"
        >
          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          Nova Entrada
        </Button>
        <Button
          onClick={onSaida}
          variant="secondary"
          size="default"
          className="flex-1 rounded-full font-semibold bg-surface-strong text-ink hover:bg-surface-strong/80"
        >
          <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
          Nova Saída
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop: fixed bottom-8 right-8 */}
      <div className="hidden md:flex fixed bottom-8 right-8 gap-3 z-50">
        <Button
          onClick={onEntrada}
          variant="default"
          size="default"
          className="rounded-full px-5 py-2.5 font-semibold transition-transform hover:scale-105"
        >
          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          Entrada
        </Button>
        <Button
          onClick={onSaida}
          variant="secondary"
          size="default"
          className="rounded-full px-5 py-2.5 font-semibold transition-transform hover:scale-105 bg-surface-strong text-ink hover:bg-surface-strong/80"
        >
          <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
          Saída
        </Button>
      </div>

      {/* Mobile: floating bottom-20 right-4 */}
      <div className="md:hidden fixed bottom-20 right-4 z-50 flex flex-col gap-2.5">
        <Button
          onClick={onEntrada}
          variant="default"
          size="icon"
          className="h-12 w-12 rounded-full"
          title="Nova Entrada"
        >
          <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
        </Button>
        <Button
          onClick={onSaida}
          variant="secondary"
          size="icon"
          className="h-12 w-12 rounded-full bg-surface-strong text-ink shadow-lg"
          title="Nova Saída"
        >
          <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
        </Button>
      </div>
    </>
  );
}
