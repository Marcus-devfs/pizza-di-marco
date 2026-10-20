export type PedidoStatus = 'pendente' | 'confirmado' | 'em_preparo' | 'entregue' | 'cancelado'

export interface ItemPedido {
  saborId: string
  saborNome: string
  quantidade: number
  precoUnitario: number
}

export interface Pedido {
  id: string
  cliente: string
  telefone: string
  itens: ItemPedido[]
  total: number
  status: PedidoStatus
  data: string
  observacoes?: string
  origem?: 'admin' | 'site'
  dataRetirada?: string
  fornada?: string
  horarioEntrega?: string
  endereco?: string
  recebimento?: string
}

export type StatusFornada = 'Aberta' | 'Encerrada' | 'Cancelada'

export interface Fornada {
  id: string
  data: string
  horarioInicio: string
  horarioFim: string
  capacidade: number
  reservadas: number
  sabores: string[]
  especial?: string
  encerramentoReservas?: string
  status: StatusFornada
  observacoes?: string
}

export type IngredienteCategoria = 'massa' | 'molho' | 'queijo' | 'proteina' | 'embalagem' | 'outros'

export interface Ingrediente {
  id: string
  nome: string
  unidade: string
  custoPorUnidade: number
  estoque: number
  estoqueMinimo: number
  categoria: IngredienteCategoria
}

export type GastoCategoria = 'ingredientes' | 'embalagens' | 'gas' | 'equipamentos' | 'manutencao' | 'outros'

export interface Gasto {
  id: string
  descricao: string
  categoria: GastoCategoria
  valor: number
  data: string
  observacoes?: string
}

export interface DashboardStats {
  faturamentoMes: number
  pedidosMes: number
  ticketMedio: number
  gastosMes: number
  pedidosPorStatus: Record<PedidoStatus, number>
  pedidosRecentes: Pedido[]
  faturamentoPorSabor: { nome: string; total: number; quantidade: number }[]
}

// --- Produção em lote, canais de venda e financeiro (módulos novos) ---

export type StatusProdutoCadastro = 'Ativo' | 'Inativo'

export interface Produto {
  id: string
  nome: string
  descricaoGourmet: string
  precoVenda: number
  custoInsumos: number
  status: StatusProdutoCadastro
  imagemUrl?: string
  margemLucro: number
  margemLucroPercentual: number
}

export type StatusLote = 'Em Maturação' | 'Pré-Assando' | 'Finalizado/Estoque'

export interface AlocacaoProduto {
  produto: string | Produto
  quantidade: number
}

export interface Lote {
  id: string
  codigo: string
  quantidadeFarinhaKg: number
  dataInicio: string
  dataFinalizacao?: string
  status: StatusLote
  alocacoes: AlocacaoProduto[]
  rendimentoTeorico: number
  rendimentoRealTotal: number
}

export type StatusAcerto = 'Pendente' | 'Parcialmente Vendido' | 'Finalizado'
export type TipoDestino = 'Condomínio' | 'Parceiro' | 'Outro'

export interface ItemMovimentacao {
  produto: string | Produto
  quantidadeEnviada: number
  quantidadeVendida: number
  precoVendaUnitario: number
}

export interface MovimentacaoCanal {
  id: string
  destino: string
  tipoDestino: TipoDestino
  dataEnvio: string
  dataAcerto?: string
  itens: ItemMovimentacao[]
  statusAcerto: StatusAcerto
  observacoes?: string
}

export interface SaldoEstoqueProduto {
  produtoId: string
  nome: string
  produzidoTotal: number
  emCanais: number
  vendidoDireto: number
  cortesias: number
  saldoDisponivel: number
}

export type CategoriaTransacao = 'Venda Direta' | 'Venda por Canal' | 'Cortesia/Marketing'

export interface TransacaoFinanceira {
  id: string
  tipo: 'Receita' | 'Despesa'
  categoria: CategoriaTransacao
  produto?: string
  quantidade?: number
  valor: number
  custoInsumoTotal?: number
  descricao: string
  data: string
}

export interface ResumoFinanceiro {
  receitas: number
  despesasGerais: number
  despesasMarketing: number
  custoInsumoVendido: number
  lucroLiquidoReal: number
  lucroLiquidoAposMarketing: number
  transacoes: TransacaoFinanceira[]
}
