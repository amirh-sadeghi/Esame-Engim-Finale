import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import type { Prenotazione } from '../types'

interface DialogoConfermaProps {
  prenotazione: Prenotazione
  onConferma: () => void
  onAnnulla: () => void
}

function DialogoConferma({ prenotazione, onConferma, onAnnulla }: DialogoConfermaProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const dialogoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(overlayRef.current, { opacity: 0, duration: 0.2, ease: 'power2.out' })
      gsap.from(dialogoRef.current, { opacity: 0, scale: 0.88, y: 24, duration: 0.3, ease: 'back.out(1.7)' })
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onAnnulla() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onAnnulla])

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onAnnulla()
  }

  const dataFormattata = new Date(prenotazione.data + 'T00:00:00').toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return createPortal(
    <div className="overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="dialogo" ref={dialogoRef}>
        <h2 className="dialogo-titolo">Elimina prenotazione</h2>
        <p className="dialogo-dettagli">
          Prenotazione di <strong>{prenotazione.prenotante}</strong> per{' '}
          <strong>{prenotazione.sala_nome}</strong>
          <br />
          {dataFormattata}, dalle <strong>{prenotazione.inizio}</strong> alle{' '}
          <strong>{prenotazione.fine}</strong>.
        </p>
        <p className="dialogo-avviso">Questa azione non può essere annullata.</p>
        <div className="dialogo-azioni">
          <button className="btn-annulla" onClick={onAnnulla}>Annulla</button>
          <button className="btn-conferma" onClick={onConferma}>Elimina</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default DialogoConferma
