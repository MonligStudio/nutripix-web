"""
NutriPix — Meshy AI el+telefon modelini temizler, sahneye hizalar ve render eder.

Girdi : blender/Meshy_AI_Hand_Holding_Smartpho_0817111104_generate.blend
Çıktı : public/hand/model.webp   (el + telefon, ekran alanı delik)
        public/hand/thumb.webp   (baş parmak ayrı katman — dokunma animasyonu için)
        blender/model_clean.blend

Yapılan temizlik:
  • Meshy'nin eklediği sergi kaidesi kesilir (kol kadrajın altından çıkar)
  • Sıfır alanlı yüzler ve çakışık noktalar temizlenir
  • Heykel gürültüsü hafif düzleştirmeyle alınır, normaller yeniden hesaplanır

Hizalama: modelin telefon ekranı ölçülür, 13°'lik yatıklığı düzeltilir ve ekran
tam olarak `src/lib/stage.ts` içindeki SCREEN dikdörtgenine oturtulur. Dünya
birimi = sahne birimi (1 birim = 620'lik sahnenin 1/620'si).

Çalıştırma:
  /Applications/Blender.app/Contents/MacOS/Blender --background \
      blender/Meshy_AI_Hand_Holding_Smartpho_0817111104_generate.blend \
      --python blender/model.py -- <cikis_klasoru> [samples]
"""

import bpy
import bmesh
import collections
import math
import os
import sys
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(argv[0]) if argv else os.path.join(HERE, "..", "public", "hand")
SAMPLES = int(argv[1]) if len(argv) > 1 else 128
os.makedirs(OUT, exist_ok=True)

# ───────────────────────────────────────────────── sahne koordinat sistemi ──
# stage.ts ile aynı: 620x1000 sahne, el kadrajı 620x1220 (kol aşağıdan taşar)
STAGE_W, STAGE_H, FRAME_H = 620.0, 1000.0, 1220.0
SCREEN_W = 364.0  # ekranın sahne birimindeki genişliği
SCREEN_CX, SCREEN_CY = 280.0, 415.0  # ekran merkezi (sahne birimi)

wx = lambda sx: sx - STAGE_W / 2  # noqa: E731
wz = lambda sy: STAGE_H / 2 - sy  # noqa: E731


def bsdf(mat):
    return next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")


def set_in(node, key, value):
    if key in node.inputs:
        node.inputs[key].default_value = value


ob = bpy.data.objects["mesh_node"]
bpy.context.view_layer.objects.active = ob
ob.select_set(True)

# ── 1) kaideyi bul ve kes ────────────────────────────────────────────────────
# Kaide geniş bir disk; bilek ondan çok daha ince. z dilimlerinde XY yayılımına
# bakıp yayılımın aniden büyüdüğü yeri kesim yüksekliği kabul ediyoruz.
bm = bmesh.new()
bm.from_mesh(ob.data)
zmin = min(v.co.z for v in bm.verts)
zmax = max(v.co.z for v in bm.verts)
slices = collections.defaultdict(list)
for v in bm.verts:
    if v.co.z < zmin + 0.45:
        slices[round((v.co.z - zmin) / 0.02)].append(v.co)

spread = []
for k in sorted(slices):
    pts = slices[k]
    r = max(math.hypot(p.x - sum(q.x for q in pts) / len(pts),
                       p.y - sum(q.y for q in pts) / len(pts)) for p in pts)
    spread.append((zmin + k * 0.02, r, len(pts)))

# kaide üstü: alttan yukarı çıkarken yarıçapın ilk kez kalıcı olarak düştüğü yer
base_top = zmin
for i in range(1, len(spread) - 2):
    z, r, _ = spread[i]
    nxt = [s[1] for s in spread[i + 1 : i + 4]]
    if r > 0.16 and all(n < r * 0.82 for n in nxt):
        base_top = spread[i + 1][0]
        break
print(f"[model] kaide üstü z = {base_top:.4f}  (model z {zmin:.3f}..{zmax:.3f})")
print("[model] alt dilim yarıçapları:", [(round(z, 3), round(r, 3)) for z, r, _ in spread[:14]])

CUT = max(base_top + 0.015, zmin + 0.055)
doomed = [v for v in bm.verts if v.co.z < CUT]
bmesh.ops.delete(bm, geom=doomed, context="VERTS")
print(f"[model] kaide silindi: {len(doomed)} nokta (z < {CUT:.4f})")

# ── 2) çapak temizliği ───────────────────────────────────────────────────────
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0006)
bmesh.ops.dissolve_degenerate(bm, dist=0.0004, edges=bm.edges)
# artık bağlantısız kalan küçük kırıntıları at
seen, groups = set(), []
for v in bm.verts:
    if v in seen:
        continue
    stack, comp = [v], []
    seen.add(v)
    while stack:
        cur = stack.pop()
        comp.append(cur)
        for e in cur.link_edges:
            ov = e.other_vert(cur)
            if ov not in seen:
                seen.add(ov)
                stack.append(ov)
    groups.append(comp)
