---
name: pixelforge-animation
description: Convertir imágenes de referencia u hojas de sprites en animaciones editables de PixelForge, cargar sus píxeles en fotogramas, conservar las escenas existentes y publicar cambios mediante GitHub y Vercel. Usar cuando el usuario pida crear, importar, corregir, animar o desplegar sprites y efectos VFX en PixelForge.
---

# PixelForge Animation Skill

Objetivo: pasar de **imagen / secuencia visual → hoja de sprites → fotogramas editables → GitHub → Vercel**, sin pasos manuales evitables, sin base de datos y sin inundar el chat con listas de píxeles.

## Contrato de entrada

- Referencia: imagen subida, secuencia previamente generada o especificación del ataque.
- Diseño: silueta, estilo, paleta, capas y desplazamiento de los elementos.
- Animación: cantidad de fotogramas, tamaño por fotograma, FPS y orden temporal. Si no se indica, conservar las especificaciones de la escena actual.
- Destino: escena existente (`?scene=orb` o `?scene=explosion`) o una escena **nueva e independiente**.

Si el usuario ya proporcionó una referencia o seleccionó una secuencia, usarla sin solicitarla de nuevo. No confundir ocho poses principales con 24 fotogramas interpolados: las imágenes intermedias deben existir realmente.

## Flujo de trabajo

1. **Inspeccionar la versión viva.** Leer `index.html`, `sprite-support.js`, el script de la escena relevante y el estado del repositorio `estebanorozcocore-boop/PixelForge`. Comprobar límites actuales; no basarse en versiones recordadas. Reutilizar herramientas conectadas de GitHub y Vercel si están autorizadas.
2. **Diseñar poses coherentes.** Mantener dimensiones, posición de cámara, escala del personaje y línea de suelo consistentes; planificar anticipación, acción, impacto y recuperación. Los efectos de brillo, anillos, humo y partículas deben tener su propio ciclo de aparición y desaparición.
3. **Preparar la hoja.** Para el importador **actual** de PixelForge usar exactamente **4 columnas × 2 filas**, sin etiquetas, márgenes ni separadores entre celdas, con ocho celdas cuadradas. Las ocho imágenes deben ser distintas y tener el mismo encuadre. Generar o utilizar un PNG, y ejecutar `scripts/prepare_sheet.py`. Ver `references/runtime-contract.md`.
4. **Validar.** Comprobar que hay ocho fotogramas reales; confirmar coordenadas, paleta y límites. Diferenciar siempre «imagen importada en una capa editable» de «efectos separados en capas»: la importación actual crea **una** capa con ocho cels.
5. **Integrar sin perder trabajo.** Si es el orbe actual, actualizar `orb-sprites.js` con el JS resultante. Si se solicita otra animación, añadir un archivo y una ruta de escena distintos, con una clave de almacenamiento propia, sin reutilizar ni sobrescribir el orbe/árbol/explosión. No reemplazar una escena local existente sin una acción explícita del usuario. No modificar las pestañas abiertas.
6. **Publicar.** Subir el/los archivos mediante el conector GitHub, en la rama `main` si el usuario pidió despliegue a producción. Actualizar archivos existentes con su SHA actual; nunca forzar sobrescritura ciega. La integración de Vercel desplegará automáticamente. Verificar que la revisión indicada aparece en estado `READY`.
7. **Probar.** Comprobar código JS, carga de ocho cels por fotograma, resolución, reproducción y cambios de pincel sin pérdida de datos. Verificar que ninguna escena distinta cambió. Si se puede ejecutar navegador de prueba, comprobar visualmente la animación; en caso contrario, declarar la limitación.
8. **Entregar.** Proporcionar enlace directo `https://pixelforge-domisur.vercel.app/?scene=orb` (u otra escena realmente creada), cantidad de fotogramas, resolución, FPS, capas reales, commit y estado de despliegue. No afirmar que el navegador del usuario recibió el cambio sin evidencia.

## Conversión local

```bash
python scripts/prepare_sheet.py /ruta/hoja.png --out-dir /ruta/salida --name orb --cell 256 --fps 8 --colors 128
```

Produce `orb-sprites.js` (reemplazo del archivo de la escena de orbe), `orb-sheet.png` (atlas normalizado) y `orb-manifest.json` (metadatos verificables). Requiere Pillow (`pip install Pillow`). No insertar el contenido Base64 completo ni miles de líneas `x,y,color` en el chat.

## Reglas de integridad

- Mantener los proyectos anteriores y sus claves de `localStorage` independientes.
- Máximo actual: 512 px por lado y 4.194.304 celdas (ancho × alto × capas × fotogramas). El importador por hoja acepta 4 × 2 y normaliza a 256 × 256 por pose. Verificar límites vigentes antes de publicar.
- Las imágenes por fotograma contienen píxeles editables, **pero no** una segmentación automática en personaje/llama/humo. Para esa separación se requiere generar máscaras o capas independientes de verdad.
- Una skill aporta **instrucciones y scripts**, no autorización ni conectividad: las herramientas GitHub/Vercel deben estar disponibles y autorizadas en la sesión. Nunca pedir tokens personales en el chat.
- El almacenamiento local y el canal de instrucciones desde GitHub no son una base de datos ni permiten leer automáticamente los trazos del navegador del usuario.
- Si falla la validación, no publicar ni modificar una escena existente. Informar el motivo y conservar los archivos originales.