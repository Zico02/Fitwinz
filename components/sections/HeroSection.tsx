"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function HeroSection({ compactTop = false }: { compactTop?: boolean }) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Wait one frame so the initial (hidden) styles paint before the entrance transition.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsLoaded(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const reveal = isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0";

  return (
    <section className={`relative w-full h-[85vh] ${compactTop ? "mt-[72px]" : "mt-[108px]"} overflow-hidden`}>
      <div
        className={`absolute inset-0 transition-all duration-1000 ${
          isLoaded ? "scale-100 opacity-100" : "scale-110 opacity-0"
        }`}
      >
        <Image
          src="/images/hero-men.webp"
          alt="Fitwinz Men's Collection"
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      </div>

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full">
          <div className="max-w-xl">
            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6 transition-all duration-700 ${reveal}`}
              style={{ transitionDelay: "300ms" }}
            >
              <span className="block">TIME TO</span>
              <span className="block">DRESS HEALTHY</span>
            </h1>
            <p
              className={`text-lg md:text-xl text-white/90 mb-8 transition-all duration-700 ${reveal}`}
              style={{ transitionDelay: "500ms" }}
            >
              <span className="block">Sportswear Designed for Performance</span>
              <span className="block">and a Healthier Lifestyle.</span>
            </p>
            <div className={`flex flex-wrap gap-4 transition-all duration-700 ${reveal}`} style={{ transitionDelay: "700ms" }}>
              <a
                href="#section-men-durable"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold text-sm tracking-wide hover:bg-black hover:text-white transition-all duration-300"
              >
                Men&apos;s Shop
              </a>
              <a
                href="#section-trending-now"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold text-sm tracking-wide hover:bg-white hover:text-black transition-all duration-300"
              >
                Women&apos;s Shop
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-white/70 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
