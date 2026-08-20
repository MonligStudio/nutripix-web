"""
NutriPix — rigli el modelini sahneye yerleştirir ve baş parmak poz dizisini render eder.

Girdi : blender/hand_rigged.blend  (21 kemikli el rigi; eklem limitleri modelin kendisinde)
Çıktı : $RAW_DIR/base.webp  → avuç + parmaklar (telefon holdout ile kesilmiş taban görsel)
        $RAW_DIR/t00..tNN.webp + meta.json  → yalnız baş parmak, kare kare
        blender/pack_thumb.py bunları model.webp + thumb-sheet.webp'ye çevirir.

İKİ KATMAN — bu betiğin can alıcı noktası. Telefon avuçla başparmak ARASINDA
durur: avuç arkada (telefon onu kesmeli), başparmak camın üstünde (kesilmemeli).
Tek render'da bunu holdout ile yapmak mümkün değil, çünkü holdout derinliğe
bakar ve modelin başparmağı avuçla aynı düzlemdedir. Bu yüzden mesh ağırlığa
göre ikiye bölünüp iki ayrı render alınıyor; sitede taban görselin üstüne
başparmak sprite'ı seriliyor. Kamera ORTOGRAFİK olduğu için derinlik görüntüyü
kaydırmaz — başparmak zaten olması gereken yere düşer, hiçbir şey esnetilmez.
(Eskiden başparmak zinciri kamera yönünde öteleniyordu; tenar yastığı ekranın
alt şeridini kapatıyor, gerilen normaller de kesme sınırında kızıl bir dikiş
bırakıyordu.)

Sahne koordinatları src/lib/stage.ts ile ORTAK: 620x1000 sahne, el kadrajı
620x1220 (kol aşağıdan taşsın diye).

Baş parmak dizisi her hedef için iki poz taşır: dokunma ve bastırma (uç birkaç
birim daha ileri iter). Parmağın tek başına yetişemediği köşelerde artakalan
hata ELE devredilir — `handShift` alanı, sitede el katmanının o kare için ne
kadar öteleneceğini söyler. Gerçek kullanıcı da uzak köşeye uzanırken elini
kaydırır.

Çalıştırma:
  Blender --background blender/hand_rigged.blend --python blender/hand_rig.py -- \
      [samples] [frames] [debug]
"""

import json
import math
import os
import sys

import bmesh
import bpy
from mathutils import Euler, Matrix, Quaternion, Vector

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
SAMPLES = int(argv[0]) if len(argv) > 0 else 64
FRAMES = int(argv[1]) if len(argv) > 1 else 40
DEBUG = len(argv) > 2 and argv[2] == "debug"

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.environ.get("RAW_DIR", "/tmp/nutripix_thumb")
os.makedirs(RAW, exist_ok=True)

# ── sahne koordinat sistemi (stage.ts ile aynı) ─────────────────────────────
STAGE_W, STAGE_H, FRAME_H = 620.0, 1000.0, 1220.0
PHONE = dict(x=86.0, y=24.8, w=388.0, h=780.4)
SCREEN = dict(x=98.0, y=36.8, w=364.0, h=756.4)
FRONT = -12.0  # holdout kutusunun ön yüzü: bundan öndeki her şey görünür kalır

wx = lambda sx: sx - STAGE_W / 2  # noqa: E731
wz = lambda sy: STAGE_H / 2 - sy  # noqa: E731
to_stage = lambda p: (p.x + STAGE_W / 2, STAGE_H / 2 - p.z)  # noqa: E731


def scr(fx, fy):
    """Ekran yüzdesi (journey tap'leri) → sahne koordinatı."""
    return (SCREEN["x"] + fx * SCREEN["w"], SCREEN["y"] + fy * SCREEN["h"])


# Journey adımlarının dokunma noktaları — src/lib/content.ts ile AYNI SIRADA.
# frameForTarget bu sırayla yazılır, Journey.tsx adım i için [i-1]'i okur.
TAPS = [
    (0.313, 0.900),  # 02 Geçmiş
    (0.687, 0.900),  # 03 Hedefler
    (0.874, 0.900),  # 04 Profil
    (0.500, 0.843),  # 05 Öğün ekle
    (0.810, 0.786),  # 06 Yazarak anlat (ikonun sol kenarı — baş parmak tam köşeye yetişmiyor)
    (0.528, 0.875),  # 07 Elle gir
    (0.359, 0.768),  # 08 Barkod
    (0.156, 0.768),  # 09 Fotoğraf
]

# ── yerleşim ayarları ───────────────────────────────────────────────────────
def env(name, default):
    """Yerleşimi denerken kod düzenlemeden geçmek için: HAND_SPIN=... gibi."""
    v = os.environ.get(name)
    return float(v) if v is not None else default


