import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type {
  Sala,
  Prenotazione,
  NuovaPrenotazione,
  ModificaPrenotazione,
} from "./types";
import {
  getSale,
  getPrenotazioni,
  creaPrenotazione,
  modificaPrenotazione,
  cancellaPrenotazione,
} from "./api";
import ListaPrenotazioni from "./components/ListaPrenotazioni";
import FormPrenotazione from "./components/FormPrenotazione";
import DisponibilitaSale from "./components/DisponibilitaSale";
import Scheletro from "./components/Scheletro";
import { PlusCircleIcon, MagnifyingGlassIcon } from "./components/Icons";

type Pannello = "form" | "disponibilita" | null;
type PreCompila = {
  sala_id: number;
  data: string;
  inizio: string;
  fine: string;
};

function App() {
  const [sale, setSale] = useState<Sala[]>([]);
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [erroreCaricamento, setErroreCaricamento] = useState("");
  const [prenotazioneInModifica, setPrenotazioneInModifica] = useState<
    Prenotazione | undefined
  >();
  const [preCompilaForm, setPreCompilaForm] = useState<
    PreCompila | undefined
  >();
  const [pannelloAperto, setPannelloAperto] = useState<Pannello>(null);

  const [tema, setTema] = useState<"light" | "dark">(
    () => (localStorage.getItem("tema") as "light" | "dark") || "light",
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
    localStorage.setItem("tema", tema);
  }, [tema]);

  useEffect(() => {
    document.title = "Prenotazioni Sale Riunioni";
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: "power2.out",
      });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const [saleFetched, prenotazioniFetched] = await Promise.all([
          getSale(),
          getPrenotazioni(),
        ]);
        if (!cancelled) {
          setSale(saleFetched);
          setPrenotazioni(prenotazioniFetched);
        }
      } catch (err: unknown) {
        if (!cancelled)
          setErroreCaricamento(
            err instanceof Error ? err.message : "Errore di caricamento",
          );
      } finally {
        if (!cancelled) setCaricamento(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  async function caricaDati() {
    setCaricamento(true);
    setErroreCaricamento("");
    try {
      const [saleFetched, prenotazioniFetched] = await Promise.all([
        getSale(),
        getPrenotazioni(),
      ]);
      setSale(saleFetched);
      setPrenotazioni(prenotazioniFetched);
    } catch (err: unknown) {
      setErroreCaricamento(
        err instanceof Error ? err.message : "Errore di caricamento",
      );
    } finally {
      setCaricamento(false);
    }
  }

  async function handleCreata(nuova: NuovaPrenotazione) {
    await creaPrenotazione(nuova);
    await caricaDati();
  }

  async function handleModificata(dati: ModificaPrenotazione) {
    await modificaPrenotazione(dati);
    setPrenotazioneInModifica(undefined);
    setPannelloAperto(null);
    await caricaDati();
  }

  async function handleCancella(id: number) {
    await cancellaPrenotazione(id);
    await caricaDati();
  }

  function handleModifica(p: Prenotazione) {
    setPrenotazioneInModifica(p);
    setPreCompilaForm(undefined);
    setPannelloAperto("form");
  }

  function handleSelezionaLibera(info: PreCompila) {
    setPrenotazioneInModifica(undefined);
    setPreCompilaForm(info);
    setPannelloAperto("form");
  }

  function togglePannello(pannello: "form" | "disponibilita") {
    setPannelloAperto((p) => {
      if (p === pannello) {
        setPrenotazioneInModifica(undefined);
        return null;
      }
      if (pannello !== "form") setPrenotazioneInModifica(undefined);
      return pannello;
    });
  }

  function handleToggleTema() {
    gsap.to(toggleRef.current, {
      rotation: 360,
      duration: 0.35,
      ease: "power2.out",
      onComplete: () => gsap.set(toggleRef.current, { rotation: 0 }),
    });
    setTema((t) => (t === "light" ? "dark" : "light"));
  }

  return (
    <div className="container" ref={containerRef}>
      <div className="header">
        <h1>Prenotazioni Sale Riunioni</h1>
        <button
          className="tema-toggle"
          ref={toggleRef}
          onClick={handleToggleTema}
        >
          {tema === "light" ? "Dark Mode" : "Light Mode"}
        </button>
      </div>

      {erroreCaricamento && (
        <p className="messaggio errore">{erroreCaricamento}</p>
      )}

      {caricamento ? (
        <Scheletro />
      ) : (
        <>
          <div className="pannelli-toggle">
            <button
              className={`btn-pannello${pannelloAperto === "form" ? " attivo" : ""}`}
              onClick={() => togglePannello("form")}
            >
              <PlusCircleIcon size={16} />{" "}
              {prenotazioneInModifica
                ? "Modifica prenotazione"
                : "Nuova prenotazione"}
            </button>
            <button
              className={`btn-pannello${pannelloAperto === "disponibilita" ? " attivo" : ""}`}
              onClick={() => togglePannello("disponibilita")}
            >
              <MagnifyingGlassIcon size={16} /> Verifica disponibilità
            </button>
          </div>

          <div
            className={`pannello${pannelloAperto === "form" ? " aperto" : ""}`}
          >
            <FormPrenotazione
              sale={sale}
              prenotazioni={prenotazioni}
              onCreata={handleCreata}
              prenotazioneInModifica={prenotazioneInModifica}
              onModificata={handleModificata}
              onAnnullaModifica={() => {
                setPrenotazioneInModifica(undefined);
                setPannelloAperto(null);
              }}
              preCompila={preCompilaForm}
            />
          </div>

          <div
            className={`pannello${pannelloAperto === "disponibilita" ? " aperto" : ""}`}
          >
            <DisponibilitaSale
              sale={sale}
              prenotazioni={prenotazioni}
              onSelezionaLibera={handleSelezionaLibera}
            />
          </div>

          <ListaPrenotazioni
            prenotazioni={prenotazioni}
            onModifica={handleModifica}
            onCancella={handleCancella}
          />
        </>
      )}
    </div>
  );
}

export default App;
