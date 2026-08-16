# Fuel Bill Generator

Fuel bill / petrol pump receipt generator
live preview, PDF/PNG export, and an admin panel for pump logos.

Templates currently :

- Indian Oil
- Bharat Petroleum
- Shell

## Run it

Requires Node 18+.

```bash
cd fuel-bill-app
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # serve the built files locally
```

`dist/` is a static folder — drop it on Netlify, Vercel, GitHub Pages, or any
static host.

## Files

| Path                        | What it is                                  |
| --------------------------- | ------------------------------------------- |
| `src/FuelBillGenerator.jsx` | The whole app — form, 5 templates, admin     |
| `src/main.jsx`              | React entry point                           |
| `src/index.css`             | Tailwind import + print stylesheet          |
| `vite.config.js`            | Vite + React + Tailwind v4 plugin           |

## Templates

1. **Dot Matrix** — classic thermal slip with barcode
2. **Modern Boxed** — coloured header, table layout
3. **Compact Slip** — narrow, highlighted amount
4. **Office GST Invoice** — A4 tax invoice with HSN, amount in words, signature
5. **BPCL Pump Slip** — replica of a real dispenser printout

## Admin · Logos

Click **⚙ Admin · Logos** in the header to upload real pump logos (Bharat
Petroleum, HP, Indian Oil…). Images are downscaled to 240px and saved to
`localStorage`, so they persist across reloads. You can also paste an image URL,
set an accent colour, and edit or delete brands.

> Note: if you paste a remote image URL, that host must send permissive CORS
> headers or the PNG/PDF export will fail to include it. Uploading the file is
> always safe because it becomes a data URL.

## Dependencies loaded at runtime

`html2canvas` and `jsPDF` are pulled from cdnjs on the first export click, so no
extra npm packages are needed — but the machine needs internet access for
Download PDF / Download PNG to work. Print works offline.

## Using it inside an existing app

The component is self-contained with no required props:

```jsx
import FuelBillGenerator from "./FuelBillGenerator.jsx";

export default function Page() {
  return <FuelBillGenerator />;
}
```

Only Tailwind core utility classes are used, so any Tailwind 3 or 4 setup works.