SCALE = env("HAND_SCALE", 48.0)    # 1 blender birimi = kaç sahne birimi (el ~19 birim ≈ 18 cm)
MIRROR = env("HAND_MIRROR", 1) > 0  # sağ eli aynala → başparmak sağ tarafta kalsın
SPIN = env("HAND_SPIN", -65.0)     # kamera eksenindeki dönüş: parmaklar sola baksın
PITCH = env("HAND_PITCH", -15.0)    # öne/arkaya yatırma
YAW = env("HAND_YAW", 14.0)        # dikey eksende çevirme (elin hafif profili)
# başparmağın kök eklemi (CMC) hangi sahne noktasına otursun
CMC_STAGE = (env("HAND_CMC_X", 500.0), env("HAND_CMC_Y", 720.0))
ANCHOR_Y = env("HAND_AZ", 200.0)    # kamera ekseninde derinlik: avuç telefonun arkasında

# parmak kıvrımları (yerel Z, derece) — rig'in kendi limitleri zaten kısıtlıyor
K = env("HAND_CURL", 0.6)  # tüm kıvrımları topluca ölçekler
CURL = {
    "index": (14 * K, 58 * K, 70 * K, 30 * K),
    "midd": (8 * K, 66 * K, 78 * K, 34 * K),
    "ring": (6 * K, 72 * K, 82 * K, 36 * K),
    "pinky": (10 * K, 78 * K, 86 * K, 40 * K),
}

rig = bpy.data.objects["Rig"]
hand = bpy.data.objects["Hand"]
nails = bpy.data.objects["Nails"]
scene = bpy.context.scene

# ── 1) rigi sahneye yerleştir ───────────────────────────────────────────────
q = Quaternion((0, 1, 0), math.radians(SPIN))
q = Quaternion((1, 0, 0), math.radians(PITCH)) @ q
q = Quaternion((0, 0, 1), math.radians(YAW)) @ q

rig.rotation_mode = "QUATERNION"
rig.rotation_quaternion = q
rig.scale = (-SCALE if MIRROR else SCALE, SCALE, SCALE)
bpy.context.view_layer.update()

# Kompozisyonun çıpası BAŞPARMAK KÖKÜ (CMC): telefonun sağ alt köşesinin biraz
# dışında dursun ki tenar yastığı camın üstüne taşmasın, başparmak da telefonun
# kenarından çıkıyormuş gibi görünsün. Bilekten çıpalamak ölçek/dönüş her
# değiştiğinde kompozisyonu bozuyordu.
anchor_local = rig.data.bones["radius_ulna"].tail_local
rig.location = Vector((0.0, ANCHOR_Y, 0.0))
bpy.context.view_layer.update()
_cmc = to_stage(rig.matrix_world @ rig.pose.bones["thumb_meta"].head)
rig.location += Vector((CMC_STAGE[0] - _cmc[0], 0.0, -(CMC_STAGE[1] - _cmc[1])))
bpy.context.view_layer.update()
print(f"[el] ölçek {SCALE}  başparmak kökü çıpası {CMC_STAGE}  "
      f"bilek → {tuple(round(v, 1) for v in (rig.matrix_world @ anchor_local))}")

# ── 2a) el iki katmana ayrılır: "avuç" ve "baş parmak" ──────────────────────
# Telefon avuçla başparmak ARASINDA durur; başparmak camın üstünde olmalı.
# Eskiden başparmak zinciri kamera yönünde öteleniyordu ki holdout onu kesmesin
# — ama ağırlık karışımı yüzünden tenar yastığı da öne geliyor, ekranın alt
# şeridini deri kapatıyor ve gerilen normaller kesme sınırında kızıl bir dikiş
# bırakıyordu. Bunun yerine mesh ağırlığa göre İKİ NESNEYE bölünüyor:
#
#   Hand_palm  → holdout AÇIK render edilir (taban görsel): telefonun arkasında
#                kalan avuç silinir, kenardan sarkan parmak uçları kalır.
#   Hand_thumb → holdout KAPALI, tek başına render edilir (kare dizisi): kesme
#                yok, gerilme yok. Kamera ortografik olduğu için derinlik
#                görüntüyü kaydırmaz; başparmak zaten camın üstünde durması
#                gereken yere düşer.
#
# İki render aynı sahne/ışıktan geldiği için üst üste bindiklerinde (telefonun
# dışında kalan tenar bölgesi) pikseller birebir aynı olur, dikiş görünmez.
THUMB_SPLIT = env("TH_SPLIT", 0.45)  # bu ağırlığın üstü başparmak katmanına gider
THUMB_BONES = ("thumb_trapez", "thumb_meta", "thumb_prox", "thumb_dist")


