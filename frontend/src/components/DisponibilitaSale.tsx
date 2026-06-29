import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import type { Sala, Prenotazione } from '../types'
import { CheckIcon } from './Icons'

interface PreCompila {
  sala_id: number
  data: string
  inizio: string
  fine: string
}

interface DisponibilitaSaleProps {
  sale: Sala[]
  prenotazioni: Prenotazione[]
  onSelezionaLibera?: (info: PreCompila) => void
}

function DisponibilitaSale({ sale, prenotazioni, onSelezionaLibera }: DisponibilitaSaleProps) {
  const [data, setData] = useState('')
  const [inizio, setInizio] = useState('')
  const [fine, setFine] = useState('')

  const listaRef = useRef<HTMLUListElement>(null)

  const oggi = new Date().toISOString().split('T')[0]
  const campiCompilati = data !== '' || inizio !== '' || fine !== ''
  const pronta = data !== '' && inizio !== '' && fine !== '' && fine > inizio && data >= oggi

  let avviso = ''
  if (data && data < oggi) {
    avviso = 'La data selezionata è nel passato.'
  } else if (inizio && fine && fine <= inizio) {
    avviso = "L'ora di fine deve essere successiva all'ora di inizio."
  }

  const disponibilita = pronta
    ? sale.map((sala) => {
        const occupata = prenotazioni.some(
          (p) =>
            p.sala_id === sala.id &&
            p.data === data &&
            inizio < p.fine &&
            fine > p.inizio,
        )
        return { sala, occupata }
      })
    : []

  useEffect(() => {
    if (!pronta || !listaRef.current) return
    const ctx = gsap.context(() => {
      gsap.from(listaRef.current!.querySelectorAll('li'), {
        opacity: 0, y: 10, duration: 0.3, stagger: 0.06, ease: 'power2.out',
      })
    }, listaRef)
    return () => ctx.revert()
  }, [pronta, data, inizio, fine])

  function handleSvuota() {
    setData('')
    setInizio('')
    setFine('')
  }

  function handleClickLibera(sala: Sala) {
    onSelezionaLibera?.({ sala_id: sala.id, data, inizio, fine })
    handleSvuota()
  }

  return (
    <div className="disponibilita">
      <div className="disponibilita-header">
        <h3>Verifica disponibilità</h3>
        {campiCompilati && (
          <button className="btn-svuota" onClick={handleSvuota}>Svuota</button>
        )}
      </div>

      <div className="disponibilita-filtri">
        <label>
          Data
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </label>
        <label>
          Ora inizio
          <input type="time" value={inizio} onChange={(e) => setInizio(e.target.value)} />
        </label>
        <label>
          Ora fine
          <input type="time" value={fine} onChange={(e) => setFine(e.target.value)} />
        </label>
      </div>

      {avviso && <p className="disponibilita-avviso">⚠ {avviso}</p>}

      {!pronta && !avviso && (
        <p className="disponibilita-hint">
          Seleziona data e orario per vedere quali sale sono libere.
        </p>
      )}

      {pronta && (
        <ul className="disponibilita-lista" ref={listaRef}>
          {disponibilita.map(({ sala, occupata }) => (
            <li
              key={sala.id}
              className={occupata ? 'occupata' : 'libera'}
              onClick={!occupata ? () => handleClickLibera(sala) : undefined}
              title={!occupata ? 'Clicca per copiare i dati nel modulo di prenotazione' : undefined}
            >
              <span className="stato-dot" />
              <span className="sala-info">
                {sala.nome}
                <small>cap. {sala.capienza} · piano {sala.piano}</small>
              </span>
              <span className="stato-label">
                {occupata ? 'Occupata' : <><CheckIcon size={13} /> Libera — clicca per prenotare</>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DisponibilitaSale
