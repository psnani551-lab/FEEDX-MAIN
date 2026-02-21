#!/usr/bin/env python3
"""Organize SVG/asset files safely.

Goal:
- Move root-level `images/*.svg` into `src/assets/illustrations/`
- Rewrite TS/TSX imports that currently reference `../../images/<file>`

Safety:
- Default is DRY-RUN (no changes).
- Use --apply to perform changes.

Usage:
  python3 scripts/organize_assets.py            # dry run
  python3 scripts/organize_assets.py --apply    # move + rewrite

Notes:
- This script only touches files tracked in this repo and only updates imports.
- If you have custom imports elsewhere, add mappings below.
"""

from __future__ import annotations

import argparse
import re
import shutil
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
IMAGES_DIR = REPO_ROOT / "images"
TARGET_DIR = REPO_ROOT / "src" / "assets" / "illustrations"

# Maps filename -> new relative import path (from TS/TSX files)
# We'll rewrite: ../../images/<name>  ->  @/assets/illustrations/<name>

def iter_ts_files() -> list[Path]:
    return sorted(
        [p for p in (REPO_ROOT / "src").rglob("*") if p.suffix in {".ts", ".tsx"}]
    )


def rewrite_imports(contents: str) -> tuple[str, int, set[str]]:
    """Rewrite relative imports pointing at images/ to the @ alias.

    Examples rewritten:
      ../../images/foo.svg
      ../../../images/foo.svg

    Output:
      @/assets/illustrations/foo.svg
    """

    # Match any relative depth like ../../images/ or ../../../images/
    # We intentionally do NOT match absolute paths like /images/foo.svg.
    pattern = re.compile(r"((?:\.\./)+images/)([^'\"]+)")
    replaced = 0
    rewritten_files: set[str] = set()

    def _sub(m: re.Match[str]) -> str:
        nonlocal replaced
        replaced += 1
        filename = m.group(2)
        rewritten_files.add(filename)
        return f"@/assets/illustrations/{filename}"

    new_contents = pattern.sub(_sub, contents)
    return new_contents, replaced, rewritten_files


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Apply changes (move files + rewrite imports)")
    args = parser.parse_args()

    if not IMAGES_DIR.exists():
        print(f"images dir not found: {IMAGES_DIR}")
        return 1

    svg_files = sorted([p for p in IMAGES_DIR.iterdir() if p.is_file() and p.suffix.lower() == ".svg"])
    if not svg_files:
        print("No SVG files found under images/. Nothing to do.")
        return 0

    print(f"Found {len(svg_files)} SVG files under images/.")
    print(f"Target directory: {TARGET_DIR}")

    # 1) Rewrite imports
    ts_files = iter_ts_files()
    total_rewrites = 0
    rewritten_asset_names: set[str] = set()
    for path in ts_files:
        old = path.read_text(encoding="utf-8")
        new, count, rewritten_names = rewrite_imports(old)
        if count:
            total_rewrites += count
            rewritten_asset_names.update(rewritten_names)
            print(f"- would rewrite {count} import(s) in {path.relative_to(REPO_ROOT)}")
            if args.apply:
                path.write_text(new, encoding="utf-8")

    # 2) Move SVG files
    for svg in svg_files:
        dest = TARGET_DIR / svg.name
        print(f"- would move {svg.relative_to(REPO_ROOT)} -> {dest.relative_to(REPO_ROOT)}")
        if args.apply:
            TARGET_DIR.mkdir(parents=True, exist_ok=True)
            shutil.move(str(svg), str(dest))

    print(f"Total import rewrites: {total_rewrites}")
    if args.apply:
        moved = [p for p in TARGET_DIR.glob("*.svg")]
        missing = sorted({p.name for p in svg_files} - {p.name for p in moved})
        if missing:
            print("WARNING: Some SVGs were not found in the target folder after moving:")
            for name in missing:
                print(f"- {name}")

        # Helpful signal: were we rewriting imports for assets that don't exist?
        moved_names = {p.name for p in moved}
        rewritten_missing = sorted(rewritten_asset_names - moved_names)
        if rewritten_missing:
            print("WARNING: Some rewritten imports reference files not present in src/assets/illustrations/:")
            for name in rewritten_missing:
                print(f"- {name}")

        print("Applied changes.")
    else:
        print("Dry run complete. Re-run with --apply to make changes.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
