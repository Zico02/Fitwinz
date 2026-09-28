"use client";

import Image from "next/image";
import { useReveal } from "@/components/useReveal";
import { shopCategories } from "@/lib/catalog";

export default function ShopByCategory() {
  const { ref, visible } = useReveal<HTMLElement>(0.1);

  return (
    <section ref={ref} className="py-16 px-6 lg:px-10 bg-white">
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>
        {shopCategories.map((category, index) => (
          <a
            key={category.id}
            href={category.href}
            className={`group relative aspect-[4/5] md:aspect-[3/4] overflow-hidden transition-all duration-700 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
            }`}
            style={{ transitionDelay: `${200 + index * 150}ms` }}
          >
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-108"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <span className="text-xl font-bold text-white tracking-wide relative">
                {category.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
