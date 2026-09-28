import Logo from "@/components/Logo";

export default function PhilosophySection() {
  return (
    <section id="philosophy" className="scroll-mt-28 bg-white py-16 px-6 lg:px-10">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">Our Philosophy</h2>
        <div className="flex justify-center mb-6">
          <Logo className="w-auto object-contain bg-transparent" style={{ height: "170px", maxWidth: "240px" }} />
        </div>
        <div className="space-y-3 text-gray-700 leading-snug text-sm max-w-4xl mx-auto">
          <p>
            Fitwinz is a Moroccan brand founded with a clear vision: to create sportswear that combines performance,
            comfort, and a healthier approach to clothing.
          </p>
          <p>
            We design our products using natural materials such as wool, linen, and organic cotton, focusing on comfort,
            breathability, and durability. Our approach avoids synthetic fabrics; we aim to use materials that feel
            better on the skin and align with a healthier lifestyle.
          </p>
          <p>
            Founded by twins, Fitwinz reflects a commitment to quality, creating sportswear that connects movement,
            well-being, and nature.
          </p>
        </div>
        <p className="mt-8 text-center text-base md:text-xl font-semibold text-gray-900 max-w-3xl mx-auto leading-snug">
          Fitwinz is more than sportswear — it&rsquo;s a way to train, move, and live better.
        </p>
      </div>
    </section>
  );
}
