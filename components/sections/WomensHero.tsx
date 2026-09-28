"use client";

import Image from "next/image";
import { useReveal } from "@/components/useReveal";

export default function WomensHero() {
  const { ref, visible } = useReveal<HTMLElement>(0.2);
  const reveal = visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0";

  return (
    <section ref={ref} className="relative w-full h-[70vh] overflow-hidden">
      <div
        className={`absolute inset-0 transition-all duration-1000 ${
          visible ? "scale-100 opacity-100" : "scale-110 opacity-0"
        }`}
      >
        <Image src="/images/hero-women.webp" alt="Fitwinz Women's Collection" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full">
          <div className="max-w-lg">
            <h2
              className={`text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4 transition-all duration-700 ${reveal}`}
              style={{ transitionDelay: "200ms" }}
            >
              NEW IN: EARTH TONES
            </h2>
            <p
              className={`text-lg text-white/90 mb-8 transition-all duration-700 ${reveal}`}
              style={{ transitionDelay: "400ms" }}
            >
              Natural tones engineered for performance and everyday wear.
            </p>
            <div className={`flex flex-wrap gap-4 transition-all duration-700 ${reveal}`} style={{ transitionDelay: "600ms" }}>
              <a
                href="#section-new-in-matching"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold text-sm tracking-wide hover:bg-black hover:text-white transition-all duration-300"
              >
                Shop New In
              </a>
              <a
                href="#section-trending-now"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold text-sm tracking-wide hover:bg-white hover:text-black transition-all duration-300"
              >
                Shop Trending Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
