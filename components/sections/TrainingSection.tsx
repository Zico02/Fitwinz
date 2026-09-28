"use client";

import { useState } from "react";
import Image from "next/image";
import { useReveal } from "@/components/useReveal";
import GenderToggle, { type Gender } from "@/components/sections/GenderToggle";
import { trainingTiles } from "@/lib/catalog";

export default function TrainingSection() {
  const [gender, setGender] = useState<Gender>("women");
  const { ref, visible } = useReveal<HTMLElement>(0.1);
  const tiles = trainingTiles[gender];

  return (
    <section ref={ref} className="py-16 px-6 lg:px-10 bg-white">
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 transition-all duration-700 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">HOW DO YOU TRAIN?</h2>
        <GenderToggle value={gender} onChange={setGender} />
      </div>

      <div
        className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        {tiles.map((tile, index) => (
          <a
            key={tile.id}
            href="#"
            className={`group relative aspect-[3/4] overflow-hidden transition-all duration-700 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
            }`}
            style={{ transitionDelay: `${300 + index * 100}ms` }}
          >
            <Image
              src={tile.image}
              alt={tile.name}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-4 left-4">
              <span className="text-lg font-bold text-white tracking-wide">{tile.name}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
