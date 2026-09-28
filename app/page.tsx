import HomeChrome from "@/components/HomeChrome";
import Footer from "@/components/Footer";
import ProductCarousel from "@/components/sections/ProductCarousel";
import WomensHero from "@/components/sections/WomensHero";
import PopularSection from "@/components/sections/PopularSection";
import TrainingSection from "@/components/sections/TrainingSection";
import ShopByCategory from "@/components/sections/ShopByCategory";
import PhilosophySection from "@/components/sections/PhilosophySection";
import { productsByCategory } from "@/lib/catalog";

export default function HomePage() {
  return (
    <>
      <main>
        <HomeChrome />
        <ProductCarousel
          id="section-men-durable"
          title="DURABLE KIT FOR PUSH, PULL & LEG DAYS"
          label="MEN"
          products={productsByCategory("men")}
        />
        <ProductCarousel
          id="accessories"
          title="STRAPS, SHAKER & SOCKS"
          label="ACCESSORIES"
          products={productsByCategory("accessories")}
        />
        <WomensHero />
        <ProductCarousel
          id="section-new-in-matching"
          title="NEW IN: MATCHING SETS"
          label="COUPLES COLLECTION"
          products={productsByCategory("couples")}
        />
        <PopularSection />
        <TrainingSection />
        <ShopByCategory />
        <PhilosophySection />
      </main>
      <Footer />
    </>
  );
}