def thumb_weight(obj, v):
    idx = {obj.vertex_groups[n].index for n in THUMB_BONES if n in obj.vertex_groups}
    return sum(g.weight for g in v.groups if g.group in idx)


def split_thumb(obj):
    """Nesneyi (avuç, başparmak) ikilisine böler; başparmak payı yoksa (obj, None)."""
    if not any(n in obj.vertex_groups for n in THUMB_BONES):
        return obj, None
    dup = obj.copy()
    dup.data = obj.data.copy()
    dup.name = obj.name + "_thumb"
    bpy.context.scene.collection.objects.link(dup)
    # Sınır bandı iki katmanda da dursun: paylı (0.15–0.45) noktalar avuçta da
    # başparmakta da kalır, aralarında boşluk açılmaz.
    bm = bmesh.new()
    bm.from_mesh(dup.data)
    bm.verts.ensure_lookup_table()
    drop = [bv for bv in bm.verts if thumb_weight(obj, obj.data.vertices[bv.index]) < 0.15]
    bmesh.ops.delete(bm, geom=drop, context="VERTS")
    bm.to_mesh(dup.data)
    bm.free()

    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.verts.ensure_lookup_table()
    drop = [bv for bv in bm.verts if thumb_weight(obj, obj.data.vertices[bv.index]) >= THUMB_SPLIT]
    keep_ids = {bv.index for bv in bm.verts} - {bv.index for bv in drop}
    bmesh.ops.delete(bm, geom=drop, context="VERTS")
    bm.to_mesh(obj.data)
    bm.free()
    print(f"[el] {obj.name}: {len(keep_ids)} nokta avuçta, {len(dup.data.vertices)} nokta başparmakta")
    return obj, dup

# ── 2) baş parmağın kök kısıtını sustur ─────────────────────────────────────
# thumb_trapez, midd_meta'dan rotasyon kopyalıyor; parmakları büktüğümüzde
# başparmağın kökü de kayıyor ve poz çözümü kaçıyor.
for c in rig.pose.bones["thumb_trapez"].constraints:
    if c.type == "COPY_ROTATION":
        c.mute = True

# ── 3) parmakları telefonun etrafına kapat ──────────────────────────────────
def bend(name, deg):
    pb = rig.pose.bones[name]
    pb.rotation_mode = "XYZ"
    pb.rotation_euler.z = math.radians(deg)


for finger, (meta, prox, midd, dist) in CURL.items():
    bend(f"{finger}_meta", meta)
    bend(f"{finger}_prox", prox)
    bend(f"{finger}_midd", midd)
    bend(f"{finger}_dist", dist)

# başparmak dinlenme duruşu (frame 0 tabanı buradan çıkar)
THUMB_REST = (env("TH_MZ", 45.0), env("TH_MX", 10.0), env("TH_PZ", 60.0), env("TH_DZ", 45.0))  # meta.z, meta.x, prox.z, dist.z


def set_thumb(meta_z, meta_x, prox_z, dist_z):
    m = rig.pose.bones["thumb_meta"]
    m.rotation_mode = "XYZ"
    m.rotation_euler.z = math.radians(meta_z)
    m.rotation_euler.x = math.radians(meta_x)
    p = rig.pose.bones["thumb_prox"]
    p.rotation_mode = "XYZ"
    p.rotation_euler.z = math.radians(prox_z)
    d = rig.pose.bones["thumb_dist"]
    d.rotation_mode = "XYZ"
    d.rotation_euler.z = math.radians(dist_z)


set_thumb(*THUMB_REST)
bpy.context.view_layer.update()

deps = bpy.context.evaluated_depsgraph_get()


def thumb_tip():
    """Kısıtlar uygulandıktan sonraki uç konumu (sahne birimi)."""
    deps.update()
    ev = rig.evaluated_get(deps)
    return to_stage(ev.matrix_world @ ev.pose.bones["thumb_dist"].tail)


deps.update()
_ev = rig.evaluated_get(deps)
print(f"[el] başparmak kökü: {tuple(round(v) for v in to_stage(_ev.matrix_world @ _ev.pose.bones['thumb_meta'].head))}"
      f"  boğum(MCP): {tuple(round(v) for v in to_stage(_ev.matrix_world @ _ev.pose.bones['thumb_meta'].tail))}")
