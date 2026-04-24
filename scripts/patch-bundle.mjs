import fs from "fs";

const bundlePath = new URL("../dist/assets/index-Csxc0UUK.js", import.meta.url);
let s = fs.readFileSync(bundlePath, "utf8");

function rep(from, to, label) {
  if (!s.includes(from)) throw new Error(`Missing for ${label}`);
  s = s.replace(from, to);
}

// --- Announcement hides on scroll; header moves up ---
rep(
  `function O1(){const[u,f]=b.useState(0),[d,o]=b.useState(!0);`,
  `function O1({scrollHide:y7=!1}){const[u,f]=b.useState(0),[d,o]=b.useState(!0);`,
  "O1 signature",
);
rep(
  `return d?c.jsxs("div",{"code-path":"src/components/AnnouncementBar.tsx:32:5"`,
  `return d&&!y7?c.jsxs("div",{"code-path":"src/components/AnnouncementBar.tsx:32:5"`,
  "O1 hide when scrollHide",
);

rep(
  `c.jsx(O1,{"code-path":"src/App.tsx:186:7"}),c.jsx(z1,{"code-path":"src/App.tsx:187:7",scrollY:u})`,
  `c.jsx(O1,{"code-path":"src/App.tsx:186:7",scrollHide:u>50}),c.jsx(z1,{"code-path":"src/App.tsx:187:7",scrollY:u})`,
  "App passes scrollHide",
);

rep(`style:{top:"36px"}`, `style:{top:u>50?"0px":"36px"}`, "Header top offset");

// --- Main hero margin when scrolled ---
rep(
  `function w1(){const[u,f]=b.useState(!1),d=b.useRef(null);`,
  `function w1({compactTop:n7=!1}){const[u,f]=b.useState(!1),d=b.useRef(null);`,
  "w1 signature",
);
rep(
  `className:"relative w-full h-[85vh] mt-[108px] overflow-hidden"`,
  `className:\`relative w-full h-[85vh] \${n7?"mt-[72px]":"mt-[108px]"} overflow-hidden\``,
  "Hero dynamic top margin",
);
rep(
  `c.jsx(w1,{"code-path":"src/App.tsx:189:9"})`,
  `c.jsx(w1,{"code-path":"src/App.tsx:189:9",compactTop:u>50})`,
  "App passes compactTop",
);

// --- Nav + mega menu ---
rep(
  `const Nh=[{name:"Women",href:"#women"},{name:"Men",href:"#men"},{name:"Accessories",href:"#accessories"},{name:"Explore",href:"#explore"}]`,
  `const Nh=[{name:"Women",href:"#section-trending-now"},{name:"Men",href:"#section-men-durable"},{name:"Accessories",href:"#accessories"},{name:"Our Philosophy",href:"#philosophy"}]`,
  "Top nav links",
);
rep(`}],Explore:[{title:"WOMENS GUIDES"`, `}],'Our Philosophy':[{title:"WOMENS GUIDES"`, "Mega menu key");

// --- Product carousel optional id ---
rep(`function jh({title:u,label:f,products:d}){`, `function jh({title:u,label:f,products:d,id:r9}){`, "jh signature");
rep(
  `c.jsxs("section",{"code-path":"src/sections/ProductCarousel.tsx:87:5",ref:L,className:"py-16 px-6 lg:px-10 bg-white",children:`,
  `c.jsxs("section",{"code-path":"src/sections/ProductCarousel.tsx:87:5",id:r9,ref:L,className:"py-16 px-6 lg:px-10 bg-white scroll-mt-28",children:`,
  "jh section anchor",
);
rep(
  `c.jsx(jh,{"code-path":"src/App.tsx:190:9",title:"DURABLE KIT FOR PUSH, PULL & LEG DAYS",label:"MEN",products:J1})`,
  `c.jsx(jh,{"code-path":"src/App.tsx:190:9",id:"section-men-durable",title:"DURABLE KIT FOR PUSH, PULL & LEG DAYS",label:"MEN",products:J1})`,
  "Durable section id",
);
rep(
  `c.jsx(jh,{"code-path":"src/App.tsx:196:9",title:"NEW IN: MATCHING SETS",label:"COUPLES COLLECTION",products:W1})`,
  `c.jsx(jh,{"code-path":"src/App.tsx:196:9",id:"section-new-in-matching",title:"NEW IN: MATCHING SETS",label:"COUPLES COLLECTION",products:W1})`,
  "Matching section id",
);

