#!/usr/bin/env python3
"""
Baş parmak karelerini tek bir sprite sheet'e paketler.

İki boru hattı da (blender/thumb_frames.py ve blender/hand_rig.py) aynı biçimde
çıktı verir: base.webp (avuç + parmaklar, baş parmaksız) ve t00..tNN.webp
(yalnız baş parmak). Bu betik tabanı model.webp'ye kopyalar, kareleri de
hareket kutusuna kırpıp tek sprite sheet'e dizer.

Çıktı:
  public/hand/thumb-sheet.webp
  src/lib/thumbFrames.json   (dikdörtgen + ızgara + hedef→kare eşlemesi)
"""

import json
import os
import sys

from PIL import Image

RAW = sys.argv[1] if len(sys.argv) > 1 else "/tmp/nutripix_thumb"
SITE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_IMG = os.path.join(SITE, "public", "hand", "thumb-sheet.webp")
OUT_META = os.path.join(SITE, "src", "lib", "thumbFrames.json")
SCALE = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0  # 2x render'a göre
QUALITY = int(sys.argv[3]) if len(sys.argv) > 3 else 86

meta = json.load(open(os.path.join(RAW, "meta.json")))
n = meta["frames"]

# ── taban görsel ────────────────────────────────────────────────────────────
base = Image.open(os.path.join(RAW, "base.webp")).convert("RGBA")
W, H = base.size
BASE_IMG = os.path.join(SITE, "public", "hand", "model.webp")
base.save(BASE_IMG, "WEBP", quality=QUALITY + 6, method=6)
print(f"[paket] taban → {BASE_IMG}  {W}x{H}  {os.path.getsize(BASE_IMG)//1024}KB")

# ── baş parmak kareleri ─────────────────────────────────────────────────────
# Kareler zaten yalnız başparmak katmanını içeriyor (avuç ayrı render edildi),
# dışı saydam. Kırpma kutusu hand_rig.py'nin ölçtüğü hareket kutusu; fark
# analizine gerek yok.
box = tuple(round(v * 2) for v in meta["box"])
box = (max(0, box[0]), max(0, box[1]), min(W, box[2]), min(H, box[3]))
bw, bh = box[2] - box[0], box[3] - box[1]

frames = [Image.open(os.path.join(RAW, f"t{i:02d}.webp")).convert("RGBA") for i in range(n)]
tw, th = max(1, round(bw * SCALE)), max(1, round(bh * SCALE))
# Izgara kabaca kare çıksın: çok uzun/geniş sheet'ler webp'de gereksiz yer tutuyor.
cols = max(1, round((n * th / tw) ** 0.5))
rows = (n + cols - 1) // cols
sheet = Image.new("RGBA", (cols * tw, rows * th), (0, 0, 0, 0))
for i, f in enumerate(frames):
    tile = f.crop(box).resize((tw, th), Image.LANCZOS)
    sheet.paste(tile, ((i % cols) * tw, (i // cols) * th))
sheet.save(OUT_IMG, "WEBP", quality=QUALITY, method=6)
print(f"[paket] {OUT_IMG}  {sheet.size[0]}x{sheet.size[1]}  {os.path.getsize(OUT_IMG)//1024}KB")

# ── site için ölçüler: sahne birimine çevir (render 2x) ─────────────────────
out = {
    "frames": n,
    "cols": cols,
    "rows": rows,
    "rect": {  # el kadrajı (620x1220) içindeki yüzdesel yeri
        "x": box[0] / 2,
        "y": box[1] / 2,
        "w": bw / 2,
        "h": bh / 2,
    },
    "frameForTarget": meta["frameForTarget"],
    "pressForTarget": meta["pressForTarget"],
    "handShift": meta["handShift"],
    "tips": meta["tips"],
}
os.makedirs(os.path.dirname(OUT_META), exist_ok=True)
json.dump(out, open(OUT_META, "w"), indent=2)
print("[paket] ölçüler →", OUT_META, out["rect"])
