"use client";

import Image from "next/image";
import Link from "next/link";
import { useReveal } from "@/components/useReveal";

const footerLinks = {
  help: ["FAQ", "Delivery Information", "Returns Policy", "Make A Return", "Orders", "Submit a Fake"],
  account: ["Login", "Register"],
  pages: ["Fitwinz Central", "Fitwinz Loyalty", "Careers", "About Us", "Student Discount", "Training App", "Factory List"],
  more: ["Blog", "Student Discount", "Email Sign Up"],
};

const paymentMethods = [
  { name: "Visa", src: "/images/pay-visa.webp" },
  { name: "Mastercard", src: "/images/pay-mastercard.webp" },
  { name: "Amex", src: "/images/pay-amex.webp" },
  { name: "PayPal", src: "/images/pay-paypal.webp" },
  { name: "Apple Pay", src: "/images/pay-apple.webp" },
];

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61551073806108&locale=fr_FR",
    icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h4.047V9.43c0-4.007 2.792-6.195 6.533-6.195 1.78 0 3.52.317 3.52.317v3.88h-1.985c-1.96 0-2.57 1.218-2.57 2.467v2.96h4.364l-.698 3.47h-3.666V24c5.737-.9 10.125-5.864 10.125-11.854z",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/fitwinz_store/?hl=fr",
    icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    name: "X",
    href: "https://x.com/",
    icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@streamerspotlight03",
    icon: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/",
    icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
];

function LinkColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 tracking-wider mb-6">{title}</h3>
      <ul className="space-y-3">
        {links.map((name) => (
          <li key={name}>
            <a href="#" className="text-sm text-gray-300 hover:text-white hover:translate-x-1 inline-block transition-all">
              {name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const { ref, visible } = useReveal<HTMLElement>(0.1);
  const reveal = visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0";

  return (
    <footer ref={ref} className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 transition-all duration-700 ${reveal}`}>
          <LinkColumn title="HELP" links={footerLinks.help} />
          <LinkColumn title="MY ACCOUNT" links={footerLinks.account} />
          <LinkColumn title="PAGES" links={footerLinks.pages} />
          <LinkColumn title="MORE ABOUT FITWINZ" links={footerLinks.more} />
        </div>

        <div className={`mt-16 pt-8 border-t border-gray-800 transition-all duration-700 ${reveal}`} style={{ transitionDelay: "200ms" }}>
          <h3 className="text-xl font-bold mb-4">WORKOUT CLOTHES &amp; GYM WEAR</h3>
          <p className="text-sm text-gray-400 leading-relaxed max-w-4xl">
            Performance-driven apparel built for those who train with purpose, from workouts to recovery, every piece is
            designed to help you perform at your best.
          </p>
        </div>

        <div className={`mt-8 flex gap-4 transition-all duration-700 ${reveal}`} style={{ transitionDelay: "300ms" }}>
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              aria-label={social.name}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden>
                <path d={social.icon} />
              </svg>
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex gap-3">
              {paymentMethods.map((method) => (
                <div key={method.name} className="h-8 flex items-center">
                  <Image
                    src={method.src}
                    alt={method.name}
                    width={100}
                    height={60}
                    className="h-8 w-auto max-w-[52px] object-contain"
                  />
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-400 text-center space-y-1">
              <p>© 2026 Fitwinz | Founded by AHAJI Zakariae |</p>
              <p>| All Rights Reserved | Time to Dress Healthy |</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms and Conditions
              </Link>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Use
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Privacy Notice
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
