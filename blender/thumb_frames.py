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

import bmesh
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



def envf(name, default):
    v = os.environ.get(name)
    return float(v) if v is not None else default


# ── anatomi ─────────────────────────────────────────────────────────────────
# Baş parmak ÜÇ kemiktir: 1. metakarp ≈ 46 mm, proksimal falanks ≈ 31 mm, distal
# falanks ≈ 21 mm (toplam ≈ 98 mm). Merkez çizgisinin yayı 536 sahne birimi ve
# sahne ölçeği 5.44 birim/mm → 98.5 mm; oranlar birebir oturuyor, yani çizgi
# gerçekten CMC'den uca uzanıyor.
#
# Eklem açıklıkları (in vivo ortalamalar, J Hand Surg / Physiopedia):
#   CMC (eyer eklemi) : fleksiyon ~22°, ekstansiyon ~20°  (+ abdüksiyon ~51°,
#                       ortografik kamerada düzlem içine düşüyor)
#   MCP               : fleksiyon ~70°, hiperekstansiyon ~25°
#   IP                : fleksiyon ~80°, ekstansiyon ~15°
#
# ÖNEMLİ: eski sürüm iki uydurma pivotla, üstelik 180 birimlik (33 mm!) yumuşak
# geçişlerle büküyordu — kemik diye bir şey yoktu, yüzey baştan sona kayıyordu
# ve parmak lastik hortuma dönüyordu. Şimdi üç KATI segment var, geçiş yalnız
# eklemin çevresindeki dar bantta; segment uzunlukları hiç değişmiyor.
SEG_MM = (46.0, 31.0, 21.0)
_TOT_MM = sum(SEG_MM)
S_MCP = TOTAL_ARC * SEG_MM[0] / _TOT_MM
S_IP = TOTAL_ARC * (SEG_MM[0] + SEG_MM[1]) / _TOT_MM
BAND = envf("JOINT_BAND", 26.0)      # eklem geçiş bandının yarısı (~5 mm)
# Kök geçişi bilerek DAR: mesh ikiye bölünürken (bkz. split_layers) sınırın
# hareketin sıfır olduğu yerden geçmesi gerekiyor, yoksa iki katman ayrışıp
# arada delik kalıyor. 60±40 → yayın 20..100 aralığında geçiyor (~15 mm).
S_BASE = envf("S_BASE", 60.0)
BASE_BAND = envf("BASE_BAND", 40.0)
R_IN, R_OUT = 78.0, 132.0            # merkez çizgiye uzaklık: içeride 1, dışarıda 0

# CMC bir EYER eklemi: fleksiyon ~22° ama abdüksiyon ~51° ve ikisi aynı anda
# olur (oppozisyon). Ortografik kamerada ikisi de aynı düzlem içi dönüşe
# düşüyor, o yüzden buradaki tek açı fleksiyon+abdüksiyon toplamını temsil eder.
LIM = [
    (-envf("CMC_EXT", 32.0), envf("CMC_FLEX", 52.0)),
    (-envf("MCP_EXT", 25.0), envf("MCP_FLEX", 80.0)),
    (-envf("IP_EXT", 15.0), envf("IP_FLEX", 85.0)),
]


def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def point_at_arc(s):
    """Merkez çizgisi üzerinde verilen yay uzunluğundaki nokta."""
    for i in range(len(ARC) - 1):
        if ARC[i + 1] >= s:
            u = (s - ARC[i]) / (ARC[i + 1] - ARC[i])
            return CENTER[i].lerp(CENTER[i + 1], u)
    return CENTER[-1]


JOINT = [point_at_arc(0.0), point_at_arc(S_MCP), point_at_arc(S_IP)]  # CMC, MCP, IP
print(f"[parmak] yay {TOTAL_ARC:.0f} ≈ {TOTAL_ARC/5.44:.0f} mm | eklemler "
      f"CMC {to_stage(JOINT[0])} MCP {to_stage(JOINT[1])} IP {to_stage(JOINT[2])}")


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

# Deri ağırlıkları: her nokta üç segmentten birine (ya da eklem bandında ikisine
# birden) bağlı. Toplamı 1'i geçmez; kalan pay avuçta kalır, yani kıpırdamaz.
WEIGHTS = []
for co in BASE:
    p = M @ co
    s, r = arc_and_radius(p)
    radial = 1.0 - smooth((r - R_IN) / (R_OUT - R_IN))
    g = radial * smooth((s - (S_BASE - BASE_BAND)) / (2 * BASE_BAND))
    a = smooth((s - (S_MCP - BAND)) / (2 * BAND))   # MCP'den sonra
    c = smooth((s - (S_IP - BAND)) / (2 * BAND))    # IP'den sonra
    WEIGHTS.append((g * (1 - a), g * (a - c), g * c))

