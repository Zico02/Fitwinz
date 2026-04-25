import fs from "fs";

const bundlePath = new URL("../dist/assets/index-Csxc0UUK.js", import.meta.url);
let s = fs.readFileSync(bundlePath, "utf8");

function rep(from, to, label) {
  if (!s.includes(from)) throw new Error(`Missing for ${label}`);
  s = s.replace(from, to);
}

rep(
  `className:"absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-black text-white text-[10px] font-bold",children:wl.length`,
  `className:"absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-semibold",children:wl.length`,
  "wishlist badge",
);

rep(
  `o=[...J1,...W1].filter(h=>u.includes(h.id))`,
  `o=[...J1,...W1,...Tk1].filter(h=>u.includes(h.id))`,
  "wishlist Tk1 merge",
);

rep(
  `[m,O]=b.useState(""),A=Wu(),{cartItems:L,cartCount:U,cartTotal:X,updateQuantity:Y,removeFromCart:B,wishlistItems:wl}=hc(),V=u>50;`,
  `[m,O]=b.useState(""),A=Wu(),{cartItems:L,cartCount:U,cartTotal:X,updateQuantity:Y,removeFromCart:B,wishlistItems:wl}=hc(),Qw1=b.useMemo(()=>{const Fw=m.trim().toLowerCase();if(!Fw)return[];const all=[...J1,...W1,...Tk1];return all.filter(Ea=>[Ea.name,Ea.fit,Ea.color,Ea.title].filter(Boolean).join(" ").toLowerCase().includes(Fw))},[m]),V=u>50;`,
  "search memo",
);

rep(
  `c.jsx("input",{"code-path":"src/components/Header.tsx:221:17",type:"text",placeholder:"What are you looking for?",className:"w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black",autoFocus:!0})`,
  `c.jsx("input",{"code-path":"src/components/Header.tsx:221:17",type:"text",placeholder:"What are you looking for?",value:m,onChange:D=>O(D.target.value),className:"w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black",autoFocus:!0})`,
  "search input",
);

rep(
  `{"code-path":"src/components/Header.tsx:240:17",className:"px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors",children:D},D))})]})]}),T&&`,
  `{"code-path":"src/components/Header.tsx:240:17",className:"px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors",children:D},D))}),m.trim()&&c.jsxs("div",{className:"mt-8",children:[c.jsx("h3",{className:"text-sm font-semibold text-gray-900 mb-3",children:"RESULTS"}),Qw1.length===0?c.jsx("p",{className:"text-sm text-gray-500",children:"No matches for your search."}):c.jsx("ul",{className:"space-y-2 max-h-[50vh] overflow-y-auto",children:Qw1.map(D=>c.jsx(Ce,{key:D.id,to:"/",onClick:()=>x(!1),className:"block rounded-xl border border-gray-100 p-3 hover:bg-gray-50",children:D.name}))})]})]})]}),T&&`,
  "search results",
);

rep(
  `c.jsx("a",{"code-path":"src/components/Footer.tsx:214:15",href:"#",className:"hover:text-white transition-colors",children:"Terms and Conditions"})`,
  `c.jsx(Ce,{"code-path":"src/components/Footer.tsx:214:15",to:"/terms",className:"hover:text-white transition-colors",children:"Terms and Conditions"})`,
  "footer terms",
);

rep(
  `children:"TIME TO          DRESS HEALTHY "})`,
  `children:c.jsxs(b.Fragment,{children:[c.jsx("span",{className:"block",children:"TIME TO"}),c.jsx("span",{className:"block",children:"DRESS HEALTHY"})]})})`,
  "hero h1",
);

rep(
  `children:"Sportswear Designed for Performance and a Healthier Lifestyle."})`,
  `children:c.jsxs(b.Fragment,{children:[c.jsx("span",{className:"block",children:"Sportswear Designed for Performance"}),c.jsx("span",{className:"block",children:"and a Healthier Lifestyle."})]})})`,
  "hero p",
);

