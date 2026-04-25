import fs from "fs";

const bundlePath = new URL("../dist/assets/index-Csxc0UUK.js", import.meta.url);
let s = fs.readFileSync(bundlePath, "utf8");

function rep(from, to, label) {
  if (!s.includes(from)) throw new Error(`Missing for ${label}`);
  s = s.replace(from, to);
}

// --- 1) Wishlist badge matches cart (fixed circle w-5 h-5) ---
rep(
  `className:"absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-black text-white text-[10px] font-bold",children:wl.length`,
  `className:"absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-semibold",children:wl.length`,
  "wishlist badge",
);

// --- 2) Wishlist page resolves trending IDs ---
rep(
  `o=[...J1,...W1].filter(h=>u.includes(h.id))`,
  `o=[...J1,...W1,...Tk1].filter(h=>u.includes(h.id))`,
  "wishlist merge Tk1",
);

// --- 3) Header search: memoized keyword results ---
rep(
  `[m,O]=b.useState(""),A=Wu(),{cartItems:L,cartCount:U,cartTotal:X,updateQuantity:Y,removeFromCart:B,wishlistItems:wl}=hc(),V=u>50;`,
  `[m,O]=b.useState(""),A=Wu(),{cartItems:L,cartCount:U,cartTotal:X,updateQuantity:Y,removeFromCart:B,wishlistItems:wl}=hc(),Qw1=b.useMemo(()=>{const Fw=m.trim().toLowerCase();if(!Fw)return[];const all=[...J1,...W1,...Tk1];return all.filter(Ea=>[Ea.name,Ea.fit,Ea.color,Ea.title].filter(Boolean).join(" ").toLowerCase().includes(Fw))},[m]),V=u>50;`,
  "header search memo",
);

rep(
  `c.jsx("input",{"code-path":"src/components/Header.tsx:221:17",type:"text",placeholder:"What are you looking for?",className:"w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black",autoFocus:!0})`,
  `c.jsx("input",{"code-path":"src/components/Header.tsx:221:17",type:"text",placeholder:"What are you looking for?",value:m,onChange:D=>O(D.target.value),className:"w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black",autoFocus:!0})`,
  "header search input controlled",
);

rep(
  `{"code-path":"src/components/Header.tsx:240:17",className:"px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors",children:D},D))})]})]}),T&&`,
  `{"code-path":"src/components/Header.tsx:240:17",className:"px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors",children:D},D))}),m.trim()&&c.jsxs("div",{className:"mt-8",children:[c.jsx("h3",{className:"text-sm font-semibold text-gray-900 mb-3",children:"RESULTS"}),Qw1.length===0?c.jsx("p",{className:"text-sm text-gray-500",children:"No matches for your search."}):c.jsx("ul",{className:"space-y-2 max-h-[50vh] overflow-y-auto",children:Qw1.map(D=>c.jsx("li",{key:D.id,children:c.jsxs(Ce,{to:"/",onClick:()=>x(!1),className:"flex gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50",children:[c.jsx("img",{src:D.image,alt:D.name,className:"w-14 h-14 object-cover rounded-md bg-gray-100"}),c.jsxs("div",{className:"min-w-0",children:[c.jsx("p",{className:"text-sm font-semibold text-gray-900 truncate",children:D.name}),c.jsx("p",{className:"text-xs text-gray-500 truncate",children:[D.fit,D.color].filter(Boolean).join(" • ")})]})]})})})]})]})]}),T&&`,
  "header search results list",
);

// --- 4) Footer Terms link ---
rep(
  `c.jsx("a",{"code-path":"src/components/Footer.tsx:214:15",href:"#",className:"hover:text-white transition-colors",children:"Terms and Conditions"})`,
  `c.jsx(Ce,{"code-path":"src/components/Footer.tsx:214:15",to:"/terms",className:"hover:text-white transition-colors",children:"Terms and Conditions"})`,
  "footer terms link",
);

// --- 5) Hero copy (4 lines) ---
rep(
  `children:"TIME TO          DRESS HEALTHY "})`,
  `children:c.jsxs(b.Fragment,{children:[c.jsx("span",{className:"block",children:"TIME TO"}),c.jsx("span",{className:"block",children:"DRESS HEALTHY,"})]})})`,
  "hero h1 lines",
);

rep(
  `children:"Sportswear Designed for Performance and a Healthier Lifestyle."})`,
  `children:c.jsxs(b.Fragment,{children:[c.jsx("span",{className:"block",children:"Sportswear Designed for Performance"}),c.jsx("span",{className:"block",children:"and a Healthier Lifestyle."})]})})`,
  "hero subtitle lines",
);