live = sum(1 for w in WEIGHTS if sum(w) > 0.02)
print(f"[parmak] deforme olan nokta: {live} / {len(BASE)}")


def chain(th):
    """Üç eklemin hiyerarşik dönüşümü → (metakarp, proksimal, distal) matrisleri."""
    def about(pivot, deg):
        # Pozitif açı = FLEKSİYON (parmak avuca doğru kıvrılır). Sahnede el XZ
        # düzleminde durduğu için eksen Y; kıvrılma yönü eksi dönüş oluyor.
        return (Matrix.Translation(pivot)
                @ Matrix.Rotation(math.radians(-deg), 4, "Y")
                @ Matrix.Translation(-pivot))

    m1 = about(JOINT[0], th[0])
    m2 = about(m1 @ JOINT[1], th[1]) @ m1
    m3 = about(m2 @ JOINT[2], th[2]) @ m2
    return m1, m2, m3


def bend_point(p, w, mats):
    """Doğrusal karışım (LBS): segmentler katı, yalnız eklem bandında karışıyor."""
    rest = 1.0 - w[0] - w[1] - w[2]
    return (mats[0] @ p) * w[0] + (mats[1] @ p) * w[1] + (mats[2] @ p) * w[2] + p * rest


_tip_i = min(range(len(BASE)), key=lambda i: ((M @ BASE[i]) - CENTER[-1]).length)
TIP, TIP_W = M @ BASE[_tip_i], WEIGHTS[_tip_i]


def tip_at(th):
    return bend_point(TIP, TIP_W, chain(th))


def solve(target_stage, start=None):
    """Çoklu başlangıçla çöz: LM tek başına yerel çukura düşüyor.

    Tipik tuzak — çözücü bir önceki (kıvrık) pozdan başlayınca parmağı sonuna
    kadar kıvırıp orada takılıyor; oysa aynı hedefe parmağı DÜZELTİP kökten
    çevirerek de gidilebiliyor. Birkaç farklı duruştan başlatıp en iyisini
    alıyoruz.
    """
    seeds = [list(start) if start else [0.0, 0.0, 0.0], [0.0, 0.0, 0.0],
             [LIM[0][1] * 0.7, 10.0, 10.0], [LIM[0][1], 0.0, 0.0],
             [0.0, LIM[1][1] * 0.6, LIM[2][1] * 0.6], [LIM[0][0], 30.0, 30.0]]
    # Aynı noktaya birden çok duruşla gidilebiliyor. Hedefe varanlar arasından
    # DOĞAL olanı seçiyoruz: dokunurken baş parmak dümdüz açılmaz, kavisini
    # korur; ayrıca bir önceki kareye yakın kalsın ki kareler arası sıçramasın.
    NATURAL = (8.0, 45.0, 30.0)
    prev = list(start) if start else list(NATURAL)

    def posture_cost(th):
        return (sum((a - b) ** 2 for a, b in zip(th, NATURAL))
                + 0.6 * sum((a - b) ** 2 for a, b in zip(th, prev)))

    reached, fallback, fb_err = [], None, 1e18
    for sd in seeds:
        th, err = _solve_from(target_stage, sd)
        if err < 1.5:
            reached.append(th)
        if err < fb_err:
            fallback, fb_err = th, err
    if reached:
        best = min(reached, key=posture_cost)
        return best, math.hypot(*(a - b for a, b in zip(
            to_stage(tip_at(best)), target_stage)))
    return fallback, fb_err


