"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Heart, Lock, Menu, Minus, Plus, Search, ShoppingBag, User, X } from "lucide-react";
import Logo from "@/components/Logo";
import { useCart } from "@/components/CartContext";
import { cartUpsellProductId, categoryAnchor, getProduct, products } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

const navLinks = [
  { name: "Women", href: "#section-trending-now" },
  { name: "Men", href: "#section-men-durable" },
  { name: "Accessories", href: "#accessories" },
  { name: "Our Philosophy", href: "#philosophy" },
];

const megaMenuContent: Record<string, { title: string; links: string[] }[]> = {
  Women: [
    { title: "TRENDING", links: ["New Product Drops", "Best Sellers", "Everyday Seamless", "Cosy Luxe", "Running"] },
    { title: "LEGGINGS", links: ["All Leggings", "High Waisted", "Scrunch Bum Leggings", "Black Leggings", "Flare Leggings"] },
    { title: "PRODUCTS", links: ["All Products", "Leggings", "T-Shirts & Tops", "Sports Bras", "Long Sleeve"] },
    { title: "EXPLORE", links: ["Leggings Guide", "Sports Bra Guide", "Your Edit", "Fitwinz Loyalty"] },
  ],
  Men: [
    { title: "TRENDING", links: ["New Product Drops", "Coming Soon", "Best Sellers", "Running", "Lifting"] },
    { title: "T-SHIRTS & TOPS", links: ["T-Shirts & Tops", "Tank Tops", "Oversized T-Shirts", "Long Sleeve Tops", "Muscle Fit Shirts"] },
    { title: "PRODUCTS", links: ["All Products", "T-Shirts & Tops", "Shorts", "Hoodies & Sweatshirts", "Joggers & Sweatpants"] },
    { title: "EXPLORE", links: ["Shorts Guide", "Your Edit", "Fitwinz Loyalty", "Blog"] },
  ],
  Accessories: [
    { title: "TRENDING", links: ["All Accessories", "New Product Drops", "Best Sellers", "Seasonal Accessories"] },
    { title: "BAGS", links: ["All Bags", "Backpacks", "Holdall And Duffel Bags", "Tote Bags", "Crossbody Bags"] },
    { title: "EQUIPMENT", links: ["All Equipment", "Lifting Straps", "Lifting Belts", "Knee Sleeves", "Running Accessories"] },
    { title: "SOCKS", links: ["All Socks", "Crew Socks", "Quarter Socks", "Trainer Socks", "Graphic Socks"] },
  ],
  "Our Philosophy": [
    { title: "WOMENS GUIDES", links: ["Leggings Guide", "Leggings Size Guide", "Sports Bra Guide", "New To Fitwinz?"] },
    { title: "WOMENS CLOTHING", links: ["Best Sellers", "Top Rated", "Black Staples", "High Waisted", "Sports Bras"] },
    { title: "MEN CLOTHING", links: ["Best Sellers", "Top Rated", "Black Staples", "T-Shirts & Tops", "Shorts"] },
    { title: "FIND OUT MORE", links: ["Your Edit", "Fitwinz Loyalty", "Blog"] },
  ],
};

const popularSearches = ["Tanks", "Leggings", "Shorts", "Hoodies", "Accessories"];

const SHIPPING_ESTIMATE = 15;

