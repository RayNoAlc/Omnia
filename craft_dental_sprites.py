import os
from PIL import Image, ImageDraw

DARK = (45, 40, 53, 255)            # Base outline color
TEAL_BASE = (13, 148, 136, 255)       # Hospital scrub teal
TEAL_LIGHT = (45, 212, 191, 255)      # Scrub highlight
TEAL_SHADOW = (15, 118, 110, 255)     # Scrub shadow
TEAL_BAND = (17, 94, 89, 255)         # Elastic trim band

MASK_BLUE = (56, 189, 248, 255)       # Surgical mask sky blue
MASK_LIGHT = (186, 230, 253, 255)     # Mask highlight
MASK_FOLD = (14, 116, 144, 255)       # Pleat fold
STRAP_WHITE = (248, 250, 252, 230)    # Soft white strap

WHITE_COAT = (252, 252, 255, 255)     # Doctor lab coat
WHITE_SHADE = (218, 226, 236, 255)    # Coat fold shadow
WHITE_DEEP = (180, 195, 212, 255)     # Deep shadow

SILVER_BRIGHT = (248, 250, 252, 255)
SILVER_MID = (203, 213, 225, 255)
SILVER_DARK = (100, 116, 139, 255)
STETH_TUBE = (51, 65, 85, 255)

GOLD_LIGHT = (254, 240, 138, 255)
GOLD_BASE = (245, 158, 11, 255)
GOLD_SHADOW = (180, 83, 9, 255)

def get_head_bounds(im, y, max_x_limit=220):
    """Finds left and right bounds of owl head on a given row."""
    xs = [x for x in range(im.width) if im.getpixel((x, y))[3] > 100 and x < max_x_limit]
    if not xs:
        return None, None
    return min(xs), max(xs)

def draw_mask_on(draw, mx, my, mw, mh, pleat_y1, pleat_y2, strap_left, strap_right):
    """Draws an anatomically fitting surgical mask with pleats and straps."""
    # Mask main body
    for y in range(my, my + mh):
        is_corner_y = (y <= my + 2) or (y >= my + mh - 3)
        inset = 3 if is_corner_y else 0
        draw.line([(mx + inset, y), (mx + mw - inset, y)], fill=MASK_BLUE, width=1)

    # Top highlight
    draw.line([(mx + 3, my), (mx + mw - 3, my)], fill=MASK_LIGHT, width=2)
    # Bottom shadow
    draw.line([(mx + 3, my + mh - 1), (mx + mw - 3, my + mh - 1)], fill=MASK_FOLD, width=1)

    # Pleat folds
    if pleat_y1:
        draw.line([(mx + 3, pleat_y1), (mx + mw - 3, pleat_y1)], fill=MASK_FOLD, width=1)
        draw.line([(mx + 3, pleat_y1 + 1), (mx + mw - 3, pleat_y1 + 1)], fill=MASK_LIGHT, width=1)
    if pleat_y2:
        draw.line([(mx + 3, pleat_y2), (mx + mw - 3, pleat_y2)], fill=MASK_FOLD, width=1)
        draw.line([(mx + 3, pleat_y2 + 1), (mx + mw - 3, pleat_y2 + 1)], fill=MASK_LIGHT, width=1)

    # Dark borders
    draw.line([(mx + 3, my), (mx + mw - 3, my)], fill=DARK, width=1)
    draw.line([(mx + 3, my + mh), (mx + mw - 3, my + mh)], fill=DARK, width=1)
    draw.line([(mx, my + 2), (mx, my + mh - 2)], fill=DARK, width=1)
    draw.line([(mx + mw, my + 2), (mx + mw, my + mh - 2)], fill=DARK, width=1)

    # Straps
    draw.line([(mx, strap_left[1]), (strap_left[0], strap_left[1] - 4)], fill=STRAP_WHITE, width=2)
    draw.line([(mx + mw, strap_right[1]), (strap_right[0], strap_right[1] - 4)], fill=STRAP_WHITE, width=2)