def _solve_from(target_stage, start=None):
    """Uç verilen sahne noktasına gitsin diye üç eklemi çözer.

    Üç bilinmeyen, iki denklem: fazlalık serbestlik sönümlü en küçük karelerle
    (Levenberg-Marquardt) dağıtılıyor, çözüm de bir önceki pozdan başlatılıyor —
    böylece kareler arası poz sıçraması olmuyor.
    """
    T = w2(*target_stage)
    th = [max(lo, min(hi, v)) for v, (lo, hi) in zip(list(start or (6.0, 18.0, 24.0)), LIM)]
    lam = 6.0
    best, best_err = th[:], 1e18
    for _ in range(70):
        p = tip_at(th)
        ex, ez = T.x - p.x, T.z - p.z
        err = math.hypot(ex, ez)
        if err < best_err:
            best_err, best = err, th[:]
        if err < 0.6:
            break
        J = []
        for k in range(3):
            d = th[:]
            d[k] = max(LIM[k][0], min(LIM[k][1], d[k] + 0.6))
            step = d[k] - th[k]
            if abs(step) < 1e-6:
                J.append((0.0, 0.0))
                continue
            q = tip_at(d)
            J.append(((q.x - p.x) / step, (q.z - p.z) / step))
        A = [[sum(J[i][a] * J[j][a] for a in range(2)) + (lam if i == j else 0.0)
              for j in range(3)] for i in range(3)]
        b = [J[i][0] * ex + J[i][1] * ez for i in range(3)]
        for i in range(3):  # 3x3 Gauss
            piv = max(range(i, 3), key=lambda r: abs(A[r][i]))
            if abs(A[piv][i]) < 1e-9:
                lam *= 2.5
                break
            A[i], A[piv] = A[piv], A[i]
            b[i], b[piv] = b[piv], b[i]
            for r in range(i + 1, 3):
                f = A[r][i] / A[i][i]
                for c in range(i, 3):
                    A[r][c] -= f * A[i][c]
                b[r] -= f * b[i]
        else:
            dth = [0.0] * 3
            for i in range(2, -1, -1):
                acc = b[i] - sum(A[i][c] * dth[c] for c in range(i + 1, 3))
                dth[i] = acc / A[i][i] if abs(A[i][i]) > 1e-9 else 0.0
            th = [max(lo, min(hi, th[k] + dth[k])) for k, (lo, hi) in enumerate(LIM)]
            lam = max(0.4, lam * 0.7)
    return best, best_err


# ── poz yolu ────────────────────────────────────────────────────────────────
# Hedefler JOURNEY SIRASIYLA (src/lib/content.ts'teki `tap` alanları). Eskiden
# sağdan sola sıralıydı — parmak tek yönde tarasın diye — ama o zaman halka
# ekranın solunda belirirken parmak sağda kalıyordu; dokunuş sahte duruyordu.
# Sıra gerçek dokunma noktalarına bağlanınca parmak ileri geri gidiyor, ki
# gerçek kullanım da öyle.
TARGETS_RAW = [
    (212, 718),  # 02 Geçmiş
    (348, 718),  # 03 Hedefler
    (416, 718),  # 04 Profil
    (280, 674),  # 05 Öğün ekle
    (405, 618),  # 06 Yazarak anlat
    (290, 699),  # 07 Elle gir
    (229, 618),  # 08 Barkod
    (155, 618),  # 09 Fotoğraf
]


# Gerçek bir başparmak telefonu tutarken ekranın sol alt köşesine YETİŞEMEZ;
# zorlarsak parmak yatay uzanıp işaret parmağı gibi duruyor. İki kademe var:
# önce kökten uzaklığı rahat bölgeyle sınırlıyoruz (D_MAX), kalan açığı da
# ELİN kendisi kapatıyor (kavrama kayması) — gerçek kullanıcı da uzak köşeye
# uzanırken telefonu avucunda azıcık kaydırır.
SHIFT_MAX = envf("SHIFT_MAX", 92.0)
J = to_stage(JOINT[0])  # baş parmağın kök eklemi


def solve_with_shift(target, start):
    """Önce parmakla dene; yetişemediği kadarını ELİN kaymasıyla kapat.

    Gerçek bir sağ baş parmak, telefonu tutarken ekranın sol alt köşesine
    yetişemez — kimse yetişemez, herkes telefonu avucunda kaydırır. Eklem
    sınırları artık anatomik olduğu için bu sınır kendiliğinden ortaya çıkıyor;
    artakalan hatayı ele devrediyoruz.
    """
    sh = [0.0, 0.0]
    th, err = solve(target, start)
    for _ in range(5):
        if err < 1.5:
            break
        tip = tip_at(th)
        p = to_stage(tip)
        rx, ry = target[0] - p[0] - sh[0], target[1] - p[1] - sh[1]
        sh = [max(-SHIFT_MAX, min(SHIFT_MAX, sh[0] + rx)),
              max(-SHIFT_MAX, min(SHIFT_MAX, sh[1] + ry))]
        th, err = solve((target[0] - sh[0], target[1] - sh[1]), th)
    return th, tuple(sh), err