print(f"[el] başparmak dinlenme ucu: {tuple(round(v) for v in thumb_tip())}")
def depth_report():
    """Telefonun önünde/arkasında ne var: holdout doğru kessin diye ölçüyoruz."""
    d = bpy.context.evaluated_depsgraph_get()
    d.update()
    eh = hand.evaluated_get(d)
    m = eh.matrix_world
    thumb_groups = {hand.vertex_groups[n].index for n in ("thumb_trapez", "thumb_meta", "thumb_prox", "thumb_dist")}
    thumb_front, thumb_back, over_x, n_over = 1e9, -1e9, [], 0
    for v in eh.data.vertices:
        p = m @ v.co
        sx, sy = to_stage(p)
        inside = PHONE["x"] < sx < PHONE["x"] + PHONE["w"] and PHONE["y"] < sy < PHONE["y"] + PHONE["h"]
        is_thumb = any(g.group in thumb_groups and g.weight > 0.2 for g in v.groups)
        if is_thumb:
            thumb_front = min(thumb_front, p.y)
            if inside:
                thumb_back = max(thumb_back, p.y)
        elif inside and p.y < FRONT:
            over_x.append(sx)
            n_over += 1
    return thumb_front, thumb_back, (min(over_x), max(over_x)) if over_x else None, n_over


def silhouette():
    """Elin kapladığı kutu + telefonun dışında kalan deri: kompozisyon ölçüsü."""
    d = bpy.context.evaluated_depsgraph_get()
    d.update()
    eh = hand.evaluated_get(d)
    m = eh.matrix_world
    xs, ys, out_below, out_left, out_right = [], [], 0, 0, 0
    for v in eh.data.vertices:
        sx, sy = to_stage(m @ v.co)
        xs.append(sx)
        ys.append(sy)
        if sy > PHONE["y"] + PHONE["h"]:
            out_below += 1
        elif sx < PHONE["x"]:
            out_left += 1
        elif sx > PHONE["x"] + PHONE["w"]:
            out_right += 1
    return (min(xs), min(ys), max(xs), max(ys)), out_below, out_left, out_right


_bb, _ob, _ol, _orr = silhouette()
print(f"[el] kutu (sahne): x {_bb[0]:.0f}..{_bb[2]:.0f}  y {_bb[1]:.0f}..{_bb[3]:.0f}"
      f"   telefon: x {PHONE['x']:.0f}..{PHONE['x']+PHONE['w']:.0f}  y {PHONE['y']:.0f}..{PHONE['y']+PHONE['h']:.0f}")
print(f"[el] telefon dışında kalan nokta: alt {_ob}  sol {_ol}  sağ {_orr}")

_tf, _tb2, _ov, _n = depth_report()
print(f"[el] başparmak derinliği: ön {_tf:.0f} / ekran üstündeki en arka nokta {_tb2:.0f}  (ikisi de < {FRONT})")
print(f"[el] telefonun önüne taşan parmak: {_n} nokta  x aralığı {_ov}")

for f in ("index", "midd", "ring", "pinky"):
    deps.update()
    ev = rig.evaluated_get(deps)
    print(f"[el] {f} ucu: {tuple(round(v) for v in to_stage(ev.matrix_world @ ev.pose.bones[f + '_dist'].tail))}")

# ── 4) ışık, kamera, holdout ────────────────────────────────────────────────
for o in list(bpy.data.objects):
    if o.type in {"LIGHT", "CAMERA"}:
        bpy.data.objects.remove(o, do_unlink=True)


def bsdf(mat):
    return next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")


def set_in(node, key, value):
    if key in node.inputs:
        node.inputs[key].default_value = value


# Dokular blend'in yanında yok (TurboSquid paketi eksik) → prosedürel ten.
skin = bpy.data.materials.new("Skin")
skin.use_nodes = True
b = bsdf(skin)
set_in(b, "Base Color", (0.800, 0.505, 0.395, 1.0))
set_in(b, "Roughness", 0.52)
set_in(b, "Subsurface Weight", 0.30)
set_in(b, "Subsurface Scale", 5.0)
set_in(b, "Specular IOR Level", 0.34)
hand.data.materials.clear()
hand.data.materials.append(skin)

nail = bpy.data.materials.new("Nail")
nail.use_nodes = True
nb = bsdf(nail)
set_in(nb, "Base Color", (0.800, 0.560, 0.480, 1.0))
set_in(nb, "Roughness", 0.30)
set_in(nb, "Specular IOR Level", 0.55)
nails.data.materials.clear()
nails.data.materials.append(nail)

for ob in (hand, nails):
    for p in ob.data.polygons:
        p.use_smooth = True

world = bpy.data.worlds.new("W")
scene.world = world
world.use_nodes = True
next(n for n in world.node_tree.nodes if n.type == "BACKGROUND").inputs[0].default_value = (
    0.030, 0.034, 0.040, 1,
)


def area(name, loc, rot, size, energy, color):
    d = bpy.data.lights.new(name, "AREA")
    d.energy, d.color, d.size = energy, color, size
    o = bpy.data.objects.new(name, d)
    o.location, o.rotation_euler = loc, rot
    scene.collection.objects.link(o)


