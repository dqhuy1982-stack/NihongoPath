#!/usr/bin/env python3
"""HORIZON N5 v3 artwork exporter. Produces WebP; never auto-approves artwork.

Install: python -m pip install Pillow
Run: python scripts/n5-v3-prepare-art.py --source art-source --pilot
     python scripts/n5-v3-prepare-art.py --source art-source --all

Source tree:
  art-source/characters/keiko/portrait.png
  art-source/characters/keiko/bust.png
  art-source/scenes/meeting.png
  art-source/scenes/meeting-thumb.png [optional; derived from meeting when absent]
  art-source/environments/office.png
  art-source/heroes/lesson01-desktop.png
  art-source/heroes/lesson01-mobile.png
"""
import argparse
import hashlib
import json
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError as exc:
    raise SystemExit("Pillow is required: python -m pip install Pillow") from exc

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "source" / "public"
MANIFEST = json.loads((PUBLIC / "n5-v3" / "art-manifest.json").read_text(encoding="utf-8"))
OUTPUT = PUBLIC / "assets" / "n5-v3"
Image.MAX_IMAGE_PIXELS = 120_000_000

# Limits retain sufficient detail while preventing 6MB portraits on iPhone.
PRESETS = {
    "portrait": (800, 1000),
    "bust": (960, 1280),
    "scene": (1600, 900),
    "thumb": (480, 270),
    "environment": (1600, 900),
    "desktop": (1800, 600),
    "mobile": (900, 600),
}

def image_export(source: Path, target: Path, kind: str):
    with Image.open(source) as original:
        img = ImageOps.exif_transpose(original)
        if img.width < 600 or img.height < 400:
            raise ValueError(f"{source}: source too small ({img.width}x{img.height})")
        if original.format not in ("PNG", "JPEG", "WEBP", "TIFF"):
            raise ValueError(f"{source}: unsupported image type {original.format}")
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA")
        intended = PRESETS[kind]
        # Keep the whole scene/person; never silently crop a face or text.
        img.thumbnail(intended, Image.Resampling.LANCZOS)
        target.parent.mkdir(parents=True, exist_ok=True)
        img.save(target, "WEBP", quality=89, method=6, exact=True)
        digest = hashlib.sha256(target.read_bytes()).hexdigest()
        return {
            "source": source.as_posix(),
            "asset": target.relative_to(PUBLIC).as_posix(),
            "width": img.width,
            "height": img.height,
            "bytes": target.stat().st_size,
            "sha256": digest,
            "review": "pending-human-approval",
        }

def plan_jobs(source: Path, pilot: bool):
    characters = MANIFEST["characters"]
    if pilot:
        characters = [x for x in characters if x["id"] in ("keiko", "yamada", "mike")]
    for c in characters:
        for kind in ("portrait", "bust"):
            origin = source / "characters" / c["id"] / f"{kind}.png"
            path = PUBLIC / c["sources"][kind]
            yield origin, path, kind, True
    scenes = MANIFEST["scenes"]
    if pilot:
        scenes = [x for x in scenes if x["id"] in ("meeting", "colleague", "namecheck")]
    for scene in scenes:
        img = source / "scenes" / (scene["id"] + ".png")
        yield img, PUBLIC / scene["asset"], "scene", True
        thumb = source / "scenes" / (scene["id"] + "-thumb.png")
        yield thumb if thumb.exists() else img, PUBLIC / scene["thumbnail"], "thumb", False
    if not pilot:
        for entry in MANIFEST["environments"]:
            yield source / "environments" / (entry["id"] + ".png"), PUBLIC / entry["asset"], "environment", True
        for mode, entry in MANIFEST["hero"].items():
            yield source / "heroes" / ("lesson01-"+mode+".png"), PUBLIC / entry["asset"], mode, True

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=ROOT / "art-source")
    scope = parser.add_mutually_exclusive_group(required=True)
    scope.add_argument("--pilot", action="store_true")
    scope.add_argument("--all", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    results=[]
    missing=[]
    for src, dst, mode, required in plan_jobs(args.source, pilot=args.pilot):
        if not src.is_file():
            if required: missing.append(src.as_posix())
            continue
        if args.dry_run:
            print(f"DRY RUN: {src} -> {dst} ({mode})")
        else:
            record=image_export(src,dst,mode)
            results.append(record)
            print(f"READY FOR REVIEW: {record['asset']} {record['width']}x{record['height']}")
    if missing:
        print("Missing required original artwork:")
        for p in missing: print(" -",p)
    if not args.dry_run and results:
        OUTPUT.mkdir(parents=True,exist_ok=True)
        (OUTPUT / "export-index.json").write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Exported: {len(results)} | missing original sources: {len(missing)} | approvals automatically granted: 0")
    return 1 if missing else 0

if __name__ == "__main__":
    raise SystemExit(main())