# Dokunuşun ritmi pozlara gömülü: her hedef için ÜÇ anahtar kare —
#   havada : uç hedefin biraz gerisinde (parmak camdan kalkmış gibi toplanır)
#   temas  : uç tam hedefte
#   bastır : uç birkaç birim öteye iter, parmak cama yaslanır
# Ortografik kamerada derinlik görünmediği için "kalkma" ancak parmağın
# toplanmasıyla anlatılabiliyor; aradaki kareler bunu sürekli hâle getiriyor.
AIR = envf("AIR", 46.0)
PRESS = envf("PRESS", 13.0)


def along(t, sh, amount):
    """Hedefi, kökten hedefe giden doğrultuda `amount` kadar ötele."""
    dx, dy = t[0] + sh[0] - J[0], t[1] + sh[1] - J[1]
    d = math.hypot(dx, dy) or 1.0
    return (t[0] + dx / d * amount, t[1] + dy / d * amount)


KEYS = [[0.0, 0.0, 0.0]]  # dinlenme = modelin kendi yontulmuş duruşu
SHIFTS = [(0.0, 0.0)]
air_key, touch_key, press_key = [], [], []
for t_raw in TARGETS_RAW:
    th, sh, err = solve_with_shift(t_raw, KEYS[-1])
    if abs(sh[0]) + abs(sh[1]) > 1.0 or err > 1.5:
        print(f"[parmak] {t_raw}: parmak tek başına yetişmiyor → el kayması "
              f"({sh[0]:+.0f},{sh[1]:+.0f}), kalan sapma {err:.0f}")
    for amount, bucket in ((-AIR, air_key), (0.0, touch_key), (PRESS, press_key)):
        tgt = along(t_raw, (0.0, 0.0), amount)
        KEYS.append(solve((tgt[0] - sh[0], tgt[1] - sh[1]), KEYS[-1])[0])
        SHIFTS.append(sh)
        bucket.append(len(KEYS) - 1)

# Kare dağılımı: havaya kalkma/gitme uzun, temas kısa, bastırma bir kare.
# Eşit dağıtmak bastırmayı da uzatıyor, dokunuş tokat gibi duruyordu.
GO, LAND, PUSH = 3, 2, 1
key_frame = [0]
for k in range(len(TARGETS_RAW)):
    key_frame.append(key_frame[-1] + GO)    # havada
    key_frame.append(key_frame[-1] + LAND)  # temas
    key_frame.append(key_frame[-1] + PUSH)  # bastırma
FRAMES = key_frame[-1] + 1

poses, tips, shifts = [], [], []
for i in range(FRAMES):
    seg = max(j for j in range(len(key_frame)) if key_frame[j] <= i)
    if seg >= len(KEYS) - 1:
        th, sh = KEYS[-1], SHIFTS[-1]
    else:
        a, b = KEYS[seg], KEYS[seg + 1]
        sa, sb = SHIFTS[seg], SHIFTS[seg + 1]
        span = key_frame[seg + 1] - key_frame[seg]
        u = smooth((i - key_frame[seg]) / span) if span else 0.0
        th = [x + (y - x) * u for x, y in zip(a, b)]
        sh = (sa[0] + (sb[0] - sa[0]) * u, sa[1] + (sb[1] - sa[1]) * u)
    poses.append(list(th))
    shifts.append(sh)
    p = tip_at(th)
    tips.append((to_stage(p)[0] + sh[0], to_stage(p)[1] + sh[1]))

frame_for = [key_frame[k] for k in touch_key]
press_for = [key_frame[k] for k in press_key]

print(f"[parmak] {FRAMES} kare — hedef başına havada {GO} + temas {LAND} + bastırma {PUSH}")
print("[parmak] pozlar (CMC, MCP, IP, uç):")
for i, (th, t) in enumerate(zip(poses, tips)):
    mark = " ← temas" if i in frame_for else (" ← bas" if i in press_for else "")
    print(f"   {i:2d}  CMC={th[0]:+6.1f}  MCP={th[1]:+6.1f}  IP={th[2]:+6.1f}  "
          f"uç=({t[0]:5.0f},{t[1]:5.0f}){mark}")
for k, t in enumerate(TARGETS_RAW):
    got = tips[frame_for[k]]
    print(f"[parmak] hedef {k + 1}: ({t[0]},{t[1]}) → ({got[0]:.0f},{got[1]:.0f})  sapma {math.hypot(t[0]-got[0], t[1]-got[1]):.0f}")
