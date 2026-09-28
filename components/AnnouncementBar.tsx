"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const announcements = ["Free Shipping on Orders $50+", "New Drops Weekly", "Student Discount 15%"];

export default function AnnouncementBar({ scrollHide = false }: { scrollHide?: boolean }) {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % announcements.length), 4000);
    return () => clearInterval(timer);
  }, []);

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
          {announcements[index]}
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
