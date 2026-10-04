import type { AccessoryIconName } from "../data/site";

/* Pictogrammes des accessoires — même grammaire que WheelIcon : trait unique,
   couleur héritée du texte (`currentColor`), aucune icône importée. */
export default function AccessoireIcon({
  name,
  className,
}: {
  name: AccessoryIconName;
  className?: string;
}) {
  const s = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      {name === "roofbox" && (
        <>
          <path {...s} d="M2 19h28" />
          <rect {...s} x="6" y="8" width="20" height="8" rx="3" />
          <path {...s} d="M10 16v3M22 16v3" />
        </>
      )}
      {name === "bars" && (
        <>
          <path {...s} d="M3 12h26M3 20h26" />
          <path {...s} d="M7 12v-2.5M25 12v-2.5M9 20v2.5M23 20v2.5" />
        </>
      )}
      {name === "wheels" && (
        <>
          <circle {...s} cx="16" cy="16" r="10.5" />
          <circle {...s} cx="16" cy="16" r="3" />
          <path {...s} d="M16 5.5v7M24.9 11.1l-6 3.5M24.9 20.9l-6-3.5M16 26.5v-7M7.1 20.9l6-3.5M7.1 11.1l6 3.5" />
        </>
      )}
      {name === "mat" && (
        <>
          <rect {...s} x="5" y="9" width="22" height="14" rx="2.5" />
          <path {...s} d="M9 13.5h14M9 18.5h14" />
        </>
      )}
      {name === "hitch" && (
        <>
          <path {...s} d="M3 25h9l7-8" />
          <circle {...s} cx="21.5" cy="14" r="3.5" />
          <path {...s} d="M6 25v-3M12 25v-3" />
        </>
      )}
    </svg>
  );
}
