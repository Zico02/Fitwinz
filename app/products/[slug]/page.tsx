import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Truck } from "lucide-react";
import Footer from "@/components/Footer";
import SiteChrome from "@/components/SiteChrome";
import ProductPurchase from "@/components/product/ProductPurchase";
import { formatPrice } from "@/lib/pricing";
import { getStorefront } from "@/lib/store";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { products } = await getStorefront();
  return products.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { products } = await getStorefront();
  const product = products.find((p) => p.id === slug);
  if (!product) return {};
  const title = `${product.name} - ${product.color}`;
  const description =
    product.description ?? `${product.name} in ${product.color}. ${product.fit}. Fitwinz sportswear, delivered across Morocco.`;
  return {
    title,
    description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: { title, description, images: product.image ? [{ url: product.image }] : undefined, type: "website" },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const { products, settings } = await getStorefront();
  const product = products.find((p) => p.id === slug);
  if (!product) notFound();

  const inStock = product.sizes.some((s) => (product.stock[s] ?? 0) > 0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} - ${product.color}`,
    image: product.images.map((i) => new URL(i.url, "https://fitwinz.ma").toString()),
    description: product.description ?? `${product.name}, ${product.fit}, ${product.color}`,
    color: product.color,
    brand: { "@type": "Brand", name: "Fitwinz" },
    sku: product.id,
    offers: {
      "@type": "Offer",
      url: `https://fitwinz.ma/products/${product.id}`,
      priceCurrency: settings.currencyCode,
      price: product.price.toFixed(2),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <>
      <SiteChrome />
      <main className="mt-[108px] px-6 lg:px-10 py-10">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-black">
            Home
          </Link>{" "}
          / <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
          <div className="flex lg:grid lg:grid-cols-2 gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            {product.images.map((img, i) => (
              <div key={img.url} className="relative aspect-[3/4] bg-gray-100 overflow-hidden flex-shrink-0 w-[85%] lg:w-auto snap-start">
                <Image
                  src={img.url}
                  alt={img.alt ?? `${product.name} - ${product.color}`}
                  fill
                  loading={i === 0 ? "eager" : undefined}
                  fetchPriority={i === 0 ? "high" : undefined}
                  sizes="(min-width: 1024px) 25vw, 85vw"
                  className="object-cover"
                />
                {i === 0 && product.isNew && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-white text-xs font-semibold tracking-wide">NEW</span>
                )}
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-28 self-start space-y-6">
            <div className="space-y-2">
              {product.rating !== null && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-black" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-500">{product.fit}</p>
              <p className="text-gray-500">{product.color}</p>
              <p className="text-xl font-semibold text-gray-900 pt-2">{formatPrice(product.price, settings)}</p>
            </div>

            <ProductPurchase productId={product.id} />

            <div className="border-t border-gray-100 pt-6 space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Delivery across Morocco:{" "}
                {settings.freeShippingThreshold !== null
                  ? `${formatPrice(settings.shippingFee, settings)}, free from ${formatPrice(settings.freeShippingThreshold, settings)}`
                  : formatPrice(settings.shippingFee, settings)}
              </p>
              <p>Cash on delivery: pay when your order arrives.</p>
            </div>

            {product.description && (
              <div className="border-t border-gray-100 pt-6">
                <h2 className="text-sm font-semibold mb-2">DESCRIPTION</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="max-w-7xl mx-auto mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">YOU MAY ALSO LIKE</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <Link key={p.id} href={`/products/${p.id}`} className="group">
                  <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  <p className="text-sm text-gray-500">{p.color}</p>
                  <p className="font-semibold text-gray-900">{formatPrice(p.price, settings)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
