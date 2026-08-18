"""
NutriPix — baş parmak poz dizisi.

model_clean.blend'i açar, baş parmağı iki eklemden (CMC + IP) bükerek ekranın
alt bandındaki dokunma hedeflerine uzatır ve 24 kare render eder. Kareler
değişen bölgeye kırpılıp tek bir sprite sheet'e paketlenir; site bu sheet'in
karesini scroll'a göre değiştirir.

Neden mesh deformasyonu: modeli tarayıcıda deforme edemiyoruz, 2B'de parmağı
kesip döndürmek de kökte dikiş bırakıyor. Mesh'i Blender'da bükmek dikişsiz
ve her pozun gölgesi kendi hesaplanıyor.

Çalıştırma:
  /Applications/Blender.app/Contents/MacOS/Blender --background \
      blender/model_clean.blend --python blender/thumb_frames.py -- <cikis> [samples] [kare]
"""

import bpy
import json
import math
import os
import sys
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(argv[0]) if argv else os.path.join(HERE, "..", "public", "hand")
SAMPLES = int(argv[1]) if len(argv) > 1 else 48
FRAMES = int(argv[2]) if len(argv) > 2 else 24
RAW = os.environ.get("RAW_DIR", "/tmp/nutripix_thumb")
os.makedirs(RAW, exist_ok=True)
os.makedirs(OUT, exist_ok=True)

# ───────────────────────────────────────────────── sahne ↔ dünya (model.py) ──
STAGE_W, STAGE_H, FRAME_H = 620.0, 1000.0, 1220.0
w2 = lambda sx, sy: Vector((sx - STAGE_W / 2, 0.0, STAGE_H / 2 - sy))  # noqa: E731
to_stage = lambda p: (p.x + STAGE_W / 2, STAGE_H / 2 - p.z)  # noqa: E731

# ── baş parmağın merkez çizgisi (kökten uca, sahne birimi) ──────────────────
CENTER_STAGE = [
    (589, 894), (576, 850), (567, 826), (561, 800), (560, 774), (563, 749),
    (547, 724), (543, 701), (542, 675), (556, 650), (554, 625), (547, 599),
    (539, 575), (531, 550), (530, 524), (521, 500), (511, 475), (502, 449),
    (492, 425), (489, 399), (488, 382),
]
CENTER = [w2(*p) for p in CENTER_STAGE]
ARC = [0.0]
for a, b in zip(CENTER, CENTER[1:]):
    ARC.append(ARC[-1] + (b - a).length)
TOTAL_ARC = ARC[-1]

CMC = CENTER[0] + (CENTER[1] - CENTER[0]) * 0.4  # kök eklemi (avucun içinde)
S_IP = TOTAL_ARC * 0.60  # orta eklem, yay boyunca
IP0 = next(CENTER[i] for i in range(len(ARC)) if ARC[i] >= S_IP)

L1 = (IP0 - CMC).length
L2 = (CENTER[-1] - IP0).length
print(f"[parmak] yay {TOTAL_ARC:.0f}  L1 {L1:.0f}  L2 {L2:.0f}  kök {to_stage(CMC)}")

# bükülme profilleri: iki yumuşak eklem (keskin menteşe değil, doğal kavis)
CMC_IN, CMC_OUT = 70.0, 250.0
IP_IN, IP_OUT = S_IP - 60.0, S_IP + 120.0
R_IN, R_OUT = 78.0, 132.0  # merkez çizgiye uzaklık: içeride 1, dışarıda 0


def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def arc_and_radius(p):
    best_d, best_s = 1e18, 0.0
    for i in range(len(CENTER) - 1):
        a, b = CENTER[i], CENTER[i + 1]
        ab = b - a
        L2s = ab.length_squared
        t = max(0.0, min(1.0, (p - a).dot(ab) / L2s)) if L2s else 0.0
        q = a + ab * t
        d = (p - q).length
        if d < best_d:
            best_d, best_s = d, ARC[i] + ab.length * t
    return best_s, best_d


ob = bpy.data.objects["mesh_node"]
M = ob.matrix_world
Mi = M.inverted()
BASE = [v.co.copy() for v in ob.data.vertices]

# her nokta için (kök ağırlığı, orta eklem ağırlığı) — bir kez hesaplanır
WEIGHTS = []
for co in BASE:
    p = M @ co
    s, r = arc_and_radius(p)
    radial = 1.0 - smooth((r - R_IN) / (R_OUT - R_IN))
    WEIGHTS.append(
        (
            smooth((s - CMC_IN) / (CMC_OUT - CMC_IN)) * radial,
            smooth((s - IP_IN) / (IP_OUT - IP_IN)) * radial,
        )
    )
live = sum(1 for a, b in WEIGHTS if a > 0.02)
print(f"[parmak] deforme olan nokta: {live} / {len(BASE)}")

TIP = M @ BASE[min(range(len(BASE)), key=lambda i: ((M @ BASE[i]) - CENTER[-1]).length)]
TIP_W = WEIGHTS[min(range(len(BASE)), key=lambda i: ((M @ BASE[i]) - CENTER[-1]).length)]


def bend_point(p, w, th1, th2):
    """Önce orta eklemden, sonra kökten büker (ekran düzleminde, Y ekseni)."""
    R2 = Matrix.Rotation(math.radians(th2), 4, "Y")
    R1 = Matrix.Rotation(math.radians(th1), 4, "Y")
    q = IP0 + R2 @ (p - IP0) if w[1] > 1e-4 else p
    q = p.lerp(q, w[1])
    r = CMC + R1 @ (q - CMC)
    return q.lerp(r, w[0])


