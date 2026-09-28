import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/components/CartContext";
import { StoreProvider } from "@/components/StoreContext";
import { getStorefront } from "@/lib/store";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://fitwinz.ma"),
  title: {
    default: "Fitwinz - Premium Sportswear & Fitness Clothing in Morocco",
    template: "%s | Fitwinz",
  },
  description:
    "Fitwinz offers premium sportswear and fitness clothing designed for performance and a healthier lifestyle in Morocco. Shop now.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const storefront = await getStorefront();
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <StoreProvider storefront={storefront}>
          <CartProvider>{children}</CartProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
