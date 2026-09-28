"use client";

import { useEffect, useState } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import HeroSection from "@/components/sections/HeroSection";

/** Scroll-aware top of the home page: announcement bar, fixed header and hero offset. */
export default function HomeChrome() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <AnnouncementBar scrollHide={scrollY > 50} />
      <Header scrollY={scrollY} />
      <HeroSection compactTop={scrollY > 50} />
    </>
  );
}
