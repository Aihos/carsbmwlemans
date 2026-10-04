import SmartLink from "./SmartLink";

/* Bandeau d'appel vers l'atelier de configuration, en bas de l'accueil et des
   actualités. Le visuel est une photo plein cadre (BMW Skytop de trois-quarts
   arrière) : le dégradé d'encre part du bord gauche en opaque pour garder le
   texte et le bouton lisibles, la photo n'apparaît que sur la droite. Remplacer
   la voiture détourée évite l'effet « PNG posé sur un aplat » et le grain de
   l'aplat tient la photo dans la charte. */
const IMG = "/img/troisquart/BMW-Skytop-2025-Rear_Three-Quarter.60c0a162.webp";

export default function BandeauCOnfigurateurMini() {
  return (
    <div className="mx-auto mt-20 max-w-[1600px] px-5 md:mt-28 md:px-10">
      <div className="grain relative overflow-hidden bg-ink">
        <img
          src={IMG}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[64%_50%]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/25" />

        <div className="relative z-10 max-w-xl px-6 py-14 md:px-14 md:py-20">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/55">
            Atelier de configuration
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.6rem,3.4vw,2.6rem)] font-bold uppercase leading-[1.06] text-white">
            Composez votre BMW
          </h2>
          <p className="mt-4 text-[12px] leading-relaxed text-white/70">
            Teinte extérieure, jantes, motorisation, sellerie et accessoires : composez votre BMW et
            transmettez votre configuration à la concession.
          </p>
          <SmartLink
            to="/configurateur"
            className="group mt-7 inline-flex items-center gap-3 bg-brand px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-navy"
          >
            Ouvrir le configurateur
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </SmartLink>
        </div>
      </div>
    </div>
  );
}