rep(
  `return c.jsxs("div",{"code-path":"src/pages/LoginPage.tsx:21:5",className:"min-h-screen bg-white flex flex-col",children:[c.jsx("header",{"code-path":"src/pages/LoginPage.tsx:23:7",className:"h-16 flex items-center justify-center border-b border-gray-100",children:c.jsx(Ce,{"code-path":"src/pages/LoginPage.tsx:24:9",to:"/",children:c.jsx("img",{"code-path":"src/pages/LoginPage.tsx:25:11",src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-10 w-auto"})})}),c.jsx("div",{"code-path":"src/pages/LoginPage.tsx:34:7",className:"flex-1 flex items-center justify-center px-4 py-12",children:c.jsxs("div",{"code-path":"src/pages/LoginPage.tsx:35:9",className:"w-full max-w-md",children:[c.jsxs("div",{"code-path":"src/pages/LoginPage.tsx:36:11",className:"text-center mb-8",children:[c.jsx("h1",{"code-path":"src/pages/LoginPage.tsx:37:13",className:"text-2xl font-bold text-gray-900 mb-2",children:"FITWINZ LOGIN"})`,
  `return c.jsxs("div",{"code-path":"src/pages/LoginPage.tsx:21:5",className:"min-h-screen bg-white flex flex-col",children:[c.jsx("div",{"code-path":"src/pages/LoginPage.tsx:34:7",className:"flex-1 flex items-center justify-center px-4 py-12",children:c.jsxs("div",{"code-path":"src/pages/LoginPage.tsx:35:9",className:"w-full max-w-md",children:[c.jsxs("div",{"code-path":"src/pages/LoginPage.tsx:36:11",className:"text-center mb-8",children:[c.jsx("img",{src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-16 md:h-[4.5rem] w-auto mx-auto object-contain bg-transparent mb-4"}),c.jsx("h1",{"code-path":"src/pages/LoginPage.tsx:37:13",className:"text-2xl font-bold text-gray-900 mb-2",children:"FITWINZ LOGIN"})`,
  "login",
);

rep(
  `return c.jsxs("div",{"code-path":"src/pages/SignupPage.tsx:34:5",className:"min-h-screen bg-white flex flex-col",children:[c.jsx("header",{"code-path":"src/pages/SignupPage.tsx:36:7",className:"h-16 flex items-center justify-center border-b border-gray-100",children:c.jsx(Ce,{"code-path":"src/pages/SignupPage.tsx:37:9",to:"/",children:c.jsx("img",{"code-path":"src/pages/SignupPage.tsx:38:11",src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-10 w-auto"})})}),c.jsx("div",{"code-path":"src/pages/SignupPage.tsx:47:7",className:"flex-1 flex items-center justify-center px-4 py-12",children:c.jsxs("div",{"code-path":"src/pages/SignupPage.tsx:48:9",className:"w-full max-w-md",children:[c.jsxs("div",{"code-path":"src/pages/SignupPage.tsx:49:11",className:"text-center mb-8",children:[c.jsx("h1",{"code-path":"src/pages/SignupPage.tsx:50:13",className:"text-2xl font-bold text-gray-900 mb-2",children:"FITWINZ SIGNUP"})`,
  `return c.jsxs("div",{"code-path":"src/pages/SignupPage.tsx:34:5",className:"min-h-screen bg-white flex flex-col",children:[c.jsx("div",{"code-path":"src/pages/SignupPage.tsx:47:7",className:"flex-1 flex items-center justify-center px-4 py-12",children:c.jsxs("div",{"code-path":"src/pages/SignupPage.tsx:48:9",className:"w-full max-w-md",children:[c.jsxs("div",{"code-path":"src/pages/SignupPage.tsx:49:11",className:"text-center mb-8",children:[c.jsx("img",{src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-16 md:h-[4.5rem] w-auto mx-auto object-contain bg-transparent mb-4"}),c.jsx("h1",{"code-path":"src/pages/SignupPage.tsx:50:13",className:"text-2xl font-bold text-gray-900 mb-2",children:"FITWINZ SIGNUP"})`,
  "signup",
);