// --- 6) Login: logo above title, no top header bar ---
rep(
  `return c.jsxs("div",{"code-path":"src/pages/LoginPage.tsx:21:5",className:"min-h-screen bg-white flex flex-col",children:[c.jsx("header",{"code-path":"src/pages/LoginPage.tsx:23:7",className:"h-16 flex items-center justify-center border-b border-gray-100",children:c.jsx(Ce,{"code-path":"src/pages/LoginPage.tsx:24:9",to:"/",children:c.jsx("img",{"code-path":"src/pages/LoginPage.tsx:25:11",src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-10 w-auto"})})}),c.jsx("div",{"code-path":"src/pages/LoginPage.tsx:34:7",className:"flex-1 flex items-center justify-center px-4 py-12",children:c.jsxs("div",{"code-path":"src/pages/LoginPage.tsx:35:9",className:"w-full max-w-md",children:[c.jsxs("div",{"code-path":"src/pages/LoginPage.tsx:36:11",className:"text-center mb-8",children:[c.jsx("h1",{"code-path":"src/pages/LoginPage.tsx:37:13",className:"text-2xl font-bold text-gray-900 mb-2",children:"FITWINZ LOGIN"})`,
  `return c.jsxs("div",{"code-path":"src/pages/LoginPage.tsx:21:5",className:"min-h-screen bg-white flex flex-col",children:[c.jsx("div",{"code-path":"src/pages/LoginPage.tsx:34:7",className:"flex-1 flex items-center justify-center px-4 py-12",children:c.jsxs("div",{"code-path":"src/pages/LoginPage.tsx:35:9",className:"w-full max-w-md",children:[c.jsxs("div",{"code-path":"src/pages/LoginPage.tsx:36:11",className:"text-center mb-8",children:[c.jsx("img",{src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-16 md:h-[4.5rem] w-auto mx-auto object-contain bg-transparent mb-4"}),c.jsx("h1",{"code-path":"src/pages/LoginPage.tsx:37:13",className:"text-2xl font-bold text-gray-900 mb-2",children:"FITWINZ LOGIN"})`,
  "login layout",
);

// --- 7) Signup: same logo treatment ---
rep(
  `return c.jsxs("div",{"code-path":"src/pages/SignupPage.tsx:34:5",className:"min-h-screen bg-white flex flex-col",children:[c.jsx("header",{"code-path":"src/pages/SignupPage.tsx:36:7",className:"h-16 flex items-center justify-center border-b border-gray-100",children:c.jsx(Ce,{"code-path":"src/pages/SignupPage.tsx:37:9",to:"/",children:c.jsx("img",{"code-path":"src/pages/SignupPage.tsx:38:11",src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-10 w-auto"})})}),c.jsx("div",{"code-path":"src/pages/SignupPage.tsx:47:7",className:"flex-1 flex items-center justify-center px-4 py-12",children:c.jsxs("div",{"code-path":"src/pages/SignupPage.tsx:48:9",className:"w-full max-w-md",children:[c.jsxs("div",{"code-path":"src/pages/SignupPage.tsx:49:11",className:"text-center mb-8",children:[c.jsx("h1",{"code-path":"src/pages/SignupPage.tsx:50:13",className:"text-2xl font-bold text-gray-900 mb-2",children:"FITWINZ SIGNUP"})`,
  `return c.jsxs("div",{"code-path":"src/pages/SignupPage.tsx:34:5",className:"min-h-screen bg-white flex flex-col",children:[c.jsx("div",{"code-path":"src/pages/SignupPage.tsx:47:7",className:"flex-1 flex items-center justify-center px-4 py-12",children:c.jsxs("div",{"code-path":"src/pages/SignupPage.tsx:48:9",className:"w-full max-w-md",children:[c.jsxs("div",{"code-path":"src/pages/SignupPage.tsx:49:11",className:"text-center mb-8",children:[c.jsx("img",{src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-16 md:h-[4.5rem] w-auto mx-auto object-contain bg-transparent mb-4"}),c.jsx("h1",{"code-path":"src/pages/SignupPage.tsx:50:13",className:"text-2xl font-bold text-gray-900 mb-2",children:"FITWINZ SIGNUP"})`,
  "signup layout",
);

