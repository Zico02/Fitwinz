// Single source of truth for the storefront catalog.
// Step 2 moves this data into Supabase; the seed script reads from this file.

export type ProductCategory = "men" | "accessories" | "couples";

export interface Product {
  /** Unique, URL-safe identifier (also the future product page slug). */
  id: string;
  name: string;
  fit: string;
  color: string;
  /** Price as currently displayed on fitwinz.ma (USD placeholder until MAD prices are provided). */
  price: number;
  rating: number;
  isNew: boolean;
  image: string;
  hoverImage: string;
  sizes: string[];
  category: ProductCategory;
}

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const SET_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

export const products: Product[] = [
  {
    id: "oversized-fit-ice-blue",
    name: "Oversized Fit",
    fit: "Thermal Wool Blend",
    color: "Ice Blue",
    price: 44,
    rating: 4.8,
    isNew: true,
    image: "/images/ice_front.webp",
    hoverImage: "/images/back_ice.webp",
    sizes: APPAREL_SIZES,
    category: "men",
  },
  {
    id: "compression-top-black-grey",
    name: "Compression Top",
    fit: "Breathable Linen",
    color: "Black/Grey",
    price: 35,
    rating: 3.4,
    isNew: false,
    image: "/images/compressor_fit.webp",
    hoverImage: "/images/compressor_back.webp",
    sizes: APPAREL_SIZES,
    category: "men",
  },
  {
    id: "oversized-fit-burnt-orange",
    name: "Oversized Fit",
    fit: "Thermal Wool Blend",
    color: "Burnt Orange",
    price: 44,
    rating: 4.4,
    isNew: false,
    image: "/images/or_fitwinz.webp",
    hoverImage: "/images/product-tank-black.webp",
    sizes: APPAREL_SIZES,
    category: "men",
  },
  {
    id: "compression-top-grey-graphite-blue",
    name: "Compression Top",
    fit: "Breathable Linen",
    color: "Grey/Graphite/Blue",
    price: 45,
    rating: 4.9,
    isNew: true,
    image: "/images/jacket_fitwinz.webp",
    hoverImage: "/images/back_jacket_fitwinz.webp",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    category: "men",
  },
  {
    id: "lifting-straps-black",
    name: "Lifting Straps",
    fit: "One Size",
    color: "Black",
    price: 16,
    rating: 4.3,
    isNew: false,
    image: "/images/straps_fitwinz.webp",
    hoverImage: "/images/straps_fitwinz.webp",
    sizes: ["OS"],
    category: "accessories",
  },
  {
    id: "pro-shaker-black",
    name: "Pro Shaker",
    fit: "BPA-Free Aluminum",
    color: "Black",
    price: 20,
    rating: 4.7,
    isNew: true,
    image: "/images/shaker_fitwinz.webp",
    hoverImage: "/images/shaker_fitwinz.webp",
    sizes: ["OS"],
    category: "accessories",
  },
  {
    id: "performance-socks-white",
    name: "Performance Socks",
    fit: "Lightweight Wool Blend",
    color: "White",
    price: 12,
    rating: 4.5,
    isNew: false,
    image: "/images/sock_Fitwinz.webp",
    hoverImage: "/images/sock_Fitwinz.webp",
    sizes: ["OS"],
    category: "accessories",
  },
  {
    id: "matching-set-forest-teal",
    name: "Matching Sets",
    fit: "Performance Wool Blend",
    color: "Forest Teal",
    price: 88,
    rating: 4.5,
    isNew: true,
    image: "/images/fiti_green.webp",
    hoverImage: "/images/fiti_green2.webp",
    sizes: SET_SIZES,
    category: "couples",
  },
  {
    id: "matching-set-wine-burgundy",
    name: "Matching Sets",
    fit: "Performance Wool Blend",
    color: "Wine Burgundy",
    price: 88,
    rating: 4.7,
    isNew: true,
    image: "/images/mamadoua.webp",
    hoverImage: "/images/mamadoua2.webp",
    sizes: SET_SIZES,
    category: "couples",
  },
  {
    id: "train-together-dusty-rose-rust-red",
    name: "Train Together",
    fit: "Performance Linen Blend",
    color: "Dusty Rose/Rust Red",
    price: 82,
    rating: 4.3,
    isNew: false,
    image: "/images/category-seamless.webp",
    hoverImage: "/images/category-seamless2.webp",
    sizes: ["XXS", "XS", "S", "M", "L", "XL"],
    category: "couples",
  },
  {
    id: "train-together-dark-forest-teal",
    name: "Train Together",
    fit: "Performance Wool Blend",
    color: "Dark Forest/Forest Teal",
    price: 86,
    rating: 3.9,
    isNew: false,
    image: "/images/category-cosy.webp",
    hoverImage: "/images/category-cosy1.webp",
    sizes: SET_SIZES,
    category: "couples",
  },
];