area("key", (-260, -300, 280), (math.radians(50), 0, math.radians(-40)), 700, 8.0e6, (1.0, 0.95, 0.90))
area("rim", (280, 120, 110), (math.radians(84), 0, math.radians(120)), 380, 1.4e6, (0.76, 0.87, 1.0))
area("fill", (110, -260, -240), (math.radians(-44), 0, math.radians(16)), 760, 2.4e6, (0.88, 0.93, 1.0))

# ekranın yeşil parıltısı — elin üzerine düşen renk
bpy.ops.mesh.primitive_plane_add(size=1)
glow = bpy.context.object
glow.name = "screen_glow"
glow.rotation_euler = (math.radians(90), 0, 0)
glow.scale = (SCREEN["w"] * 0.96, SCREEN["h"] * 0.96, 1)
glow.location = (wx(SCREEN["x"] + SCREEN["w"] / 2), -0.6, wz(SCREEN["y"] + SCREEN["h"] / 2))
gm = bpy.data.materials.new("Glow")
gm.use_nodes = True
gnt = gm.node_tree
gnt.nodes.remove(bsdf(gm))
em = gnt.nodes.new("ShaderNodeEmission")
em.inputs["Color"].default_value = (0.55, 0.95, 0.62, 1)
# Zayıf tutuluyor: baş parmak ayrı katman olarak render edildiği için (bkz. 2a)
# sahnede camın ARKASINDA duruyor ve güçlü bir emisyon onu neon yeşile boyuyor.
# Gerçekte ekran başparmağın gördüğümüz yüzünü değil, arkasını aydınlatır.
em.inputs["Strength"].default_value = env("GLOW", 0.35)
gnt.links.new(em.outputs[0], next(n for n in gnt.nodes if n.type == "OUTPUT_MATERIAL").inputs["Surface"])
glow.data.materials.append(gm)
glow.visible_camera = False
glow.visible_shadow = False

# telefonun tamamı holdout: arkada kalan avuç alfadan silinir
bpy.ops.mesh.primitive_cube_add(size=1)
hole = bpy.context.object
hole.name = "phone_holdout"
hole.scale = (PHONE["w"], 400.0, PHONE["h"])
hole.location = (
    wx(PHONE["x"] + PHONE["w"] / 2),
    FRONT + 200.0,
    wz(PHONE["y"] + PHONE["h"] / 2),
)
# Kutu YALNIZCA kamera ışınlarını keser: ışık/gölge/yansıma ışınlarına görünmez.
# Aksi halde 400 birim derinliğindeki kutu eli içine alıp karartıyor — üstelik
# başparmak ayrı render edilirken (holdout kapalı) bu karartma iki katman
# arasında renk farkına yol açıyordu.
for _flag in ("visible_shadow", "visible_diffuse", "visible_glossy",
              "visible_transmission", "visible_volume_scatter"):
    setattr(hole, _flag, False)
hole.is_holdout = not DEBUG
if DEBUG:
    # hata ayıklamada telefonu yarı saydam bir dikdörtgen olarak göster
    hole.scale = (PHONE["w"], 1.0, PHONE["h"])
    hole.location = (hole.location.x, FRONT, hole.location.z)
    dm = bpy.data.materials.new("DebugPhone")
    dm.use_nodes = True
    dnt = dm.node_tree
    dnt.nodes.remove(bsdf(dm))
    de = dnt.nodes.new("ShaderNodeEmission")
    de.inputs["Color"].default_value = (0.10, 0.35, 0.75, 1)
    de.inputs["Strength"].default_value = 0.8
    mix = dnt.nodes.new("ShaderNodeMixShader")
    tr = dnt.nodes.new("ShaderNodeBsdfTransparent")
    mix.inputs[0].default_value = 0.55
    dnt.links.new(tr.outputs[0], mix.inputs[1])
    dnt.links.new(de.outputs[0], mix.inputs[2])
    dnt.links.new(mix.outputs[0], next(n for n in dnt.nodes if n.type == "OUTPUT_MATERIAL").inputs["Surface"])
    hole.data.materials.append(dm)

cam_d = bpy.data.cameras.new("Cam")
cam_d.type = "ORTHO"
cam_d.sensor_fit = "HORIZONTAL"
cam_d.ortho_scale = STAGE_W
cam = bpy.data.objects.new("Cam", cam_d)
cam.location = (0, -900, (wz(0) + wz(FRAME_H)) / 2)
cam.rotation_euler = (math.radians(90), 0, 0)
scene.collection.objects.link(cam)
scene.camera = cam

