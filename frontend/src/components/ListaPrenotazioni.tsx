import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import type { Prenotazione } from '../types'
import DialogoConferma from './DialogoConferma'
import { PencilIcon, TrashIcon, CalendarIcon, XMarkIcon } from './Icons'

interface ListaPrenotazioniProps {
  prenotazioni: Prenotazione[]
  onModifica: (p: Prenotazione) => void
  onCancella: (id: number) => Promise<void>
}

function ListaPrenotazioni({ prenotazioni, onModifica, onCancella }: ListaPrenotazioniProps) {
  const [filtroSala, setFiltroSala] = useState('')
  const [filtroData, setFiltroData] = useState('')
  const [daCancellare, setDaCancellare] = useState<Prenotazione | null>(null)

  const oggi = new Date().toISOString().split('T')[0]
  const sale = [...new Set(prenotazioni.map((p) => p.sala_nome))]

  const lista = prenotazioni
    .filter(
      (p) =>
        (!filtroSala || p.sala_nome === filtroSala) &&
        (!filtroData || p.data === filtroData),
    )
    .sort((a, b) => a.data.localeCompare(b.data) || a.inizio.localeCompare(b.inizio))

  const tbodyRef = useRef<HTMLTableSectionElement>(null)

  useEffect(() => {
    if (!tbodyRef.current) return
    const ctx = gsap.context(() => {
      gsap.from(tbodyRef.current!.querySelectorAll('tr'), {
        opacity: 0,
        x: -20,
        duration: 0.35,
        stagger: 0.05,
        ease: 'power2.out',
      })
    }, tbodyRef)
    return () => ctx.revert()
  }, [lista])

  async function handleConfermaElimina() {
    if (!daCancellare) return
    await onCancella(daCancellare.id)
    setDaCancellare(null)
  }

  if (prenotazioni.length === 0) {
    return (
      <div className="stato-vuoto">
        <div className="stato-vuoto-icona"><CalendarIcon size={48} /></div>
        <p>Nessuna prenotazione presente.</p>
        <small>Usa il form qui sopra per aggiungere la prima prenotazione.</small>
      </div>
    )
  }

  return (
    <>
      {daCancellare && (
        <DialogoConferma
          prenotazione={daCancellare}
          onConferma={handleConfermaElimina}
          onAnnulla={() => setDaCancellare(null)}
        />
      )}

      <div className="lista-header">
        <span className="contatore">
          {lista.length} prenotazion{lista.length === 1 ? 'e' : 'i'}
        </span>
        <div className="lista-filtri">
          <select value={filtroSala} onChange={(e) => setFiltroSala(e.target.value)}>
            <option value="">Tutte le sale</option>
            {sale.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            title="Filtra per data"
          />
          {(filtroSala || filtroData) && (
            <button
              className="btn-reset-filtri"
              onClick={() => { setFiltroSala(''); setFiltroData('') }}
            >
              <XMarkIcon size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {lista.length === 0 ? (
        <p className="vuoto">Nessun risultato per i filtri selezionati.</p>
      ) : (
        <table className="tabella">
          <thead>
            <tr>
              <th>Sala</th>
              <th>Prenotante</th>
              <th>Data</th>
              <th>Orario</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody ref={tbodyRef}>
            {lista.map((p) => (
              <tr
                key={p.id}
                className={[
                  p.data === oggi ? 'oggi' : '',
                  p.data < oggi ? 'passata' : '',
                ].filter(Boolean).join(' ')}
              >
                <td>{p.sala_nome}</td>
                <td>{p.prenotante}</td>
                <td>{p.data}</td>
                <td>{p.inizio} – {p.fine}</td>
                <td className="azioni">
                  <button className="btn-azione btn-modifica" onClick={() => onModifica(p)} title="Modifica">
                    <PencilIcon size={15} />
                  </button>
                  <button className="btn-azione btn-cancella" onClick={() => setDaCancellare(p)} title="Elimina">
                    <TrashIcon size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

export default ListaPrenotazioni
