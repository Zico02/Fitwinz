import HomeChrome from "@/components/HomeChrome";
import Footer from "@/components/Footer";
import ProductCarousel from "@/components/sections/ProductCarousel";
import WomensHero from "@/components/sections/WomensHero";
import PopularSection from "@/components/sections/PopularSection";
import TrainingSection from "@/components/sections/TrainingSection";
import ShopByCategory from "@/components/sections/ShopByCategory";
import PhilosophySection from "@/components/sections/PhilosophySection";
import { getStorefront } from "@/lib/store";

export default async function HomePage() {
  const { products } = await getStorefront();
  const inCategory = (slug: string) => products.filter((p) => p.category === slug);

  return (
    <>
      <main>
        <HomeChrome />
        <ProductCarousel
          id="section-men-durable"
          title="DURABLE KIT FOR PUSH, PULL & LEG DAYS"
          label="MEN"
          products={inCategory("men")}
        />
        <ProductCarousel
          id="accessories"
          title="STRAPS, SHAKER & SOCKS"
          label="ACCESSORIES"
          products={inCategory("accessories")}
        />
        <WomensHero />
        <ProductCarousel
          id="section-new-in-matching"
          title="NEW IN: MATCHING SETS"
          label="COUPLES COLLECTION"
          products={inCategory("couples")}
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