def apply_touca_mascara(base, mode):
    img = base.copy()
    draw = ImageDraw.Draw(img)

    # 1. SCRUB CAP (Touca Cirúrgica)
    if mode == 'happy':
        cap_y_start, cap_y_end = 0, 32
        max_x = 218
        cross_pos = (140, 16)
    elif mode == 'sleep':
        cap_y_start, cap_y_end = 14, 40
        max_x = 202 # Stays strictly on head, never touches Zzz letters
        cross_pos = (145, 26)
    else: # focus
        cap_y_start, cap_y_end = 6, 36
        max_x = 232
        cross_pos = (155, 18)

    for y in range(cap_y_start, cap_y_end + 1):
        lx, rx = get_head_bounds(base, y, max_x_limit=max_x)
        if lx is None:
            continue
        # Color smoothly within the head contour
        is_band = (y >= cap_y_end - 4)
        c = TEAL_BAND if is_band else (TEAL_LIGHT if y < cap_y_start + 6 else TEAL_BASE)
        draw.line([(lx + 1, y), (rx - 1, y)], fill=c, width=1)
        # Side shadows
        draw.point((lx + 1, y), fill=TEAL_SHADOW)
        draw.point((rx - 1, y), fill=TEAL_SHADOW)
        # Outline
        draw.point((lx, y), fill=DARK)
        draw.point((rx, y), fill=DARK)

    # Bottom trim
    lx, rx = get_head_bounds(base, cap_y_end, max_x_limit=max_x)
    if lx and rx:
        draw.line([(lx, cap_y_end), (rx, cap_y_end)], fill=DARK, width=1)

    # Embroidered Medical Cross on cap
    cx, cy = cross_pos
    draw.rectangle([cx - 2, cy - 6, cx + 2, cy + 6], fill=(255, 255, 255, 255))
    draw.rectangle([cx - 6, cy - 2, cx + 6, cy + 2], fill=(255, 255, 255, 255))
    draw.rectangle([cx - 1, cy - 5, cx + 1, cy + 5], fill=TEAL_LIGHT)
    draw.rectangle([cx - 5, cy - 1, cx + 5, cy + 1], fill=TEAL_LIGHT)

    # 2. SURGICAL MASK (Máscara Cirúrgica)
    if mode == 'happy':
        draw_mask_on(draw, 146, 76, 48, 22, 82, 90, (126, 80), (206, 80))
    elif mode == 'sleep':
        draw_mask_on(draw, 148, 96, 48, 20, 102, 110, (128, 98), (206, 98))
    else: # focus (Centered snugly over the tilted beak)
        draw_mask_on(draw, 122, 102, 44, 20, 107, 114, (108, 104), (172, 104))

    return img