groups.sort(key=len, reverse=True)
if len(groups) > 1:
    junk = [v for g in groups[1:] for v in g]
    bmesh.ops.delete(bm, geom=junk, context="VERTS")
    print(f"[model] {len(groups) - 1} kopuk parça atıldı ({len(junk)} nokta)")
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
bm.to_mesh(ob.data)
bm.free()
ob.data.update()

# ── 3) ekran düzlemini ölç ───────────────────────────────────────────────────
bm = bmesh.new()
bm.from_mesh(ob.data)
bm.faces.ensure_lookup_table()
bins = collections.defaultdict(float)
for f in bm.faces:
    n = f.normal
    bins[(round(n.x * 6) / 6, round(n.y * 6) / 6, round(n.z * 6) / 6)] += f.calc_area()
axis = Vector(max(bins.items(), key=lambda kv: kv[1])[0]).normalized()
cand = [f for f in bm.faces if f.normal.dot(axis) > 0.985]
fset = {f.index for f in cand}
seen, groups = set(), []
for f in cand:
    if f.index in seen:
        continue
    stack, g = [f], []
    seen.add(f.index)
    while stack:
        cur = stack.pop()
        g.append(cur)
        for e in cur.edges:
            for nf in e.link_faces:
                if nf.index in fset and nf.index not in seen:
                    seen.add(nf.index)
                    stack.append(nf)
    groups.append(g)
g = max(groups, key=lambda g: sum(f.calc_area() for f in g))
tot = sum(f.calc_area() for f in g)
scr_c = sum((f.calc_center_median() * f.calc_area() for f in g), Vector()) / tot
scr_n = sum((f.normal * f.calc_area() for f in g), Vector()).normalized()
up = (Vector((0, 0, 1)) - scr_n * Vector((0, 0, 1)).dot(scr_n)).normalized()
right = up.cross(scr_n).normalized()
pts = [v.co for f in g for v in f.verts]
us = [(p - scr_c).dot(right) for p in pts]
vs = [(p - scr_c).dot(up) for p in pts]
scr_w, scr_h = max(us) - min(us), max(vs) - min(vs)
tilt = math.atan2(scr_n.z, -scr_n.y)  # X ekseni etrafındaki yatıklık
print(f"[model] ekran: {scr_w:.4f} x {scr_h:.4f} (oran {scr_h/scr_w:.3f}), yatıklık {math.degrees(tilt):.2f}°")
bm.free()

# ── 4) hizala: yatıklığı düzelt, ölçekle, ekranı hedefe taşı ────────────────
SCALE = SCREEN_W / scr_w
# glTF ithalatı rotation_mode'u QUATERNION bırakıyor; öyleyken rotation_euler
# ataması sessizce hiçbir şey yapmıyor.
ob.rotation_mode = "XYZ"
ob.rotation_euler = (tilt, 0, 0)
ob.scale = (SCALE, SCALE, SCALE)
bpy.context.view_layer.update()
# döndürme+ölçek sonrası ekran merkezinin nereye düştüğünü ölç ve farkı kapat
now = ob.matrix_world @ scr_c
target = Vector((wx(SCREEN_CX), 0.0, wz(SCREEN_CY)))
ob.location = target - now
bpy.context.view_layer.update()
print(f"[model] ölçek {SCALE:.2f}  ekran merkezi → {tuple(round(v,2) for v in (ob.matrix_world @ scr_c))}")

SCREEN_H = scr_h * SCALE
print(f"[model] sahne birimiyle ekran: {SCREEN_W:.1f} x {SCREEN_H:.1f}")

# ── 5) yumuşatma ─────────────────────────────────────────────────────────────
sm = ob.modifiers.new("relax", "SMOOTH")  # heykel gürültüsünü alır
sm.factor = 0.5
sm.iterations = 2
for p in ob.data.polygons:
    p.use_smooth = True
wn = ob.modifiers.new("wn", "WEIGHTED_NORMAL")
wn.keep_sharp = True

# ── 6) malzeme: el ve telefon aynı gövdede, maskeyle ayrılıyor ──────────────
# Ekran düzleminin önünde/arkasında olmasına göre değil; telefon gövdesi
# koyu, el teni açık. Ayrımı dünya konumundan değil, ayrı malzeme yuvasıyla
# yapamadığımız için tek clay malzeme + telefon için ayrı obje kullanıyoruz.
skin = bpy.data.materials.new("ClaySkin")
skin.use_nodes = True
b = bsdf(skin)
set_in(b, "Base Color", (0.760, 0.430, 0.320, 1.0))
set_in(b, "Roughness", 0.60)
set_in(b, "Subsurface Weight", 0.26)
set_in(b, "Subsurface Scale", 6.0)
set_in(b, "Specular IOR Level", 0.30)
ob.data.materials.clear()
ob.data.materials.append(skin)