// --- Trending section anchor ---
rep(
  `c.jsxs("section",{"code-path":"src/sections/PopularSection.tsx:90:5",ref:h,className:"py-16 px-6 lg:px-10 bg-white",children:`,
  `c.jsxs("section",{"code-path":"src/sections/PopularSection.tsx:90:5",id:"section-trending-now",ref:h,className:"py-16 px-6 lg:px-10 bg-white scroll-mt-28",children:`,
  "Trending section id",
);

// --- Men's hero CTAs ---
rep(
  `"code-path":"src/sections/HeroSection.tsx:62:15",href:"#men",className:"inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold text-sm tracking-wide hover:bg-black hover:text-white transition-all duration-300",children:"Shop Men's"`,
  `"code-path":"src/sections/HeroSection.tsx:62:15",href:"#section-men-durable",className:"inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold text-sm tracking-wide hover:bg-black hover:text-white transition-all duration-300",children:"Men's Shop"`,
  "Hero men CTA",
);
rep(
  `"code-path":"src/sections/HeroSection.tsx:68:15",href:"#women",className:"inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold text-sm tracking-wide hover:bg-white hover:text-black transition-all duration-300",children:"Shop Women's"`,
  `"code-path":"src/sections/HeroSection.tsx:68:15",href:"#section-trending-now",className:"inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold text-sm tracking-wide hover:bg-white hover:text-black transition-all duration-300",children:"Women's Shop"`,
  "Hero women CTA",
);

// --- Women's hero CTAs ---
rep(
  `"code-path":"src/sections/WomensHero.tsx:76:15",href:"#women",className:"inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold text-sm tracking-wide hover:bg-black hover:text-white transition-all duration-300",children:"Shop New In"`,
  `"code-path":"src/sections/WomensHero.tsx:76:15",href:"#section-new-in-matching",className:"inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold text-sm tracking-wide hover:bg-black hover:text-white transition-all duration-300",children:"Shop New In"`,
  "Womens hero new in href",
);
rep(
  `"code-path":"src/sections/WomensHero.tsx:82:15",href:"#women",className:"inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold text-sm tracking-wide hover:bg-white hover:text-black transition-all duration-300",children:"Shop Cool Brown"`,
  `"code-path":"src/sections/WomensHero.tsx:82:15",href:"#section-trending-now",className:"inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold text-sm tracking-wide hover:bg-white hover:text-black transition-all duration-300",children:"Shop Trending Now"`,
  "Womens hero trending CTA",
);

// --- Header logo ---
rep(
  `"code-path":"src/components/Header.tsx:163:13",src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-12 w-auto object-contain"`,
  `"code-path":"src/components/Header.tsx:163:13",src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-16 md:h-[4.5rem] w-auto object-contain bg-transparent"`,
  "Header logo",
);

// --- Wishlist ---
rep(
  `{cartItems:L,cartCount:U,cartTotal:X,updateQuantity:Y,removeFromCart:B}=hc()`,
  `{cartItems:L,cartCount:U,cartTotal:X,updateQuantity:Y,removeFromCart:B,wishlistItems:wl}=hc()`,
  "Header wishlist destructure",
);

rep(
  `c.jsx(Ce,{"code-path":"src/components/Header.tsx:192:13",to:"/wishlist",className:"p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block","aria-label":"Wishlist",children:c.jsx(Ul,{"code-path":"src/components/Header.tsx:193:15",className:"w-5 h-5"})})`,
  `c.jsxs(Ce,{"code-path":"src/components/Header.tsx:192:13",to:"/wishlist",className:"p-2 hover:bg-gray-100 rounded-full transition-colors relative hidden sm:block","aria-label":"Wishlist",children:[c.jsx(Ul,{"code-path":"src/components/Header.tsx:193:15",className:"w-5 h-5"}),wl.length>0&&c.jsx("span",{"code-path":"src/components/Header.tsx:193:40",className:"absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-black text-white text-[10px] font-bold",children:wl.length})]})`,
  "Wishlist badge",
);

