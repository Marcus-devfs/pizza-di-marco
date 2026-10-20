// Regras de data/horário da fornada, sem dependência do banco: usadas tanto
// pelas APIs quanto pelas telas do admin.

// America/Sao_Paulo não tem horário de verão desde 2019.
const OFFSET_BRASILIA = '-03:00'
const TZ = 'America/Sao_Paulo'

type DatasFornada = {
  data: string
  horarioInicio: string
  horarioFim: string
  encerramentoReservas?: Date | string | null
}

export function hojeEmBrasilia(agora = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(agora)
}

export function inicioFornada(f: Pick<DatasFornada, 'data' | 'horarioInicio'>) {
  return new Date(`${f.data}T${f.horarioInicio}:00${OFFSET_BRASILIA}`)
}

export function fimFornada(f: Pick<DatasFornada, 'data' | 'horarioFim'>) {
  return new Date(`${f.data}T${f.horarioFim}:00${OFFSET_BRASILIA}`)
}

// Sem prazo definido, as reservas fecham quando começam as entregas.
export function prazoReservas(f: DatasFornada) {
  return f.encerramentoReservas ? new Date(f.encerramentoReservas) : inicioFornada(f)
}

export function reservasAbertas(f: DatasFornada & { status: string }, agora = new Date()) {
  return f.status === 'Aberta' && agora < prazoReservas(f)
}

function diaDaSemana(data: string) {
  const dia = new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, weekday: 'long' }).format(
    new Date(`${data}T12:00:00${OFFSET_BRASILIA}`),
  )
  return dia.charAt(0).toUpperCase() + dia.slice(1).replace('-feira', '')
}

// "Sábado, 25 de outubro"
export function rotuloFornada(data: string) {
  const texto = new Intl.DateTimeFormat('pt-BR', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${data}T12:00:00${OFFSET_BRASILIA}`))
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function hora(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
}

// Janela da fornada em horários de 1h: ["Sábado · 19h–20h", "Sábado · 20h–21h"].
export function horariosFornada(f: Pick<DatasFornada, 'data' | 'horarioInicio' | 'horarioFim'>) {
  const paraMin = (h: string) => {
    const [hh, mm] = h.split(':').map(Number)
    return hh * 60 + mm
  }
  const inicio = paraMin(f.horarioInicio)
  const fim = paraMin(f.horarioFim)
  const dia = diaDaSemana(f.data)
  const horarios: string[] = []
  for (let t = inicio; t < fim; t += 60) {
    horarios.push(`${dia} · ${hora(t)}–${hora(Math.min(t + 60, fim))}`)
  }
  return horarios
}

/** Fornada "da vez": a próxima aberta cuja janela de entrega ainda não terminou. */
export function proximaFornada<T extends DatasFornada & { status: string }>(fornadas: T[], agora = new Date()) {
  return (
    [...fornadas]
      .filter((f) => f.status === 'Aberta' && fimFornada(f) > agora)
      .sort((a, b) => inicioFornada(a).getTime() - inicioFornada(b).getTime())[0] ?? null
  )
}
