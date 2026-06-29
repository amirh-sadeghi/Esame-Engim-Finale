import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import type { Sala, Prenotazione, NuovaPrenotazione, ModificaPrenotazione } from '../types'

interface PreCompila {
  sala_id: number
  data: string
  inizio: string
  fine: string
}

interface FormPrenotazioneProps {
  sale: Sala[]
  prenotazioni: Prenotazione[]
  onCreata: (nuova: NuovaPrenotazione) => Promise<void>
  prenotazioneInModifica?: Prenotazione
  onModificata?: (dati: ModificaPrenotazione) => Promise<void>
  onAnnullaModifica?: () => void
  preCompila?: PreCompila
}

function FormPrenotazione({
  sale,
  prenotazioni,
  onCreata,
  prenotazioneInModifica,
  onModificata,
  onAnnullaModifica,
  preCompila,
}: FormPrenotazioneProps) {
  const inModifica = prenotazioneInModifica !== undefined

  const [salaId, setSalaId] = useState('')
  const [prenotante, setPrenotante] = useState('')
  const [data, setData] = useState('')
  const [inizio, setInizio] = useState('')
  const [fine, setFine] = useState('')
  const [errore, setErrore] = useState('')
  const [successo, setSuccesso] = useState('')
  const [infoMessaggio, setInfoMessaggio] = useState('')

  const formRef = useRef<HTMLFormElement>(null)
  const erroreRef = useRef<HTMLParagraphElement>(null)
  const successoRef = useRef<HTMLParagraphElement>(null)

  // Pre-fill when editing an existing booking
  useEffect(() => {
    if (prenotazioneInModifica) {
      setSalaId(String(prenotazioneInModifica.sala_id))
      setPrenotante(prenotazioneInModifica.prenotante)
      setData(prenotazioneInModifica.data)
      setInizio(prenotazioneInModifica.inizio)
      setFine(prenotazioneInModifica.fine)
      setErrore('')
      setSuccesso('')
      setInfoMessaggio('')
    } else {
      resetForm()
    }
  }, [prenotazioneInModifica])

  // Pre-fill sala/date/time from availability checker (prenotante stays empty)
  useEffect(() => {
    if (!preCompila) return
    setSalaId(String(preCompila.sala_id))
    setData(preCompila.data)
    setInizio(preCompila.inizio)
    setFine(preCompila.fine)
    setPrenotante('')
    setErrore('')
    setSuccesso('')
    setInfoMessaggio('Sala e orario copiati dalla verifica — inserisci il prenotante e premi Prenota.')
  }, [preCompila])

  // Stagger form fields on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('label, .orari, .form-azioni', {
        opacity: 0, y: 15, duration: 0.4, stagger: 0.07, ease: 'power2.out',
      })
    }, formRef)
    return () => ctx.revert()
  }, [])

  // Shake on error
  useEffect(() => {
    if (!errore || !erroreRef.current) return
    gsap.from(erroreRef.current, { opacity: 0, duration: 0.15 })
    gsap.to(erroreRef.current, {
      x: 8, duration: 0.07, repeat: 5, yoyo: true, ease: 'power1.inOut',
      onComplete: () => gsap.set(erroreRef.current, { x: 0 }),
    })
  }, [errore])

  // Slide down on success
  useEffect(() => {
    if (!successo || !successoRef.current) return
    gsap.from(successoRef.current, { opacity: 0, y: -10, duration: 0.35, ease: 'back.out(1.5)' })
  }, [successo])

  function resetForm() {
    setSalaId('')
    setPrenotante('')
    setData('')
    setInizio('')
    setFine('')
    setErrore('')
    setSuccesso('')
    setInfoMessaggio('')
  }

  function salaOccupata(): boolean {
    return prenotazioni.some(
      (p) =>
        p.id !== prenotazioneInModifica?.id &&
        p.sala_id === Number(salaId) &&
        p.data === data &&
        inizio < p.fine &&
        fine > p.inizio,
    )
  }

  async function handleSubmit(evento: { preventDefault(): void }) {
    evento.preventDefault()
    setErrore('')
    setSuccesso('')
    setInfoMessaggio('')

    if (!salaId || !prenotante || !data || !inizio || !fine) {
      setErrore('Tutti i campi sono obbligatori')
      return
    }
    if (fine <= inizio) {
      setErrore("L'ora di fine deve essere successiva all'ora di inizio")
      return
    }
    if (salaOccupata()) {
      setErrore('La sala è già occupata in questa fascia oraria')
      return
    }
    const oggi = new Date().toISOString().split('T')[0]
    if (data < oggi) {
      setErrore('Non puoi prenotare una data nel passato')
      return
    }

    try {
      if (inModifica && onModificata && prenotazioneInModifica) {
        await onModificata({ id: prenotazioneInModifica.id, sala_id: Number(salaId), prenotante, data, inizio, fine })
        setSuccesso('Prenotazione aggiornata!')
      } else {
        await onCreata({ sala_id: Number(salaId), prenotante, data, inizio, fine })
        setSuccesso('Prenotazione salvata!')
      }
      setTimeout(() => setSuccesso(''), 3000)
      resetForm()
      if (inModifica && onAnnullaModifica) onAnnullaModifica()
    } catch (err: unknown) {
      setErrore(err instanceof Error ? err.message : 'Errore imprevisto')
    }
  }

  return (
    <form className={`form${inModifica ? ' form--modifica' : ''}`} ref={formRef} onSubmit={handleSubmit}>
      <h2>{inModifica ? 'Modifica prenotazione' : 'Nuova prenotazione'}</h2>

      <label>
        Sala
        <select value={salaId} onChange={(e) => setSalaId(e.target.value)}>
          <option value="">— Seleziona una sala —</option>
          {sale.map((sala) => (
            <option key={sala.id} value={sala.id}>
              {sala.nome} (capienza {sala.capienza}, piano {sala.piano})
            </option>
          ))}
        </select>
      </label>

      <label>
        Prenotante
        <input
          type="text"
          value={prenotante}
          onChange={(e) => setPrenotante(e.target.value)}
          placeholder="Es. Mario Rossi"
        />
      </label>

      <label>
        Data
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
      </label>

      <div className="orari">
        <label>
          Ora inizio
          <input type="time" value={inizio} onChange={(e) => setInizio(e.target.value)} />
        </label>
        <label>
          Ora fine
          <input type="time" value={fine} onChange={(e) => setFine(e.target.value)} />
        </label>
      </div>

      {infoMessaggio && <p className="messaggio info">{infoMessaggio}</p>}
      {errore && <p className="messaggio errore" ref={erroreRef}>{errore}</p>}
      {successo && <p className="messaggio successo" ref={successoRef}>{successo}</p>}

      <div className="form-azioni">
        <button type="submit">{inModifica ? 'Aggiorna' : 'Prenota'}</button>
        {!inModifica && (
          <button type="button" className="btn-svuota" onClick={resetForm}>
            Svuota
          </button>
        )}
        {inModifica && (
          <button type="button" className="btn-annulla-modifica" onClick={onAnnullaModifica}>
            Annulla
          </button>
        )}
      </div>
    </form>
  )
}

export default FormPrenotazione