rep(
  `c.jsx(Fa,{"code-path":"src/App.tsx:219:11",path:"/checkout",element:c.jsx(K1,{"code-path":"src/App.tsx:219:44"})}),c.jsx(Fa,{"code-path":"src/App.tsx:220:11",path:"*",element:c.jsx(S0,{"code-path":"src/App.tsx:220:36",to:"/"})})`,
  `c.jsx(Fa,{"code-path":"src/App.tsx:219:11",path:"/checkout",element:c.jsx(K1,{"code-path":"src/App.tsx:219:44"})}),c.jsx(Fa,{"code-path":"src/App.tsx:219:12",path:"/terms",element:c.jsx(R9,{})}),c.jsx(Fa,{"code-path":"src/App.tsx:220:11",path:"*",element:c.jsx(S0,{"code-path":"src/App.tsx:220:36",to:"/"})})`,
  "terms route",
);

const termsHtml = fs.readFileSync(new URL("./terms-html.txt", import.meta.url), "utf8");

const r9 = `function R9(){return c.jsxs("div",{className:"min-h-screen bg-white flex flex-col",children:[c.jsx("header",{className:"sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100",children:c.jsxs("div",{className:"max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4",children:[c.jsx(Ce,{to:"/",className:"text-sm font-medium text-gray-700 hover:text-black",children:"\u2190 Back to shop"}),c.jsx(Ce,{to:"/",className:"shrink-0",children:c.jsx("img",{src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-10 w-auto object-contain"})})]})}),c.jsxs("main",{className:"flex-1 max-w-3xl mx-auto px-6 py-12 lg:py-16 w-full",children:[c.jsx("h1",{className:"text-center text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-10",children:"TERMS \\u0026 CONDITIONS"}),c.jsx("div",{className:"text-gray-800 leading-relaxed",dangerouslySetInnerHTML:{__html:${JSON.stringify(termsHtml)}}})]}),c.jsx("footer",{className:"bg-black text-white py-8 px-6 mt-auto",children:c.jsx("div",{className:"max-w-7xl mx-auto text-center",children:c.jsx("p",{className:"text-sm text-gray-400",children:"\u00a9 2026 Fitwinz"})})})]})}`;

const tk = `const Tk1=[{id:801,name:"EVERYDAY SEAMLESS 2.0",title:"EVERYDAY SEAMLESS 2.0",description:"Breathable Performance Fabric Squat-proof, Built for performance.",image:"/images/gymgirl.jpg",fit:"Trending",color:"Performance",price:55,rating:5,isNew:!1,hoverImage:"/images/gymgirl.jpg",sizes:["XS","S","M","L","XL","XXL","3XL"]},{id:802,name:"COSY LUXE",title:"COSY LUXE",description:"Premium Soft Fabric Ultra-soft comfort Built for recovery days.",image:"/images/Fitwinz_green.png",fit:"Trending",color:"Soft",price:55,rating:5,isNew:!1,hoverImage:"/images/Fitwinz_green.png",sizes:["XS","S","M","L","XL","XXL","3XL"]},{id:803,name:"JUST DROPPED",title:" JUST DROPPED",description:"Fresh performance pieces just landed Performance Fabric.",image:"/images/yilo.jpg",fit:"Trending",color:"New",price:55,rating:5,isNew:!0,hoverImage:"/images/yilo.jpg",sizes:["XS","S","M","L","XL","XXL","3XL"]},{id:804,name:"COLD WEATHER TRAINING",title:"COLD WEATHER TRAINING",description:"New Insulated Performance Fabric Stay warm. Stay moving.",image:"/images/pinkii.jpg",fit:"Trending",color:"Insulated",price:65,rating:5,isNew:!1,hoverImage:"/images/pinkii.jpg",sizes:["XS","S","M","L","XL","XXL","3XL"]},{id:805,name:"NEW ARRIVALS",title:"NEW ARRIVALS",description:"Slim-Fit Performance Fabric.",image:"/images/Fitwinz_blue1.png",fit:"Men's Trending",color:"Blue",price:55,rating:5,isNew:!0,hoverImage:"/images/Fitwinz_blue1.png",sizes:["XS","S","M","L","XL","XXL","3XL"]},{id:806,name:"POWER COLLECTION",title:"POWER COLLECTION",description:"Advanced Performance Fabric.",image:"/images/ori.jpg",fit:"Men's Trending",color:"Multi",price:55,rating:5,isNew:!1,hoverImage:"/images/ori.jpg",sizes:["XS","S","M","L","XL","XXL","3XL"]},{id:807,name:"POWER COLLECTION",title:"POWER COLLECTION",description:"Advanced Performance Fabric.",image:"/images/bleu_fiti.jpg",fit:"Men's Trending",color:"Blue",price:55,rating:5,isNew:!1,hoverImage:"/images/bleu_fiti.jpg",sizes:["XS","S","M","L","XL","XXL","3XL"]},{id:808,name:"POWER COLLECTION",title:"POWER COLLECTION",description:"Advanced Performance Fabric.",image:"/images/model2.jpg",fit:"Men's Trending",color:"Black",price:55,rating:5,isNew:!1,hoverImage:"/images/model2.jpg",sizes:["XS","S","M","L","XL","XXL","3XL"]}],H1=Tk1.slice(0,4),M1=Tk1.slice(4);`;

