import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { Input } from '../ui/input';
import { getSugestoesDescricao } from '../../services/api';
import { cn } from '@/lib/utils';

function removerAcentos(str) {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export default function DescricaoAutocomplete({
  value = '',
  onChange,
  onSelect,
  tipo,
  contaId,
  placeholder = 'Ex: Venda no balcão, Supermercado, Aluguel...',
  maxLength = 120,
  className,
  required = false,
  id = 'descricao-input',
  disabled = false,
}) {
  const [sugestoes, setSugestoes] = useState([]);
  const [aberto, setAberto] = useState(false);
  const [focoIndex, setFocoIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Carrega sugestões da API sempre que tipo ou contaId mudarem
  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const dados = await getSugestoesDescricao({
          contaId: contaId || null,
          tipo: tipo || null,
          limite: 60,
        });
        if (ativo && Array.isArray(dados)) {
          setSugestoes(dados);
        }
      } catch {
        // Silencioso se offline ou sem histórico ainda
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [contaId, tipo]);

  // Filtra as sugestões conforme o que o usuário digita, mantendo as mais digitadas no topo
  const sugestoesFiltradas = useMemo(() => {
    if (!sugestoes || sugestoes.length === 0) return [];

    const termo = removerAcentos(value);

    // Se o campo estiver vazio, exibe as 8 opções mais digitadas
    if (!termo) {
      return sugestoes.slice(0, 8);
    }

    // Filtra por ocorrência (case e acento insensíveis)
    const filtradas = sugestoes.filter((s) => removerAcentos(s.descricao).includes(termo));

    // Ordenação: prioriza as mais digitadas (totalUsos desc), desempatando pela última data
    return filtradas
      .sort((a, b) => {
        const diffUsos = (b.totalUsos || 0) - (a.totalUsos || 0);
        if (diffUsos !== 0) return diffUsos;
        return (b.ultimaData || '').localeCompare(a.ultimaData || '');
      })
      .slice(0, 8);
  }, [sugestoes, value]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickFora(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setAberto(false);
      }
    }

    document.addEventListener('mousedown', handleClickFora);
    document.addEventListener('touchstart', handleClickFora);
    return () => {
      document.removeEventListener('mousedown', handleClickFora);
      document.removeEventListener('touchstart', handleClickFora);
    };
  }, []);

  function handleSelect(sugestao) {
    if (onChange) {
      onChange({ target: { value: sugestao.descricao } });
    }
    if (onSelect) {
      onSelect(sugestao);
    }
    setAberto(false);
    setFocoIndex(-1);
  }

  function handleKeyDown(e) {
    if (!aberto || sugestoesFiltradas.length === 0) {
      if (e.key === 'ArrowDown') {
        setAberto(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocoIndex((prev) => (prev < sugestoesFiltradas.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocoIndex((prev) => (prev > 0 ? prev - 1 : sugestoesFiltradas.length - 1));
    } else if (e.key === 'Enter') {
      if (focoIndex >= 0 && focoIndex < sugestoesFiltradas.length) {
        e.preventDefault();
        handleSelect(sugestoesFiltradas[focoIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setAberto(false);
      setFocoIndex(-1);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        ref={inputRef}
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          if (onChange) onChange(e);
          setAberto(true);
          setFocoIndex(-1);
        }}
        onFocus={() => {
          setAberto(true);
          setFocoIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        maxLength={maxLength}
        className={cn('rounded-xl h-11 text-sm bg-secondary border-border', className)}
        required={required}
        disabled={disabled}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={aberto && sugestoesFiltradas.length > 0}
        aria-controls="descricao-sugestoes-listbox"
      />

      {/* Menu flutuante de sugestões */}
      {aberto && sugestoesFiltradas.length > 0 && (
        <div
          id="descricao-sugestoes-listbox"
          role="listbox"
          aria-label="Sugestões de descrição"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden py-1 max-h-60 overflow-y-auto backdrop-blur-xl animate-in fade-in-50 zoom-in-95 duration-100"
        >
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center justify-between border-b border-border/50">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary" />
              Sugestões Frequentes
            </span>
            <span>Mais digitadas</span>
          </div>

          <div className="py-1">
            {sugestoesFiltradas.map((sugestao, index) => {
              const isFocado = index === focoIndex;
              const isMaisFrequente = index === 0 && sugestao.totalUsos > 1;

              return (
                <div
                  key={`${sugestao.descricao}-${index}`}
                  role="option"
                  aria-selected={isFocado}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(sugestao);
                  }}
                  onMouseEnter={() => setFocoIndex(index)}
                  className={cn(
                    'px-3.5 py-2 flex items-center justify-between cursor-pointer transition-colors text-sm',
                    isFocado
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-secondary/70',
                  )}
                >
                  <span className="truncate pr-2">{sugestao.descricao}</span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isMaisFrequente && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-semibold hidden sm:inline-flex items-center gap-1">
                        Top
                      </span>
                    )}
                    <span
                      title={`${sugestao.totalUsos} lançamento(s) anteriores`}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-secondary border border-border/60 text-muted-foreground font-mono"
                    >
                      {sugestao.totalUsos}x
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