print("[parmak] hedef → kare:", frame_for, " bastırma:", press_for)


# ── sprite kırpma kutusu ────────────────────────────────────────────────────
# Sheet yalnız başparmağın gezindiği pencereyi taşır; kalanı taban görselden
# gelir. Kutu, deforme olan TÜM noktaların bütün pozlardaki yayılımını
# kapsamalı — enerji tabanlı kırpma yalnız en çok değişen yeri buluyor ve
# parmağın kökü dışarıda kalınca görsel ikiye bölünmüş gibi duruyor. Eskiden
# bu kutu elle yazılıydı; poz aralığı değişince sessizce yanlış kalıyordu.
def thumb_box(pad=26.0):
    xs, ys = [], []
    live = [i for i, w in enumerate(WEIGHTS) if sum(w) > 1e-3]
    world = [M @ BASE[i] for i in live]
    for th in poses:
        mats = chain(th)
        for i, p in zip(live, world):
            sx, sy = to_stage(bend_point(p, WEIGHTS[i], mats))
            xs.append(sx)
            ys.append(sy)
    return (
        max(0.0, min(xs) - pad), max(0.0, min(ys) - pad),
        min(STAGE_W, max(xs) + pad), min(FRAME_H, max(ys) + pad),
    )


BOX = thumb_box()
print(f"[parmak] sprite kutusu (sahne): {tuple(round(v) for v in BOX)}")


# ── iki katman ──────────────────────────────────────────────────────────────
# Taban görsel baş parmağı İÇERMEZ. İçerirse sprite yeni pozu çizerken tabandaki
# dinlenme pozu altından görünüyor ve el altı parmaklı gibi duruyor — kullanıcı
# bunu "6 parmaklı gibi" diye tarif etti, aynen öyleydi. Bu yüzden mesh ağırlığa
# göre ikiye bölünüyor: avuç bir kez, baş parmak kare kare render ediliyor.
# İki mesh GENİŞ bir bantta örtüşür (W_THUMB..W_PALM): dar tutulunca hiçbir yüz
# iki tarafta birden kalmıyor ve arada bir yüz genişliğinde delik açılıyordu.
# Örtüşen bantta baş parmak katmanı üstte olduğu için tabandaki duruş görünmez;
# bant da kök geçişi dar tutulduğu için mekânda yalnız birkaç mm.
def cull_backfaces(obj):
    """Arka yüzleri saydam yapar.

    Mesh ikiye bölününce her iki katmanda da AÇIK bir kenar kalıyor ve orada
    mesh'in İÇİ görünüyor: ışık almadığı için elin sırtında koyu, tırtıklı bir
    leke çıkıyordu. Arka yüzler saydam olunca kesik kenar hiçbir şey çizmiyor,
    altındaki/üstündeki katman görünüyor ve dikiş kayboluyor.
    """
    mat = obj.data.materials[0].copy()
    mat.name = obj.data.materials[0].name + "_nb"
    obj.data.materials[0] = mat
    nt = mat.node_tree
    out_node = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
    shader = out_node.inputs["Surface"].links[0].from_node
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(geo.outputs["Backfacing"], mix.inputs["Fac"])
    nt.links.new(shader.outputs[0], mix.inputs[1])
    nt.links.new(tr.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out_node.inputs["Surface"])


W_THUMB = envf("W_THUMB", 0.03)   # bu ağırlığın üstü baş parmak katmanına girer
W_PALM = envf("W_PALM", 0.45)     # bu ağırlığın altı avuç katmanında kalır


def split_layers():
    dup = ob.copy()
    dup.data = ob.data.copy()
    dup.name = "thumb_layer"
    bpy.context.scene.collection.objects.link(dup)

    bm = bmesh.new()
    bm.from_mesh(dup.data)
    bm.verts.ensure_lookup_table()
    lay = bm.verts.layers.int.new("orig")
    for v in bm.verts:
        v[lay] = v.index
    # Ağırlık alanı yarıçap sınırında sıçrıyor (bir nokta 0, komşusu 0.9), bu
    # yüzden o yüzler iki katmandan da düşüp arada üçgen delikler bırakıyordu.
    # Baş parmak kümesini birkaç kenar halkası büyütüyoruz: eklenen noktalar
    # kıpırdamıyor, avuçtakiyle birebir çakışıyor, sadece deliği kapatıyor.
    keep = {v.index for v in bm.verts if sum(WEIGHTS[v.index]) >= W_THUMB}
    for _ in range(int(envf("GROW", 2))):
        ring = set()
        for e in bm.edges:
            a, b = e.verts[0].index, e.verts[1].index
            if a in keep:
                ring.add(b)
            if b in keep:
                ring.add(a)
        keep |= ring
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.index not in keep],
                     context="VERTS")
    bm.to_mesh(dup.data)
    bm.free()
    orig = [a.value for a in dup.data.attributes["orig"].data]

    cull_backfaces(dup)
    cull_backfaces(ob)

    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bm.verts.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if sum(WEIGHTS[v.index]) >= W_PALM],
                     context="VERTS")
    bm.to_mesh(ob.data)
    bm.free()
    print(f"[parmak] katmanlar: avuç {len(ob.data.vertices)} nokta, "
          f"baş parmak {len(dup.data.vertices)} nokta")
    return dup, orig