const h1 = s.indexOf("const H1=[");
const fn = s.indexOf("function _1(){");
if (h1 < 0 || fn < 0 || fn <= h1) throw new Error("H1/_1 bounds");
s = s.slice(0, h1) + tk + s.slice(fn);

const newP9 = `function P9(){return c.jsxs("section",{id:"philosophy",className:"scroll-mt-28 bg-gradient-to-b from-zinc-50 via-white to-white py-20 px-6 lg:px-10",children:[c.jsx("h2",{className:"text-4xl md:text-6xl font-extrabold text-gray-900 text-center mb-12 md:mb-16 tracking-tight",children:"Our Philosophy"}),c.jsxs("div",{className:"max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-10 lg:gap-16 items-start",children:[c.jsx("div",{className:"flex justify-center lg:justify-start lg:sticky lg:top-28",children:c.jsx("img",{src:"/images/logo-full-transparent.png",alt:"Fitwinz",className:"h-44 md:h-56 lg:h-72 w-auto object-contain bg-transparent"})}),c.jsxs("div",{className:"space-y-6 text-gray-700 leading-relaxed text-base md:text-lg",children:[c.jsx("p",{children:"Fitwinz is a Moroccan brand founded with a clear vision: to create sportswear that combines performance, comfort, and a healthier approach to clothing."}),c.jsx("p",{children:"We design our products using natural materials such as wool, linen, and organic cotton, focusing on comfort, breathability, and durability. Our approach avoids synthetic fabrics; we aim to use materials that feel better on the skin and align with a healthier lifestyle."}),c.jsx("p",{children:"Founded by twins, Fitwinz reflects a commitment to quality, creating sportswear that connects movement, well-being, and nature."})]})]}),c.jsx("p",{className:"mt-14 md:mt-20 text-center text-lg md:text-2xl font-semibold text-gray-900 max-w-3xl mx-auto leading-snug",children:"Fitwinz is more than sportswear \\u2014 it\\u2019s a way to train, move, and live better."})]})}`;
const p9Start = s.indexOf("function P9(){");
const p9End = s.indexOf("function $1(){");
if (p9Start < 0 || p9End < 0 || p9End <= p9Start) throw new Error("P9 bounds");
s = s.slice(0, p9Start) + newP9 + s.slice(p9End);

const f1 = s.indexOf("function F1(){");
if (f1 < 0) throw new Error("F1");
s = s.slice(0, f1) + r9 + s.slice(f1);

fs.writeFileSync(bundlePath, s);
console.log("patch-safe OK");
