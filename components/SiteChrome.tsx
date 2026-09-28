"use client";

import { useEffect, useState } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";

/** Announcement bar + fixed header for pages other than home. Content should start at mt-[108px]. */
export default function SiteChrome() {
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
    </>
  );
}
