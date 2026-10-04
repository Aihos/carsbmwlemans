import SmartLink from "./SmartLink";


export default function BandeauCOnfigurateurMini() {

    return(

         <div className="mx-auto mt-20 max-w-[1600px] px-5 md:mt-28 md:px-10">
                <div className="grain relative overflow-hidden bg-ink">
                  <img
                    src="/img/produit/voitureA-net.png"
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-4 bottom-0 hidden h-[92%] w-auto opacity-95 md:block"
                  />
                  <div className="relative z-10 max-w-xl px-6 py-12 md:px-14 md:py-16">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-white/55">
                      Atelier de configuration
                    </p>
                    <h2 className="mt-3 font-display text-[clamp(1.6rem,3.4vw,2.6rem)] font-bold uppercase leading-[1.06] text-white">
                      Composez votre BMW
                    </h2>
                    <p className="mt-4 text-[12px] leading-relaxed text-white/70">
                      Teinte extérieure, jantes et motorisation : composez votre BMW et transmettez votre
                      configuration à la concession.
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
    )
}