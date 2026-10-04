/* Jante stylisée : les rayons sont dessinés selon le nombre de branches du
   modèle choisi. Partagé par le configurateur de l'accueil et la page
   « configurateur en grand ». */
export default function WheelIcon({
  spokes,
  active,
  className = "h-10 w-10",
}: {
  spokes: number;
  active: boolean;
  className?: string;
}) {
  const r = 15;
  const lines = Array.from({ length: spokes }).map((_, i) => {
    const a = (i / spokes) * Math.PI * 2;
    return { x2: 20 + Math.cos(a) * r, y2: 20 + Math.sin(a) * r };
  });
  const stroke = active ? "#00559d" : "#8fa3ba";

  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="none" stroke={stroke} strokeWidth="2" />
      <circle cx="20" cy="20" r="5.5" fill={stroke} />
      {lines.map((l, i) => (
        <line key={i} x1="20" y1="20" x2={l.x2} y2={l.y2} stroke={stroke} strokeWidth="1.6" />
      ))}
      <circle cx="20" cy="20" r="13" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}
