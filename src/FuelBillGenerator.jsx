import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

/**
 * FuelBillGenerator
 * ------------------------------------------------------------------
 * A single-file React + Tailwind fuel bill / petrol pump receipt generator.
 *
 *  - 4 templates (thermal dot-matrix, modern boxed, compact, office GST invoice)
 *  - Live preview that updates as you type
 *  - Auto-calculation: amount <-> volume <-> rate, GST split, amount in words
 *  - Admin settings: add / edit / delete pump brands with uploaded logos
 *  - Save / load last entry (localStorage, safely wrapped)
 *  - Download as PNG or PDF (html2canvas + jsPDF, loaded from CDN on demand)
 *
 * No required props. Default export. Uses only Tailwind core utilities.
 */

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "fuel-bill-generator:last";
const BRANDS_KEY = "fuel-bill-generator:brands";

/** Shell pecten, inlined so Template 7 has a logo out of the box.
 *  Replace it (or any brand's logo) from Admin · Logos. */
const SHELL_LOGO = "data:image/png;base64,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";

/** Built-in brands. `logo` may be a data URL or a remote image URL. */
const BUILTIN_BRANDS = [
  { id: "iocl", name: "Indian Oil", color: "#e4610f", tagline: "Indian Oil Corporation Ltd.", logo: "" },
  { id: "hp", name: "HP Petrol Pump", color: "#e8112d", tagline: "Hindustan Petroleum Corp. Ltd.", logo: "" },
  { id: "bpcl", name: "Bharat Petroleum", color: "#f5a623", tagline: "Bharat Petroleum Corp. Ltd.", logo: "" },
  { id: "reliance", name: "Reliance Petroleum", color: "#0b6ab0", tagline: "Reliance Industries Ltd.", logo: "" },
  {
    id: "shell",
    name: "Shell",
    color: "#DD1D21",
    tagline: "Shell India Markets Pvt. Ltd.",
    logo: SHELL_LOGO,
  },
  { id: "nayara", name: "Nayara Energy", color: "#00a0af", tagline: "Nayara Energy Ltd.", logo: "" },
  { id: "none", name: "No Brand", color: "#374151", tagline: "", logo: "" },
];

const PRODUCTS = [
  "PETROL",
  "DIESEL",
  "CNG",
  "XP95",
  "XP100",
  "XTRAPREMIUM",
  "SPEED",
  "POWER",
];
const VEHICLE_TYPES = ["CAR", "BIKE", "SCOOTER", "TRUCK", "AUTO", "BUS", "OTHER"];
const PAY_MODES = ["CASH", "CARD", "UPI", "PAYTM", "FLEET CARD"];

const PAPERS = [
  { id: "plain", label: "Plain White" },
  { id: "aged", label: "Aged / Thermal" },
  { id: "grid", label: "Faint Grid" },
];

const TEMPLATES = [
  { id: "t1", label: "Template 1 — Dot Matrix" },
  { id: "t2", label: "Template 2 — Modern Boxed" },
  { id: "t3", label: "Template 3 — Compact Slip" },
  { id: "t4", label: "Template 4 — Office GST Invoice" },
  { id: "t5", label: "Template 5 — BPCL Pump Slip (exact)" },
  { id: "t6", label: "Template 6 — IndianOil Pump Slip (exact)" },
  { id: "t7", label: "Template 7 — Shell POS Receipt (combined)" },
];

/** Templates that print on a narrow thermal roll rather than A4. */
const SLIP_TEMPLATES = ["t1", "t3", "t5", "t6", "t7"];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad = (n, len = 2) => String(n).padStart(len, "0");

/* --- Indian numbering: amount in words ---------------------------- */
const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
  "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const twoDigits = (n) =>
  n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? " " + ONES[n % 10] : ""}`;

const inWords = (num) => {
  const n = Math.floor(Math.abs(Number(num) || 0));
  if (n === 0) return "Zero";
  const parts = [];
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = Math.floor((n % 1000) / 100);
  const rest = n % 100;
  if (crore) parts.push(`${twoDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (hundred) parts.push(`${ONES[hundred]} Hundred`);
  if (rest) parts.push(twoDigits(rest));
  return parts.join(" ");
};

const rupeesInWords = (value) => {
  const v = Number(value) || 0;
  const rupees = Math.floor(v);
  const paise = Math.round((v - rupees) * 100);
  let s = `Rupees ${inWords(rupees)}`;
  if (paise) s += ` and ${twoDigits(paise)} Paise`;
  return `${s} Only`;
};

const inr = (v) =>
  (Number(v) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const nowDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const nowTime = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const randomDigits = (len) =>
  Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");

const DEFAULTS = {
  brand: "iocl",
  template: "t1",
  paper: "plain",
  showLogo: true,

  stationName: "SHRI BALAJI FUEL STATION",
  address: "NH-48, Sector 21, Gurugram, Haryana - 122016",
  phone: "0124-2345678",
  cstNo: "CST/0987654321",
  lstNo: "LST/1234567890",
  vatNo: "06AABCU9603R1ZM",

  receiptNo: randomDigits(6),
  fccId: randomDigits(8),
  fipNo: "02",
  nozzleNo: "03",
  attendantId: "1024",

  product: "PETROL",
  rate: "104.75",
  volume: "10.00",
  amount: "1047.50",
  lockField: "amount", // which field is derived: "amount" | "volume"

  vehType: "CAR",
  vehNo: "HR26 DK 8337",
  customerName: "",
  date: nowDate(),
  time: nowTime(),
  mode: "CASH",

  footer: "Thank You! Visit Again. Save Fuel, Save Money.",
  showCustomer: true,
  showVehicle: true,
  showTax: true,

  /* --- Office / GST invoice (Template 4) --- */
  invoiceNo: `FB/${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(2)}/${randomDigits(4)}`,
  gstin: "06AABCU9603R1ZM",
  stateName: "Haryana",
  stateCode: "06",
  hsnCode: "27101290",

  billToName: "Acme Technologies Pvt. Ltd.",
  billToAddress: "8th Floor, Cyber Hub, DLF Phase 2, Gurugram, Haryana - 122002",
  billToGstin: "06AAACA1234F1Z5",
  employeeName: "",
  employeeId: "",
  department: "",
  purpose: "Official travel — client visit",

  gstRate: "0",           // fuel is outside GST; kept configurable for CNG / services
  showGstSplit: false,     // CGST/SGST breakdown
  authorisedBy: "For Shri Balaji Fuel Station",
  declaration:
    "Certified that the particulars given above are true and correct and the fuel was purchased for official purposes.",

  /* --- Pump-slip specifics (Template 5) --- */
  density: "753.7",
  presetType: "Amount",
  atot: "00158074033.03",
  vtot: "00001536419.89",
  mobileNo: "",
  fccDate: "",
  fccTime: "",
  welcomeText: "Welcomes You",

  /* --- Shell POS receipt (Template 7) --- */
  siteId: "12170818",
  dealerName: "AVIGHNA ENTERPRISES",
  fssai: "11222333000087",
  posNo: "612 612",
  seqNo: "2475",
  pumpNo: "08",
  grade: "V-PowerUNL",
  duplicateReceipt: true,

  showOffer: true,
  offerText: "Get ₹10/- off on fueling petr",
  offerAmount: "-10.00",

  showLoyalty: true,
  loyaltyProgram: "Shell Go+",
  loyaltyId: "000000****4878",

  shellFooter:
    "Thank you for visiting Shell\nTell us about your visit at\nwww.shell.com/india/tellshell",
};

/* ------------------------------------------------------------------ */
/* Safe localStorage helpers                                           */
/* ------------------------------------------------------------------ */

const storage = {
  save(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  },
  load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },
  saveBrands(list) {
    try {
      window.localStorage.setItem(BRANDS_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      return false;
    }
  },
  loadBrands() {
    try {
      const raw = window.localStorage.getItem(BRANDS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) && parsed.length ? parsed : null;
    } catch (e) {
      return null;
    }
  },
};

/** Read a File as a data URL, downscaled so localStorage stays small. */
const fileToDataUrl = (file, maxSize = 240) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(reader.result); // e.g. SVG — keep as-is
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

/* ------------------------------------------------------------------ */
/* Small form primitives                                               */
/* ------------------------------------------------------------------ */

const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-medium tracking-wide text-slate-600 uppercase">
      {label}
    </span>
    {children}
    {hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
  </label>
);

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900";

const Text = ({ value, onChange, ...rest }) => (
  <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
);

const Area = ({ value, onChange, rows = 3, ...rest }) => (
  <textarea
    className={`${inputCls} resize-y font-mono text-xs`}
    rows={rows}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    {...rest}
  />
);

const Select = ({ value, onChange, options }) => (
  <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
    {options.map((o) => (
      <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
        {typeof o === "string" ? o : o.label}
      </option>
    ))}
  </select>
);

const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 transition hover:border-slate-400"
  >
    <span>{label}</span>
    <span
      className={`relative h-5 w-9 shrink-0 rounded-full transition ${
        checked ? "bg-emerald-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
          checked ? "left-4" : "left-0.5"
        }`}
      />
    </span>
  </button>
);