// --- 8) Terms route ---
rep(
  `c.jsx(Fa,{"code-path":"src/App.tsx:219:11",path:"/checkout",element:c.jsx(K1,{"code-path":"src/App.tsx:219:44"})}),c.jsx(Fa,{"code-path":"src/App.tsx:220:11",path:"*",element:c.jsx(S0,{"code-path":"src/App.tsx:220:36",to:"/"})})`,
  `c.jsx(Fa,{"code-path":"src/App.tsx:219:11",path:"/checkout",element:c.jsx(K1,{"code-path":"src/App.tsx:219:44"})}),c.jsx(Fa,{"code-path":"src/App.tsx:219:12",path:"/terms",element:c.jsx(R9,{})}),c.jsx(Fa,{"code-path":"src/App.tsx:220:11",path:"*",element:c.jsx(S0,{"code-path":"src/App.tsx:220:36",to:"/"})})`,
  "terms route",
);

const termsHtml = `<div class="space-y-4 text-gray-800 leading-relaxed text-sm md:text-base">
<p class="text-lg font-semibold text-gray-900">Fitwinz Terms &amp; Conditions</p>
<p>Welcome to Fitwinz. These terms outline how you purchase and use our products. Please read them carefully before placing an order.</p>
<p>By using our website, you agree to these terms.</p>
<h2 class="text-xs font-bold tracking-widest text-gray-900 uppercase mt-10">1. Who We Are</h2>
<p>Fitwinz is a sportswear brand founded with a vision to create performance-driven clothing using healthier, more natural materials.</p>
<p><strong>Contact us anytime at:</strong><br/>Email: <a class="underline" href="mailto:support@fitwinz.com">support@fitwinz.com</a><br/>Or through our website contact section.</p>
<h2 class="text-xs font-bold tracking-widest text-gray-900 uppercase mt-10">2. Placing an Order</h2>
<p>When you place an order, you are making an offer to purchase a product. After ordering, you will receive a confirmation email. Your order is officially accepted once we dispatch your items. Please double-check your size, items, and delivery address before confirming.</p>
<p>You must be at least 18 years old, or have permission from a parent/guardian.</p>
<h2 class="text-xs font-bold tracking-widest text-gray-900 uppercase mt-10">3. Product Availability &amp; Order Cancellation</h2>
<p>We may cancel your order if a product is out of stock, payment cannot be verified, there is a pricing or listing error, or suspicious or bulk-buy activity is detected. If this happens, you will not be charged.</p>
<h2 class="text-xs font-bold tracking-widest text-gray-900 uppercase mt-10">4. Our Products</h2>
<p>Fitwinz designs performance clothing and gym accessories. We focus on materials such as wool, linen, and organic cotton.</p>
<p><strong>Note:</strong> Product images are for illustration. Colors may vary slightly depending on your device.</p>
<h2 class="text-xs font-bold tracking-widest text-gray-900 uppercase mt-10">5. Delivery</h2>
<p>Delivery times depend on your location and selected shipping method. Delays may happen due to external factors (weather, logistics, etc.). Risk transfers to you once the product is handed to the carrier. If you miss delivery, the courier will provide next steps.</p>
<h2 class="text-xs font-bold tracking-widest text-gray-900 uppercase mt-10">6. Returns &amp; Refunds</h2>
<p>If the product is faulty, you are eligible for a replacement or full refund. If you change your mind, you have 30 days to return items; items must be unused, with tags and original packaging.</p>
<p>Non-returnable items include opened socks (hygiene reasons), shakers &amp; bottles (health safety), and personalized/custom products.</p>
<p>Refunds are processed using your original payment method within 14 days after receiving returned items.</p>
<h2 class="text-xs font-bold tracking-widest text-gray-900 uppercase mt-10">7. Pricing &amp; Payments</h2>
<p>Prices are displayed before checkout. Taxes may apply depending on your location. Accepted payments include Visa, Mastercard, PayPal, and Apple Pay. We may correct pricing errors and cancel affected orders if necessary.</p>
<h2 class="text-xs font-bold tracking-widest text-gray-900 uppercase mt-10">8. Discounts &amp; Offers</h2>
<p>Discount codes are time-limited. Only one code per order. Cannot be used on gift cards or combined offers. Refunds reflect the discounted price paid.</p>
<h2 class="text-xs font-bold tracking-widest text-gray-900 uppercase mt-10">9. Your Rights</h2>
<p>You may cancel your order if we change product details, there is a pricing error, or delivery is significantly delayed.</p>
<h2 class="text-xs font-bold tracking-widest text-gray-900 uppercase mt-10">10. Our Responsibility</h2>
<p>We are responsible for delivering products as described and ensuring reasonable quality. We are not responsible for indirect losses or business-related losses. Nothing in these terms removes your legal rights.</p>
<h2 class="text-xs font-bold tracking-widest text-gray-900 uppercase mt-10">11. Personal Data</h2>
<p>We only use your data according to our Privacy Policy. Your information is handled securely and never sold.</p>
<h2 class="text-xs font-bold tracking-widest text-gray-900 uppercase mt-10">12. General Terms</h2>
<p>These terms may be updated at any time. Continued use of the website means acceptance of updates. If one part of these terms is invalid, the rest still applies.</p>
<h2 class="text-xs font-bold tracking-widest text-gray-900 uppercase mt-10">13. Fitwinz Philosophy</h2>
<p>Fitwinz is built on a simple idea: performance should not come at the cost of comfort or well-being. We create sportswear that feels better on the skin, supports movement naturally, and aligns with a healthier lifestyle.</p>
<p>Fitwinz is more than clothing \u2014 it\u2019s how you train, move, and live.</p>
<h2 class="text-xs font-bold tracking-widest text-gray-900 uppercase mt-10">14. Legal</h2>
<p>These terms are governed by applicable laws in your region.</p>
</div>`;

