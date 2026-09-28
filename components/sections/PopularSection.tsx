"use client";

import { useState } from "react";
import Image from "next/image";
import { useReveal } from "@/components/useReveal";
import GenderToggle, { type Gender } from "@/components/sections/GenderToggle";
import { trendingTiles } from "@/lib/catalog";

export default function PopularSection() {
  const [gender, setGender] = useState<Gender>("women");
  const { ref, visible } = useReveal<HTMLElement>(0.1);
  const tiles = trendingTiles[gender];

  return (
    <section id="section-trending-now" ref={ref} className="py-16 px-6 lg:px-10 bg-white scroll-mt-28">
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 transition-all duration-700 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <div>
          <span className="text-xs font-semibold text-gray-500 tracking-wider mb-2 block">WOMEN</span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">TRENDING NOW</h2>
        </div>
        <GenderToggle value={gender} onChange={setGender} />
      </div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {tiles.map((tile, index) => (
          <a
            key={tile.id}
            href="#"
            className={`group relative aspect-[4/5] overflow-hidden transition-all duration-700 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
            }`}
            style={{ transitionDelay: `${400 + index * 100}ms` }}
          >
            <Image
              src={tile.image}
              alt={tile.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-all duration-300 ease-out group-hover:scale-105"
            />
            <div
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}
              className="absolute inset-0 z-[1] pointer-events-none"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-[2] transform transition-all duration-300 ease-out group-hover:-translate-y-[5px]">
              <h3 className="text-lg font-bold text-white mb-2">{tile.title}</h3>
              <p className="text-sm text-white/80 line-clamp-2">{tile.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-white border border-white/70 rounded-full px-4 py-2">
                Shop Now
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
