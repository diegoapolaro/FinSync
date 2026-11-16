import { TipoTransacao } from '@/types/enums';
import { TIPO_TRANSACAO } from './constants';

export interface PresetCategoria {
  nome: string;
  tipo: TipoTransacao;
  cor: string;
}

// Modelos gastronômicos e alimentares (Sem emojis)
export const PRESETS_ALIMENTACAO: PresetCategoria[] = [
  { nome: 'Insumos & Matéria-Prima', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#f59e0b' },
  { nome: 'Hortifruti & Molhos', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#ef4444' },
  { nome: 'Embalagens & Descartáveis', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#8b5cf6' },
  { nome: 'Logística & Entregas', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#0ea5e9' },
  { nome: 'Gás, Energia & Manutenção', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#f97316' },
  { nome: 'Bebidas & Estoque Seco', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#06b6d4' },
  { nome: 'Taxas de Cartão & Adquirentes', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#e11d48' },
  { nome: 'Equipe & Folha Operacional', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#6366f1' },
  { nome: 'Aluguel & Contas Fixas', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#64748b' },
  { nome: 'Higiene & Limpeza', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#14b8a6' },
  { nome: 'Vendas Balcão / Salão', tipo: TIPO_TRANSACAO.ENTRADA as TipoTransacao, cor: '#00cc4b' },
  { nome: 'Vendas Delivery & Marketplaces', tipo: TIPO_TRANSACAO.ENTRADA as TipoTransacao, cor: '#1c6cff' },
  { nome: 'Vendas Canal Próprio', tipo: TIPO_TRANSACAO.ENTRADA as TipoTransacao, cor: '#10b981' },
];

// Modelos para Barbearia, Salão e Estética (Sem emojis)
export const PRESETS_BARBEARIA: PresetCategoria[] = [
  { nome: 'Cortes & Barba', tipo: TIPO_TRANSACAO.ENTRADA as TipoTransacao, cor: '#00cc4b' },
  { nome: 'Venda de Pomadas & Cosméticos', tipo: TIPO_TRANSACAO.ENTRADA as TipoTransacao, cor: '#1c6cff' },
  { nome: 'Tratamentos & Química', tipo: TIPO_TRANSACAO.ENTRADA as TipoTransacao, cor: '#10b981' },
  { nome: 'Bebidas & Cafeteria', tipo: TIPO_TRANSACAO.ENTRADA as TipoTransacao, cor: '#06b6d4' },
  { nome: 'Lâminas & Descartáveis', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#ef4444' },
  { nome: 'Produtos & Cosméticos Capilares', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#f59e0b' },
  { nome: 'Comissões de Barbeiros', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#6366f1' },
  { nome: 'Aluguel & Contas Fixas', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#64748b' },
  { nome: 'Taxas de Cartão & Adquirentes', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#e11d48' },
  { nome: 'Higiene & Esterilização', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#14b8a6' },
  { nome: 'Marketing & Divulgação', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#0ea5e9' },
];

// Modelos Gerais para Empresas / Comércio Geral (Sem emojis)
export const PRESETS_GERAL: PresetCategoria[] = [
  { nome: 'Venda de Produtos & Mercadorias', tipo: TIPO_TRANSACAO.ENTRADA as TipoTransacao, cor: '#00cc4b' },
  { nome: 'Prestação de Serviços', tipo: TIPO_TRANSACAO.ENTRADA as TipoTransacao, cor: '#1c6cff' },
  { nome: 'Receitas Financeiras & Rendimentos', tipo: TIPO_TRANSACAO.ENTRADA as TipoTransacao, cor: '#10b981' },
  { nome: 'Fornecedores & Estoque', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#f59e0b' },
  { nome: 'Aluguel & Contas Fixas', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#64748b' },
  { nome: 'Equipe & Pró-labore', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#6366f1' },
  { nome: 'Marketing & Anúncios', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#0ea5e9' },
  { nome: 'Taxas Bancárias & Adquirentes', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#e11d48' },
  { nome: 'Manutenção & Materiais', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#14b8a6' },
  { nome: 'Impostos & Taxas Fiscais', tipo: TIPO_TRANSACAO.SAIDA as TipoTransacao, cor: '#ef4444' },
];

export function detectarSegmentoComercial(nome?: string): {
  id: 'alimentacao' | 'barbearia' | 'geral';
  titulo: string;
  presets: PresetCategoria[];
} {
  const normalizado = (nome || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  if (
    normalizado.includes('barber') ||
    normalizado.includes('barbearia') ||
    normalizado.includes('cabelo') ||
    normalizado.includes('salao') ||
    normalizado.includes('estetica') ||
    normalizado.includes('manicure')
  ) {
    return {
      id: 'barbearia',
      titulo: 'Barbearia & Cuidados',
      presets: PRESETS_BARBEARIA,
    };
  }

  if (
    normalizado.includes('pizza') ||
    normalizado.includes('restaurante') ||
    normalizado.includes('burger') ||
    normalizado.includes('hamburguer') ||
    normalizado.includes('lanchonete') ||
    normalizado.includes('lanche') ||
    normalizado.includes('forneria') ||
    normalizado.includes('padaria') ||
    normalizado.includes('cafe') ||
    normalizado.includes('comida') ||
    normalizado.includes('bar')
  ) {
    return {
      id: 'alimentacao',
      titulo: 'Comércio & Alimentação',
      presets: PRESETS_ALIMENTACAO,
    };
  }

  return {
    id: 'geral',
    titulo: 'Comércio & Serviços',
    presets: PRESETS_GERAL,
  };
}
