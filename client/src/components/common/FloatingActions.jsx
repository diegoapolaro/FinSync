import { Plus, Minus } from 'lucide-react';
import { Button } from '../ui/button';

export default function FloatingActions({ onEntrada, onSaida, empty }) {
  if (empty) {
    return (
      <div className="flex gap-4 mt-8 max-w-md mx-auto">
        <Button
          onClick={onEntrada}
          variant="default"
          size="default"
          className="flex-1"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          Nova Entrada
        </Button>
        <Button
          onClick={onSaida}
          variant="secondary"
          size="default"
          className="flex-1"
        >
          <Minus className="w-5 h-5 stroke-[2.5]" />
          Nova Saída
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop: fixed bottom-right */}
      <div className="hidden md:flex fixed bottom-8 right-8 gap-3 z-50">
        <Button
          onClick={onEntrada}
          variant="default"
          size="default"
          className="shadow-md"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          Entrada
        </Button>
        <Button
          onClick={onSaida}
          variant="outline"
          size="default"
          className="shadow-md"
        >
          <Minus className="w-5 h-5 stroke-[2.5]" />
          Saída
        </Button>
      </div>

      {/* Mobile: floating bottom-right */}
      <div className="md:hidden fixed bottom-20 right-4 z-50 flex flex-col gap-2">
        <Button
          onClick={onEntrada}
          variant="default"
          size="icon"
          className="h-11 w-11 shadow-md"
          title="Nova Entrada"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </Button>
        <Button
          onClick={onSaida}
          variant="outline"
          size="icon"
          className="h-11 w-11 shadow-md"
          title="Nova Saída"
        >
          <Minus className="w-6 h-6 stroke-[2.5]" />
        </Button>
      </div>
    </>
  );
}