const r9 = `function R9(){return c.jsxs("div",{className:"min-h-screen bg-white flex flex-col",children:[c.jsx("header",{className:"sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100",children:c.jsxs("div",{className:"max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4",children:[c.jsx(Ce,{to:"/",className:"text-sm font-medium text-gray-700 hover:text-black",children:"\u2190 Back to shop"}),c.jsx(Ce,{to:"/",className:"shrink-0",children:c.jsx("img",{src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-10 w-auto object-contain"})})]})}),c.jsxs("main",{className:"flex-1 max-w-3xl mx-auto px-6 py-12 lg:py-16 w-full",children:[c.jsx("h1",{className:"text-center text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-10",children:"TERMS \\u0026 CONDITIONS"}),c.jsx("div",{className:"text-gray-800 leading-relaxed",dangerouslySetInnerHTML:{__html:${JSON.stringify(termsHtml)}}})]}),c.jsx("footer",{className:"bg-black text-white py-8 px-6 mt-auto",children:c.jsx("div",{className:"max-w-7xl mx-auto text-center",children:c.jsx("p",{className:"text-sm text-gray-400",children:"\u00a9 2026 Fitwinz"})})})]})}`;

const trendSnippet = fs.readFileSync(new URL("./trend-snippet.txt", import.meta.url), "utf8");
const tStart = s.indexOf("const H1=[");
const tEnd = s.indexOf("const D1=[");
if (tStart < 0 || tEnd < 0 || tEnd <= tStart) throw new Error(`trend bounds ${tStart} ${tEnd}`);
s = s.slice(0, tStart) + trendSnippet + s.slice(tEnd);

const newP9 = `function P9(){return c.jsxs("section",{id:"philosophy",className:"scroll-mt-28 bg-gradient-to-b from-zinc-50 via-white to-white py-20 px-6 lg:px-10",children:[c.jsx("h2",{className:"text-4xl md:text-6xl font-extrabold text-gray-900 text-center mb-12 md:mb-16 tracking-tight",children:"Our Philosophy"}),c.jsxs("div",{className:"max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-10 lg:gap-16 items-start",children:[c.jsx("div",{className:"flex justify-center lg:justify-start lg:sticky lg:top-28",children:c.jsx("img",{src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-44 md:h-56 lg:h-72 w-auto object-contain bg-transparent"})}),c.jsxs("div",{className:"space-y-6 text-gray-700 leading-relaxed text-base md:text-lg",children:[c.jsx("p",{children:"Fitwinz is a Moroccan brand founded with a clear vision: to create sportswear that combines performance, comfort, and a healthier approach to clothing."}),c.jsx("p",{children:"We design our products using natural materials such as wool, linen, and organic cotton, focusing on comfort, breathability, and durability. Our approach avoids synthetic fabrics; we aim to use materials that feel better on the skin and align with a healthier lifestyle."}),c.jsx("p",{children:"Founded by twins, Fitwinz reflects a commitment to quality, creating sportswear that connects movement, well-being, and nature."})]})]}),c.jsx("p",{className:"mt-14 md:mt-20 text-center text-lg md:text-2xl font-semibold text-gray-900 max-w-3xl mx-auto leading-snug",children:"Fitwinz is more than sportswear \\u2014 it\\u2019s a way to train, move, and live better."})]})}`;
const p9Start = s.indexOf("function P9(){");
const p9End = s.indexOf("function $1(){");
if (p9Start < 0 || p9End < 0 || p9End <= p9Start) throw new Error(`P9 bounds ${p9Start} ${p9End}`);
s = s.slice(0, p9Start) + newP9 + s.slice(p9End);

const f1 = s.indexOf("function F1(){");
if (f1 < 0) throw new Error("F1 not found");
s = s.slice(0, f1) + r9 + s.slice(f1);

fs.writeFileSync(bundlePath, s);
console.log("apply-final OK", bundlePath);
