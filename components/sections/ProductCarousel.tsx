"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, Heart, Plus, Star, X } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useStore } from "@/components/StoreContext";
import { useReveal } from "@/components/useReveal";
import type { StoreProduct } from "@/lib/store-types";

interface ProductCarouselProps {
  id: string;
  title: string;
  label: string;
  products: StoreProduct[];
}

const SCROLL_STEP = 320;

export default function ProductCarousel({ id, title, label, products }: ProductCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Touch screens: the quick-add panel opens with the "+" button (shown via CSS on hover-less devices).
  const [openId, setOpenId] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { ref: sectionRef, visible } = useReveal<HTMLElement>(0.2);
  const { toggleWishlist, isInWishlist, addToCart } = useCart();
  const { formatPrice } = useStore();

  // Track how far the row can scroll so the arrows disable when everything fits.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setMaxScroll(Math.max(0, el.scrollWidth - el.clientWidth));
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const next = Math.max(0, Math.min(max, direction === "left" ? scrollPosition - SCROLL_STEP : scrollPosition + SCROLL_STEP));
    el.scrollTo({ left: next, behavior: "smooth" });
    setScrollPosition(next);
  };

  const handleQuickAdd = (product: StoreProduct, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [product.id]: size }));
    addToCart(product.id, size);
    if (openId === product.id) {
      setJustAdded(product.id);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      closeTimer.current = setTimeout(() => {
        setJustAdded(null);
        setOpenId(null);
      }, 1200);
    }
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
        // overflow-y-hidden: otherwise the row is also vertically scrollable and can shift under a tap.
        className="flex gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth pb-4"
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
      >
        {products.map((product, index) => {
          const isHovered = hoveredId === product.id;
          const panelOpen = isHovered || openId === product.id;
          const inWishlist = isInWishlist(product.id);
          const soldOut = product.sizes.every((s) => (product.stock[s] ?? 0) <= 0);
          const href = `/products/${product.id}`;
          return (
            <div
              key={product.id}
              className={`flex-shrink-0 w-[280px] group transition-all duration-700 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
              }`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
              // Hover behaviour only for a real mouse; taps must not open/close the panel.
              onPointerEnter={(e) => e.pointerType === "mouse" && setHoveredId(product.id)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setHoveredId(null)}
            >
              <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-4">
                <Link href={href} aria-label={`${product.name} - ${product.color}`} className="absolute inset-0">
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
                </Link>
                {product.isNew && (
                  <span className="absolute z-10 top-3 left-3 px-3 py-1 bg-white text-xs font-semibold tracking-wide">NEW</span>
                )}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute z-10 top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                  aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-4 h-4 transition-colors ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
                </button>
                {!panelOpen && !soldOut && (
                  <button
                    onClick={() => setOpenId(product.id)}
                    className="touch-only absolute z-10 bottom-3 right-3 w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
                    aria-label={`Quick add ${product.name}`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )}
                {panelOpen && (
                  <div className="absolute z-10 bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-4 animate-slideUp">
                    {openId === product.id && (
                      <button
                        onClick={() => setOpenId(null)}
                        className="absolute top-2 right-2 p-1 text-gray-500"
                        aria-label="Close quick add"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <p className="text-xs text-center text-gray-500 mb-2">
                      {justAdded === product.id ? (
                        <span className="inline-flex items-center gap-1 text-black font-semibold">
                          <Check className="w-3 h-3" /> ADDED TO BAG
                        </span>
                      ) : soldOut ? (
                        "SOLD OUT"
                      ) : (
                        "QUICK ADD"
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {product.sizes.map((size) => {
                        const available = (product.stock[size] ?? 0) > 0;
                        return (
                          <button
                            key={size}
                            onClick={() => handleQuickAdd(product, size)}
                            disabled={!available}
                            aria-label={available ? `Add size ${size}` : `Size ${size} sold out`}
                            className={`min-w-[40px] h-10 px-3 text-sm font-medium border transition-all ${
                              !available
                                ? "bg-white text-gray-300 border-gray-200 line-through cursor-not-allowed"
                                : selectedSizes[product.id] === size
                                  ? "bg-black text-white border-black"
                                  : "bg-white text-black border-gray-300 hover:border-black"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                {product.rating !== null && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-black" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                )}
                <h3 className="font-semibold text-gray-900">
                  <Link href={href}>{product.name}</Link>
                </h3>
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