rep(`o=V1.filter(h=>u.includes(h.id))`, `o=[...J1,...W1].filter(h=>u.includes(h.id))`, "Wishlist items from catalog");

// --- Payment row ---
rep(
  `q1=[{name:"Visa",svg:"visa"},{name:"Mastercard",svg:"mastercard"},{name:"Amex",svg:"amex"},{name:"PayPal",svg:"paypal"},{name:"Apple Pay",svg:"applepay"},{name:"Google Pay",svg:"googlepay"}]`,
  `q1=[{name:"Visa",src:"/images/pay-visa.png"},{name:"Mastercard",src:"/images/pay-mastercard.png"},{name:"Amex",src:"/images/pay-amex.png"},{name:"PayPal",src:"/images/pay-paypal.png"},{name:"Apple Pay",src:"/images/pay-apple.png"}]`,
  "Payment metadata",
);

rep(
  `q1.map(o=>c.jsx("div",{"code-path":"src/components/Footer.tsx:198:17",className:"w-12 h-8 bg-white rounded flex items-center justify-center",children:c.jsx("span",{"code-path":"src/components/Footer.tsx:202:19",className:"text-xs font-bold text-gray-800",children:o.name})},o.name))`,
  `q1.map(o=>c.jsx("div",{"code-path":"src/components/Footer.tsx:198:17",className:"h-8 flex items-center",children:c.jsx("img",{"code-path":"src/components/Footer.tsx:198:40",src:o.src,alt:o.name,className:"h-8 w-auto max-w-[52px] object-contain"})},o.name))`,
  "Payment icons",
);

rep(
  `}),c.jsx("p",{"code-path":"src/components/Footer.tsx:208:13",className:"text-sm text-gray-400 text-center",children:"© 2026 Fitwinz | Founded by AHAJI Zakariae | All Rights Reserved | It's Time to Dress Healthy"}),c.jsx("div",{"code-path":"src/components/Footer.tsx:212:13",className:"flex justify-center",children:c.jsx("img",{"code-path":"src/components/Footer.tsx:212:38",src:"/images/payment-methods.png",alt:"Payment methods",className:"w-[280px] h-auto object-contain"})}),c.jsxs("div",{"code-path":"src/components/Footer.tsx:213:13"`,
  `}),c.jsxs("div",{"code-path":"src/components/Footer.tsx:208:13",className:"text-sm text-gray-400 text-center space-y-1",children:[c.jsx("p",{className:"",children:"\u00a9 2026 Fitwinz | Founded by AHAJI Zakariae"}),c.jsx("p",{children:"| All Rights Reserved | Time to Dress Healthy"})]}),c.jsxs("div",{"code-path":"src/components/Footer.tsx:213:13"`,
  "Copyright + remove payment-methods strip",
);

// --- PopularSection (TRENDING NOW) ---
rep(
  `className:"w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"`,
  `className:"w-full h-full object-cover transition-all duration-300 ease-out group-hover:scale-105"`,
  "Trending image hover",
);
rep(
  `className:"absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"`,
  `style:{background:"linear-gradient(to top, rgba(0,0,0,0.6), transparent)"},className:"absolute inset-0 z-[1] pointer-events-none"`,
  "Trending overlay",
);
rep(
  `className:"absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-300 group-hover:-translate-y-2"`,
  `className:"absolute bottom-0 left-0 right-0 p-6 z-[2] transform transition-all duration-300 ease-out group-hover:-translate-y-[5px]"`,
  "Trending text motion",
);
rep(
  `className:"text-sm text-white/80 line-clamp-2",children:x.description})]})]},x.id))`,
  `className:"text-sm text-white/80 line-clamp-2",children:x.description}),c.jsx("span",{className:"mt-3 inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-white border border-white/70 rounded-full px-4 py-2",children:["Shop Now","\u2192"]})]})]},x.id))`,
  "Shop Now CTA",
);

