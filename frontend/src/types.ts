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
  data: string     
  inizio: string    
  fine: string     
}

export interface NuovaPrenotazione {
  sala_id: number
  prenotante: string
  data: string
  inizio: string
  fine: string
}

export interface ModificaPrenotazione extends NuovaPrenotazione {
  id: number
}
