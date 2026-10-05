import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Assemble des classes conditionnelles (clsx) puis dédoublonne les conflits
    Tailwind en gardant la dernière (tailwind-merge) — l'utilitaire `cn` de
    shadcn/ui, repris tel quel. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