# Modelin kendi kompozitör ağacı render'ı opak arka planla düzleştiriyor
# (çıktı RGB geliyor, sitede el görselinin saydam yerleri beyaz kalıyordu).
scene.render.use_compositing = False
try:
    scene.compositing_node_group = None
except AttributeError:
    scene.use_nodes = False

scene.render.engine = "CYCLES"
scene.render.resolution_x = int(STAGE_W) * (1 if DEBUG else 2)
scene.render.resolution_y = int(FRAME_H) * (1 if DEBUG else 2)
scene.render.film_transparent = not DEBUG
scene.render.image_settings.file_format = "WEBP"
scene.render.image_settings.color_mode = "RGBA"
scene.render.image_settings.quality = 90
scene.cycles.samples = SAMPLES
scene.cycles.use_adaptive_sampling = True
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 4
try:
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Base Contrast"
except Exception:
    pass

prefs = bpy.context.preferences.addons.get("cycles")
if prefs:
    try:
        prefs.preferences.compute_device_type = "METAL"
        prefs.preferences.get_devices()
        for d in prefs.preferences.devices:
            d.use = True
        scene.cycles.device = "GPU"
    except Exception:
        pass

if DEBUG:
    if SAMPLES > 0:
        scene.render.filepath = os.path.join(RAW, "debug")
        bpy.ops.render.render(write_still=True)
        print("[el] debug render →", scene.render.filepath + ".webp")
    sys.exit(0)


# ── 5) baş parmak IK: uç, dokunma noktasına gitsin ──────────────────────────
# Dört serbestlik (meta bükülme/açılma, prox, dist) ve iki denklem (x, y) var;
# sönümlü en küçük kareler (Levenberg-Marquardt) kullanıyoruz. Rig'in kendi
# LIMIT_ROTATION kısıtları pozu zaten anatomik aralıkta tutuyor, biz de
# parametreleri aynı aralıkta tutup Jacobian'ın bozulmasını engelliyoruz.
# Rig'in kendi LIMIT_ROTATION kısıtları zaten anatomik aralığı koruyor; buradaki
# aralık yalnız Jacobian'ı bozmasın diye geniş tutuluyor. Dar tutulduğunda
# çözüm sınıra yapışıp ekranın uzak köşelerine yetişemiyordu.
LIM = [(-30.0, 85.0), (-25.0, 60.0), (-30.0, 95.0), (-15.0, 95.0)]


def clamp_pose(th):
    return [max(lo, min(hi, v)) for v, (lo, hi) in zip(th, LIM)]


def tip_of(th):
    set_thumb(*th)
    return thumb_tip()


def solve(target, start):
    th = clamp_pose(list(start))
    lam = 8.0
    best, best_err = th[:], 1e18
    for _ in range(60):
        p = tip_of(th)
        ex, ey = target[0] - p[0], target[1] - p[1]
        err = math.hypot(ex, ey)
        if err < best_err:
            best_err, best = err, th[:]
        if err < 1.5:
            break
        # sayısal Jacobian (2x4)
        J = []
        for k in range(4):
            d = th[:]
            d[k] = max(LIM[k][0], min(LIM[k][1], d[k] + 0.75))
            step = d[k] - th[k]
            if abs(step) < 1e-6:
                J.append((0.0, 0.0))
                continue
            q = tip_of(d)
            J.append(((q[0] - p[0]) / step, (q[1] - p[1]) / step))
        # (JᵀJ + λI) δ = Jᵀe
        A = [[sum(J[i][a] * J[j][a] for a in range(2)) + (lam if i == j else 0.0)
              for j in range(4)] for i in range(4)]
        b = [J[i][0] * ex + J[i][1] * ey for i in range(4)]
        # 4x4 Gauss
        for i in range(4):
            piv = max(range(i, 4), key=lambda r: abs(A[r][i]))
            if abs(A[piv][i]) < 1e-9:
                break
            A[i], A[piv] = A[piv], A[i]
            b[i], b[piv] = b[piv], b[i]
            for r in range(i + 1, 4):
                f = A[r][i] / A[i][i]
                for c in range(i, 4):
                    A[r][c] -= f * A[i][c]
                b[r] -= f * b[i]
        else:
            d = [0.0] * 4
            for i in range(3, -1, -1):
                acc = b[i] - sum(A[i][c] * d[c] for c in range(i + 1, 4))
                d[i] = acc / A[i][i] if abs(A[i][i]) > 1e-9 else 0.0
            th = clamp_pose([th[k] + d[k] for k in range(4)])
            lam = max(0.5, lam * 0.7)
            continue
        lam *= 2.5
    return best, best_err


TARGETS = [scr(*t) for t in TAPS]
N_TAPS = len(TARGETS)

