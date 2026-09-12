export const IDIOMAS_SUPORTADOS = {
  PT: 'Português (Brasil)',
  EN: 'English (US)',
  ES: 'Español',
};

export const LOCALES = {
  'Português (Brasil)': 'pt-BR',
  'English (US)': 'en-US',
  'Español': 'es-ES',
};

export function getLocaleFromIdioma(idioma) {
  return LOCALES[idioma] || 'pt-BR';
}

export const translations = {
  'Português (Brasil)': {
    // Navegação
    nav_dashboard: 'Dashboard',
    nav_extrato: 'Extrato',
    nav_lancamentos: 'Lançamentos',
    nav_relatorios: 'Relatórios',
    nav_ajustes: 'Ajustes',
    nav_institucional: 'Institucional',
    nav_contas: 'Contas',
    nav_sem_contas: 'Nenhuma conta ativa',
    nav_minha_conta: 'Minha Conta',
    nav_sair: 'Sair',
    nav_modo_escuro: 'Modo Escuro',

    // Ajustes Menus
    ajustes_perfil: 'Perfil',
    ajustes_contas: 'Contas',
    ajustes_categorias: 'Categorias',
    ajustes_recorrencias: 'Recorrências & Fixos',
    ajustes_preferencias: 'Preferências',
    ajustes_notificacoes: 'Notificações',
    ajustes_exportar: 'Exportar',
    ajustes_seguranca: 'Segurança',

    // Preferências
    pref_titulo: 'Preferências do Sistema',
    pref_idioma: 'Idioma',
    pref_moeda: 'Moeda Padrão',
    pref_formato_data: 'Formato de Data',
    pref_modo_escuro: 'Modo Escuro',
    pref_modo_escuro_desc: 'Alternar entre o tema claro e escuro',
    pref_preview_titulo: 'Pré-visualização em Tempo Real',
    pref_preview_moeda: 'Exemplo de Moeda',
    pref_preview_data: 'Exemplo de Data',
    pref_preview_idioma: 'Idioma Selecionado',

    // Transações & Ações
    acao_salvar: 'Salvar',
    acao_cancelar: 'Cancelar',
    acao_excluir: 'Excluir',
    acao_editar: 'Editar',
    acao_filtrar: 'Filtrar',
    acao_buscar: 'Buscar',
    acao_novo_lancamento: 'Novo Lançamento',
    acao_nova_conta: 'Nova Conta',
    acao_nova_categoria: 'Nova Categoria',

    // Tipos & Status
    tipo_entrada: 'Entrada',
    tipo_saida: 'Saída',
    tipo_receita: 'Receita',
    tipo_despesa: 'Despesa',
    status_pago: 'Pago',
    status_pendente: 'Pendente',
    status_todos: 'Todos os Status',
    cat_todas: 'Todas as Categorias',

    // Tabela de Transações
    tab_descricao: 'Descrição',
    tab_categoria: 'Categoria',
    tab_status: 'Status',
    tab_data: 'Data',
    tab_valor: 'Valor',
    tab_acoes: 'Ações',
    tab_sem_transacoes: 'Nenhuma movimentação neste período.',

    // Períodos
    periodo_mes: 'Este Mês',
    periodo_dia: 'Dia',
    periodo_periodo: 'Período',
    periodo_hoje: 'Hoje',
    periodo_ontem: 'Ontem',

    // Dashboard
    dash_titulo: 'Visão Geral',
    dash_entradas: 'Entradas',
    dash_saidas: 'Saídas',
    dash_saldo_geral: 'Saldo Geral',
    dash_saldo_previsto: 'Saldo Previsto',
    dash_proximos_vencimentos: 'Próximos Vencimentos',
  },

  'English (US)': {
    // Navegação
    nav_dashboard: 'Dashboard',
    nav_extrato: 'Transactions',
    nav_lancamentos: 'New Entry',
    nav_relatorios: 'Reports',
    nav_ajustes: 'Settings',
    nav_institucional: 'Institutional',
    nav_contas: 'Accounts',
    nav_sem_contas: 'No active accounts',
    nav_minha_conta: 'My Account',
    nav_sair: 'Log Out',
    nav_modo_escuro: 'Dark Mode',

    // Ajustes Menus
    ajustes_perfil: 'Profile',
    ajustes_contas: 'Accounts',
    ajustes_categorias: 'Categories',
    ajustes_recorrencias: 'Recurring & Fixed',
    ajustes_preferencias: 'Preferences',
    ajustes_notificacoes: 'Notifications',
    ajustes_exportar: 'Export',
    ajustes_seguranca: 'Security',

    // Preferências
    pref_titulo: 'System Preferences',
    pref_idioma: 'Language',
    pref_moeda: 'Default Currency',
    pref_formato_data: 'Date Format',
    pref_modo_escuro: 'Dark Mode',
    pref_modo_escuro_desc: 'Switch between light and dark theme',
    pref_preview_titulo: 'Real-Time Preview',
    pref_preview_moeda: 'Currency Example',
    pref_preview_data: 'Date Example',
    pref_preview_idioma: 'Selected Language',

    // Transações & Ações
    acao_salvar: 'Save',
    acao_cancelar: 'Cancel',
    acao_excluir: 'Delete',
    acao_editar: 'Edit',
    acao_filtrar: 'Filter',
    acao_buscar: 'Search',
    acao_novo_lancamento: 'New Transaction',
    acao_nova_conta: 'New Account',
    acao_nova_categoria: 'New Category',

    // Tipos & Status
    tipo_entrada: 'Income',
    tipo_saida: 'Expense',
    tipo_receita: 'Income',
    tipo_despesa: 'Expense',
    status_pago: 'Paid',
    status_pendente: 'Pending',
    status_todos: 'All Statuses',
    cat_todas: 'All Categories',

    // Tabela de Transações
    tab_descricao: 'Description',
    tab_categoria: 'Category',
    tab_status: 'Status',
    tab_data: 'Date',
    tab_valor: 'Amount',
    tab_acoes: 'Actions',
    tab_sem_transacoes: 'No transactions in this period.',

    // Períodos
    periodo_mes: 'This Month',
    periodo_dia: 'Day',
    periodo_periodo: 'Custom Range',
    periodo_hoje: 'Today',
    periodo_ontem: 'Yesterday',

    // Dashboard
    dash_titulo: 'Overview',
    dash_entradas: 'Income',
    dash_saidas: 'Expenses',
    dash_saldo_geral: 'Total Balance',
    dash_saldo_previsto: 'Projected Balance',
    dash_proximos_vencimentos: 'Upcoming Due Dates',
  },

  'Español': {
    // Navegação
    nav_dashboard: 'Panel',
    nav_extrato: 'Movimientos',
    nav_lancamentos: 'Nuevo Registro',
    nav_relatorios: 'Informes',
    nav_ajustes: 'Ajustes',
    nav_institucional: 'Institucional',
    nav_contas: 'Cuentas',
    nav_sem_contas: 'Sin cuentas activas',
    nav_minha_conta: 'Mi Cuenta',
    nav_sair: 'Cerrar Sesión',
    nav_modo_escuro: 'Modo Oscuro',

    // Ajustes Menus
    ajustes_perfil: 'Perfil',
    ajustes_contas: 'Cuentas',
    ajustes_categorias: 'Categorías',
    ajustes_recorrencias: 'Recurrentes & Fijos',
    ajustes_preferencias: 'Preferencias',
    ajustes_notificacoes: 'Notificaciones',
    ajustes_exportar: 'Exportar',
    ajustes_seguranca: 'Seguridad',

    // Preferências
    pref_titulo: 'Preferencias del Sistema',
    pref_idioma: 'Idioma',
    pref_moeda: 'Moneda Predeterminada',
    pref_formato_data: 'Formato de Fecha',
    pref_modo_escuro: 'Modo Oscuro',
    pref_modo_escuro_desc: 'Alternar entre tema claro y oscuro',
    pref_preview_titulo: 'Vista Previa en Tiempo Real',
    pref_preview_moeda: 'Ejemplo de Moneda',
    pref_preview_data: 'Ejemplo de Fecha',
    pref_preview_idioma: 'Idioma Seleccionado',

    // Transações & Ações
    acao_salvar: 'Guardar',
    acao_cancelar: 'Cancelar',
    acao_excluir: 'Eliminar',
    acao_editar: 'Editar',
    acao_filtrar: 'Filtrar',
    acao_buscar: 'Buscar',
    acao_novo_lancamento: 'Nuevo Registro',
    acao_nova_conta: 'Nueva Cuenta',
    acao_nova_categoria: 'Nueva Categoría',

    // Tipos & Status
    tipo_entrada: 'Ingreso',
    tipo_saida: 'Gasto',
    tipo_receita: 'Ingreso',
    tipo_despesa: 'Gasto',
    status_pago: 'Pagado',
    status_pendente: 'Pendiente',
    status_todos: 'Todos los Estados',
    cat_todas: 'Todas las Categorías',

    // Tabela de Transações
    tab_descricao: 'Descripción',
    tab_categoria: 'Categoría',
    tab_status: 'Estado',
    tab_data: 'Fecha',
    tab_valor: 'Monto',
    tab_acoes: 'Acciones',
    tab_sem_transacoes: 'Sin movimientos en este período.',

    // Períodos
    periodo_mes: 'Este Mes',
    periodo_dia: 'Día',
    periodo_periodo: 'Período',
    periodo_hoje: 'Hoy',
    periodo_ontem: 'Ayer',

    // Dashboard
    dash_titulo: 'Visión General',
    dash_entradas: 'Ingresos',
    dash_saidas: 'Gastos',
    dash_saldo_geral: 'Saldo Total',
    dash_saldo_previsto: 'Saldo Previsto',
    dash_proximos_vencimentos: 'Próximos Vencimientos',
  },
};
