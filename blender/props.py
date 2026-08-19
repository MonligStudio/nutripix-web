"""
NutriPix — küplerin etrafında uçuşacak 3B yiyecek nesneleri.

El modeliyle aynı dil: yumuşak clay malzemeler, geniş ve düşük kontrastlı
stüdyo ışığı, saydam arka plan. Her nesne kendi webp'sine render edilir.

Çalıştırma:
  /Applications/Blender.app/Contents/MacOS/Blender --background \
      --python blender/props.py -- <cikis_klasoru> [samples]
"""


import bpy
import math
import os
import sys
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(argv[0]) if argv else os.path.join(HERE, "..", "public", "props")
SAMPLES = int(argv[1]) if len(argv) > 1 else 96
RES = 640
os.makedirs(OUT, exist_ok=True)


def bsdf(mat):
    return next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")


def set_in(node, key, value):
    if key in node.inputs:
        node.inputs[key].default_value = value


def mat(name, color, rough=0.45, sub=0.25, sub_r=(0.06, 0.03, 0.02), transmit=0.0,
        bump=0.0, bump_scale=90.0, mottle=0.0):
    """bump: yüzey kabartısı, mottle: renkte doğal alacalanma."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = bsdf(m)
    set_in(b, "Base Color", (*color, 1.0))
    set_in(b, "Roughness", rough)
    set_in(b, "Subsurface Weight", sub)
    set_in(b, "Subsurface Radius", sub_r)
    set_in(b, "Subsurface Scale", 0.05)
    set_in(b, "Specular IOR Level", 0.45)
    if transmit:
        set_in(b, "Transmission Weight", transmit)
        set_in(b, "IOR", 1.33)

    nt = m.node_tree
    if bump:
        noise = nt.nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = bump_scale
        noise.inputs["Detail"].default_value = 7.0
        bp = nt.nodes.new("ShaderNodeBump")
        bp.inputs["Strength"].default_value = bump
        bp.inputs["Distance"].default_value = 0.012
        nt.links.new(noise.outputs["Fac"], bp.inputs["Height"])
        nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    if mottle:
        n2 = nt.nodes.new("ShaderNodeTexNoise")
        n2.inputs["Scale"].default_value = 4.5
        n2.inputs["Detail"].default_value = 3.0
        ramp = nt.nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].color = (*[c * (1 - mottle) for c in color], 1)
        ramp.color_ramp.elements[1].color = (*[min(1, c * (1 + mottle)) for c in color], 1)
        nt.links.new(n2.outputs["Fac"], ramp.inputs["Fac"])
        nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    return m


def smooth(ob, levels=2):
    ob.modifiers.new("sub", "SUBSURF").levels = levels
    ob.modifiers["sub"].render_levels = levels
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


def sphere(r=1.0, loc=(0, 0, 0), scale=(1, 1, 1), rot=(0, 0, 0), segs=48, rings=28):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segs, ring_count=rings, radius=r, location=loc)
    o = bpy.context.object
    o.scale, o.rotation_euler = scale, rot
    for p in o.data.polygons:
        p.use_smooth = True
    return o


def cylinder(r=1.0, d=1.0, loc=(0, 0, 0), rot=(0, 0, 0), verts=32):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=d, location=loc, rotation=rot)
    o = bpy.context.object
    for p in o.data.polygons:
        p.use_smooth = True
    return o


def join(objs, name):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    ob = bpy.context.object
    ob.name = name
    return ob


# ── nesneler ────────────────────────────────────────────────────────────────
def build_apple():
    body = sphere(1.0, scale=(1.0, 1.0, 0.94))
    # tepe ve dip çukuru
    for v in body.data.vertices:
        d = math.hypot(v.co.x, v.co.y)
        if v.co.z > 0.55:
            v.co.z -= 0.30 * math.exp(-(d * 3.4) ** 2)
        if v.co.z < -0.6:
            v.co.z += 0.16 * math.exp(-(d * 3.6) ** 2)
    body.data.update()
    body.data.materials.append(mat("apple", (0.62, 0.055, 0.06), rough=0.26, sub=0.35,
                                   sub_r=(0.08, 0.03, 0.02), bump=0.05, bump_scale=220, mottle=0.32))
    stem = cylinder(0.055, 0.5, loc=(0, 0, 0.86), rot=(math.radians(7), 0, 0))
    stem.data.materials.append(mat("stem", (0.14, 0.08, 0.035), rough=0.7, sub=0.05))
    leaf = sphere(1.0, loc=(0.30, 0.02, 1.00), scale=(0.30, 0.10, 0.13),
                  rot=(0, math.radians(-24), math.radians(12)))
    leaf.data.materials.append(mat("leaf", (0.10, 0.42, 0.13), rough=0.45, sub=0.4,
                                   sub_r=(0.03, 0.08, 0.02)))
    return join([body, stem, leaf], "apple")


def build_broccoli():
    parts = []
    stalk = cylinder(0.30, 1.25, loc=(0, 0, -0.55))
    for v in stalk.data.vertices:
        v.co.x *= 1.0 + 0.18 * (v.co.z + 0.62)
        v.co.y *= 1.0 + 0.18 * (v.co.z + 0.62)
    stalk.data.update()
    stalk.data.materials.append(mat("stalk", (0.42, 0.62, 0.22), rough=0.55, sub=0.3,
                                    sub_r=(0.04, 0.08, 0.02)))
    parts.append(stalk)

    crown = mat("crown", (0.075, 0.30, 0.10), rough=0.72, sub=0.28, sub_r=(0.03, 0.07, 0.02),
                bump=0.35, bump_scale=340, mottle=0.28)
    for cx, cy, cz, r in (
        (0, 0, 0.52, 0.62), (0.46, 0.10, 0.30, 0.42), (-0.40, 0.18, 0.32, 0.40),
        (0.16, -0.44, 0.30, 0.38), (-0.18, -0.40, 0.44, 0.34), (0.30, 0.40, 0.52, 0.30),
    ):
        b = sphere(r, loc=(cx, cy, cz), segs=28, rings=16)
        # yüzeyi taneli yap
        for v in b.data.vertices:
            n = (math.sin(v.co.x * 21) + math.cos(v.co.y * 19) + math.sin(v.co.z * 23)) / 3
            v.co += v.normal * (n * 0.055 * r)
        b.data.update()
        b.data.materials.append(crown)
        parts.append(b)
    return join(parts, "broccoli")


def build_water():
    """Su damlası — üstü sivri, altı yuvarlak."""
    d = sphere(1.0, segs=48, rings=32)
    for v in d.data.vertices:
        t = (v.co.z + 1) / 2
        k = 1.0 - 0.92 * max(0.0, (t - 0.45) / 0.55) ** 1.6
        v.co.x *= k
        v.co.y *= k
        v.co.z = v.co.z * 1.06 + 0.42 * max(0.0, (t - 0.45) / 0.55) ** 1.4
    d.data.update()
    d.data.materials.append(
        mat("water", (0.16, 0.55, 0.78), rough=0.06, sub=0.0, transmit=0.85)
    )
    return d


def build_carrot():
    c = cylinder(0.38, 2.0, verts=40)
    for v in c.data.vertices:
        t = (v.co.z + 1) / 2  # 0 uç, 1 taban
        k = 0.12 + 0.88 * t ** 0.85
        v.co.x *= k
        v.co.y *= k
        ang = math.atan2(v.co.y, v.co.x)
        v.co.x *= 1 + 0.05 * math.sin(ang * 9)
        v.co.y *= 1 + 0.05 * math.sin(ang * 9)
    c.data.update()
    c.data.materials.append(mat("carrot", (0.82, 0.26, 0.03), rough=0.42, sub=0.35,
                                sub_r=(0.09, 0.04, 0.01), bump=0.18, bump_scale=160, mottle=0.24))
    greens = []
    for a, tilt in ((0, 10), (120, 16), (240, 13)):
        g = sphere(1.0, loc=(0.10 * math.cos(math.radians(a)), 0.10 * math.sin(math.radians(a)), 1.30),
                   scale=(0.09, 0.09, 0.42),
                   rot=(math.radians(tilt) * math.sin(math.radians(a)), math.radians(tilt) * math.cos(math.radians(a)), 0))
        g.data.materials.append(mat("greens", (0.10, 0.36, 0.10), rough=0.6, sub=0.3))
        greens.append(g)
    return join([c, *greens], "carrot")


def build_egg():
    e = sphere(1.0, segs=48, rings=32)
    for v in e.data.vertices:
        t = (v.co.z + 1) / 2
        k = 1.0 - 0.26 * max(0.0, t - 0.5) / 0.5
        v.co.x *= k * 0.78
        v.co.y *= k * 0.78
        v.co.z *= 1.06
    e.data.update()
    e.data.materials.append(mat("egg", (0.88, 0.79, 0.66), rough=0.34, sub=0.45,
                                sub_r=(0.10, 0.07, 0.05), bump=0.06, bump_scale=300, mottle=0.10))
    return e


def build_avocado():
    half = sphere(1.0, scale=(0.78, 0.78, 1.12))
    for v in half.data.vertices:
        t = (v.co.z + 1.12) / 2.24
        k = 0.72 + 0.55 * math.sin(t * math.pi) ** 1.2
        v.co.x *= k
        v.co.y *= k
    half.data.update()
    half.data.materials.append(mat("avo", (0.34, 0.46, 0.13), rough=0.5, sub=0.3,
                                   sub_r=(0.05, 0.08, 0.02)))
    flesh = sphere(0.86, loc=(0, -0.16, 0), scale=(0.74, 0.5, 1.02))
    flesh.data.materials.append(mat("flesh", (0.78, 0.80, 0.36), rough=0.55, sub=0.4))
    pit = sphere(0.34, loc=(0, -0.30, 0))
    pit.data.materials.append(mat("pit", (0.36, 0.19, 0.07), rough=0.45, sub=0.2))
    return join([half, flesh, pit], "avocado")



def build_banana():
    """Muz — eğri bir prizma; kesit üçgene yakın, uçları koyu."""
    c = cylinder(0.30, 2.2, verts=40)
    for v in c.data.vertices:
        # t'yi kırp: kayan nokta hatasıyla [0,1] dışına çıkınca sin() negatif
        # oluyor, kesirli üsse girince karmaşık sayı döndürüyor.
        t = min(1.0, max(0.0, (v.co.z + 1.1) / 2.2))
        arc = max(0.0, math.sin(t * math.pi))
        bend = 0.62 * arc ** 1.1
        v.co.x += bend
        k = 0.55 + 0.9 * arc ** 0.55
        ang = math.atan2(v.co.y, v.co.x - bend)
        edge = 1 + 0.16 * math.cos(ang * 3)  # köşeli kesit
        v.co.y *= k * edge
        v.co.x = bend + (v.co.x - bend) * k * edge
    c.data.update()
    c.data.materials.append(mat("banana", (0.86, 0.66, 0.06), rough=0.44, sub=0.32,
                                sub_r=(0.09, 0.07, 0.02), bump=0.10, bump_scale=140, mottle=0.22))
    return c


def build_tomato():
    t = sphere(1.0, scale=(1.0, 1.0, 0.82))
    for v in t.data.vertices:
        ang = math.atan2(v.co.y, v.co.x)
        v.co.x *= 1 + 0.05 * math.cos(ang * 5)
        v.co.y *= 1 + 0.05 * math.cos(ang * 5)
        if v.co.z > 0.5:
            v.co.z -= 0.16 * math.exp(-(math.hypot(v.co.x, v.co.y) * 3.0) ** 2)
    t.data.update()
    t.data.materials.append(mat("tomato", (0.72, 0.06, 0.03), rough=0.20, sub=0.4,
                                sub_r=(0.10, 0.03, 0.02), bump=0.05, bump_scale=260, mottle=0.26))
    caps = []
    for a in range(0, 360, 72):
        leaf = sphere(1.0, loc=(0.26 * math.cos(math.radians(a)), 0.26 * math.sin(math.radians(a)), 0.74),
                      scale=(0.26, 0.09, 0.05),
                      rot=(0, math.radians(-18), math.radians(a)))
        leaf.data.materials.append(mat("tcap", (0.16, 0.34, 0.08), rough=0.6, sub=0.3))
        caps.append(leaf)
    return join([t, *caps], "tomato")


def build_grapes():
    parts = []
    skin = mat("grape", (0.26, 0.09, 0.34), rough=0.22, sub=0.35,
               sub_r=(0.06, 0.03, 0.08), bump=0.04, bump_scale=280, mottle=0.24)
    rows = [(0.0, 0.62, 5), (-0.42, 0.50, 4), (-0.80, 0.36, 3), (-1.10, 0.0, 1)]
    for z, ring, n in rows:
        for i in range(n):
            a = (i / max(n, 1)) * math.tau + z
            b = sphere(0.30, loc=(ring * math.cos(a), ring * math.sin(a), z), segs=26, rings=16)
            b.data.materials.append(skin)
            parts.append(b)
    stem = cylinder(0.05, 0.5, loc=(0, 0, 0.88))
    stem.data.materials.append(mat("gstem", (0.22, 0.16, 0.06), rough=0.7, sub=0.05))
    parts.append(stem)
    return join(parts, "grapes")


def build_green_apple():
    body = sphere(1.0, scale=(1.0, 1.0, 0.96))
    for v in body.data.vertices:
        d = math.hypot(v.co.x, v.co.y)
        if v.co.z > 0.55:
            v.co.z -= 0.28 * math.exp(-(d * 3.4) ** 2)
    body.data.update()
    body.data.materials.append(mat("gapple", (0.42, 0.62, 0.07), rough=0.24, sub=0.35,
                                    sub_r=(0.05, 0.09, 0.02), bump=0.05, bump_scale=220, mottle=0.30))
    stem = cylinder(0.05, 0.44, loc=(0, 0, 0.88), rot=(math.radians(-8), 0, 0))
    stem.data.materials.append(mat("gstem2", (0.15, 0.09, 0.04), rough=0.7, sub=0.05))
    return join([body, stem], "green_apple")


PROPS = {
    "elma": (build_apple, (18, 0, -22)),
    "yesil-elma": (build_green_apple, (14, 0, 16)),
    "brokoli": (build_broccoli, (12, 0, 24)),
    "domates": (build_tomato, (16, 0, -10)),
    "muz": (build_banana, (12, 0, 30)),
    "uzum": (build_grapes, (10, 0, -18)),
    "su": (build_water, (0, 0, 0)),
    "havuc": (build_carrot, (16, 0, 34)),
    "yumurta": (build_egg, (10, 0, -14)),
}

# ── sahne kurulumu ──────────────────────────────────────────────────────────
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = SAMPLES
scene.cycles.use_adaptive_sampling = True
scene.cycles.use_denoising = True
scene.render.resolution_x = scene.render.resolution_y = RES
scene.render.film_transparent = True
scene.render.image_settings.file_format = "WEBP"
scene.render.image_settings.color_mode = "RGBA"
scene.render.image_settings.quality = 90
try:
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Base Contrast"
except Exception:
    pass

world = bpy.data.worlds.new("W")
scene.world = world
world.use_nodes = True
next(n for n in world.node_tree.nodes if n.type == "BACKGROUND").inputs[0].default_value = (
    0.05, 0.055, 0.065, 1,
)


def area(name, loc, rot, size, energy, color):
    d = bpy.data.lights.new(name, "AREA")
    d.energy, d.color, d.size = energy, color, size
    o = bpy.data.objects.new(name, d)
    o.location, o.rotation_euler = loc, rot
    scene.collection.objects.link(o)


area("key", (-3.2, -3.6, 3.4), (math.radians(50), 0, math.radians(-40)), 6.0, 420, (1.0, 0.96, 0.92))
area("rim", (3.4, 2.0, 1.6), (math.radians(82), 0, math.radians(122)), 3.4, 190, (0.72, 0.86, 1.0))
area("fill", (1.4, -3.2, -2.6), (math.radians(-44), 0, math.radians(18)), 6.5, 120, (0.86, 0.92, 1.0))

cam_d = bpy.data.cameras.new("Cam")
cam_d.lens = 85
cam = bpy.data.objects.new("Cam", cam_d)
scene.collection.objects.link(cam)
scene.camera = cam
cam.location = (0, -7.4, 1.5)
cam.rotation_euler = (math.radians(78), 0, 0)

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

for name, (build, rot) in PROPS.items():
    for o in [x for x in bpy.data.objects if x.type == "MESH"]:
        bpy.data.objects.remove(o, do_unlink=True)
    ob = build()
    smooth(ob)
    ob.rotation_euler = tuple(math.radians(a) for a in rot)
    # kadraja sığdır
    bpy.context.view_layer.update()
    dim = max(ob.dimensions)
    ob.scale = tuple(s * (2.6 / dim) for s in ob.scale)
    ob.location = (0, 0, 0)
    scene.render.filepath = os.path.join(OUT, name)
    bpy.ops.render.render(write_still=True)
    print(f"[prop] {name} → {scene.render.filepath}.webp")

print("[prop] bitti")