# Elin kavrama kayması: baş parmak tek başına ekranın her köşesine yetişemez —
# gerçek kullanıcı da yetişemez, eli azıcık kaydırır. Çözücü artakalan hatayı
# ele devrediyor; bu kayma JSON'a yazılıyor ve sitede el katmanı o kadar
# ötelendiği için uç yine hedefin tam üstüne düşüyor.
SHIFT_MAX = env("HAND_SHIFT_MAX", 100.0)


def mcp_of(th):
    """Baş parmağın boğumu (prox kemiğinin başı) — bastırma yönünü buradan alıyoruz."""
    set_thumb(*th)
    deps.update()
    ev = rig.evaluated_get(deps)
    return to_stage(ev.matrix_world @ ev.pose.bones["thumb_prox"].head)


def solve_with_shift(target, start):
    """Önce parmakla dene; kalan hatayı (sınırlı) el kaymasıyla kapat."""
    sh = [0.0, 0.0]
    pose, err = solve(target, start)
    for _ in range(4):
        if err < 1.5:
            break
        tip = tip_of(pose)
        rx, ry = target[0] - tip[0] - sh[0], target[1] - tip[1] - sh[1]
        sh = [max(-SHIFT_MAX, min(SHIFT_MAX, sh[0] + rx)),
              max(-SHIFT_MAX, min(SHIFT_MAX, sh[1] + ry))]
        pose, err = solve((target[0] - sh[0], target[1] - sh[1]), pose)
    # Kaymayı geri kıs: çözücü artakalanı hep ele devrettiği için gereğinden
    # fazla kayıyor. Parmakla kapatılabilen kısmı parmağa geri veriyoruz,
    # yoksa el adımlar arasında sağa sola savruluyor.
    for _ in range(8):
        if err > 2.0:
            break
        cand = [sh[0] * 0.78, sh[1] * 0.78]
        cpose, cerr = solve((target[0] - cand[0], target[1] - cand[1]), pose)
        ctip = tip_of(cpose)
        cerr = math.hypot(target[0] - ctip[0] - cand[0], target[1] - ctip[1] - cand[1])
        if cerr > 2.0:
            break
        sh, pose, err = cand, cpose, cerr
    tip = tip_of(pose)
    return pose, sh, math.hypot(target[0] - tip[0] - sh[0], target[1] - tip[1] - sh[1])


# Her hedef için İKİ poz: dokunma pozu ve bastırma pozu. Bastırmada uç, boğumdan
# hedefe giden doğrultuda birkaç birim daha ileri iter — parmak cama yaslanır,
# hafifçe düzleşir. Kare dizisi bu iki pozu ardışık kareler olarak taşıyor,
# böylece "uzan → bas → bırak" ritmi gerçek pozlardan çıkıyor.
PRESS_PUSH = env("TH_PRESS", 15.0)

KEYS = [list(THUMB_REST)]
SHIFTS = [[0.0, 0.0]]
touch_key, press_key = [], []
for i, t in enumerate(TARGETS):
    pose, sh, err = solve_with_shift(t, KEYS[-1])
    KEYS.append(pose)
    SHIFTS.append(sh)
    touch_key.append(len(KEYS) - 1)

    mx, my = mcp_of(pose)
    dx, dy = t[0] - sh[0] - mx, t[1] - sh[1] - my
    d = math.hypot(dx, dy) or 1.0
    pt = (t[0] - sh[0] + dx / d * PRESS_PUSH, t[1] - sh[1] + dy / d * PRESS_PUSH)
    ppose, _perr = solve(pt, pose)
    KEYS.append(ppose)
    SHIFTS.append(sh)
    press_key.append(len(KEYS) - 1)

    tip = tip_of(pose)
    print(f"[parmak] hedef {i + 1}: ({t[0]:.0f},{t[1]:.0f}) → uç ({tip[0] + sh[0]:.0f},{tip[1] + sh[1]:.0f})  "
          f"sapma {err:.0f}  el kayması ({sh[0]:+.0f},{sh[1]:+.0f})  poz {tuple(round(v, 1) for v in pose)}")


def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


# Kare dağılımı: hedefe uzanma TRAVEL kare, bastırma 1 kare. Eşit dağıtmak
# bastırmayı da uzun yapıyordu, dokunuş tokat gibi duruyordu.
TRAVEL = max(2, round(FRAMES / N_TAPS) - 1)
FRAMES = 1 + N_TAPS * (TRAVEL + 1)
key_frame = [0]
for i in range(N_TAPS):
    key_frame.append(key_frame[-1] + TRAVEL)  # dokunma
    key_frame.append(key_frame[-1] + 1)       # bastırma
print(f"[parmak] {FRAMES} kare  (uzanma {TRAVEL} kare + bastırma 1 kare) × {N_TAPS} hedef")