def apply_jaleco(base, mode):
    img = base.copy()
    draw = ImageDraw.Draw(img)

    if mode in ['happy', 'sleep']:
        # 1. Tailored Lapels (Golas dobradas de jaleco médico)
        # Left lapel (collar)
        left_lapel = [(106, 122), (118, 120), (130, 158), (116, 162), (104, 138)]
        draw.polygon(left_lapel, fill=WHITE_COAT)
        draw.line([(106, 122), (130, 158)], fill=DARK, width=2)
        draw.line([(118, 120), (130, 158)], fill=WHITE_SHADE, width=1)
        draw.line([(104, 138), (116, 162)], fill=WHITE_DEEP, width=1)

        # Right lapel (collar)
        right_lapel = [(188, 122), (176, 120), (164, 158), (178, 162), (190, 138)]
        draw.polygon(right_lapel, fill=WHITE_COAT)
        draw.line([(188, 122), (164, 158)], fill=DARK, width=2)
        draw.line([(176, 120), (164, 158)], fill=WHITE_SHADE, width=1)
        draw.line([(190, 138), (178, 162)], fill=WHITE_DEEP, width=1)

        # 2. Medical Stethoscope (Estetoscópio curvo nos ombros)
        steth_left = [(98, 126), (102, 136), (108, 146), (116, 156), (132, 168)]
        steth_right = [(196, 126), (192, 136), (186, 146), (178, 156), (162, 168)]

        for p1, p2 in zip(steth_left[:-1], steth_left[1:]):
            draw.line([p1, p2], fill=STETH_TUBE, width=3)
        for p1, p2 in zip(steth_right[:-1], steth_right[1:]):
            draw.line([p1, p2], fill=STETH_TUBE, width=3)

        # Center connector & chestpiece bell
        draw.line([(132, 168), (147, 174)], fill=STETH_TUBE, width=3)
        draw.line([(162, 168), (147, 174)], fill=STETH_TUBE, width=3)
        draw.line([(147, 174), (147, 185)], fill=STETH_TUBE, width=3)

        # Bell (diafragma do estetoscópio)
        bx, by = 147, 188
        draw.ellipse([bx - 6, by - 6, bx + 6, by + 6], fill=SILVER_DARK)
        draw.ellipse([bx - 5, by - 5, bx + 5, by + 5], fill=SILVER_BRIGHT)
        draw.ellipse([bx - 3, by - 3, bx + 3, by + 3], fill=(14, 165, 233, 255))
        draw.point((bx - 1, by - 1), fill=(255, 255, 255, 255))

        # 3. Clinical Identification Badge & Pocket on left chest
        px, py = 98, 172
        # Crisp pocket
        draw.rectangle([px, py, px + 20, py + 18], fill=WHITE_COAT, outline=WHITE_DEEP)
        draw.line([(px, py), (px + 20, py)], fill=DARK, width=1)
        # Blue dental probe in pocket
        draw.rectangle([px + 5, py - 7, px + 7, py + 4], fill=(37, 99, 235, 255))
        draw.point((px + 6, py - 5), fill=SILVER_BRIGHT)
        # ID Card lanyard clip
        draw.rectangle([px + 12, py + 2, px + 17, py + 12], fill=(241, 245, 249, 255), outline=DARK)
        draw.line([(px + 13, py + 5), (px + 16, py + 5)], fill=(37, 99, 235, 255), width=1)

    else: # focus
        # In focus mode: coat collar visible around the open textbook
        draw.polygon([(100, 120), (115, 120), (110, 140), (95, 135)], fill=WHITE_COAT, outline=DARK)
        draw.polygon([(194, 120), (179, 120), (184, 140), (199, 135)], fill=WHITE_COAT, outline=DARK)
        draw.line([(96, 128), (105, 150)], fill=STETH_TUBE, width=2)
        draw.line([(198, 128), (189, 150)], fill=STETH_TUBE, width=2)

    return img

def apply_espelho(base, mode):
    img = base.copy()
    draw = ImageDraw.Draw(img)

    # Clinical Dental Examination Mirror beside the owl on the branch
    hx, hy = 224, 152 # Mirror head center
    # Round angled mirror
    draw.ellipse([hx - 9, hy - 9, hx + 9, hy + 9], fill=SILVER_DARK)
    draw.ellipse([hx - 8, hy - 8, hx + 8, hy + 8], fill=SILVER_MID)
    draw.ellipse([hx - 6, hy - 6, hx + 6, hy + 6], fill=(224, 242, 254, 255))
    # Glass glare reflection
    draw.ellipse([hx - 3, hy - 5, hx + 4, hy - 1], fill=(255, 255, 255, 255))

    # Metallic handle
    draw.line([(hx, hy + 8), (hx - 4, 242)], fill=SILVER_MID, width=4)
    draw.line([(hx - 1, hy + 8), (hx - 5, 242)], fill=SILVER_DARK, width=1)
    draw.line([(hx + 1, hy + 8), (hx - 3, 242)], fill=SILVER_BRIGHT, width=1)

    # Knurled dental handle grip
    for gy in range(180, 230, 6):
        draw.line([(hx - 3, gy), (hx + 1, gy)], fill=DARK, width=1)

    # Star glint
    draw.line([(hx + 7, hy - 11), (hx + 7, hy - 5)], fill=(255, 255, 255, 255), width=1)
    draw.line([(hx + 4, hy - 8), (hx + 10, hy - 8)], fill=(255, 255, 255, 255), width=1)

    return img

