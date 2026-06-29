import type { Sala, Prenotazione, NuovaPrenotazione, ModificaPrenotazione } from './types'

const API_URL = 'http://localhost:8000'

export async function getSale(): Promise<Sala[]> {
  const risposta = await fetch(`${API_URL}/sale.php`)
  if (!risposta.ok) throw new Error('Errore nel caricamento delle sale')
  return risposta.json()
}

export async function getPrenotazioni(): Promise<Prenotazione[]> {
  const risposta = await fetch(`${API_URL}/prenotazioni.php`)
  if (!risposta.ok) throw new Error('Errore nel caricamento delle prenotazioni')
  return risposta.json()
}

export async function creaPrenotazione(dati: NuovaPrenotazione): Promise<void> {
  const risposta = await fetch(`${API_URL}/crea.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dati),
  })
  if (!risposta.ok) {
    const corpo = (await risposta.json().catch(() => ({}))) as { errore?: string }
    throw new Error(corpo.errore ?? 'Errore nel salvataggio della prenotazione')
  }
}

export async function modificaPrenotazione(dati: ModificaPrenotazione): Promise<void> {
  const risposta = await fetch(`${API_URL}/modifica.php`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dati),
  })
  if (!risposta.ok) {
    const corpo = (await risposta.json().catch(() => ({}))) as { errore?: string }
    throw new Error(corpo.errore ?? 'Errore nella modifica della prenotazione')
  }
}

export async function cancellaPrenotazione(id: number): Promise<void> {
  const risposta = await fetch(`${API_URL}/cancella.php`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
  if (!risposta.ok) {
    const corpo = (await risposta.json().catch(() => ({}))) as { errore?: string }
    throw new Error(corpo.errore ?? 'Errore nella cancellazione della prenotazione')
  }
}
