# Benderrack Vendedores – versión web (v8.2)

La misma app de vendedores, pero se abre en el navegador (computadora, tablet o celular) y se puede instalar como app.

## Cómo publicarla (GitHub Pages)

1. En el repositorio `actualizaciones` de GitHub, crea (o reemplaza) la carpeta **`app`**.
2. Sube **todos** los archivos de esta carpeta `web` dentro de `app` (sin este LEEME si no quieres).
3. Espera 1–2 minutos y abre: `https://manuelmaxi.github.io/actualizaciones/app/`
4. Para instalarla: en Chrome/Edge, menú ⋮ → **Instalar app** (en iPhone: Compartir → **Agregar a inicio**).

Al subir una versión nueva, la app se actualiza sola la próxima vez que se abra con internet.

## Qué funciona en la web

- Todo lo de la app: clientes, cotizaciones (con **dibujo del rack** en el PDF), pedidos, facturas, conduces, recibos, visitas, captación, prospectos, **inspecciones de racks**, reportes en Excel y PDF y **Reportes F.V** con la plantilla de la empresa (con «Enviar o guardar»: correo, WhatsApp o descarga), calendario y mapa.
- **Escanear tarjetas de presentación** y leer **PDF escaneados**: el lector de texto viene incluido y funciona sin internet (la primera lectura tarda unos segundos mientras se prepara).
- Funciona sin internet después de abrirla una vez.
- En el celular, desliza hacia abajo en Inicio para actualizar.
- En español, inglés o ruso (Ajustes → Idioma).
- Correo de la empresa (Microsoft 365) cuando IT dé el Client ID; en la web la dirección de regreso es la misma página. El correo con contraseña (IMAP/SMTP: hosting, Google Workspace) funciona solo en la app Android: el navegador no puede conectarse por IMAP.

## Diferencias con la app Android

- Los datos se guardan en el navegador de cada equipo (no se comparten entre la web y la tablet salvo con la cuenta en la nube).
- No descarga actualizaciones APK (la web se actualiza sola).
- Las fotos y archivos se descargan a la carpeta de Descargas del equipo.

## Archivos

| Archivo | Para qué |
|---|---|
| index.html | La app |
| web.js, sw.js, manifest.webmanifest, icon192/512.png | Modo web, sin internet e instalación |
| jspdf*, pdf*.js, leaflet.* , logo_*.js | PDF, lectura de PDF, mapa y logos |
| ocr_core.js, ocr_spa.js | Lector de texto (tarjetas y PDF escaneados) |
| plantilla_fv.js | Plantilla del Reporte F.V |
| Benderrack.apk | App de clientes para enviar por WhatsApp |
| version-web.txt | Versión publicada |
