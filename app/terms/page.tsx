import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Fitwinz terms and conditions: orders, delivery, returns and refunds.",
};

const H = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xs font-bold tracking-widest text-gray-900 uppercase mt-10">{children}</h2>
);

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-black">
            ← Back to shop
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full px-6 py-10 lg:py-14">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-4 mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">TERMS &amp; CONDITIONS</h1>
          <Link href="/" className="shrink-0">
            <Logo className="w-auto object-contain bg-transparent" style={{ height: "170px", maxWidth: "240px" }} />
          </Link>
        </div>

        <div className="text-gray-800 leading-relaxed max-w-3xl mx-auto text-center">
          <div className="space-y-4 text-gray-800 leading-relaxed text-sm md:text-base">
            <p className="text-lg font-semibold text-gray-900">Fitwinz Terms &amp; Conditions</p>
            <p>
              Welcome to Fitwinz. These terms outline how you purchase and use our products. Please read them carefully
              before placing an order.
            </p>
            <p>By using our website, you agree to these terms.</p>

            <H>1. Who We Are</H>
            <p>
              Fitwinz is a sportswear brand founded with a vision to create performance-driven clothing using healthier,
              more natural materials.
            </p>
            <p>
              <strong>Contact us anytime at:</strong>
              <br />
              Email:{" "}
              <a className="underline" href="mailto:fitwinz2@gmail.com">
                fitwinz2@gmail.com
              </a>
              <br />
              Or through our website contact section.
            </p>

            <H>2. Placing an Order</H>
            <p>
              When you place an order, you are making an offer to purchase a product. After ordering, you will receive a
              confirmation email. Your order is officially accepted once we dispatch your items. Please double-check
              your size, items, and delivery address before confirming.
            </p>
            <p>You must be at least 18 years old, or have permission from a parent/guardian.</p>

            <H>3. Product Availability &amp; Order Cancellation</H>
            <p>
              We may cancel your order if a product is out of stock, payment cannot be verified, there is a pricing or
              listing error, or suspicious or bulk-buy activity is detected. If this happens, you will not be charged.
            </p>

            <H>4. Our Products</H>
            <p>
              Fitwinz designs performance clothing and gym accessories. We focus on materials such as wool, linen, and
              organic cotton.
            </p>
            <p>
              <strong>Note:</strong> Product images are for illustration. Colors may vary slightly depending on your
              device.
            </p>

            <H>5. Delivery</H>
            <p>
              Delivery times depend on your location and selected shipping method. Delays may happen due to external
              factors (weather, logistics, etc.). Risk transfers to you once the product is handed to the carrier. If you
              miss delivery, the courier will provide next steps.
            </p>

            <H>6. Returns &amp; Refunds</H>
            <p>
              If the product is faulty, you are eligible for a replacement or full refund. If you change your mind, you
              have 30 days to return items; items must be unused, with tags and original packaging.
            </p>
            <p>
              Non-returnable items include opened socks (hygiene reasons), shakers &amp; bottles (health safety), and
              personalized/custom products.
            </p>
            <p>Refunds are processed using your original payment method within 14 days after receiving returned items.</p>

            <H>7. Pricing &amp; Payments</H>
            <p>
              Prices are displayed before checkout. Taxes may apply depending on your location. Accepted payments include
              Visa, Mastercard, PayPal, and Apple Pay. We may correct pricing errors and cancel affected orders if
              necessary.
            </p>

            <H>8. Discounts &amp; Offers</H>
            <p>
              Discount codes are time-limited. Only one code per order. Cannot be used on gift cards or combined offers.
              Refunds reflect the discounted price paid.
            </p>

            <H>9. Your Rights</H>
            <p>
              You may cancel your order if we change product details, there is a pricing error, or delivery is
              significantly delayed.
            </p>

            <H>10. Our Responsibility</H>
            <p>
              We are responsible for delivering products as described and ensuring reasonable quality. We are not
              responsible for indirect losses or business-related losses. Nothing in these terms removes your legal
              rights.
            </p>

            <H>11. Personal Data</H>
            <p>We only use your data according to our Privacy Policy. Your information is handled securely and never sold.</p>

            <H>12. General Terms</H>
            <p>
              These terms may be updated at any time. Continued use of the website means acceptance of updates. If one
              part of these terms is invalid, the rest still applies.
            </p>

            <H>13. Fitwinz Philosophy</H>
            <p>
              Fitwinz is built on a simple idea: performance should not come at the cost of comfort or well-being. We
              create sportswear that feels better on the skin, supports movement naturally, and aligns with a healthier
              lifestyle.
            </p>
            <p>Fitwinz is more than clothing &mdash; it&rsquo;s how you train, move, and live.</p>

            <H>14. Legal</H>
            <p>These terms are governed by applicable laws in your region.</p>
          </div>
        </div>
      </main>

      <footer className="bg-black text-white py-8 px-6 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-400">© 2026 Fitwinz</p>
        </div>
      </footer>
    </div>
  );
}