poses, tips, shifts = [], [], []
for i in range(FRAMES):
    seg = max(j for j in range(len(key_frame)) if key_frame[j] <= i)
    if seg >= len(KEYS) - 1:
        th, sh = KEYS[-1], SHIFTS[-1]
    else:
        span = key_frame[seg + 1] - key_frame[seg]
        u = smooth((i - key_frame[seg]) / span) if span else 0.0
        th = [a + (b - a) * u for a, b in zip(KEYS[seg], KEYS[seg + 1])]
        sh = [a + (b - a) * u for a, b in zip(SHIFTS[seg], SHIFTS[seg + 1])]
    poses.append(th)
    shifts.append(sh)
    tips.append([c + d for c, d in zip(tip_of(th), sh)])

frame_for = [key_frame[k] for k in touch_key]
press_for = [key_frame[k] for k in press_key]
print("[parmak] hedef → kare:", frame_for, " bastırma:", press_for)

# ── 6) baş parmağın tüm pozlarda kapladığı kutu (sprite kırpması için) ──────
def thumb_box():
    xs, ys = [], []
    for th in poses:
        set_thumb(*th)
        deps.update()
        ev = rig.evaluated_get(deps)
        ev_hand = hand.evaluated_get(deps)
        m = ev_hand.matrix_world
        me = ev_hand.to_mesh()
        # başparmak ağırlık gruplarına ait noktalar
        idx = {hand.vertex_groups[n].index for n in ("thumb_trapez", "thumb_meta", "thumb_prox", "thumb_dist")}
        for v in me.vertices:
            if any(g.group in idx and g.weight > 0.15 for g in v.groups):
                sx, sy = to_stage(m @ v.co)
                xs.append(sx)
                ys.append(sy)
        ev_hand.to_mesh_clear()
    return min(xs), min(ys), max(xs), max(ys)


bx0, by0, bx1, by1 = thumb_box()
PAD = 26.0
box = (max(0.0, bx0 - PAD), max(0.0, by0 - PAD), min(STAGE_W, bx1 + PAD), min(FRAME_H, by1 + PAD))
print(f"[parmak] kutu (sahne): {tuple(round(v) for v in box)}")

# ── 7) render ───────────────────────────────────────────────────────────────
# 0. kare tam kadraj (taban görsel); kalan kareler yalnız başparmak kutusunda
# render edilir — kadrajın geri kalanı zaten değişmiyor, süre 4-5 kat düşüyor.
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


print(f"[render] film_transparent={scene.render.film_transparent} "
      f"format={scene.render.image_settings.file_format} color={scene.render.image_settings.color_mode} "
      f"use_nodes={scene.use_nodes} engine={scene.render.engine}")

# Mesh'i şimdi ikiye böl: ölçüler (thumb_box, depth_report) tam mesh üzerinden
# alındı, bundan sonrası yalnız render.
palm_parts, thumb_parts = [], []
for ob in (hand, nails):
    a, b = split_thumb(ob)
    palm_parts.append(a)
    if b:
        thumb_parts.append(b)


def show(objs, on):
    for o in objs:
        o.visible_camera = on
        # görünmeyen katman gölge/ışık için sahnede kalır ki iki render'ın
        # aydınlatması birebir aynı olsun


# 1) taban görsel: avuç + parmaklar, telefon holdout olarak açık
set_thumb(*poses[0])
show(palm_parts, True)
show(thumb_parts, False)
hole.is_holdout = True
hole.visible_camera = True
set_border(None)
scene.render.filepath = os.path.join(RAW, "base")
bpy.ops.render.render(write_still=True)
print("[el] taban render edildi →", scene.render.filepath + ".webp")

# 2) baş parmak kareleri: yalnız başparmak katmanı, holdout kapalı, kesme yok
show(palm_parts, False)
show(thumb_parts, True)
hole.is_holdout = False
hole.visible_camera = False
set_border(box)
for i, th in enumerate(poses):
    set_thumb(*th)
    scene.render.filepath = os.path.join(RAW, f"t{i:02d}")
    bpy.ops.render.render(write_still=True)
    print(f"[parmak] kare {i:2d}/{FRAMES - 1}  uç ({tips[i][0]:.0f},{tips[i][1]:.0f})")

meta = {
    "frames": FRAMES,
    "poses": poses,
    "tips": tips,
    "frameForTarget": frame_for,
    "pressForTarget": press_for,
    "handShift": shifts,
    "targets": TARGETS,
    "box": box,
    "raw": RAW,
}
with open(os.path.join(RAW, "meta.json"), "w") as f:
    json.dump(meta, f)
print("[parmak] bitti →", RAW)
