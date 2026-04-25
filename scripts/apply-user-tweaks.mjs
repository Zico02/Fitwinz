import fs from "fs";

const bundlePath = new URL("../dist/assets/index-Csxc0UUK.js", import.meta.url);
let s = fs.readFileSync(bundlePath, "utf8");

function rep(from, to, label) {
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`${label}: expected 1 match, got ${n}`);
  s = s.replace(from, to);
}

// 1 Hero: remove comma from second line
rep(
  `children:"DRESS HEALTHY,"`,
  `children:"DRESS HEALTHY"`,
  "hero comma",
);

// 2 Login / signup logos slightly larger than before
rep(
  `className:"h-16 md:h-[4.5rem] w-auto mx-auto object-contain bg-transparent mb-4"}),c.jsx("h1",{"code-path":"src/pages/LoginPage.tsx:37:13"`,
  `className:"h-20 md:h-28 w-auto mx-auto object-contain bg-transparent mb-4"}),c.jsx("h1",{"code-path":"src/pages/LoginPage.tsx:37:13"`,
  "login logo",
);
rep(
  `className:"h-16 md:h-[4.5rem] w-auto mx-auto object-contain bg-transparent mb-4"}),c.jsx("h1",{"code-path":"src/pages/SignupPage.tsx:50:13"`,
  `className:"h-20 md:h-28 w-auto mx-auto object-contain bg-transparent mb-4"}),c.jsx("h1",{"code-path":"src/pages/SignupPage.tsx:50:13"`,
  "signup logo",
);

// 3 Wishlist + checkout: match header transparent logo sizing
rep(
  `"code-path":"src/pages/WishlistPage.tsx:59:11",src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-10 w-auto"`,
  `"code-path":"src/pages/WishlistPage.tsx:59:11",src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-16 md:h-[4.5rem] w-auto object-contain bg-transparent"`,
  "wishlist logo",
);
rep(
  `"code-path":"src/pages/CheckoutPage.tsx:19:13",src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-10 w-auto"`,
  `"code-path":"src/pages/CheckoutPage.tsx:19:13",src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-16 md:h-[4.5rem] w-auto object-contain bg-transparent"`,
  "checkout empty logo",
);
rep(
  `"code-path":"src/pages/CheckoutPage.tsx:39:11",src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-10 w-auto"`,
  `"code-path":"src/pages/CheckoutPage.tsx:39:11",src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-16 md:h-[4.5rem] w-auto object-contain bg-transparent"`,
  "checkout filled logo",
);

// 4 Terms page: Gymshark-style centered logo + title; body width
rep(
  `c.jsx("header",{className:"sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100",children:c.jsxs("div",{className:"max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4",children:[c.jsx(Ce,{to:"/",className:"text-sm font-medium text-gray-700 hover:text-black",children:"← Back to shop"}),c.jsx(Ce,{to:"/",className:"shrink-0",children:c.jsx("img",{src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-10 w-auto object-contain"})})]})}),c.jsxs("main",{className:"flex-1 max-w-3xl mx-auto px-6 py-12 lg:py-16 w-full",children:[c.jsx("h1",{className:"text-center text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-10",children:"TERMS \\u0026 CONDITIONS"}),c.jsx("div",{className:"text-gray-800 leading-relaxed",dangerouslySetInnerHTML`,
  `c.jsx("header",{className:"sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100",children:c.jsx("div",{className:"max-w-5xl mx-auto px-6 py-4",children:c.jsx(Ce,{to:"/",className:"text-sm font-medium text-gray-700 hover:text-black",children:"← Back to shop"})})}),c.jsxs("main",{className:"flex-1 w-full px-6 py-10 lg:py-14",children:[c.jsxs("div",{className:"max-w-3xl mx-auto flex flex-col items-center text-center gap-5 mb-12",children:[c.jsx(Ce,{to:"/",className:"shrink-0",children:c.jsx("img",{src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-20 md:h-28 w-auto object-contain bg-transparent"})}),c.jsx("h1",{className:"text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900",children:"TERMS \\u0026 CONDITIONS"})]}),c.jsx("div",{className:"text-gray-800 leading-relaxed max-w-3xl mx-auto",dangerouslySetInnerHTML`,
  "terms header layout",
);

