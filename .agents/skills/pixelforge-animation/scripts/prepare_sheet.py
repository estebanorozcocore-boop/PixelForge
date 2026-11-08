#!/usr/bin/env python3
"""Normalize a 4x2 sprite sheet and generate the JS asset used by PixelForge orb scene.

Requires Pillow. This script never changes the source image or the repository.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import io
import json
from pathlib import Path

from PIL import Image


def build_sheet(image_path: Path, out_dir: Path, name: str, cell: int, fps: int, colors: int, resampling: str) -> dict:
    if not image_path.is_file():
        raise ValueError(f"Imagen inexistente: {image_path}")
    if image_path.stat().st_size > 20 * 1024 * 1024:
        raise ValueError("La imagen supera 20 MB")
    if not 8 <= cell <= 512:
        raise ValueError("cell debe estar entre 8 y 512")
    if not 1 <= fps <= 60:
        raise ValueError("fps debe estar entre 1 y 60")
    if not 2 <= colors <= 255:
        raise ValueError("colors debe estar entre 2 y 255")
    if not name.replace("-", "").replace("_", "").isalnum() or not name[0].isalpha():
        raise ValueError("name solo admite letras, números, - y _; debe empezar por letra")

    with Image.open(image_path) as src:
        src.load()
        if src.width % 4 or src.height % 2:
            raise ValueError("La hoja debe dividirse exactamente en 4 columnas × 2 filas")
        sw, sh = src.width // 4, src.height // 2
        if sw != sh:
            raise ValueError("Cada pose debe ser cuadrada. Elimina títulos, márgenes y etiquetas")
        if sw < 16:
            raise ValueError("Cada pose debe tener al menos 16 píxeles por lado")
        sheet = Image.new("RGBA", (cell * 4, cell * 2), (0, 0, 0, 0))
        method = Image.Resampling.NEAREST if resampling == "nearest" else Image.Resampling.LANCZOS
        for frame in range(8):
            x, y = frame % 4, frame // 4
            frame_img = src.crop((x * sw, y * sh, (x + 1) * sw, (y + 1) * sh)).convert("RGBA")
            if frame_img.size != (cell, cell):
                frame_img = frame_img.resize((cell, cell), resample=method)
            sheet.alpha_composite(frame_img, (x * cell, y * cell))

    # Quantization keeps the palette compact enough for PixelForge's localStorage packer.
    q = sheet.quantize(colors=colors, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    normalized = q.convert("RGBA")
    identities = []
    for i in range(8):
        x, y = i % 4, i // 4
        im = normalized.crop((x * cell, y * cell, (x + 1) * cell, (y + 1) * cell))
        identities.append(hashlib.sha256(im.tobytes()).hexdigest())
    distinct = len(set(identities))
    if distinct < 2:
        raise ValueError("Las ocho poses son iguales. No se creará una falsa animación")

    out_dir.mkdir(parents=True, exist_ok=True)
    img_path = out_dir / f"{name}-sheet.png"
    normalized.save(img_path, format="PNG", optimize=True)
    binary = img_path.read_bytes()
    uri = "data:image/png;base64," + base64.b64encode(binary).decode("ascii")
    js_path = out_dir / f"{name}-sprites.js"
    # The current PixelForge 'orb' scene reads this exact identifier.
    js_path.write_text("/* Auto-generated sprite sheet for PixelForge. */\nconst ORB_SHEET_DATA = " + json.dumps(uri) + ";\n", encoding="utf-8")
    meta = {
        "scene": name,
        "grid": {"columns": 4, "rows": 2},
        "frame_size": {"width": cell, "height": cell},
        "frames": 8,
        "distinct_frames": distinct,
        "fps": fps,
        "source_image": image_path.name,
        "resampling": resampling,
        "palette_limit": colors,
        "atlas_file": img_path.name,
        "asset_file": js_path.name,
        "atlas_sha256": hashlib.sha256(binary).hexdigest(),
        "note": "Use as orb-sprites.js in the existing orb scene; import generates one editable layer.",
    }
    meta_path = out_dir / f"{name}-manifest.json"
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return meta


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("image", type=Path, help="PNG/WebP/JPEG sprite sheet arranged 4x2")
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--name", default="orb")
    parser.add_argument("--cell", type=int, default=256)
    parser.add_argument("--fps", type=int, default=8)
    parser.add_argument("--colors", type=int, default=128)
    parser.add_argument("--resample", choices=["nearest", "lanczos"], default="lanczos")
    args = parser.parse_args()
    try:
        meta = build_sheet(args.image, args.out_dir, args.name, args.cell, args.fps, args.colors, args.resample)
    except (ValueError, OSError) as err:
        parser.error(str(err))
    print(json.dumps(meta, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()