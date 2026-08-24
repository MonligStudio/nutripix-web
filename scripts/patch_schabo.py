"""SCHABO Condensed'e Türkçe İ ve ı ekler.

Fontun orijinalinde U+0130 (İ) ve U+0131 (ı) yok. Site tamamen Türkçe ve
başlıklar büyük harf olduğu için "İ" sık geçiyor; glif yoksa tarayıcı o harfi
yedek fonttan çizer ve başlığın ortasında farklı bir harf belirir.

Yaptığı iş: İ = I gövdesi + Idieresis'in tek noktası (stem üzerinde ortalanmış),
ı = i gliflerinin noktasız hâli. Ölçüler fontun kendi diyakritiğinden alınır,
uydurma yok.

Kullanım:  python3 scripts/patch_schabo.py  <kaynak.otf>  <hedef.otf>
"""

import sys

from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.ttLib import TTFont


def contours(glyph_set, name):
    """Glifi kontur listesine ayır: [(başlangıç, [(op, args), ...]), ...]"""
    pen = RecordingPen()
    glyph_set[name].draw(pen)
    out, cur = [], None
    for op, args in pen.value:
        if op == "moveTo":
            cur = [(op, args)]
            out.append(cur)
        elif cur is not None:
            cur.append((op, args))
    return out


def bounds(contour):
    pts = [p for _, args in contour for p in args if p]
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return min(xs), min(ys), max(xs), max(ys)


def replay(contour, pen, dx=0.0):
    for op, args in contour:
        moved = tuple((x + dx, y) for x, y in args)
        getattr(pen, op)(*moved)


def build(font, name, unicode_value, source_contours, advance):
    top = font["CFF "].cff[0]
    pen = T2CharStringPen(advance, font.getGlyphSet())
    for contour, dx in source_contours:
        replay(contour, pen, dx)
    pen.closePath()
    charstring = pen.getCharString(private=top.Private, globalSubrs=top.GlobalSubrs)

    # T2CharStringPen hint (hstem/vstem) üretmez — fontun geri kalan HER
    # glifi üretiyor. Windows/DirectWrite gibi bazı render yollarında hint'i
    # olmayan tek bir glif, komşularından farklı grid-fitting alıp gözle
    # görülür fazladan boşluğa yol açabiliyor (bu makinede "İ"den sonra
    # oluşan boşluğun sebebi büyük olasılıkla budur). Kaba ama geçerli bir
    # hint zonu — glifin kendi sınır kutusu — ekleyerek yapısal tutarlılığı
    # sağlıyoruz; kesin optik hinting değil ama hint'in TAMAMEN yokluğundan
    # kesinlikle daha iyi.
    prog = charstring.program
    has_width = (
        len(prog) > 2
        and isinstance(prog[0], (int, float))
        and isinstance(prog[1], (int, float))
        and prog[2] == "hmoveto"
    )
    head, rest = (prog[:1], prog[1:]) if has_width else ([], prog)
    boxes = [
        (bx0 + dx, by0, bx1 + dx, by1)
        for (contour, dx) in source_contours
        for bx0, by0, bx1, by1 in [bounds(contour)]
    ]
    x0 = min(b[0] for b in boxes)
    y0 = min(b[1] for b in boxes)
    x1 = max(b[2] for b in boxes)
    y1 = max(b[3] for b in boxes)
    hint = [round(y0), round(y1 - y0), "hstem", round(x0), round(x1 - x0), "vstem"]
    charstring.program = head + hint + rest

    strings = top.CharStrings
    if strings.charStringsAreIndexed:
        strings.charStrings[name] = len(strings.charStringsIndex)
        strings.charStringsIndex.append(charstring)
    else:
        strings.charStrings[name] = charstring
    if name not in top.charset:
        top.charset.append(name)

    font["hmtx"][name] = (advance, 0)
    if name not in font.getGlyphOrder():
        font.setGlyphOrder(font.getGlyphOrder() + [name])
        font["maxp"].numGlyphs = len(font.getGlyphOrder())
    for table in font["cmap"].tables:
        table.cmap[unicode_value] = name


def main(src, dst):
    font = TTFont(src)
    glyph_set = font.getGlyphSet()

    stem = contours(glyph_set, "I")[0]
    # Idieresis'in iki noktasından biri: aynı boyut, gövdenin üstünde aynı yükseklik
    dieresis = contours(glyph_set, "Idieresis")
    dot = min(dieresis, key=lambda c: bounds(c)[0])
    dx0, _, dx1, _ = bounds(dot)
    sx0, _, sx1, _ = bounds(stem)
    # noktayı gövdenin ortasına kaydır
    shift = (sx0 + sx1) / 2 - (dx0 + dx1) / 2

    build(font, "Idotaccent", 0x0130, [(stem, 0), (dot, shift)], font["hmtx"]["I"][0])

    body = contours(glyph_set, "i")
    # noktasız i: en alttaki (gövde) kontur
    trunk = min(body, key=lambda c: bounds(c)[1])
    build(font, "dotlessi", 0x0131, [(trunk, 0)], font["hmtx"]["i"][0])

    font.save(dst)
    print(f"yazıldı: {dst}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
