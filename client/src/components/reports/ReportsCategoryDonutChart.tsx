import React, { useMemo } from 'react';
import { formatCurrency } from '../../utils/formatters';

export interface CategoryDistributionItem {
  nome: string;
  total: number;
  percent: number;
  color?: string;
}

interface ReportsCategoryDonutChartProps {
  categorias?: CategoryDistributionItem[];
  totalDespesas?: number;
}

const wiseDonutPalette = [
  '#163300', // Forest Ink
  '#054d28', // Spruce
  '#9fe870', // Lime Voltage
  '#868685', // Pebble
  '#0b4c72', // Signal Blue
  '#cb272f', // Alarm Red
  '#e2f6d5', // Linen Mist
  '#454745', // Charcoal
];

export default function ReportsCategoryDonutChart({
  categorias = [],
  totalDespesas = 33729.5,
}: ReportsCategoryDonutChartProps): React.ReactElement {
  // Dados com fallback realista se nenhuma categoria com despesas existir
  const itens = useMemo(() => {
    if (categorias && categorias.length > 0) {
      return categorias;
    }
    return [
      { nome: 'Insumos & Alimentos', total: 14200, percent: 42 },
      { nome: 'Pessoal & Garçons', total: 9500, percent: 28 },
      { nome: 'Aluguel & Fixos', total: 5400, percent: 16 },
      { nome: 'Impostos & Taxas', total: 3380, percent: 10 },
      { nome: 'Outros Gerais', total: 1249.5, percent: 4 },
    ];
  }, [categorias]);

  const totalCalculado = useMemo(() => {
    return totalDespesas > 0
      ? totalDespesas
      : itens.reduce((acc, it) => acc + it.total, 0);
  }, [totalDespesas, itens]);

  // Circunferência de raio 38: 2 * Math.PI * 38 ≈ 238.76
  const circ = 2 * Math.PI * 38;

  const segmentos = useMemo(() => {
    const somaTotal = itens.reduce((acc, it) => acc + it.percent, 0) || 100;
    let acumOffset = 0;

    return itens.map((it, idx) => {
      const pct = (it.percent / somaTotal) * 100;
      const compTraço = (pct / 100) * circ;
      const color = it.color || wiseDonutPalette[idx % wiseDonutPalette.length];
      const seg = {
        ...it,
        pct,
        color,
        dasharray: `${compTraço.toFixed(1)} ${circ.toFixed(1)}`,
        dashoffset: -acumOffset,
      };
      acumOffset += compTraço;
      return seg;
    });
  }, [itens, circ]);

  return (
    <div className="bg-fog dark:bg-card border border-transparent dark:border-spruce rounded-[24px] p-6 flex flex-col justify-between shadow-sm transition-all h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-bold uppercase text-pebble tracking-wider block">
            Custos Operacionais
          </span>
          <h3 className="text-xl font-bold text-forest-ink dark:text-paper tracking-tight mt-0.5">
            Distribuição por Categoria
          </h3>
        </div>
        <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-paper dark:bg-spruce text-charcoal dark:text-pebble border border-border/40">
          100% Total
        </span>
      </div>

      {/* Conjunto Gráfico Donut + Legenda */}
      <div className="flex flex-col sm:flex-row items-center gap-6 justify-center my-auto py-2">
        {/* SVG Donut Vector */}
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {segmentos.map((seg, idx) => (
              <circle
                key={idx}
                cx="50"
                cy="50"
                fill="none"
                r="38"
                stroke={seg.color}
                strokeDasharray={seg.dasharray}
                strokeDashoffset={seg.dashoffset}
                strokeWidth="12"
                className="transition-all duration-500"
              />
            ))}
          </svg>

          {/* Rótulo Central */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="numeric-mono text-base font-black text-forest-ink dark:text-paper">
              {formatCurrency(totalCalculado)}
            </span>
            <span className="text-[10px] font-bold uppercase text-pebble tracking-wider">
              Despesas
            </span>
          </div>
        </div>

        {/* Detalhes da Legenda */}
        <div className="flex flex-col gap-2.5 w-full">
          {segmentos.map((seg, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="font-semibold text-charcoal dark:text-paper truncate max-w-[140px]" title={seg.nome}>
                  {seg.nome}
                </span>
              </div>
              <div className="flex items-center gap-2 numeric-mono font-bold shrink-0">
                <span className="text-forest-ink dark:text-paper">{seg.pct.toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