def apply_lupa(base, mode):
    img = base.copy()
    draw = ImageDraw.Draw(img)

    if mode == 'happy':
        # Head-mounted LED dental surgical headlight
        # Sleek headband
        draw.line([(88, 38), (206, 42)], fill=SILVER_DARK, width=2)
        # Central LED Headlight mount
        lx, ly = 146, 38
        draw.rectangle([lx - 5, ly - 5, lx + 5, ly + 5], fill=SILVER_MID, outline=DARK)
        # Ultra bright LED lens
        draw.ellipse([lx - 3, ly - 3, lx + 3, ly + 3], fill=(254, 240, 138, 255))
        draw.point((lx, ly), fill=(255, 255, 255, 255))
        # Warm dental headlight beam sparkles
        draw.line([(lx, ly - 8), (lx, ly - 6)], fill=(254, 240, 138, 255), width=1)
        draw.line([(lx - 7, ly - 5), (lx - 5, ly - 4)], fill=(254, 240, 138, 255), width=1)
        draw.line([(lx + 7, ly - 5), (lx + 5, ly - 4)], fill=(254, 240, 138, 255), width=1)

    elif mode == 'sleep':
        # Loupe headlight turned off on sleeping forehead
        draw.line([(96, 46), (196, 48)], fill=SILVER_DARK, width=2)
        lx, ly = 146, 47
        draw.rectangle([lx - 5, ly - 5, lx + 5, ly + 5], fill=SILVER_DARK, outline=DARK)
        draw.ellipse([lx - 3, ly - 3, lx + 3, ly + 3], fill=SILVER_MID)

    else: # focus
        # Loupes with LED focused on the book
        draw.line([(95, 42), (205, 42)], fill=SILVER_DARK, width=2)
        lx, ly = 150, 42
        draw.rectangle([lx - 5, ly - 5, lx + 5, ly + 5], fill=SILVER_MID, outline=DARK)
        draw.ellipse([lx - 3, ly - 3, lx + 3, ly + 3], fill=(254, 240, 138, 255))
        # Beam towards book
        draw.polygon([(lx, ly + 6), (120, 120), (180, 120)], fill=(254, 240, 138, 50))

    return img

def apply_dente(base, mode):
    img = base.copy()
    draw = ImageDraw.Draw(img)

    # Golden Molar Trophy proudly standing on the branch
    tx, ty = 222, 218
    # Crown (anatomical molar with cusps)
    draw.rectangle([tx + 4, ty, tx + 24, ty + 12], fill=GOLD_BASE)
    draw.rectangle([tx + 2, ty + 2, tx + 6, ty + 10], fill=GOLD_LIGHT)
    draw.rectangle([tx + 12, ty + 2, tx + 16, ty + 8], fill=GOLD_LIGHT)
    # Two roots
    draw.polygon([(tx + 4, ty + 12), (tx + 11, ty + 12), (tx + 7, ty + 24)], fill=GOLD_BASE)
    draw.polygon([(tx + 17, ty + 12), (tx + 24, ty + 12), (tx + 21, ty + 24)], fill=GOLD_BASE)
    # Shadows
    draw.rectangle([tx + 18, ty + 2, tx + 24, ty + 12], fill=GOLD_SHADOW)
    draw.polygon([(tx + 19, ty + 12), (tx + 24, ty + 12), (tx + 21, ty + 24)], fill=GOLD_SHADOW)

    # Pedestal base on branch
    draw.rectangle([tx, ty + 23, tx + 28, ty + 26], fill=(71, 85, 105, 255))
    draw.rectangle([tx + 2, ty + 24, tx + 26, ty + 25], fill=SILVER_BRIGHT)

    # Sparkle star
    sx, sy = tx + 3, ty - 2
    draw.line([(sx, sy - 3), (sx, sy + 3)], fill=(255, 255, 255, 255), width=1)
    draw.line([(sx - 3, sy), (sx + 3, sy)], fill=(255, 255, 255, 255), width=1)

    return img

def apply_completo(base, mode):
    img = apply_jaleco(base, mode)
    img = apply_touca_mascara(img, mode)
    img = apply_espelho(img, mode)
    return img

def main():
    happy = Image.open('public/owl_happy.png').convert('RGBA')
    sleep = Image.open('public/owl_sleep.png').convert('RGBA')
    focus = Image.open('public/owl_focus.png').convert('RGBA')

    configs = [
        ('jaleco', apply_jaleco),
        ('mascara', apply_touca_mascara),
        ('espelho', apply_espelho),
        ('lupa', apply_lupa),
        ('dente', apply_dente),
        ('completo', apply_completo)
    ]

    for skin_id, fn in configs:
        fn(happy, 'happy').save(f'public/owl_{skin_id}_happy.png')
        fn(sleep, 'sleep').save(f'public/owl_{skin_id}_sleep.png')
        fn(focus, 'focus').save(f'public/owl_{skin_id}_focus.png')
        print(f'Successfully rendered: owl_{skin_id} (happy, sleep, focus)')

if __name__ == '__main__':
    main()
