export interface Sala {
  id: number
  nome: string
  capienza: number
  piano: number
}

export interface Prenotazione {
  id: number
  sala_id: number
  sala_nome: string
  prenotante: string
  data: string       // "2025-04-10"
  inizio: string     // "09:00"
  fine: string       // "10:30"
}

export interface NuovaPrenotazione {
  sala_id: number
  prenotante: string
  data: string
  inizio: string
  fine: string
}

// Like NuovaPrenotazione but includes the id of the booking to update
export interface ModificaPrenotazione extends NuovaPrenotazione {
  id: number
}