// --- Replace giant Y1 social array ---
const y1Start = s.indexOf('Y1=[{name:"Instagram"');
const y1End = s.indexOf(";function X1(");
if (y1Start < 0 || y1End < 0 || y1End <= y1Start) throw new Error("Y1 bounds not found");
const FY3 = `Y1=[{name:"Facebook",href:"https://www.facebook.com/profile.php?id=61551073806108&locale=fr_FR",icon:"M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h4.047V9.43c0-4.007 2.792-6.195 6.533-6.195 1.78 0 3.52.317 3.52.317v3.88h-1.985c-1.96 0-2.57 1.218-2.57 2.467v2.96h4.364l-.698 3.47h-3.666V24c5.737-.9 10.125-5.864 10.125-11.854z"},{name:"Instagram",href:"https://www.instagram.com/fitwinz_store/?hl=fr",icon:"M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"},{name:"X",href:"https://x.com/",icon:"M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"},{name:"TikTok",href:"https://www.tiktok.com/@streamerspotlight03",icon:"M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"},{name:"YouTube",href:"https://www.youtube.com/",icon:"M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"}]`;
s = s.slice(0, y1Start) + FY3 + s.slice(y1End);

rep(
  `children:Y1.map(o=>c.jsx("a",{"code-path":"src/components/Footer.tsx:177:13",href:"#",className:"w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors","aria-label":o.name,children:c.jsx("svg",{"code-path":"src/components/Footer.tsx:183:15",className:"w-5 h-5 fill-current",viewBox:"0 0 24 24",children:c.jsx("path",{"code-path":"src/components/Footer.tsx:184:17",d:o.icon})})},o.name))`,
  `children:Y1.map(o=>c.jsx("a",{"code-path":"src/components/Footer.tsx:177:13",href:o.href,target:"_blank",rel:"noreferrer",className:"w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors","aria-label":o.name,children:c.jsx("svg",{"code-path":"src/components/Footer.tsx:183:15",className:"w-5 h-5 fill-current",viewBox:"0 0 24 24",children:c.jsx("path",{"code-path":"src/components/Footer.tsx:184:17",d:o.icon})})},o.name))`,
  "Social href + target",
);

// --- Philosophy section ---
const phil = `function P9(){return c.jsxs("section",{id:"philosophy",className:"scroll-mt-28 bg-gradient-to-b from-zinc-50 via-white to-white py-20 px-6 lg:px-10",children:[c.jsx("div",{className:"max-w-5xl mx-auto text-center mb-12",children:c.jsx("img",{src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-24 md:h-32 w-auto mx-auto object-contain"})}),c.jsxs("div",{className:"max-w-3xl mx-auto",children:[c.jsx("h2",{className:"text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-10",children:"Our Philosophy"}),c.jsxs("div",{className:"space-y-6 text-gray-700 leading-relaxed text-base md:text-lg",children:[c.jsx("p",{children:"Fitwinz is a Moroccan brand founded with a clear vision: to create sportswear that combines performance, comfort, and a healthier approach to clothing."}),c.jsx("p",{children:"We design our products using natural materials such as wool, linen, and organic cotton, focusing on comfort, breathability, and durability. Our approach avoids synthetic fabrics; we aim to use materials that feel better on the skin and align with a healthier lifestyle."}),c.jsx("p",{children:"Founded by twins, Fitwinz reflects a commitment to quality, creating sportswear that connects movement, well-being, and nature."}),c.jsx("p",{className:"text-lg font-medium text-gray-900",children:"Fitwinz is more than sportswear \u2014 it\u2019s a way to train, move, and live better."})]})]})]})}`;

const dollar1 = "function $1(){";
const ins = s.indexOf(dollar1);
if (ins < 0) throw new Error("$1 not found");
s = s.slice(0, ins) + phil + s.slice(ins);

rep(
  `c.jsx(k1,{"code-path":"src/App.tsx:203:9"})]})`,
  `c.jsx(k1,{"code-path":"src/App.tsx:203:9"}),c.jsx(P9,{})]})`,
  "Mount philosophy section",
);

fs.writeFileSync(bundlePath, s);
console.log("OK", bundlePath);
