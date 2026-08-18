#!/usr/bin/env python3
"""
Baş parmak karelerini tek bir sprite sheet'e paketler.

thumb_frames.py'nin ürettiği tam kadraj render'ları alır, kareler arasında
GERÇEKTEN değişen bölgeyi bulur, hepsini o dikdörtgene kırpar ve ızgara
şeklinde tek dosyaya yazar. Böylece elin sabit kalan kısmı sprite'a
girmiyor — dosya birkaç kat küçülüyor.

Çıktı:
  public/hand/thumb-sheet.webp
  src/lib/thumbFrames.json   (dikdörtgen + ızgara + hedef→kare eşlemesi)
"""

import json
import os
import sys

from PIL import Image, ImageChops

RAW = sys.argv[1] if len(sys.argv) > 1 else "/tmp/nutripix_thumb"
SITE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_IMG = os.path.join(SITE, "public", "hand", "thumb-sheet.webp")
OUT_META = os.path.join(SITE, "src", "lib", "thumbFrames.json")
SCALE = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0  # 2x render'a göre
QUALITY = int(sys.argv[3]) if len(sys.argv) > 3 else 86

meta = json.load(open(os.path.join(RAW, "meta.json")))
n = meta["frames"]
frames = [Image.open(os.path.join(RAW, f"f{i:02d}.webp")).convert("RGBA") for i in range(n)]
W, H = frames[0].size

# ── değişen bölgeyi bul ─────────────────────────────────────────────────────
# "Eşiği geçen herhangi bir piksel" ölçütü işe yaramıyor: Cycles denoiser'ı
# her karede biraz farklı sonuç veriyor, kadrajın dört bir yanına serpilen tek
# tük piksel kutuyu %86'ya şişiriyor. Bunun yerine fark ENERJİSİNİN %99.5'ini
# kapsayan en dar kutuyu alıyoruz — gerçek hareket %16'lık bir bölgede.
KEEP = 0.995
rows = [0.0] * H
cols = [0.0] * W
for f in frames[1:]:
    px = ImageChops.difference(f.convert("RGB"), frames[0].convert("RGB")).convert("L").load()
    for y in range(0, H, 3):
        acc = 0
        for x in range(0, W, 3):
            v = px[x, y]
            if v > 3:
                acc += v
                cols[x] += v
        rows[y] += acc


def span(arr):
    total = sum(arr)
    lo_lim, hi_lim = total * (1 - KEEP) / 2, total * (1 + KEEP) / 2
    run, lo = 0.0, None
    for i, v in enumerate(arr):
        run += v
        if lo is None and run >= lo_lim:
            lo = i
        if run >= hi_lim:
            return lo or 0, i
    return lo or 0, len(arr) - 1


y0, y1 = span(rows)
x0, x1 = span(cols)
pad = 14
box = (max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad))

# Enerji kutusu parmağın SADECE hareket eden kısmını kapsıyor; taban eklem
# çevresi neredeyse kıpırdamadığı için kutunun dışında kalıyordu ve orada
# taban görselin dinlenme pozu duruyordu — parmak kırpma çizgisinde ikiye
# ayrılmış gibi görünüyordu ("sabit başparmak"). Kutuyu, başparmağın tüm
# gövdesini içine alacak asgari alanla birleştiriyoruz.
# Başparmak merkez çizgisi: uç ~(253..488, 267..735), kök (589, 894) + kalınlık.
THUMB_MIN = (240 * 2, 350 * 2, 620 * 2, 990 * 2)  # sahne → 2x render pikseli
box = (
    min(box[0], THUMB_MIN[0]), min(box[1], THUMB_MIN[1]),
    max(box[2], THUMB_MIN[2]), max(box[3], THUMB_MIN[3]),
)
box = (max(0, box[0]), max(0, box[1]), min(W, box[2]), min(H, box[3]))
bw, bh = box[2] - box[0], box[3] - box[1]
print(f"[paket] kadraj {W}x{H} → değişen bölge {bw}x{bh} @ {box[:2]}  (%{100*bw*bh/(W*H):.0f})")

tw, th = max(1, round(bw * SCALE)), max(1, round(bh * SCALE))
cols = 6
rows = (n + cols - 1) // cols
sheet = Image.new("RGBA", (cols * tw, rows * th), (0, 0, 0, 0))
for i, f in enumerate(frames):
    tile = f.crop(box).resize((tw, th), Image.LANCZOS)
    sheet.paste(tile, ((i % cols) * tw, (i // cols) * th))
sheet.save(OUT_IMG, "WEBP", quality=QUALITY, method=6)

# 0. kareyi taban görsel olarak da yaz: sprite'ın dinlenme karesiyle taban
# birebir aynı render olsun, kırpma sınırında gürültü farkı oluşmasın
BASE_IMG = os.path.join(SITE, "public", "hand", "model.webp")
frames[0].save(BASE_IMG, "WEBP", quality=90, method=6)
print(f"[paket] taban → {BASE_IMG}  {os.path.getsize(BASE_IMG)//1024}KB")
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
    "tips": meta["tips"],
}
os.makedirs(os.path.dirname(OUT_META), exist_ok=True)
json.dump(out, open(OUT_META, "w"), indent=2)
print("[paket] ölçüler →", OUT_META, out["rect"])
