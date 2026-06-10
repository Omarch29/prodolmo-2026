# Logo Prode Mundial 2026 — assets PWA

Mascota: pelota de futbol con ojos, boca y un banderin "26".

## Archivos

Fuentes vectoriales (editables, escalan sin perder calidad):
- `logo.svg` ............. logo principal, fondo transparente
- `icon.svg` ............. icono de app (fondo verde, esquinas redondeadas)
- `icon-maskable.svg` .... version maskable (personaje dentro de la safe zone)
- `apple-touch-icon.svg` . version para iOS (fondo a sangre)

PNG listos para usar:
- `logo-512.png`
- `icon-192.png`, `icon-512.png` ............ proposito "any"
- `icon-maskable-192.png`, `icon-maskable-512.png` ... proposito "maskable"
- `apple-touch-icon.png` (180x180)
- `favicon-16.png`, `favicon-32.png`, `favicon.ico`

Config:
- `manifest.json` ........ web app manifest (ajusta start_url/rutas a tu proyecto)
- `head-snippet.html` .... etiquetas para pegar en el <head>

## Como usarlo

1. Copia los PNG/SVG a una carpeta publica (ej. `/public/icons/`).
2. Copia `manifest.json` a la raiz publica y ajusta las rutas de `icons`
   si los pusiste en otra carpeta.
3. Pega el contenido de `head-snippet.html` en el `<head>` de tu HTML.
4. Necesitas servir por HTTPS y registrar un Service Worker para que sea
   instalable como PWA.

## Paleta
- Verde fondo: #16a34a / #0b6e34
- Banderin: #f5b301 (dorado)
- Detalles: negro #1a1a1a, blanco #f5f5ef, rosa mejillas #ef5d6a
