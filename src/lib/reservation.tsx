import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import ContactModal from "../components/ContactModal";

/* Popup de rendez-vous partagée.
   Un seul exemplaire de ContactModal vit ici, monté avec la coquille du site :
   — tout lien « #reservation » (SmartLink) l'ouvre au lieu de défiler ;
   — le bouton « Réserver » de l'en-tête, l'appel à l'action du hero et celui du
     pied de page passent par le même contexte.
   Le configurateur garde son propre exemplaire : il ouvre la popup en mode
   « configuration composée », avec le récapitulatif du véhicule. */

type ReservationApi = { open: (vehicule?: string) => void };

const ReservationContext = createContext<ReservationApi | null>(null);

/** Contexte de réservation. `null` hors du provider — l'appelant se rabat
    alors sur son comportement d'origine (navigation). */
export function useReservation() {
  return useContext(ReservationContext);
}

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [vehicule, setVehicule] = useState<string | undefined>(undefined);

  const openReservation = useCallback((v?: string) => {
    setVehicule(v);
    setOpen(true);
  }, []);

  const api = useMemo<ReservationApi>(() => ({ open: openReservation }), [openReservation]);

  return (
    <ReservationContext.Provider value={api}>
      {children}
      <ContactModal open={open} onClose={() => setOpen(false)} defaultVehicule={vehicule} />
    </ReservationContext.Provider>
  );
}
