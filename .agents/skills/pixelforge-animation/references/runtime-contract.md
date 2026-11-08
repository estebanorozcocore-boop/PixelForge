# Contrato técnico vigente: PixelForge

Consultar los archivos actuales antes de actuar: este documento describe la integración inicial y puede quedar obsoleto.

## Repositorio y despliegue

- GitHub: `estebanorozcocore-boop/PixelForge`; rama de producción: `main`.
- Vercel: equipo `DOMISUR`, proyecto `pixelforge`; URL estable `https://pixelforge-domisur.vercel.app`.
- `index.html`: interfaz, fotogramas, capas, reproducción, persistencia local, selector de escenas.
- `sprite-support.js`: `window.pfProjectFromSheet(image)` crea un proyecto de 8 fotogramas a 256×256; `window.pfPackProject` / `pfUnpackProject` hacen la serialización de paleta.
- `orb-sprites.js`: define `const ORB_SHEET_DATA='data:image/png;base64,...'` para cargar poses del orbe sin importar archivos manualmente.
- `explosion-scene.js`: escena existente de explosión; no sobrescribirla al crear un orbe.
- `chat-commands.json`: canal **unidireccional** (GitHub → Vercel → navegador), no sustituye una escena persistente ni sirve para leer dibujos del usuario.

## Límite de importación

- Hoja de exactamente 4 columnas × 2 filas; ocho celdas cuadradas, sin títulos ni márgenes en las celdas.
- El decodificador actual usa ocho cels de 256 × 256. El resultado inicial posee una sola capa editable con ocho imágenes.
- El máximo de 4.194.304 celdas equivale a 8 × 256 × 256 × 8 capas, si se quisieran ocho capas llenas; comprobar también el consumo de memoria y la cuota de `localStorage`.
- Escena de orbe: `?scene=orb`, almacenamiento `pixelforge-orb-scene-v1`. La carga inicial solo debe ocurrir cuando está vacía; la recarga explícita requiere confirmación si hay edición previa.
- El fotograma 1 corresponde a índice interno 0; cada cel contiene un arreglo lineal de píxeles de largo `width * height` con colores `#RRGGBB` o `null`.
- Reproducción inicial del orbe: 8 FPS, **ocho** poses = aproximadamente un segundo; más fluidez requiere fotogramas realmente intermedios.

## Calidad visual / pruebas

- Si el objetivo es una animación VFX moderna, conservar el contraste entre núcleo blanco-amarillo, transición naranja y halo rojo, y reservar sombra negativa alrededor.
- No crear un sprite ambiguo cortando una infografía con etiquetas, marcos, títulos o adornos de storyboard. La hoja fuente debe contener exclusivamente las imágenes de cada pose.
- Comprobar visualmente miniaturas y fotogramas (inicial, máxima carga, impacto, final).
- Si el agente no tiene la imagen original, usar las fuentes adjuntas o archivos accesibles: no dibujar desde la memoria una secuencia supuestamente idéntica.
- Confirmar el SHA del despliegue de Vercel y estado `READY`. La presencia del archivo en GitHub no garantiza visualización en una pestaña abierta previamente.