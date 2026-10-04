import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

export const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Révélations au scroll : [data-reveal] (fondu + translation) et [data-lines] (masques). */
export function initScrollAnimations() {
  if (reduced()) return () => {};

  const ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
      gsap.fromTo(
        el,
        { y: Number(el.dataset.revealY ?? 44), autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1.05,
          delay: Number(el.dataset.revealDelay ?? 0),
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );
    });

    gsap.utils.toArray<HTMLElement>("[data-lines]").forEach((group) => {
      const lines = group.querySelectorAll<HTMLElement>(".mask-line > span");
      if (!lines.length) return;
      gsap.fromTo(
        lines,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 1.15,
          stagger: 0.1,
          ease: "power4.out",
          scrollTrigger: { trigger: group, start: "top 85%", once: true },
        },
      );
    });

    gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
      const items = group.querySelectorAll<HTMLElement>(":scope > *");
      if (!items.length) return;
      gsap.fromTo(
        items,
        { y: 40, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          stagger: 0.09,
          ease: "power3.out",
          scrollTrigger: { trigger: group, start: "top 85%", once: true },
        },
      );
    });

    gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
      const amount = Number(el.dataset.parallax ?? 12);
      gsap.fromTo(
        el,
        { yPercent: -amount / 2 },
        {
          yPercent: amount / 2,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });

    gsap.utils.toArray<HTMLElement>("[data-rotate-slow]").forEach((el) => {
      gsap.to(el, {
        rotate: 360,
        duration: 90,
        repeat: -1,
        ease: "none",
      });
    });

    ScrollTrigger.refresh();
  });

  return () => ctx.revert();
}
