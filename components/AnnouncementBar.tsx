"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/components/StoreContext";

export default function AnnouncementBar({ scrollHide = false }: { scrollHide?: boolean }) {
  const { settings, formatPrice } = useStore();
  // The free-shipping message follows the store settings (same rule as bag and checkout).
  const announcements = useMemo(
    () => [
      ...(settings.freeShippingThreshold !== null
        ? [`Free Shipping on Orders ${formatPrice(settings.freeShippingThreshold)}+`]
        : []),
      "New Drops Weekly",
      "Student Discount 15%",
    ],
    [settings.freeShippingThreshold, formatPrice],
  );
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % announcements.length), 4000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  if (!isVisible || scrollHide) return null;

  return (
    <div className="bg-black text-white h-9 flex items-center justify-center relative overflow-hidden">
      <button
        onClick={() => setIndex((i) => (i - 1 + announcements.length) % announcements.length)}
        className="absolute left-4 p-1 hover:opacity-70 transition-opacity"
        aria-label="Previous message"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2 text-sm font-medium tracking-wide">
        <span key={index} className="animate-fadeIn">
          {announcements[index % announcements.length]}
        </span>
      </div>
      <button
        onClick={() => setIndex((i) => (i + 1) % announcements.length)}
        className="absolute right-10 p-1 hover:opacity-70 transition-opacity"
        aria-label="Next message"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 p-1 hover:opacity-70 transition-opacity"
        aria-label="Close announcement"
      >
        <span className="text-lg leading-none">×</span>
      </button>
    </div>
  );
}