# ── 7) telefonun tamamı holdout ─────────────────────────────────────────────
# Modelin telefonu ten malzemesinde ve yüzeyi tam düz değil; ince bir düzlemle
# sadece ekranı kesmeye çalışmak işe yaramıyor (yüzey düzlemi kesiyor).
# Bunun yerine telefonun tamamını alfadan siliyoruz: Blender yalnız eli basar,
# telefonu ve ekranı DOM çizer, telefonun önündeki parmaklar render'da kalır.
PHONE_PAD = 12.0  # ön yüzden gövde kenarına (pah) pay
PHONE_X0, PHONE_X1 = SCREEN_CX - SCREEN_W / 2 - PHONE_PAD, SCREEN_CX + SCREEN_W / 2 + PHONE_PAD
PHONE_Y0, PHONE_Y1 = SCREEN_CY - SCREEN_H / 2 - PHONE_PAD, SCREEN_CY + SCREEN_H / 2 + PHONE_PAD
FRONT = -10.0  # holdout kutusunun ön yüzü — bundan öndeki parmaklar korunur

bpy.ops.mesh.primitive_cube_add(size=1)
hole = bpy.context.object
hole.name = "phone_holdout"
hole.scale = (PHONE_X1 - PHONE_X0, 400.0, PHONE_Y1 - PHONE_Y0)
hole.location = (
    wx((PHONE_X0 + PHONE_X1) / 2),
    FRONT + 200.0,
    wz((PHONE_Y0 + PHONE_Y1) / 2),
)
hole.is_holdout = True
print(f"[model] telefon holdout: x {PHONE_X0:.1f}..{PHONE_X1:.1f}  y {PHONE_Y0:.1f}..{PHONE_Y1:.1f}")

# ── 8) ışık + kamera ─────────────────────────────────────────────────────────
scene = bpy.context.scene
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
    return o


# ölçek sahne birimi olduğu için ışık gücü de o ölçekte (mesafe² ile büyür)
# Alan ışığının gücü alanla ölçeklenir: sahne birimi metre olmadığı için
# değerler büyük. Işıma = güç / (alan · π).
area("key", (-260, -300, 280), (math.radians(50), 0, math.radians(-40)), 700, 8.0e6,
     (1.0, 0.95, 0.90))
area("rim", (280, 120, 110), (math.radians(84), 0, math.radians(120)), 380, 1.4e6,
     (0.76, 0.87, 1.0))
area("fill", (110, -260, -240), (math.radians(-44), 0, math.radians(16)), 760, 2.4e6,
     (0.88, 0.93, 1.0))

# ekranın mint parıltısı — el üzerine düşen renk buradan gelir
bpy.ops.mesh.primitive_plane_add(size=1)
glow = bpy.context.object
glow.name = "screen_glow"
glow.rotation_euler = (math.radians(90), 0, 0)
glow.scale = (SCREEN_W * 0.96, SCREEN_H * 0.96, 1)
glow.location = (wx(SCREEN_CX), -0.6, wz(SCREEN_CY))
gm = bpy.data.materials.new("Glow")
gm.use_nodes = True
gnt = gm.node_tree
gnt.nodes.remove(bsdf(gm))
em = gnt.nodes.new("ShaderNodeEmission")
em.inputs["Color"].default_value = (0.42, 1.0, 0.60, 1)
em.inputs["Strength"].default_value = 2.0
gnt.links.new(em.outputs[0], next(n for n in gnt.nodes if n.type == "OUTPUT_MATERIAL").inputs["Surface"])
glow.data.materials.append(gm)
glow.visible_camera = False
glow.visible_shadow = False

cam_d = bpy.data.cameras.new("Cam")
cam_d.type = "ORTHO"
cam_d.sensor_fit = "HORIZONTAL"
cam_d.ortho_scale = STAGE_W
cam = bpy.data.objects.new("Cam", cam_d)
cam.location = (0, -900, (wz(0) + wz(FRAME_H)) / 2)
cam.rotation_euler = (math.radians(90), 0, 0)
scene.collection.objects.link(cam)
scene.camera = cam

# ── 9) render ────────────────────────────────────────────────────────────────
scene.render.engine = "CYCLES"
scene.render.resolution_x = int(STAGE_W) * 2
scene.render.resolution_y = int(FRAME_H) * 2
scene.render.film_transparent = True
scene.render.image_settings.file_format = "WEBP"
scene.render.image_settings.color_mode = "RGBA"
scene.render.image_settings.quality = 90
scene.cycles.samples = SAMPLES
scene.cycles.use_adaptive_sampling = True
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 5
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

scene.render.filepath = os.path.join(OUT, "model")
bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "model_clean.blend"))
print(f"[model] SCREEN_STAGE = x{SCREEN_CX - SCREEN_W / 2:.1f} y{SCREEN_CY - SCREEN_H / 2:.1f} "
      f"w{SCREEN_W:.1f} h{SCREEN_H:.1f}")
print("[model] bitti")