// 5 Guest entry on login + signup
rep(
  `className:"mt-6 text-center",children:c.jsxs("p",{"code-path":"src/pages/LoginPage.tsx:89:13",className:"text-sm text-gray-600",children:["Don't have an account?"," ",c.jsx(Ce,{"code-path":"src/pages/LoginPage.tsx:91:15",to:"/signup",className:"text-black font-semibold underline hover:no-underline",children:"Sign up"})]})})`,
  `className:"mt-6 text-center space-y-3",children:c.jsxs(b.Fragment,{children:[c.jsxs("p",{"code-path":"src/pages/LoginPage.tsx:89:13",className:"text-sm text-gray-600",children:["Don't have an account?"," ",c.jsx(Ce,{"code-path":"src/pages/LoginPage.tsx:91:15",to:"/signup",className:"text-black font-semibold underline hover:no-underline",children:"Sign up"})]}),c.jsx(Ce,{to:"/",className:"block text-sm text-gray-600 underline hover:text-black",children:"Use as a guest"})]})})`,
  "login guest",
);
rep(
  `className:"mt-6 text-center",children:c.jsxs("p",{"code-path":"src/pages/SignupPage.tsx:147:13",className:"text-sm text-gray-600",children:["Already have an account?"," ",c.jsx(Ce,{"code-path":"src/pages/SignupPage.tsx:149:15",to:"/login",className:"text-black font-semibold underline hover:no-underline",children:"Log in"})]})})`,
  `className:"mt-6 text-center space-y-3",children:c.jsxs(b.Fragment,{children:[c.jsxs("p",{"code-path":"src/pages/SignupPage.tsx:147:13",className:"text-sm text-gray-600",children:["Already have an account?"," ",c.jsx(Ce,{"code-path":"src/pages/SignupPage.tsx:149:15",to:"/login",className:"text-black font-semibold underline hover:no-underline",children:"Log in"})]}),c.jsx(Ce,{to:"/",className:"block text-sm text-gray-600 underline hover:text-black",children:"Use as a guest"})]})})`,
  "signup guest",
);

// 6 Footer copyright lines (exact pipe layout)
rep(
  `c.jsx("p",{className:"",children:"© 2026 Fitwinz | Founded by AHAJI Zakariae"}),c.jsx("p",{children:"| All Rights Reserved | Time to Dress Healthy"})`,
  `c.jsx("p",{children:"© 2026 Fitwinz | Founded by AHAJI Zakariae |"}),c.jsx("p",{children:"| All Rights Reserved | Time to Dress Healthy |"})`,
  "footer copyright",
);

// 7 Shop-by-category anchors
rep(
  `const B1=[{id:1,name:"SHOP WOMEN",image:"/images/shop-women1.jpg"},{id:2,name:"SHOP MEN",image:"/images/boss1.jpg"},{id:3,name:"SHOP ACCESSORIES",image:"/images/shop-accessories.jpg"}];`,
  `const B1=[{id:1,name:"SHOP WOMEN",image:"/images/shop-women1.jpg",href:"#section-trending-now"},{id:2,name:"SHOP MEN",image:"/images/boss1.jpg",href:"#section-men-durable"},{id:3,name:"SHOP ACCESSORIES",image:"/images/shop-accessories.jpg",href:"#accessories"}];`,
  "B1 hrefs",
);
rep(
  `"code-path":"src/sections/ShopByCategory.tsx:58:11",href:"#"`,
  `"code-path":"src/sections/ShopByCategory.tsx:58:11",href:o.href`,
  "shop category href",
);

// 8 Split men's carousel vs accessories anchor section
rep(
  `c.jsx(jh,{"code-path":"src/App.tsx:190:9",id:"section-men-durable",title:"DURABLE KIT FOR PUSH, PULL & LEG DAYS",label:"MEN",products:J1})`,
  `c.jsx(jh,{"code-path":"src/App.tsx:190:9",id:"section-men-durable",title:"DURABLE KIT FOR PUSH, PULL & LEG DAYS",label:"MEN",products:J1.slice(0,4)}),c.jsx(jh,{"code-path":"src/App.tsx:190:9b",id:"accessories",title:"STRAPS, SHAKER & SOCKS",label:"ACCESSORIES",products:J1.slice(4)})`,
  "split men vs accessories jh",
);

// 9 Morocco in delivery country list
rep(
  `c.jsx("option",{"code-path":"src/pages/CheckoutPage.tsx:95:19",children:"Mexico"})]})`,
  `c.jsx("option",{"code-path":"src/pages/CheckoutPage.tsx:95:19",children:"Mexico"}),c.jsx("option",{"code-path":"src/pages/CheckoutPage.tsx:96:19",children:"Morocco"})]})`,
  "morocco option",
);

// 10 Philosophy section layout (body kept in scripts/p9-function.txt; export via scripts/export-p9.mjs)
const p9Start = s.indexOf("function P9(){");
const p9EndMarker = "function $1(){const[u,f]=b.useState(0)";
const p9End = s.indexOf(p9EndMarker, p9Start);
if (p9Start < 0 || p9End < 0) throw new Error("P9 bounds");
const newP9 = fs.readFileSync(new URL("./p9-function.txt", import.meta.url), "utf8");
s = s.slice(0, p9Start) + newP9 + s.slice(p9End);

fs.writeFileSync(bundlePath, s);
console.log("apply-user-tweaks OK");