def tip_at(th1, th2):
    return bend_point(TIP, TIP_W, th1, th2)


def solve(target_stage):
    """Uç verilen sahne noktasına gitsin diye (th1, th2) çözer — sayısal Newton."""
    T = w2(*target_stage)
    th = [0.0, 0.0]
    for _ in range(40):
        p = tip_at(*th)
        err = Vector((T.x - p.x, 0.0, T.z - p.z))
        if err.length < 0.6:
            break
        J = []
        for k in range(2):
            d = [th[0], th[1]]
            d[k] += 0.5
            q = tip_at(*d)
            J.append(((q.x - p.x) / 0.5, (q.z - p.z) / 0.5))
        det = J[0][0] * J[1][1] - J[0][1] * J[1][0]
        if abs(det) < 1e-9:
            break
        dx, dz = err.x, err.z
        th[0] += (dx * J[1][1] - dz * J[1][0]) / det
        th[1] += (dz * J[0][0] - dx * J[0][1]) / det
        th[0] = max(-26.0, min(30.0, th[0]))
        th[1] = max(-112.0, min(12.0, th[1]))
    return th[0], th[1], (tip_at(*th) - T).length


# ── poz yolu ────────────────────────────────────────────────────────────────
# Hedefler SAĞDAN SOLA sıralı: uç geri dönmeden tek yönde tarıyor. Mesafeye
# göre sıralamak ucu ileri-geri zıplatıyordu (parmak seğiriyor gibi duruyor).
# y'deki 618↔718 salınımı doğal: alt menü ile buton sırası arasında geziniyor.
TARGETS_RAW = [
    (416, 718), (405, 618), (348, 718), (290, 699),
    (280, 674), (229, 618), (212, 718), (155, 618),
]

# Gerçek bir başparmak telefonu tutarken ekranın sol alt köşesine YETİŞEMEZ;
# zorlarsak parmak yatay uzanıp işaret parmağı gibi duruyor. Kökten uzaklığı
# rahat bölgeyle sınırlıyoruz: uzak hedeflerde parmak o yöne uzanıp bölgenin
# kenarında duruyor, hedefi ripple işaretlemeye devam ediyor.
D_MAX = 360.0
J = to_stage(CMC)


def clamp_reach(t):
    dx, dy = t[0] - J[0], t[1] - J[1]
    d = math.hypot(dx, dy)
    if d <= D_MAX:
        return t
    k = D_MAX / d
    return (J[0] + dx * k, J[1] + dy * k)


TARGETS = [clamp_reach(t) for t in TARGETS_RAW]
for a, b in zip(TARGETS_RAW, TARGETS):
    if a != b:
        print(f"[parmak] erişim sınırı: {a} → ({b[0]:.0f},{b[1]:.0f})")
# Anahtar kareler: dinlenme + her hedef için bir IK çözümü. Aradaki kareler
# POZ UZAYINDA yumuşatılarak üretiliyor. Uç uzayında eğri geçirip en yakın
# kareyi aramak, erişim sınırı yüzünden üst üste binen hedeflerde kare
# eşlemesini geri sıçratıyordu (… 12, 18, 16, 20 …).
KEYS = [solve(to_stage(CENTER[-1]))[:2]] + [solve(t)[:2] for t in TARGETS]
frame_for = [round(k * (FRAMES - 1) / (len(KEYS) - 1)) for k in range(1, len(KEYS))]
key_frame = [0] + frame_for

poses, tips = [], []
for i in range(FRAMES):
    seg = max(j for j in range(len(key_frame)) if key_frame[j] <= i)
    if seg >= len(KEYS) - 1:
        t1, t2 = KEYS[-1]
    else:
        a, b = KEYS[seg], KEYS[seg + 1]
        span = key_frame[seg + 1] - key_frame[seg]
        u = smooth((i - key_frame[seg]) / span) if span else 0.0
        t1 = a[0] + (b[0] - a[0]) * u
        t2 = a[1] + (b[1] - a[1]) * u
    poses.append((t1, t2))
    tips.append(to_stage(tip_at(t1, t2)))

print("[parmak] pozlar (θ1, θ2, uç):")
for i, ((a, b), t) in enumerate(zip(poses, tips)):
    mark = " ←" if i in frame_for else ""
    print(f"   {i:2d}  θ1={a:+6.1f}  θ2={b:+6.1f}  uç=({t[0]:5.0f},{t[1]:5.0f}){mark}")
print("[parmak] hedef → kare:", frame_for)


def apply_pose(th1, th2):
    for i, v in enumerate(ob.data.vertices):
        w = WEIGHTS[i]
        if w[0] < 1e-4 and w[1] < 1e-4:
            v.co = BASE[i]
            continue
        v.co = Mi @ bend_point(M @ BASE[i], w, th1, th2)
    ob.data.update()


scene = bpy.context.scene
scene.cycles.samples = SAMPLES
for i, (t1, t2) in enumerate([] if SAMPLES == 0 else poses):
    apply_pose(t1, t2)
    scene.render.filepath = os.path.join(RAW, f"f{i:02d}")
    bpy.ops.render.render(write_still=True)

meta = {
    "frames": FRAMES,
    "poses": poses,
    "tips": tips,
    "frameForTarget": frame_for,
    "targets": TARGETS,
    "raw": RAW,
}
with open(os.path.join(RAW, "meta.json"), "w") as f:
    json.dump(meta, f)
print("[parmak] render bitti →", RAW)