def apply_pose(dup, orig, th):
    mats = chain(th)
    for j, v in enumerate(dup.data.vertices):
        i = orig[j]
        v.co = Mi @ bend_point(M @ BASE[i], WEIGHTS[i], mats)
    dup.data.update()


def set_border(b=None):
    if b is None:
        scene.render.use_border = False
        return
    scene.render.use_border = True
    scene.render.use_crop_to_border = False
    scene.render.border_min_x = b[0] / STAGE_W
    scene.render.border_max_x = b[2] / STAGE_W
    scene.render.border_min_y = 1.0 - b[3] / FRAME_H
    scene.render.border_max_y = 1.0 - b[1] / FRAME_H


scene = bpy.context.scene
scene.cycles.samples = SAMPLES

# ── ışık: elin sırtı daha belirgin okusun ───────────────────────────────────
# Dolgu ışığı çok güçlüydü, elin arkasını dümdüz yıkayıp formu siliyordu.
# Kısıp kenar ışığını güçlendirmek boğumları ve siluetin kavisini ortaya
# çıkarıyor.
for _l in bpy.data.objects:
    if _l.type == "LIGHT":
        if _l.name == "fill":
            _l.data.energy *= envf("FILL", 0.75)
        elif _l.name == "rim":
            _l.data.energy *= envf("RIM", 2.2)
        elif _l.name == "key":
            _l.data.energy *= envf("KEY", 1.25)

# Elin sırtı (kadrajın sağ altındaki kütle) hiçbir ışığa denk gelmiyordu, koyu
# ve düz kalıp arka plana karışıyordu. Sağ alt önden yumuşak bir ışık ekliyoruz:
# boğumların kavisini ve siluetin kenarını ortaya çıkarıyor.
_bd = bpy.data.lights.new("back", "POINT")
_bd.energy = envf("BACK", 8.0e6)
_bd.shadow_soft_size = 300.0
_bd.color = (1.0, 0.93, 0.86)
_bo = bpy.data.objects.new("back", _bd)
_bo.location = (env3 := (470.0, -320.0, -520.0))
bpy.context.scene.collection.objects.link(_bo)

if SAMPLES > 0:
    thumb_ob, ORIG = split_layers()

    # 1) taban: yalnız avuç ve parmaklar (baş parmak yok), tam kadraj
    thumb_ob.hide_render = True
    set_border(None)
    scene.render.filepath = os.path.join(RAW, "base")
    bpy.ops.render.render(write_still=True)
    print("[parmak] taban render edildi (baş parmaksız)")

    # 2) baş parmak kareleri: yalnız başparmak katmanı, hareket kutusunda
    thumb_ob.hide_render = False
    ob.visible_camera = False          # gölge/GI için sahnede kalır
    ONLY = {int(v) for v in os.environ.get("ONLY", "").split(",") if v.strip()}
    set_border(BOX)
    for i, th in enumerate(poses):
        if ONLY and i not in ONLY:
            continue
        apply_pose(thumb_ob, ORIG, th)
        scene.render.filepath = os.path.join(RAW, f"t{i:02d}")
        bpy.ops.render.render(write_still=True)
    print(f"[parmak] {len(poses)} kare render edildi")

meta = {
    "frames": FRAMES,
    "poses": poses,
    "tips": tips,
    "frameForTarget": frame_for,
    "pressForTarget": press_for,
    "handShift": shifts,
    "targets": TARGETS_RAW,
    "box": BOX,
    "raw": RAW,
}
with open(os.path.join(RAW, "meta.json"), "w") as f:
    json.dump(meta, f)
print("[parmak] render bitti →", RAW)