export const productsByCategory = (category: ProductCategory) =>
  products.filter((p) => p.category === category);

export const getProduct = (id: string) => products.find((p) => p.id === id);

/** Home-page section each category lives in (used by search results). */
export const categoryAnchor: Record<ProductCategory, string> = {
  men: "/#section-men-durable",
  accessories: "/#accessories",
  couples: "/#section-new-in-matching",
};

/** The small upsell shown in the cart drawer ("ADD A LITTLE EXTRA"). */
export const cartUpsellProductId = "performance-socks-white";

// ---------------------------------------------------------------------------
// Editorial tiles. These are banners, not purchasable products.
// ---------------------------------------------------------------------------

export interface EditorialTile {
  id: string;
  title: string;
  description: string;
  image: string;
  isNew?: boolean;
}

export const trendingTiles: Record<"women" | "men", EditorialTile[]> = {
  women: [
    {
      id: "everyday-seamless",
      title: "EVERYDAY SEAMLESS 2.0",
      description: "Breathable Performance Fabric Squat-proof, Built for performance.",
      image: "/images/gymgirl.webp",
    },
    {
      id: "cosy-luxe",
      title: "COSY LUXE",
      description: "Premium Soft Fabric Ultra-soft comfort Built for recovery days.",
      image: "/images/Fitwinz_green.webp",
    },
    {
      id: "just-dropped",
      title: "JUST DROPPED",
      description: "Fresh performance pieces just landed Performance Fabric.",
      image: "/images/yilo.webp",
      isNew: true,
    },
    {
      id: "cold-weather-training",
      title: "COLD WEATHER TRAINING",
      description: "New Insulated Performance Fabric Stay warm. Stay moving.",
      image: "/images/pinkii.webp",
    },
  ],
  men: [
    {
      id: "new-arrivals",
      title: "NEW ARRIVALS",
      description: "Slim-Fit Performance Fabric.",
      image: "/images/Fitwinz_blue1.webp",
      isNew: true,
    },
    {
      id: "power-collection-multi",
      title: "POWER COLLECTION",
      description: "Advanced Performance Fabric.",
      image: "/images/ori.webp",
    },
    {
      id: "power-collection-blue",
      title: "POWER COLLECTION",
      description: "Advanced Performance Fabric.",
      image: "/images/bleu_fiti.webp",
    },
    {
      id: "power-collection-black",
      title: "POWER COLLECTION",
      description: "Advanced Performance Fabric.",
      image: "/images/model2.webp",
    },
  ],
};

export interface TrainingTile {
  id: string;
  name: string;
  image: string;
}

export const trainingTiles: Record<"women" | "men", TrainingTile[]> = {
  women: [
    { id: "w-lifting", name: "LIFTING", image: "/images/train-lifting.webp" },
    { id: "w-hiit", name: "HIIT", image: "/images/train-hiit.webp" },
    { id: "w-running", name: "RUNNING", image: "/images/train-running2.webp" },
    { id: "w-pilates", name: "PILATES", image: "/images/grini.webp" },
  ],
  men: [
    { id: "m-lifting", name: "LIFTING", image: "/images/manlift.webp" },
    { id: "m-hiit", name: "HIIT", image: "/images/jumpi.webp" },
    { id: "m-running", name: "RUNNING", image: "/images/train-running.webp" },
    { id: "m-pilates", name: "PILATES", image: "/images/yoga.webp" },
  ],
};

export const shopCategories = [
  { id: "women", name: "SHOP WOMEN", image: "/images/shop-women1.webp", href: "#section-trending-now" },
  { id: "men", name: "SHOP MEN", image: "/images/boss1.webp", href: "#section-men-durable" },
  { id: "accessories", name: "SHOP ACCESSORIES", image: "/images/shop-accessories.webp", href: "#accessories" },
];