const Section = ({ title, children, cols = 2 }) => (
  <div className="mb-6">
    <h3 className="mb-3 border-b border-slate-200 pb-2 text-sm font-semibold text-slate-900">
      {title}
    </h3>
    <div className={`grid gap-3 ${cols === 2 ? "sm:grid-cols-2" : "grid-cols-1"}`}>{children}</div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Receipt templates                                                   */
/* ------------------------------------------------------------------ */

const paperStyle = (paper) => {
  if (paper === "aged")
    return {
      background:
        "linear-gradient(180deg, #fdfaf1 0%, #f7f1e3 45%, #f3ead6 100%)",
      boxShadow: "inset 0 0 40px rgba(150,120,60,0.12)",
    };
  if (paper === "grid")
    return {
      backgroundColor: "#ffffff",
      backgroundImage:
        "linear-gradient(rgba(0,0,0,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.045) 1px, transparent 1px)",
      backgroundSize: "14px 14px",
    };
  return { backgroundColor: "#ffffff" };
};

const Row = ({ k, v, bold }) => (
  <div className="flex items-baseline justify-between gap-2 leading-relaxed">
    <span className="shrink-0">{k}</span>
    <span className="mx-1 flex-1 translate-y-[-3px] border-b border-dotted border-current opacity-30" />
    <span className={bold ? "font-bold" : ""}>{v}</span>
  </div>
);

const BrandMark = ({ brand, size = 40, square = false }) => {
  if (!brand || brand.id === "none") return null;
  if (brand.logo) {
    return (
      <img
        src={brand.logo}
        alt={brand.name}
        crossOrigin="anonymous"
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    );
  }
  const initials = brand.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={`flex items-center justify-center font-bold text-white ${
        square ? "rounded-lg" : "rounded-full"
      }`}
      style={{ width: size, height: size, backgroundColor: brand.color, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
};

/* --- Template 1: classic dot-matrix thermal slip --- */
const TemplateOne = ({ d, brand }) => {
  return (
    <div
      className="mx-auto w-[320px] px-5 py-6 font-mono text-[11px] leading-snug text-slate-900"
      style={paperStyle(d.paper)}
    >
      <div className="text-center">
        {d.showLogo && (
          <div className="mb-2 flex justify-center">
            <BrandMark brand={brand} size={44} />
          </div>
        )}
        <div className="text-[13px] font-bold tracking-wide">{d.stationName}</div>
        {brand.tagline && <div className="text-[10px] opacity-70">{brand.tagline}</div>}
        <div className="mt-1 text-[10px] leading-tight opacity-80">{d.address}</div>
        {d.phone && <div className="text-[10px] opacity-80">TEL NO: {d.phone}</div>}
      </div>

      <div className="my-3 border-t border-dashed border-slate-500" />
      <div className="text-center text-[12px] font-bold tracking-[0.3em]">WELCOME!!!</div>
      <div className="my-3 border-t border-dashed border-slate-500" />

      <div className="space-y-0.5">
        {d.showTax && <Row k="CST NUMBER" v={d.cstNo} />}
        <Row k="RECEIPT NO" v={d.receiptNo} />
        <Row k="FCC ID" v={d.fccId} />
        <Row k="FIP NO" v={d.fipNo} />
        <Row k="NOZZLE NO" v={d.nozzleNo} />
      </div>

      <div className="my-3 border-t border-dashed border-slate-500" />

      <div className="space-y-0.5">
        <Row k="PRODUCT" v={d.product} bold />
        <Row k="RATE/LTR" v={`Rs ${d.rate}`} />
        <Row k="VOLUME(LTR)" v={`${d.volume} lt`} />
        <Row k="AMOUNT" v={`Rs ${d.amount}`} bold />
      </div>

      <div className="my-3 border-t border-dashed border-slate-500" />

      <div className="space-y-0.5">
        {d.showVehicle && <Row k="VEH TYPE" v={d.vehType} />}
        {d.showVehicle && <Row k="VEH NO" v={d.vehNo} />}
        {d.showCustomer && <Row k="CUSTOMER" v={d.customerName || "-"} />}
        <Row k="DATE" v={`${d.date}  ${d.time}`} />
        <Row k="MODE" v={d.mode} />
        {d.showTax && <Row k="LST NO" v={d.lstNo} />}
        {d.showTax && <Row k="VAT NO" v={d.vatNo} />}
        <Row k="ATTENDANT ID" v={d.attendantId || "not available"} />
      </div>

      <div className="my-3 border-t border-dashed border-slate-500" />
      <div className="text-center text-[10px] leading-relaxed opacity-80">{d.footer}</div>
      <div className="mt-3 flex justify-center gap-[2px]">
        {Array.from({ length: 34 }).map((_, i) => (
          <span
            key={i}
            className="block bg-slate-900"
            style={{ width: i % 3 === 0 ? 2 : 1, height: 26 }}
          />
        ))}
      </div>
      <div className="mt-1 text-center text-[9px] tracking-widest opacity-70">{d.receiptNo}</div>
    </div>
  );
};

/* --- Template 2: modern boxed A5-ish invoice --- */
const TemplateTwo = ({ d, brand }) => {
  return (
    <div
      className="mx-auto w-[420px] p-6 text-[12px] text-slate-900"
      style={paperStyle(d.paper)}
    >
      <div
        className="-mx-6 -mt-6 mb-5 flex items-center gap-3 px-6 py-4 text-white"
        style={{ backgroundColor: brand.color }}
      >
        {d.showLogo &&
          (brand.logo ? (
            <img
              src={brand.logo}
              alt={brand.name}
              crossOrigin="anonymous"
              className="h-11 w-11 rounded-lg bg-white object-contain p-1"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/20 text-base font-bold">
              {brand.name.slice(0, 2).toUpperCase()}
            </div>
          ))}
        <div className="min-w-0">
          <div className="truncate text-[15px] font-bold leading-tight">{d.stationName}</div>
          <div className="truncate text-[10px] opacity-90">{brand.tagline || d.address}</div>
        </div>
      </div>

      <div className="mb-4 flex items-start justify-between gap-4 text-[10px] leading-tight text-slate-600">
        <div className="max-w-[55%]">
          <div className="mb-0.5 font-semibold text-slate-800">STATION ADDRESS</div>
          {d.address}
          {d.phone && <div>Tel: {d.phone}</div>}
        </div>
        <div className="text-right">
          <div className="mb-0.5 font-semibold text-slate-800">RECEIPT</div>
          <div>No. {d.receiptNo}</div>
          <div>
            {d.date} · {d.time}
          </div>
        </div>
      </div>

      <table className="mb-4 w-full border-collapse overflow-hidden rounded-lg text-[11px]">
        <thead>
          <tr className="bg-slate-100 text-left text-slate-700">
            <th className="border border-slate-200 px-2 py-1.5">Product</th>
            <th className="border border-slate-200 px-2 py-1.5 text-right">Rate / L</th>
            <th className="border border-slate-200 px-2 py-1.5 text-right">Volume</th>
            <th className="border border-slate-200 px-2 py-1.5 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-200 px-2 py-2 font-semibold">{d.product}</td>
            <td className="border border-slate-200 px-2 py-2 text-right">₹{d.rate}</td>
            <td className="border border-slate-200 px-2 py-2 text-right">{d.volume} L</td>
            <td className="border border-slate-200 px-2 py-2 text-right font-bold">₹{d.amount}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="border border-slate-200 px-2 py-2 text-right font-semibold">
              Total Payable
            </td>
            <td
              className="border border-slate-200 px-2 py-2 text-right text-[13px] font-bold"
              style={{ color: brand.color }}
            >
              ₹{d.amount}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[10.5px] text-slate-700">
        <Row k="FIP / Nozzle" v={`${d.fipNo} / ${d.nozzleNo}`} />
        <Row k="FCC ID" v={d.fccId} />
        {d.showVehicle && <Row k="Vehicle Type" v={d.vehType} />}
        {d.showVehicle && <Row k="Vehicle No." v={d.vehNo} />}
        {d.showCustomer && <Row k="Customer" v={d.customerName || "-"} />}
        <Row k="Payment Mode" v={d.mode} />
        <Row k="Attendant ID" v={d.attendantId || "-"} />
        {d.showTax && <Row k="VAT / GST" v={d.vatNo} />}
        {d.showTax && <Row k="CST No." v={d.cstNo} />}
        {d.showTax && <Row k="LST No." v={d.lstNo} />}
      </div>

      <div className="mt-5 border-t border-dashed border-slate-300 pt-3 text-center text-[10px] text-slate-500">
        {d.footer}
      </div>
    </div>
  );
};

/* --- Template 3: compact narrow slip --- */
const TemplateThree = ({ d, brand }) => {
  return (
    <div
      className="mx-auto w-[280px] px-4 py-5 font-mono text-[10.5px] leading-tight text-slate-900"
      style={paperStyle(d.paper)}
    >
      <div className="mb-2 flex items-center gap-2 border-b-2 border-slate-900 pb-2">
        {d.showLogo && <BrandMark brand={brand} size={30} />}
        <div className="min-w-0">
          <div className="truncate text-[11px] font-bold">{d.stationName}</div>
          <div className="truncate text-[8.5px] opacity-70">{d.address}</div>
        </div>
      </div>

      <div className="mb-2 flex justify-between text-[9px] opacity-80">
        <span>BILL #{d.receiptNo}</span>
        <span>
          {d.date} {d.time}
        </span>
      </div>

      <div
        className="mb-2 rounded px-2 py-2 text-center text-white"
        style={{ backgroundColor: brand.color }}
      >
        <div className="text-[9px] tracking-widest opacity-90">{d.product}</div>
        <div className="text-[20px] font-bold leading-none">₹{d.amount}</div>
        <div className="mt-0.5 text-[9px] opacity-90">
          {d.volume} L @ ₹{d.rate}/L
        </div>
      </div>

      <div className="space-y-0.5">
        <Row k="FIP" v={d.fipNo} />
        <Row k="NOZZLE" v={d.nozzleNo} />
        <Row k="FCC ID" v={d.fccId} />
        {d.showVehicle && <Row k="VEHICLE" v={`${d.vehType} · ${d.vehNo}`} />}
        {d.showCustomer && <Row k="CUSTOMER" v={d.customerName || "-"} />}
        <Row k="MODE" v={d.mode} />
        <Row k="ATTENDANT" v={d.attendantId || "-"} />
        {d.showTax && <Row k="VAT NO" v={d.vatNo} />}
      </div>

      <div className="my-2 border-t border-dashed border-slate-500" />
      <div className="text-center text-[9px] opacity-75">{d.footer}</div>
    </div>
  );
};

/* --- Template 4: office / GST tax invoice (A4 portrait) --- */
const TemplateFour = ({ d, brand }) => {
  const taxable = Number(d.amount) || 0;
  const rate = Number(d.gstRate) || 0;
  const tax = +(taxable * (rate / 100)).toFixed(2);
  const grand = +(taxable + tax).toFixed(2);
  const half = +(tax / 2).toFixed(2);

  const Cell = ({ children, className = "", ...rest }) => (
    <td className={`border border-slate-400 px-2 py-1.5 align-top ${className}`} {...rest}>
      {children}
    </td>
  );

  return (
    <div
      className="mx-auto w-[595px] p-8 text-[10.5px] leading-snug text-slate-900"
      style={paperStyle(d.paper)}
    >
      {/* Title */}
      <div className="mb-3 text-center">
        <div className="text-[13px] font-bold uppercase tracking-[0.35em]">Tax Invoice</div>
        <div className="text-[8.5px] uppercase tracking-widest text-slate-500">
          Original for recipient
        </div>
      </div>

      {/* Seller header */}
      <div className="flex items-start gap-3 border border-slate-400 p-3">
        {d.showLogo && <BrandMark brand={brand} size={54} square />}
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold leading-tight">{d.stationName}</div>
          {brand.tagline && (
            <div className="text-[9px] font-medium" style={{ color: brand.color }}>
              Authorised Dealer — {brand.tagline}
            </div>
          )}
          <div className="mt-1 text-[9.5px] text-slate-700">{d.address}</div>
          <div className="mt-0.5 text-[9.5px] text-slate-700">
            {d.phone && <>Tel: {d.phone} · </>}GSTIN: <b>{d.gstin}</b>
          </div>
          <div className="text-[9.5px] text-slate-700">
            State: {d.stateName} (Code: {d.stateCode})
            {d.showTax && d.cstNo ? ` · CST: ${d.cstNo}` : ""}
          </div>
        </div>
      </div>

      {/* Invoice meta + bill to */}
      <div className="grid grid-cols-2 border-x border-b border-slate-400">
        <div className="border-r border-slate-400 p-3">
          <div className="mb-1 text-[8.5px] font-bold uppercase tracking-wider text-slate-500">
            Invoice Details
          </div>
          <div className="space-y-0.5">
            <Row k="Invoice No." v={d.invoiceNo} bold />
            <Row k="Invoice Date" v={d.date} />
            <Row k="Time" v={d.time} />
            <Row k="Receipt / RO Slip" v={d.receiptNo} />
            <Row k="Payment Mode" v={d.mode} />
          </div>
        </div>
        <div className="p-3">
          <div className="mb-1 text-[8.5px] font-bold uppercase tracking-wider text-slate-500">
            Billed To
          </div>
          <div className="text-[11px] font-bold leading-tight">{d.billToName}</div>
          <div className="mt-0.5 text-[9.5px] text-slate-700">{d.billToAddress}</div>
          {d.billToGstin && (
            <div className="mt-0.5 text-[9.5px]">
              GSTIN: <b>{d.billToGstin}</b>
            </div>
          )}
        </div>
      </div>

      {/* Line items */}
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr className="bg-slate-100 text-[8.5px] uppercase tracking-wide">
            <th className="border border-slate-400 px-2 py-1.5 text-left">#</th>
            <th className="border border-slate-400 px-2 py-1.5 text-left">
              Description of Goods
            </th>
            <th className="border border-slate-400 px-2 py-1.5 text-left">HSN</th>
            <th className="border border-slate-400 px-2 py-1.5 text-right">Qty (L)</th>
            <th className="border border-slate-400 px-2 py-1.5 text-right">Rate</th>
            <th className="border border-slate-400 px-2 py-1.5 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Cell className="text-center">1</Cell>
            <Cell>
              <div className="font-semibold">{d.product}</div>
              <div className="text-[8.5px] text-slate-500">
                FIP {d.fipNo} · Nozzle {d.nozzleNo} · FCC {d.fccId}
                {d.showVehicle && d.vehNo ? ` · ${d.vehType} ${d.vehNo}` : ""}
              </div>
            </Cell>
            <Cell>{d.hsnCode}</Cell>
            <Cell className="text-right">{d.volume}</Cell>
            <Cell className="text-right">{inr(d.rate)}</Cell>
            <Cell className="text-right font-semibold">{inr(taxable)}</Cell>
          </tr>
          {/* filler rows keep the table looking like a real invoice */}
          <tr>
            <Cell className="h-10" />
            <Cell />
            <Cell />
            <Cell />
            <Cell />
            <Cell />
          </tr>
        </tbody>
        <tfoot className="text-[10px]">
          <tr>
            <Cell colSpan={5} className="text-right">
              Taxable Value
            </Cell>
            <Cell className="text-right">{inr(taxable)}</Cell>
          </tr>
          {rate > 0 &&
            (d.showGstSplit ? (
              <>
                <tr>
                  <Cell colSpan={5} className="text-right">
                    CGST @ {(rate / 2).toFixed(2)}%
                  </Cell>
                  <Cell className="text-right">{inr(half)}</Cell>
                </tr>
                <tr>
                  <Cell colSpan={5} className="text-right">
                    SGST @ {(rate / 2).toFixed(2)}%
                  </Cell>
                  <Cell className="text-right">{inr(half)}</Cell>
                </tr>
              </>
            ) : (
              <tr>
                <Cell colSpan={5} className="text-right">
                  IGST @ {rate}%
                </Cell>
                <Cell className="text-right">{inr(tax)}</Cell>
              </tr>
            ))}
          <tr className="bg-slate-100 font-bold">
            <Cell colSpan={5} className="text-right text-[11px]">
              Grand Total
            </Cell>
            <Cell className="text-right text-[12px]" style={{ color: brand.color }}>
              ₹{inr(grand)}
            </Cell>
          </tr>
        </tfoot>
      </table>

      {/* Words */}
      <div className="border-x border-b border-slate-400 px-3 py-2">
        <span className="text-[8.5px] uppercase tracking-wider text-slate-500">
          Amount in words:{" "}
        </span>
        <span className="text-[10px] font-semibold">{rupeesInWords(grand)}</span>
      </div>

      {/* Reimbursement block */}
      {(d.employeeName || d.employeeId || d.department || d.purpose) && (
        <div className="border-x border-b border-slate-400 px-3 py-2">
          <div className="mb-1 text-[8.5px] font-bold uppercase tracking-wider text-slate-500">
            Reimbursement Details
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
            {d.employeeName && <Row k="Employee" v={d.employeeName} />}
            {d.employeeId && <Row k="Employee ID" v={d.employeeId} />}
            {d.department && <Row k="Department" v={d.department} />}
            {d.showVehicle && d.vehNo && <Row k="Vehicle" v={`${d.vehType} · ${d.vehNo}`} />}
            {d.purpose && (
              <div className="col-span-2">
                <Row k="Purpose" v={d.purpose} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Declaration + signature */}
      <div className="grid grid-cols-2 border-x border-b border-slate-400">
        <div className="border-r border-slate-400 p-3">
          <div className="mb-1 text-[8.5px] font-bold uppercase tracking-wider text-slate-500">
            Declaration
          </div>
          <div className="text-[9px] leading-relaxed text-slate-700">{d.declaration}</div>
          {d.showTax && (
            <div className="mt-2 text-[8.5px] text-slate-500">
              LST: {d.lstNo} · VAT: {d.vatNo}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between p-3 text-right">
          <div className="text-[9.5px] font-semibold">{d.authorisedBy}</div>
          <div>
            <div className="mt-8 border-t border-slate-400 pt-1 text-[9px] text-slate-600">
              Authorised Signatory
            </div>
            <div className="text-[8.5px] text-slate-400">
              Attendant ID: {d.attendantId || "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 text-center text-[8.5px] text-slate-400">
        This is a computer-generated invoice. {d.footer}
      </div>
    </div>
  );
};

/* --- Template 5: pixel-faithful BPCL / dispenser pump slip --------- */

/** Fallback BPCL-style emblem drawn inline, used when no logo is uploaded. */
const PumpEmblem = ({ size = 44 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
    <circle cx="50" cy="50" r="46" fill="none" stroke="#111" strokeWidth="7" />
    <path
      d="M50 12c-16 0-24 12-24 22 0 14 14 18 24 22s24 8 24 22c0 10-8 22-24 22"
      fill="none"
      stroke="#111"
      strokeWidth="9"
      strokeLinecap="round"
    />
    <circle cx="50" cy="50" r="9" fill="#111" />
  </svg>
);

/** Zero-pad a decimal the way pump dispensers print it: 00003.16 */
const pumpNum = (value, intLen = 5, decLen = 2) => {
  const n = Number(value) || 0;
  const [i, dec = ""] = n.toFixed(decLen).split(".");
  return `${i.padStart(intLen, "0")}.${dec}`;
};

const TemplateFive = ({ d, brand }) => {
  /* Fixed-width label column reproduces the dispenser's colon alignment. */
  const L = ({ k, v, w = 12 }) => (
    <div className="whitespace-pre">
      {k.padEnd(w, " ")}: {v}
    </div>
  );

  const ddmmyy = (() => {
    const parts = String(d.date).split("-");
    if (parts.length !== 3) return d.date;
    return `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`;
  })();

  return (
    <div
      className="mx-auto w-[300px] px-5 pb-8 pt-5 text-slate-900"
      style={{
        ...paperStyle(d.paper),
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: 12.5,
        lineHeight: 1.45,
        letterSpacing: "0.02em",
      }}
    >
      {/* Boxed logo, exactly like the printed header */}
      {d.showLogo && (
        <div className="mb-2 flex justify-center">
          <div className="flex flex-col items-center border-2 border-slate-900 px-3 py-1.5">
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={brand.name}
                crossOrigin="anonymous"
                style={{ width: 44, height: 44, objectFit: "contain" }}
              />
            ) : (
              <PumpEmblem size={44} />
            )}
            <div className="mt-0.5 text-center text-[12px] font-bold leading-[1.05]">
              {(brand.id === "none" ? d.stationName : brand.name).split(" ").map((w, i) => (
                <div key={i}>{w}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mb-1 text-center text-[19px] font-bold tracking-wide">{d.welcomeText}</div>

      <div className="whitespace-pre">Tel. No.: {d.phone}</div>
      <div className="h-3" />

      <div className="pl-2">
        <L k="Receipt No." v={` ${d.receiptNo}`} />
        <div className="whitespace-pre">FCC ID: {d.fccId}</div>
        <L k="FIP No." v={d.fipNo} />
        <L k="Nozzle No." v={d.nozzleNo} />
        <L k="Product" v={d.product} />
        <L k="Density" v={`${d.density}Kg/Cu.mtr`} w={8} />
        <div className="whitespace-pre">Preset Type: {d.presetType}</div>
        <L k="Rate(Rs/L)" v={`  ${Number(d.rate || 0).toFixed(2)}`} w={11} />
        <L k="Volume(L)" v={pumpNum(d.volume)} w={11} />
        <L k="Amount(Rs)" v={pumpNum(d.amount)} w={11} />
        <div className="whitespace-pre">Atot: {d.atot}</div>
        <div className="whitespace-pre">Vtot: {d.vtot}</div>
      </div>

      <div className="h-5" />

      <div className="whitespace-pre">Vehicle No: {d.vehNo || "Not Entered"}</div>
      <div className="whitespace-pre">Mobile No : {d.mobileNo || "Not Entered"}</div>

      <div className="h-4" />

      <div className="whitespace-pre">
        Date : {ddmmyy} Time: {d.time}
      </div>

      <div className="mt-1">
        <L k="CST No" v={d.showTax ? d.cstNo : ""} w={11} />
        <L k="LST No" v={d.showTax ? d.lstNo : ""} w={11} />
        <L k="VAT No" v={d.showTax ? d.vatNo : ""} w={11} />
        <div className="whitespace-pre">ATTENDANT ID : {d.attendantId || "Not Available"}</div>
        <div className="whitespace-pre">FCC DATE : {d.fccDate || "Not Available"}</div>
        <div className="whitespace-pre">FCC TIME : {d.fccTime || "Not Available"}</div>
      </div>

      <div className="h-5" />
      <div className="whitespace-pre-wrap">{d.footer}</div>
    </div>
  );
};

/* --- Template 6: IndianOil dispenser slip --------------------------- */

/** IndianOil-style roundel: double ring with a dark band across the middle. */
const IocEmblem = ({ size = 86 }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
    <circle cx="50" cy="50" r="47" fill="none" stroke="#1a1a1a" strokeWidth="4.5" />
    <circle cx="50" cy="50" r="41" fill="none" stroke="#1a1a1a" strokeWidth="1.6" />
    <rect x="6" y="39" width="88" height="21" fill="#1a1a1a" />
    <text
      x="50"
      y="54.6"
      textAnchor="middle"
      fill="#ffffff"
      style={{
        fontSize: 15,
        fontWeight: 700,
        fontFamily:
          '"Noto Sans Devanagari","Nirmala UI","Mangal","Kohinoor Devanagari",sans-serif',
      }}
    >
      इंडियनऑयल
    </text>
  </svg>
);

const TemplateSix = ({ d, brand }) => {
  /* Same fixed-width colon column the dispenser firmware prints. */
  const L = ({ k, v, w = 12 }) => (
    <div className="whitespace-pre">
      {k.padEnd(w, " ")}: {v}
    </div>
  );

  const ddmmyy = (() => {
    const parts = String(d.date).split("-");
    if (parts.length !== 3) return d.date;
    return `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`;
  })();

  /* The station block prints as separate lines; split on newline or comma. */
  const addressLines = String(d.address || "")
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div
      className="mx-auto w-[300px] px-5 pb-8 pt-6 text-slate-900"
      style={{
        ...paperStyle(d.paper),
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: 12.5,
        lineHeight: 1.45,
        letterSpacing: "0.02em",
      }}
    >
      {/* Roundel + wordmark, no bounding box (unlike the BPCL slip) */}
      {d.showLogo && (
        <div className="mb-1 flex flex-col items-center">
          {brand.logo ? (
            <img
              src={brand.logo}
              alt={brand.name}
              crossOrigin="anonymous"
              style={{ width: 86, height: 86, objectFit: "contain" }}
            />
          ) : (
            <IocEmblem size={86} />
          )}
          <div
            className="mt-0.5 text-[21px] font-extrabold leading-none tracking-tight"
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
          >
            {brand.id === "none" ? d.stationName : brand.name.replace(/\s+/g, "")}
          </div>
        </div>
      )}

      <div className="mb-0.5 text-center text-[19px] font-bold tracking-wide">
        {d.welcomeText}
      </div>

      {addressLines.map((line, i) => (
        <div key={i} className="whitespace-pre uppercase">
          {line}
        </div>
      ))}

      <div className="whitespace-pre">Tel. No. : {d.phone}</div>
      <div className="h-3" />

      <div>
        <L k="Receipt No." v={` ${d.receiptNo}`} />
        <div className="whitespace-pre">FCC ID: {d.fccId}</div>
        <L k="FIP No." v={d.fipNo} />
        <L k="Nozzle No." v={d.nozzleNo} />
        <L k="Product" v={d.product} />
        <L k="Density" v={`${d.density}Kg/Cu.mtr`} w={8} />
        <div className="whitespace-pre">Preset Type: {d.presetType}</div>
        <L k="Rate(Rs/L)" v={`  ${Number(d.rate || 0).toFixed(2)}`} />
        <L k="Volume(L)" v={pumpNum(d.volume)} />
        <L k="Amount(Rs)" v={pumpNum(d.amount)} />
        <div className="whitespace-pre">Atot: {d.atot}</div>
        <div className="whitespace-pre">Vtot: {d.vtot}</div>
      </div>

      <div className="h-5" />

      <div className="whitespace-pre">Vehicle No: {d.vehNo || "Not Entered"}</div>
      <div className="whitespace-pre">Mobile No : {d.mobileNo || "Not Entered"}</div>

      <div className="h-4" />

      {/* IndianOil prints Date and Time on their own lines */}
      <div className="whitespace-pre">Date : {ddmmyy}</div>
      <div className="whitespace-pre">Time: {d.time}</div>

      <div className="h-4" />

      <div>
        <L k="CST No" v={d.showTax ? d.cstNo : ""} />
        <L k="LST No" v={d.showTax ? d.lstNo : ""} />
        <L k="VAT No" v={d.showTax ? d.vatNo : ""} />
        <div className="whitespace-pre">ATTENDANT ID : {d.attendantId || "Not Available"}</div>
        <div className="whitespace-pre">FCC DATE : {d.fccDate || "Not Available"}</div>
        <div className="whitespace-pre">FCC TIME : {d.fccTime || "Not Available"}</div>
      </div>

      <div className="h-4" />
      <div className="whitespace-pre-wrap">{d.footer}</div>
    </div>
  );
};

/* --- Template 7: Shell POS receipt (both source layouts merged) -----
 * No drawn logo here by design — upload the real Shell mark in
 * Admin · Logos and it renders at the top. With no logo set, the receipt
 * simply starts at the site header, which is how the plain roll prints.
 */

const TemplateSeven = ({ d, brand }) => {
  const rule = (ch) => ch.repeat(38);

  /* Right-aligned money column, the way a POS printer lays it out. */
  const Money = ({ label, value, bold, indent }) => (
    <div className={`flex justify-between gap-2 ${indent ? "pl-3" : ""}`}>
      <span className={bold ? "font-bold" : ""}>{label}</span>
      <span className={`whitespace-pre ${bold ? "font-bold" : ""}`}>{value}</span>
    </div>
  );

  const volume = Number(d.volume) || 0;
  const rate = Number(d.rate) || 0;
  const gross = Number(d.amount) || 0;
  const discount = d.showOffer ? Number(d.offerAmount) || 0 : 0;
  const net = gross + discount;

  const dmy = (() => {
    const p = String(d.date).split("-");
    return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : d.date;
  })();
  const dmySlash = dmy.replace(/-/g, "/");
  const weekday = (() => {
    const dt = new Date(d.date);
    return isNaN(dt.getTime()) ? "" : WEEKDAYS[dt.getDay()];
  })();

  const addressLines = String(d.address || "")
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div
      className="mx-auto w-[320px] px-4 pb-7 pt-5 text-slate-900"
      style={{
        ...paperStyle(d.paper),
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: 11.5,
        lineHeight: 1.5,
      }}
    >
      <div>
        {/* Logo only appears once one is uploaded in Admin · Logos */}
        {d.showLogo && brand.logo && (
          <div className="mb-2 flex justify-center">
            <img
              src={brand.logo}
              alt={brand.name}
              crossOrigin="anonymous"
              style={{ width: 72, height: 72, objectFit: "contain" }}
            />
          </div>
        )}

        {/* Site header */}
        <div className="text-center">
          <div>
            {d.stationName} - Site ID: {d.siteId}
          </div>
          <div>{d.dealerName}</div>
          {addressLines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
          {d.showTax && <div>GSTIN: {d.gstin}</div>}
          {d.fssai && <div>FSSAI: {d.fssai}</div>}
        </div>

        <div className="overflow-hidden whitespace-pre text-center">{rule("*")}</div>
        {d.duplicateReceipt && (
          <div className="text-center">** DUPLICATE RECEIPT **</div>
        )}

        <div className="flex justify-between gap-2">
          <span>
            {dmy} {d.time} POS:{d.posNo}
          </span>
          <span>#{d.receiptNo}</span>
        </div>

        <div className="my-1 overflow-hidden whitespace-pre">{rule("-")}</div>

        {/* Dispenser block — from the forecourt printout */}
        <Money label="Pump No:" value={d.pumpNo} />
        <Money label="Grade:" value={d.grade} />
        <Money label="Volume:" value={`${volume.toFixed(2)}L`} />
        <Money label="Unit price(INR):" value={rate.toFixed(2)} />
        <Money label="Amount(INR):" value={gross.toFixed(2)} bold />

        <div className="my-1 overflow-hidden whitespace-pre">{rule("-")}</div>

        {/* POS sale block — from the till receipt */}
        <div>
          {d.nozzleNo} - {d.grade}
        </div>
        <Money
          label={`${volume.toFixed(2)}L x ${rate.toFixed(2)}Rs./L`}
          value={`Rs. ${gross.toFixed(2)}`}
          indent
        />

        {d.showOffer && (
          <>
            <div className="h-3" />
            <Money label={d.offerText} value={`Rs. ${discount.toFixed(2)}`} />
          </>
        )}

        <div className="h-3" />
        <Money label="Sale Total" value={`Rs. ${net.toFixed(2)}`} />
        <Money label={d.mode} value={`Rs. ${net.toFixed(2)}`} />

        <div className="h-3" />
        <Money label="TOTAL INVOICE" value={`Rs. ${net.toFixed(2)}`} bold />

        {d.showLoyalty && (
          <>
            <div className="h-3" />
            <div>{d.loyaltyProgram}</div>
            <div>Customer ID: {d.loyaltyId}</div>
            {d.showVehicle && d.vehNo && (
              <div className="whitespace-pre">Vehicle No: {d.vehNo}</div>
            )}
            {d.showCustomer && d.customerName && (
              <div className="whitespace-pre">Customer  : {d.customerName}</div>
            )}
            {d.mobileNo && <div className="whitespace-pre">Mobile No : {d.mobileNo}</div>}
          </>
        )}

        <div className="h-3" />
        <div className="flex justify-between gap-2">
          <span>
            {weekday} {dmySlash} {d.time}
          </span>
          <span>{d.seqNo}</span>
        </div>

        <div className="h-3" />
        {d.duplicateReceipt && (
          <div className="text-center">** DUPLICATE RECEIPT **</div>
        )}
        <div className="overflow-hidden whitespace-pre text-center">{rule("*")}</div>

        <div className="text-center">
          {String(d.shellFooter || "")
            .split("\n")
            .map((l, i) => (
              <div key={i}>{l}</div>
            ))}
        </div>
      </div>
    </div>
  );
};

const Receipt = ({ d, brand }) => {
  if (d.template === "t2") return <TemplateTwo d={d} brand={brand} />;
  if (d.template === "t3") return <TemplateThree d={d} brand={brand} />;
  if (d.template === "t4") return <TemplateFour d={d} brand={brand} />;
  if (d.template === "t5") return <TemplateFive d={d} brand={brand} />;
  if (d.template === "t6") return <TemplateSix d={d} brand={brand} />;
  if (d.template === "t7") return <TemplateSeven d={d} brand={brand} />;
  return <TemplateOne d={d} brand={brand} />;
};

/* ------------------------------------------------------------------ */
/* Admin: brand & logo manager                                         */
/* ------------------------------------------------------------------ */

const emptyBrand = () => ({ id: "", name: "", color: "#e4610f", tagline: "", logo: "" });

function BrandAdmin({ brands, onSave, onClose, onSelect, flash }) {
  const [list, setList] = useState(brands);
  const [draft, setDraft] = useState(emptyBrand());
  const [editingId, setEditingId] = useState(null);
  const fileRef = useRef(null);

  const update = (k) => (v) => setDraft((p) => ({ ...p, [k]: v }));

  const pickFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) return flash("Image too large (max 4 MB).");
    try {
      const url = await fileToDataUrl(file);
      setDraft((p) => ({ ...p, logo: url }));
    } catch (err) {
      flash("Could not read that image.");
    }
    e.target.value = "";
  };

  /* A draft counts as pending whenever it differs from what's in the list. */
  const isDirty = useMemo(() => {
    if (!draft.name.trim() && !draft.logo) return false;
    if (!editingId) return true;
    const original = list.find((b) => b.id === editingId);
    if (!original) return true;
    return (
      original.name !== draft.name ||
      original.logo !== draft.logo ||
      original.color !== draft.color ||
      original.tagline !== draft.tagline
    );
  }, [draft, editingId, list]);

  /** Folds the draft into a list and returns the result (pure, so saveAll
   *  can use it immediately instead of waiting for a state flush). */
  const foldDraft = (base) => {
    if (!draft.name.trim()) return base;
    const id = editingId || draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24);
    const entry = { ...draft, id, name: draft.name.trim() };
    return base.some((b) => b.id === id)
      ? base.map((b) => (b.id === id ? entry : b))
      : [...base, entry];
  };

  const commit = () => {
    if (!draft.name.trim()) return flash("Brand name is required.");
    const next = foldDraft(list);
    setList(next);
    onSave(next); // apply to the live preview straight away
    setDraft(emptyBrand());
    setEditingId(null);
    flash(editingId ? "Brand updated — now click Save library." : "Brand added.");
  };

  const edit = (b) => {
    setDraft({ ...b });
    setEditingId(b.id);
  };

  const remove = (id) => {
    const next = list.filter((b) => b.id !== id);
    setList(next);
    onSave(next);
    if (editingId === id) {
      setDraft(emptyBrand());
      setEditingId(null);
    }
  };

  /* Folds any uncommitted draft in first — the most common way to lose a
     logo was uploading it and hitting Save without pressing Update. */
  const saveAll = () => {
    const next = foldDraft(list);
    setList(next);
    onSave(next);
    flash(storage.saveBrands(next) ? "Brand library saved." : "Saved for this session only.");
    setDraft(emptyBrand());
    setEditingId(null);
    onClose();
  };

  const restore = () => {
    setList(BUILTIN_BRANDS);
    onSave(BUILTIN_BRANDS);
    setDraft(emptyBrand());
    setEditingId(null);
    flash("Restored built-in brands.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-slate-900/60 p-4">
      <div className="mt-8 w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold">Admin · Pump Logos & Brands</h2>
            <p className="text-xs text-slate-500">
              Upload the actual Bharat Petroleum / HP / Indian Oil mark and it will be used on every
              template.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          {/* Existing brands */}
          <div>
            <h3 className="mb-2 text-sm font-semibold">Brand library ({list.length})</h3>
            <div className="max-h-80 space-y-2 overflow-auto pr-1">
              {list.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-2"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-50">
                    {b.logo ? (
                      <img src={b.logo} alt="" className="h-9 w-9 object-contain" />
                    ) : (
                      <span
                        className="h-6 w-6 rounded-full"
                        style={{ backgroundColor: b.color, display: "block" }}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{b.name}</div>
                    <div className="truncate text-xs text-slate-400">{b.tagline || b.id}</div>
                  </div>
                  <button
                    onClick={() => {
                      onSelect(b.id);
                      flash(`Using ${b.name}.`);
                    }}
                    className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-50"
                  >
                    Use
                  </button>
                  <button
                    onClick={() => edit(b)}
                    className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(b.id)}
                    className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 transition hover:bg-red-50"
                  >
                    Del
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={restore}
              className="mt-3 text-xs text-slate-500 underline transition hover:text-slate-800"
            >
              Restore built-in brands
            </button>
          </div>

          {/* Editor */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-3 text-sm font-semibold">
              {editingId ? `Edit “${draft.name}”` : "Add a brand"}
            </h3>
            <div className="space-y-3">
              <Field label="Brand Name">
                <Text value={draft.name} onChange={update("name")} placeholder="Bharat Petroleum" />
              </Field>
              <Field label="Tagline / Legal Name">
                <Text
                  value={draft.tagline}
                  onChange={update("tagline")}
                  placeholder="Bharat Petroleum Corporation Ltd."
                />
              </Field>
              <Field label="Accent Colour">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={draft.color}
                    onChange={(e) => update("color")(e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border border-slate-300 bg-white"
                  />
                  <Text value={draft.color} onChange={update("color")} />
                </div>
              </Field>
              <Field label="Logo" hint="PNG/JPG/SVG · auto-resized to 240px and stored locally">
                <div className="flex items-center gap-2">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white">
                    {draft.logo ? (
                      <img src={draft.logo} alt="" className="h-12 w-12 object-contain" />
                    ) : (
                      <span className="text-[10px] text-slate-400">none</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <button
                      type="button"
                      onClick={() => fileRef.current && fileRef.current.click()}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Upload image
                    </button>
                    {draft.logo && (
                      <button
                        type="button"
                        onClick={() => update("logo")("")}
                        className="w-full rounded-lg px-3 py-1 text-xs text-red-600 transition hover:bg-red-50"
                      >
                        Remove logo
                      </button>
                    )}
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={pickFile}
                  className="hidden"
                />
              </Field>
              <Field label="…or paste an image URL">
                <Text value={draft.logo} onChange={update("logo")} placeholder="https://…/logo.png" />
              </Field>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={commit}
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  {editingId ? "Update brand" : "Add brand"}
                </button>
                {editingId && (
                  <button
                    onClick={() => {
                      setDraft(emptyBrand());
                      setEditingId(null);
                    }}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:bg-white"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
          <div className="min-w-0 text-xs">
            {isDirty ? (
              <span className="text-amber-700">
                ⚠ “{draft.name || "Untitled"}” has unsaved edits — Save library will include them.
              </span>
            ) : (
              <span className="text-slate-400">Logos are stored in this browser.</span>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={saveAll}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Save library
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function FuelBillGenerator() {
  const [d, setD] = useState(DEFAULTS);
  const [brands, setBrands] = useState(BUILTIN_BRANDS);
  const [adminOpen, setAdminOpen] = useState(false);
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState("");
  const previewRef = useRef(null);

  const set = useCallback((key) => (val) => setD((p) => ({ ...p, [key]: val })), []);

  const flash = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  };

  /* Restore a saved brand library on mount, backfilling any built-in logo
     that was added after the user last saved (e.g. the Shell pecten). */
  useEffect(() => {
    const saved = storage.loadBrands();
    if (!saved) return;
    setBrands(
      saved.map((b) => {
        if (b.logo) return b;
        const builtin = BUILTIN_BRANDS.find((x) => x.id === b.id);
        return builtin && builtin.logo ? { ...b, logo: builtin.logo } : b;
      })
    );
  }, []);

  const brand = useMemo(
    () => brands.find((b) => b.id === d.brand) || brands[0] || BUILTIN_BRANDS[0],
    [brands, d.brand]
  );

  /* --- auto calculation --- */
  const recalc = useCallback((next) => {
    const rate = parseFloat(next.rate) || 0;
    const volume = parseFloat(next.volume) || 0;
    const amount = parseFloat(next.amount) || 0;
    if (next.lockField === "amount") {
      return { ...next, amount: (rate * volume).toFixed(2) };
    }
    return { ...next, volume: rate > 0 ? (amount / rate).toFixed(2) : "0.00" };
  }, []);

  const setNumeric = (key) => (val) => setD((p) => recalc({ ...p, [key]: val }));

  useEffect(() => {
    setD((p) => recalc(p));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --- persistence --- */
  const handleSave = () => flash(storage.save(d) ? "Saved to this browser." : "Saving unavailable here.");
  const handleLoad = () => {
    const saved = storage.load();
    if (saved) {
      setD({ ...DEFAULTS, ...saved });
      flash("Last saved data loaded.");
    } else {
      flash("No saved data found.");
    }
  };
  const handleReset = () => {
    setD({ ...DEFAULTS, receiptNo: randomDigits(6), fccId: randomDigits(8), date: nowDate(), time: nowTime() });
    flash("Form reset.");
  };

  /* --- export ---
   * html2canvas-pro (not stock html2canvas) is required: Tailwind v4 emits
   * oklch() colours, which the original library cannot parse and throws on.
   */
  const capture = async () => {
    const node = previewRef.current;
    if (!node) throw new Error("Nothing to capture yet.");
    const { default: html2canvas } = await import("html2canvas-pro");
    return html2canvas(node, {
      scale: Math.min(3, (window.devicePixelRatio || 1) * 2),
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: false,
      logging: false,
      windowWidth: node.scrollWidth,
      windowHeight: node.scrollHeight,
    });
  };

  const downloadPNG = async () => {
    try {
      setBusy("png");
      const canvas = await capture();
      const a = document.createElement("a");
      a.download = `fuel-bill-${d.receiptNo}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    } catch (e) {
      console.error("PNG export failed:", e);
      flash(`PNG export failed: ${e.message}`);
    } finally {
      setBusy("");
    }
  };

  const downloadPDF = async () => {
    try {
      setBusy("pdf");
      const canvas = await capture();
      if (!canvas.width || !canvas.height) throw new Error("Captured an empty canvas.");
      const { jsPDF } = await import("jspdf");

      /* Portrait A4, receipt centred with a margin. Long thermal slips get
         their own page size so they aren't shrunk to illegibility. */
      const isSlip = SLIP_TEMPLATES.includes(d.template);
      const pdf = new jsPDF({
        unit: "pt",
        format: isSlip ? [300, Math.max(420, (canvas.height / canvas.width) * 300 + 40)] : "a4",
        compress: true,
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = isSlip ? 10 : 40;
      const ratio = Math.min(
        (pageW - margin * 2) / canvas.width,
        (pageH - margin * 2) / canvas.height
      );
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        (pageW - w) / 2,
        isSlip ? margin : (pageH - h) / 2,
        w,
        h,
        undefined,
        "FAST"
      );
      pdf.save(`fuel-bill-${d.receiptNo}.pdf`);
    } catch (e) {
      console.error("PDF export failed:", e);
      flash(`PDF export failed: ${e.message}`);
    } finally {
      setBusy("");
    }
  };

  const handlePrint = () => window.print();

  const total = useMemo(() => {
    const base = parseFloat(d.amount) || 0;
    if (d.template === "t4") return base + base * ((parseFloat(d.gstRate) || 0) / 100);
    if (d.template === "t7" && d.showOffer) return base + (parseFloat(d.offerAmount) || 0);
    return base;
  }, [d.amount, d.gstRate, d.template, d.showOffer, d.offerAmount]);

  const isOffice = d.template === "t4";
  const isPumpSlip = d.template === "t5" || d.template === "t6";
  const isShell = d.template === "t7";

  /** Load the Shell sample so the template opens looking like the real thing. */
  const applyShellPreset = () =>
    setD((p) => ({
      ...p,
      template: "t7",
      brand: "shell",
      stationName: "Shell Bellandur",
      dealerName: "AVIGHNA ENTERPRISES",
      address: "No.80/2, Next to Hotel Citrus, ORR, Bellandur, Bangalore-560 037",
      gstin: "29BRKPK5483R1ZK",
      fssai: "11222333000087",
      siteId: "12170818",
      grade: "V-PowerUNL",
      product: "XP95",
      nozzleNo: "09",
      pumpNo: "08",
      rate: "137.98",
      volume: "2.54",
      amount: "350.00",
      lockField: "amount",
      mode: "UPI",
      showTax: true,
    }));

  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
              ⛽
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Fuel Bill Generator</h1>
              <p className="text-xs text-slate-500">Free · No login · Downloads as PDF or PNG</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAdminOpen(true)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              ⚙ Admin · Logos
            </button>
            <div className="hidden text-right sm:block">
              <div className="text-xs text-slate-500">Bill total</div>
              <div className="text-lg font-bold">₹{inr(total)}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_380px]">
        {/* ---------------- Form ---------------- */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Section title="Template & Style">
            <Field label="Template">
              <Select
                value={d.template}
                onChange={set("template")}
                options={TEMPLATES.map((t) => ({ value: t.id, label: t.label }))}
              />
            </Field>
            <Field label="Paper Texture">
              <Select
                value={d.paper}
                onChange={set("paper")}
                options={PAPERS.map((p) => ({ value: p.id, label: p.label }))}
              />
            </Field>
            <Field label="Pump Brand / Logo" hint="Add your own in Admin · Logos">
              <Select
                value={d.brand}
                onChange={set("brand")}
                options={brands.map((b) => ({ value: b.id, label: b.name }))}
              />
            </Field>
            <div className="flex items-end">
              <Toggle checked={d.showLogo} onChange={set("showLogo")} label="Show logo" />
            </div>
          </Section>

          <Section title="Fuel Station">
            <Field label="Station Name">
              <Text value={d.stationName} onChange={set("stationName")} />
            </Field>
            <Field label="Phone">
              <Text value={d.phone} onChange={set("phone")} />
            </Field>
            <div className="sm:col-span-2">
              <Field
                label="Address"
                hint="Pump slips print each comma-separated part on its own line"
              >
                <Text value={d.address} onChange={set("address")} />
              </Field>
            </div>
          </Section>

          <Section title="Transaction">
            <Field label="Product">
              <Select value={d.product} onChange={set("product")} options={PRODUCTS} />
            </Field>
            <Field label="Payment Mode">
              <Select value={d.mode} onChange={set("mode")} options={PAY_MODES} />
            </Field>
            <Field label="Rate per Litre (₹)">
              <Text type="number" step="0.01" value={d.rate} onChange={setNumeric("rate")} />
            </Field>
            <Field
              label={d.lockField === "amount" ? "Volume (L)" : "Volume (L) — auto"}
              hint={d.lockField === "amount" ? "Amount is calculated from this" : undefined}
            >
              <Text
                type="number"
                step="0.01"
                value={d.volume}
                onChange={setNumeric("volume")}
                readOnly={d.lockField === "volume"}
              />
            </Field>
            <Field
              label={d.lockField === "volume" ? "Amount (₹)" : "Amount (₹) — auto"}
              hint={d.lockField === "volume" ? "Volume is calculated from this" : undefined}
            >
              <Text
                type="number"
                step="0.01"
                value={d.amount}
                onChange={setNumeric("amount")}
                readOnly={d.lockField === "amount"}
              />
            </Field>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() =>
                  setD((p) => ({ ...p, lockField: p.lockField === "amount" ? "volume" : "amount" }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                ⇄ Calculate {d.lockField === "amount" ? "volume from amount" : "amount from volume"}
              </button>
            </div>
            <Field label="Date">
              <Text type="date" value={d.date} onChange={set("date")} />
            </Field>
            <Field label="Time">
              <Text type="time" value={d.time} onChange={set("time")} />
            </Field>
          </Section>

          <Section title="Pump & Receipt Details">
            <Field label="Receipt No.">
              <Text value={d.receiptNo} onChange={set("receiptNo")} />
            </Field>
            <Field label="FCC ID">
              <Text value={d.fccId} onChange={set("fccId")} />
            </Field>
            <Field label="FIP No.">
              <Text value={d.fipNo} onChange={set("fipNo")} />
            </Field>
            <Field label="Nozzle No.">
              <Text value={d.nozzleNo} onChange={set("nozzleNo")} />
            </Field>
            <Field label="Attendant ID">
              <Text value={d.attendantId} onChange={set("attendantId")} />
            </Field>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() =>
                  setD((p) => ({ ...p, receiptNo: randomDigits(6), fccId: randomDigits(8) }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                ↻ Randomise IDs
              </button>
            </div>
          </Section>

          <Section title="Vehicle & Customer">
            <Field label="Vehicle Type">
              <Select value={d.vehType} onChange={set("vehType")} options={VEHICLE_TYPES} />
            </Field>
            <Field label="Vehicle Number">
              <Text value={d.vehNo} onChange={set("vehNo")} placeholder="HR26 DK 8337" />
            </Field>
            <Field label="Customer Name">
              <Text value={d.customerName} onChange={set("customerName")} placeholder="Optional" />
            </Field>
            <div className="grid gap-2">
              <Toggle checked={d.showVehicle} onChange={set("showVehicle")} label="Show vehicle" />
              <Toggle checked={d.showCustomer} onChange={set("showCustomer")} label="Show customer" />
            </div>
          </Section>

          {isPumpSlip && (
            <Section title="Pump Slip Fields">
              <Field label="Density (Kg/Cu.mtr)">
                <Text value={d.density} onChange={set("density")} />
              </Field>
              <Field label="Preset Type">
                <Select value={d.presetType} onChange={set("presetType")} options={["Amount", "Volume", "None"]} />
              </Field>
              <Field label="Atot (amount totaliser)">
                <Text value={d.atot} onChange={set("atot")} />
              </Field>
              <Field label="Vtot (volume totaliser)">
                <Text value={d.vtot} onChange={set("vtot")} />
              </Field>
              <Field label="Mobile No." hint="Blank prints “Not Entered”">
                <Text value={d.mobileNo} onChange={set("mobileNo")} />
              </Field>
              <Field label="Welcome Line">
                <Text value={d.welcomeText} onChange={set("welcomeText")} />
              </Field>
              <Field label="FCC Date" hint="Blank prints “Not Available”">
                <Text value={d.fccDate} onChange={set("fccDate")} />
              </Field>
              <Field label="FCC Time" hint="Blank prints “Not Available”">
                <Text value={d.fccTime} onChange={set("fccTime")} />
              </Field>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={() =>
                    setD((p) => ({
                      ...p,
                      atot: `00${randomDigits(9)}.${randomDigits(2)}`,
                      vtot: `0000${randomDigits(7)}.${randomDigits(2)}`,
                      fccId: `0000${randomDigits(12)}`,
                      receiptNo: `H${randomDigits(4)}`,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  ↻ Randomise totalisers & IDs (pump-realistic)
                </button>
              </div>
            </Section>
          )}

          {isShell && (
            <Section title="Shell POS Receipt">
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={applyShellPreset}
                  className="w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
                >
                  ⚡ Load Shell Bellandur sample data
                </button>
              </div>

              <Field label="Site ID">
                <Text value={d.siteId} onChange={set("siteId")} />
              </Field>
              <Field label="Dealer / Operator">
                <Text value={d.dealerName} onChange={set("dealerName")} />
              </Field>
              <Field label="GSTIN">
                <Text value={d.gstin} onChange={set("gstin")} />
              </Field>
              <Field label="FSSAI No.">
                <Text value={d.fssai} onChange={set("fssai")} />
              </Field>
              <Field label="Pump No.">
                <Text value={d.pumpNo} onChange={set("pumpNo")} />
              </Field>
              <Field label="Grade" hint="V-PowerUNL, V-ULP, V-Power Diesel…">
                <Text value={d.grade} onChange={set("grade")} />
              </Field>
              <Field label="POS No.">
                <Text value={d.posNo} onChange={set("posNo")} />
              </Field>
              <Field label="Receipt No." hint="Prints as #… on the POS line">
                <Text value={d.receiptNo} onChange={set("receiptNo")} />
              </Field>
              <Field label="Sequence No." hint="Bottom-right of the receipt">
                <Text value={d.seqNo} onChange={set("seqNo")} />
              </Field>
              <div className="flex items-end">
                <Toggle
                  checked={d.duplicateReceipt}
                  onChange={set("duplicateReceipt")}
                  label="DUPLICATE RECEIPT banner"
                />
              </div>

              <div className="sm:col-span-2">
                <Toggle checked={d.showOffer} onChange={set("showOffer")} label="Show offer line" />
              </div>
              {d.showOffer && (
                <>
                  <Field label="Offer Text">
                    <Text value={d.offerText} onChange={set("offerText")} />
                  </Field>
                  <Field label="Offer Amount" hint="Negative discounts the total">
                    <Text
                      type="number"
                      step="0.01"
                      value={d.offerAmount}
                      onChange={set("offerAmount")}
                    />
                  </Field>
                </>
              )}

              <div className="sm:col-span-2">
                <Toggle
                  checked={d.showLoyalty}
                  onChange={set("showLoyalty")}
                  label="Show loyalty block"
                />
              </div>
              {d.showLoyalty && (
                <>
                  <Field label="Loyalty Programme">
                    <Text value={d.loyaltyProgram} onChange={set("loyaltyProgram")} />
                  </Field>
                  <Field label="Customer ID">
                    <Text value={d.loyaltyId} onChange={set("loyaltyId")} />
                  </Field>
                  <Field label="Vehicle Number" hint="Prints under Customer ID">
                    <Text value={d.vehNo} onChange={set("vehNo")} />
                  </Field>
                  <Field label="Customer Name" hint="Prints under Customer ID">
                    <Text value={d.customerName} onChange={set("customerName")} />
                  </Field>
                  <Field label="Mobile Number" hint="Prints under Customer ID">
                    <Text value={d.mobileNo} onChange={set("mobileNo")} />
                  </Field>
                  <div className="flex items-end gap-2">
                    <Toggle
                      checked={d.showVehicle}
                      onChange={set("showVehicle")}
                      label="Vehicle"
                    />
                    <Toggle
                      checked={d.showCustomer}
                      onChange={set("showCustomer")}
                      label="Customer"
                    />
                  </div>
                </>
              )}

              <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                The Shell pecten ships as the default logo. Swap it for your own in{" "}
                <b className="text-slate-700">⚙ Admin · Logos</b> (edit the “Shell”
                brand), or turn it off with the Show logo switch above.
              </div>

              <div className="sm:col-span-2">
                <Field label="Footer Lines" hint="One line per row">
                  <Area value={d.shellFooter} onChange={set("shellFooter")} rows={3} />
                </Field>
              </div>
            </Section>
          )}

          {isOffice && (
            <Section title="Office Invoice / Reimbursement">
              <Field label="Invoice No.">
                <Text value={d.invoiceNo} onChange={set("invoiceNo")} />
              </Field>
              <Field label="Seller GSTIN">
                <Text value={d.gstin} onChange={set("gstin")} />
              </Field>
              <Field label="State">
                <Text value={d.stateName} onChange={set("stateName")} />
              </Field>
              <Field label="State Code">
                <Text value={d.stateCode} onChange={set("stateCode")} />
              </Field>
              <Field label="HSN / SAC Code">
                <Text value={d.hsnCode} onChange={set("hsnCode")} />
              </Field>
              <Field label="Tax Rate (%)" hint="Petrol/diesel are outside GST — keep 0">
                <Text type="number" step="0.01" value={d.gstRate} onChange={set("gstRate")} />
              </Field>
              <div className="sm:col-span-2">
                <Toggle
                  checked={d.showGstSplit}
                  onChange={set("showGstSplit")}
                  label="Split tax as CGST + SGST (intra-state)"
                />
              </div>

              <div className="sm:col-span-2">
                <Field label="Billed To — Company">
                  <Text value={d.billToName} onChange={set("billToName")} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Billed To — Address">
                  <Text value={d.billToAddress} onChange={set("billToAddress")} />
                </Field>
              </div>
              <Field label="Billed To — GSTIN">
                <Text value={d.billToGstin} onChange={set("billToGstin")} />
              </Field>
              <Field label="Employee Name">
                <Text value={d.employeeName} onChange={set("employeeName")} placeholder="Optional" />
              </Field>
              <Field label="Employee ID">
                <Text value={d.employeeId} onChange={set("employeeId")} placeholder="Optional" />
              </Field>
              <Field label="Department">
                <Text value={d.department} onChange={set("department")} placeholder="Optional" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Purpose of Travel">
                  <Text value={d.purpose} onChange={set("purpose")} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Authorised By">
                  <Text value={d.authorisedBy} onChange={set("authorisedBy")} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Declaration">
                  <Text value={d.declaration} onChange={set("declaration")} />
                </Field>
              </div>
            </Section>
          )}

          <Section title="Tax & Footer">
            <Field label="CST Number">
              <Text value={d.cstNo} onChange={set("cstNo")} />
            </Field>
            <Field label="LST Number">
              <Text value={d.lstNo} onChange={set("lstNo")} />
            </Field>
            <Field label="VAT / GST Number">
              <Text value={d.vatNo} onChange={set("vatNo")} />
            </Field>
            <div className="flex items-end">
              <Toggle checked={d.showTax} onChange={set("showTax")} label="Show tax numbers" />
            </div>
            <div className="sm:col-span-2">
              <Field label="Footer Message">
                <Text value={d.footer} onChange={set("footer")} />
              </Field>
            </div>
          </Section>

          <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
            <button
              onClick={handleSave}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Save Data
            </button>
            <button
              onClick={handleLoad}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Load Last Saved
            </button>
            <button
              onClick={handleReset}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* ---------------- Preview ---------------- */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Live Preview</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {TEMPLATES.find((t) => t.id === d.template)?.label.split("—")[1]?.trim()}
              </span>
            </div>

            <div className="overflow-auto rounded-xl bg-slate-200 p-4">
              <div ref={previewRef} className="shadow-lg" style={{ width: "fit-content", margin: "0 auto" }}>
                <Receipt d={d} brand={brand} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={downloadPDF}
                disabled={!!busy}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {busy === "pdf" ? "Preparing…" : "Download PDF"}
              </button>
              <button
                onClick={downloadPNG}
                disabled={!!busy}
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {busy === "png" ? "Preparing…" : "Download PNG"}
              </button>
              <button
                onClick={handlePrint}
                className="col-span-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Print
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-slate-400">
              For personal record-keeping and reimbursement templates only. Built by <a href="https://github.com/sujaykundu777" target="_blank" rel="noopener noreferrer" className="underline">xplor4r</a> 
            </p>
          </div>
        </div>
      </main>

      {adminOpen && (
        <BrandAdmin
          brands={brands}
          onSave={setBrands}
          onSelect={(id) => setD((p) => ({ ...p, brand: id }))}
          onClose={() => setAdminOpen(false)}
          flash={flash}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
