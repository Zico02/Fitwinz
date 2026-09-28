"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useReveal } from "@/components/useReveal";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

interface ProductCarouselProps {
  id: string;
  title: string;
  label: string;
  products: Product[];
}

const SCROLL_STEP = 320;

export default function ProductCarousel({ id, title, label, products }: ProductCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const { ref: sectionRef, visible } = useReveal<HTMLElement>(0.2);
  const { toggleWishlist, isInWishlist, addToCart } = useCart();

  // Track how far the row can scroll so the arrows disable when everything fits.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setMaxScroll(Math.max(0, el.scrollWidth - el.clientWidth));
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const next = Math.max(0, Math.min(max, direction === "left" ? scrollPosition - SCROLL_STEP : scrollPosition + SCROLL_STEP));
    el.scrollTo({ left: next, behavior: "smooth" });
    setScrollPosition(next);
  };

  const handleQuickAdd = (product: Product, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [product.id]: size }));
    addToCart(product.id, size);
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = maxScroll === null ? true : scrollPosition < maxScroll - 1;

  return (
    <section id={id} ref={sectionRef} className="py-16 px-6 lg:px-10 bg-white scroll-mt-28">
      <div
        className={`flex items-end justify-between mb-8 transition-all duration-700 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <div>
          <span className="text-xs font-semibold text-gray-500 tracking-wider mb-2 block">{label}</span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm font-medium text-gray-900 underline underline-offset-4 hover:no-underline">
            View All
          </a>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                canScrollLeft
                  ? "border-black text-black hover:bg-black hover:text-white"
                  : "border-gray-300 text-gray-300 cursor-not-allowed"
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                canScrollRight
                  ? "border-black text-black hover:bg-black hover:text-white"
                  : "border-gray-300 text-gray-300 cursor-not-allowed"
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
      >
        {products.map((product, index) => {
          const isHovered = hoveredId === product.id;
          const inWishlist = isInWishlist(product.id);
          return (
            <div
              key={product.id}
              className={`flex-shrink-0 w-[280px] group transition-all duration-700 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
              }`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
              onMouseEnter={() => setHoveredId(product.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="280px"
                  className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                    isHovered && product.hoverImage !== product.image ? "opacity-0" : "opacity-100"
                  }`}
                />
                {product.hoverImage !== product.image && (
                  <Image
                    src={product.hoverImage}
                    alt=""
                    aria-hidden
                    fill
                    sizes="280px"
                    className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                      isHovered ? "opacity-100" : "opacity-0"
                    }`}
                  />
                )}
                {product.isNew && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-white text-xs font-semibold tracking-wide">NEW</span>
                )}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                  aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-4 h-4 transition-colors ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
                </button>
                {isHovered && (
                  <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-4 animate-slideUp">
                    <p className="text-xs text-center text-gray-500 mb-2">QUICK ADD</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => handleQuickAdd(product, size)}
                          className={`min-w-[40px] h-10 px-3 text-sm font-medium border transition-all ${
                            selectedSizes[product.id] === size
                              ? "bg-black text-white border-black"
                              : "bg-white text-black border-gray-300 hover:border-black"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-black" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.fit}</p>
                <p className="text-sm text-gray-500">{product.color}</p>
                <p className="font-semibold text-gray-900">{formatPrice(product.price)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