export default function Header({ scrollY }: { scrollY: number }) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const router = useRouter();
  const { cartLines, cartCount, cartTotal, updateQuantity, removeFromCart, wishlistIds, addToCart } = useCart();

  const isScrolled = scrollY > 50;
  const upsell = getProduct(cartUpsellProductId);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => [p.name, p.fit, p.color].join(" ").toLowerCase().includes(q));
  }, [searchQuery]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen || isCartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, isCartOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCartOpen(false);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push("/checkout");
  };

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/95 backdrop-blur-xl shadow-sm" : "bg-white"
        }`}
        style={{ top: isScrolled ? "0px" : "36px" }}
      >
        <div className="h-[72px] flex items-center justify-between px-6 lg:px-10">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </button>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => setActiveMenu(link.name)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <a href={link.href} className="text-sm font-medium text-gray-900 hover:text-black relative py-2 group">
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
                </a>
                {activeMenu === link.name && (
                  <div
                    className="fixed left-0 right-0 top-[108px] bg-white shadow-xl border-t border-gray-100 animate-fadeIn"
                    style={{ animationDuration: "200ms" }}
                  >
                    <div className="max-w-7xl mx-auto px-10 py-8">
                      <div className="grid grid-cols-4 gap-8">
                        {megaMenuContent[link.name]?.map((section, idx) => (
                          <div key={section.title} className="animate-slideUp" style={{ animationDelay: `${idx * 50}ms` }}>
                            <h3 className="text-xs font-semibold text-gray-500 tracking-wider mb-4">{section.title}</h3>
                            <ul className="space-y-3">
                              {section.links.map((item) => (
                                <li key={item}>
                                  <a
                                    href="#"
                                    className="text-sm text-gray-700 hover:text-black hover:translate-x-1 inline-block transition-all"
                                  >
                                    {item}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <Link
            href="/"
            className={`absolute left-1/2 -translate-x-1/2 transition-transform duration-300 ${
              isScrolled ? "scale-90" : "scale-100"
            }`}
          >
            <Logo priority className="h-16 w-auto object-contain bg-transparent" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Search className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">What are you looking for?</span>
              </button>
            </div>
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              href="/wishlist"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative hidden sm:block"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
            <Link
              href="/login"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </Link>
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              aria-label="Cart"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[70] bg-white animate-fadeIn">
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
            <div className="flex-1 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  autoFocus
                />
              </div>
            </div>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="ml-4 p-2 hover:bg-gray-100 rounded-full"
              aria-label="Close search"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 max-w-2xl mx-auto">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">POPULAR SEARCHES</h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
            {searchQuery.trim() && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">RESULTS</h3>
                {searchResults.length === 0 ? (
                  <p className="text-sm text-gray-500">No matches for your search.</p>
                ) : (
                  <ul className="space-y-2 max-h-[50vh] overflow-y-auto">
                    {searchResults.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={categoryAnchor[p.category]}
                          onClick={() => setIsSearchOpen(false)}
                          className="block rounded-xl border border-gray-100 p-3 hover:bg-gray-50"
                        >
                          {p.name} <span className="text-gray-500">· {p.color}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart drawer */}
      {isCartOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60] animate-fadeIn" onClick={() => setIsCartOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[70] animate-slideInRight overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold">YOUR BAG</h2>
              <div className="flex items-center gap-4">
                <Link href="/wishlist" className="p-2" aria-label="Wishlist">
                  <Heart className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  aria-label="Close bag"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">Delivery &amp; Shipping Information</span>
                <span className="text-gray-400">ⓘ</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {cartLines.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your bag is empty</h3>
                  <p className="text-gray-500 mb-6">Add some items to get started!</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              ) : (
                <>
                  <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
                    <p className="text-sm flex items-start gap-2">
                      <span className="text-amber-500">ⓘ</span>
                      <span>Your items aren&apos;t reserved, checkout quickly to make sure you don&apos;t miss out.</span>
                    </p>
                  </div>

                  <div className="p-4 space-y-4">
                    {cartLines.map(({ product, size, quantity }) => (
                      <div key={`${product.id}-${size}`} className="flex gap-4">
                        <div className="relative w-20 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          <Image src={product.image} alt={product.name} fill sizes="80px" className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-sm">{product.name}</h3>
                              <p className="text-sm text-gray-500">
                                {product.color} - {size} - {product.fit}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => removeFromCart(product.id, size)}
                                className="text-gray-400 hover:text-black"
                                aria-label={`Remove ${product.name}`}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-gray-300 rounded">
                              <button
                                onClick={() => updateQuantity(product.id, size, quantity - 1)}
                                className="px-2 py-1 hover:bg-gray-100"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-sm">{quantity}</span>
                              <button
                                onClick={() => updateQuantity(product.id, size, quantity + 1)}
                                className="px-2 py-1 hover:bg-gray-100"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="font-semibold">{formatPrice(product.price * quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {upsell && (
                    <div className="px-4 py-4 border-t border-gray-100">
                      <h3 className="font-semibold text-sm mb-2">ADD A LITTLE EXTRA</h3>
                      <p className="text-sm text-gray-500 mb-4">Add one or more of these items to get free delivery</p>
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        <div className="flex-shrink-0 w-32">
                          <div className="relative aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
                            <Image src={upsell.image} alt={upsell.name} fill sizes="128px" className="object-cover" />
                          </div>
                          <p className="text-xs font-semibold">NEW &amp; IMPROVED</p>
                          <p className="text-xs text-gray-500">{upsell.name}</p>
                          <p className="text-sm font-semibold">{formatPrice(upsell.price)}</p>
                          <button
                            onClick={() => addToCart(upsell.id, upsell.sizes[0])}
                            className="mt-2 w-full py-1 border border-black text-sm font-semibold rounded hover:bg-black hover:text-white transition-colors"
                          >
                            + ADD
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="px-4 py-4 border-t border-gray-100">
                    <h3 className="font-semibold text-sm mb-3">DISCOUNT CODE</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <button className="px-6 py-2 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors">
                        APPLY
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">ⓘ Gift Card codes can be applied at checkout.</p>
                  </div>

                  <div className="px-4 py-4 border-t border-gray-100">
                    <h3 className="font-semibold text-sm mb-3">ORDER SUMMARY</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sub Total</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Shipping</span>
                        <span className="text-gray-400">{formatPrice(SHIPPING_ESTIMATE)}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t border-gray-100">
                        <span>Total</span>
                        <span>{formatPrice(cartTotal + SHIPPING_ESTIMATE)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {cartLines.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-white">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  CHECKOUT SECURELY
                </button>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="text-xs bg-blue-900 text-white px-2 py-1 rounded">VISA</span>
                  <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">MC</span>
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">AMEX</span>
                  <span className="text-xs bg-blue-800 text-white px-2 py-1 rounded">PayPal</span>
                  <span className="text-xs bg-black text-white px-2 py-1 rounded">Apple Pay</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50 animate-fadeIn" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white animate-slideInLeft overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <Logo className="h-8 w-auto" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2" aria-label="Close menu">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="flex items-center justify-between py-3 text-lg font-medium border-b border-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </a>
                ))}
              </nav>
              <div className="mt-8 pt-8 border-t border-gray-100">
                <Link href="/login" className="flex items-center gap-3 py-3 text-lg" onClick={() => setIsMobileMenuOpen(false)}>
                  <User className="w-5 h-5" />
                  Log In
                </Link>
                <Link href="/wishlist" className="flex items-center gap-3 py-3 text-lg" onClick={() => setIsMobileMenuOpen(false)}>
                  <Heart className="w-5 h-5" />
                  Wishlist
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
