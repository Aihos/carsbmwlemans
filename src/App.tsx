import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Preloader from "./components/Preloader";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Catalogue from "./pages/Catalogue";
import ConfigurateurPage from "./pages/ConfigurateurPage";
import ActualitesPage from "./pages/ActualitesPage";
import { ScrollTrigger, initScrollAnimations } from "./lib/anim";
import { ReservationProvider } from "./lib/reservation";

/* Coquille du site : préloader, header, routes, footer.
   Le préloader ne se joue qu'une fois, au premier chargement. */
function Shell() {
  const [ready, setReady] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const { pathname, hash } = useLocation();

  /* Verrouille le scroll pendant le préloader */
  useEffect(() => {
    document.documentElement.style.overflow = ready ? "" : "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [ready]);

  /* Révélations au scroll recréées à chaque changement de page, puis
     positionnement : ancre de l'URL si elle existe, sinon haut de page.
     ScrollTrigger.refresh() restaure la position de défilement qu'il a
     mémorisée. Or une navigation interne (react-router) ne recharge pas la
     page : le navigateur garde la position de l'écran quitté, et ce refresh la
     remet en place — le retour en haut était donc annulé. Le positionnement est
     réappliqué APRÈS chaque refresh, y compris celui du second passage.
     Le défilement est fait « instant » (pas de smooth) : un refresh de
     ScrollTrigger annulerait une animation de scroll en cours. */
  useEffect(() => {
    if (!ready) return;
    const cleanup = initScrollAnimations();

    const place = () => {
      const target = hash ? document.querySelector(hash) : null;
      if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
      else window.scrollTo({ top: 0, behavior: "instant" });
    };

    ScrollTrigger.refresh();
    place();

    /* Second passage une fois les images et la police en place */
    const timer = window.setTimeout(() => {
      ScrollTrigger.refresh();
      place();
    }, 200);
    return () => {
      window.clearTimeout(timer);
      cleanup();
    };
  }, [ready, pathname, hash]);

  return (
    <>
      {showPreloader && (
        <Preloader onReveal={() => setReady(true)} onDone={() => setShowPreloader(false)} />
      )}
      <Header ready={ready} />
      <main>
        <Routes>
          <Route path="/" element={<Home ready={ready} />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/configurateur" element={<ConfigurateurPage />} />
          <Route path="/actualites" element={<ActualitesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ReservationProvider>
        <Shell />
      </ReservationProvider>
    </BrowserRouter>
  );
}
