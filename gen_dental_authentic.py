from PIL import Image, ImageDraw

def render_authentic_pixel_dental_sprites():
    # Colors
    DARK = (45, 40, 53, 255)
    WHITE = (252, 252, 255, 255)
    WHITE_SHADOW = (205, 214, 226, 255)
    WHITE_DEEP = (160, 174, 192, 255)
    
    TEAL_BASE = (13, 148, 136, 255)      # Medical scrub teal
    TEAL_LIGHT = (45, 212, 191, 255)
    TEAL_DARK = (15, 118, 110, 255)
    
    BLUE_BASE = (56, 189, 248, 255)      # Surgical mask blue
    BLUE_LIGHT = (186, 230, 253, 255)
    BLUE_DARK = (14, 116, 144, 255)
    
    SILVER_LIGHT = (248, 250, 252, 255)
    SILVER_MID = (203, 213, 225, 255)
    SILVER_DARK = (100, 116, 139, 255)
    
    GOLD_LIGHT = (254, 240, 138, 255)
    GOLD_BASE = (245, 158, 11, 255)
    GOLD_DARK = (180, 83, 9, 255)

    def draw_pixel_blocks(img, blocks):
        """Draws pixel blocks where each block is (x, y, w, h, color)"""
        draw = ImageDraw.Draw(img)
        for x, y, w, h, col in blocks:
            draw.rectangle([x, y, x + w - 1, y + h - 1], fill=col)

    # 1. JALECO BRANCO (Clinically fitted coat following owl curvature)
    def apply_jaleco(base_img, is_focus=False):
        img = base_img.copy()
        blocks = []
        B = 4 # block size
        
        if not is_focus:
            # Main coat body rows (from neck Y=120 down to Y=216)
            # Row definitions: y, x_start, x_end
            rows = [
                (124, 104, 196),
                (128, 100, 200),
                (132, 96, 204),
                (136, 92, 208),
                (140, 88, 212),
                (144, 88, 216),
                (148, 88, 216),
                (152, 88, 216),
                (156, 92, 216),
                (160, 92, 216),
                (164, 92, 216),
                (168, 96, 212),
                (172, 96, 212),
                (176, 96, 212),
                (180, 100, 208),
                (184, 100, 208),
                (188, 104, 204),
                (192, 104, 204),
                (196, 108, 200),
                (200, 112, 196),
                (204, 116, 192),
                (208, 120, 188),
                (212, 124, 184)
            ]
            
            # Fill coat body with white and shadow
            for y, xs, xe in rows:
                # Left outline
                blocks.append((xs, y, B, B, DARK))
                # Left shadow
                blocks.append((xs + B, y, B * 2, B, WHITE_SHADOW))
                # White body
                blocks.append((xs + B * 3, y, xe - xs - B * 6, B, WHITE))
                # Right shadow
                blocks.append((xe - B * 3, y, B * 2, B, WHITE_SHADOW))
                # Right outline
                blocks.append((xe - B, y, B, B, DARK))
                
            # Bottom hem outline
            blocks.append((124, 216, 60, B, DARK))
            
            # V-Neck & Lapels (Gola dobrada)
            lapel_blocks = [
                # Left lapel (collar)
                (108, 124, 16, 8, WHITE_SHADOW),
                (112, 132, 16, 12, WHITE),
                (116, 144, 12, 12, WHITE),
                (120, 156, 8, 8, WHITE_SHADOW),
                # Right lapel (collar)
                (176, 124, 16, 8, WHITE_SHADOW),
                (172, 132, 16, 12, WHITE),
                (168, 144, 12, 12, WHITE),
                (168, 156, 8, 8, WHITE_SHADOW),
                # Inner V-neck opening (exposing chest feathers)
                (132, 124, 36, 12, (254, 248, 241, 255)),
                (136, 136, 28, 12, (254, 248, 241, 255)),
                (144, 148, 12, 8, (254, 248, 241, 255)),
            ]
            blocks.extend(lapel_blocks)
            
            # Center placket & buttons
            for by in range(156, 212, B):
                blocks.append((148, by, 4, B, WHITE_DEEP))
            # 4 buttons
            for by in [164, 176, 188, 200]:
                blocks.append((147, by, 6, 4, SILVER_DARK))
                blocks.append((148, by + 1, 4, 2, SILVER_LIGHT))
                
            # Pocket with Green Dental Caduceus / Tooth emblem (X: 112..132, Y: 172..192)
            blocks.append((112, 172, 24, B, DARK)) # pocket rim
            blocks.append((112, 176, 24, 16, WHITE_SHADOW)) # pocket body
            blocks.append((112, 192, 24, B, DARK)) # pocket bottom
            blocks.append((112, 176, B, 16, DARK)) # pocket left
            blocks.append((132, 176, B, 16, DARK)) # pocket right
            
            # Green tooth embroidered on pocket
            blocks.append((120, 180, 8, 4, TEAL_BASE))
            blocks.append((120, 184, 3, 5, TEAL_BASE))
            blocks.append((125, 184, 3, 5, TEAL_BASE))
            
            # Stethoscope tubing draped around neck
            stetho = [
                # Left curve
                (96, 132, B, B, SILVER_DARK),
                (100, 140, B, B, SILVER_DARK),
                (104, 148, B, B, SILVER_DARK),
                (108, 156, B, B, SILVER_DARK),
                # Right curve
                (200, 132, B, B, SILVER_DARK),
                (196, 140, B, B, SILVER_DARK),
                (192, 148, B, B, SILVER_DARK),
                (188, 156, B, B, SILVER_DARK),
                (184, 164, B, B, SILVER_DARK),
                # Chest piece
                (180, 172, 10, 10, SILVER_DARK),
                (182, 174, 6, 6, TEAL_LIGHT)
            ]
            blocks.extend(stetho)
            
        else: # In focus (reading book): show coat on shoulders and collar above/around book
            focus_blocks = [
                # Left shoulder coat
                (76, 128, 24, 48, WHITE),
                (72, 128, B, 48, DARK),
                (76, 176, 24, B, DARK),
                # Right shoulder coat
                (196, 128, 28, 48, WHITE),
                (224, 128, B, 48, DARK),
                (196, 176, 28, B, DARK),
                # Collar flaps above the book
                (100, 120, 16, 12, WHITE_SHADOW),
                (180, 120, 16, 12, WHITE_SHADOW),
                # Bottom coat peek under book
                (116, 216, 68, 12, WHITE),
                (116, 228, 68, B, DARK)
            ]
            blocks.extend(focus_blocks)

        draw_pixel_blocks(img, blocks)
        return img

    # 2. TOUCA E MASCARA (Scrub Cap & Mask)
    def apply_touca_mascara(base_img, is_sleep=False, is_focus=False):
        img = base_img.copy()
        blocks = []
        B = 4
        
        # Scrub Cap (Touca Cirúrgica) fitting head dome (Y: 8..52, X: 76..220)
        cap_rows = [
            (8, 116, 180),
            (12, 104, 192),
            (16, 96, 200),
            (20, 88, 208),
            (24, 84, 212),
            (28, 80, 216),
            (32, 80, 216),
            (36, 76, 220),
            (40, 76, 220),
            (44, 80, 216), # elastic band
            (48, 84, 212)
        ]
        for y, xs, xe in cap_rows:
            is_band = y >= 44
            color_base = TEAL_DARK if is_band else TEAL_BASE
            blocks.append((xs, y, B, B, DARK))
            blocks.append((xs + B, y, xe - xs - B * 2, B, color_base))
            blocks.append((xe - B, y, B, B, DARK))
            # highlight on top
            if y in [12, 16, 20]:
                blocks.append((xs + 20, y, 32, B, TEAL_LIGHT))
                
        # Pattern dots (cute scrub cap dental print)
        dots = [(108, 20), (136, 16), (164, 20), (188, 24), (120, 32), (148, 28), (176, 32)]
        for dx, dy in dots:
            blocks.append((dx, dy, 4, 4, WHITE))
            
        # Surgical Mask (Máscara Cirúrgica)
        if is_focus:
            mx, my, mw, mh = 112, 88, 56, 24
        elif is_sleep:
            mx, my, mw, mh = 140, 92, 56, 24
        else:
            mx, my, mw, mh = 136, 80, 68, 28
            
        # Mask body with 3 pleats
        blocks.append((mx, my, mw, B, DARK)) # top border
        blocks.append((mx, my + mh - B, mw, B, DARK)) # bottom border
        blocks.append((mx, my, B, mh, DARK)) # left border
        blocks.append((mx + mw - B, my, B, mh, DARK)) # right border
        
        # Pleat layers
        blocks.append((mx + B, my + B, mw - B * 2, 6, BLUE_LIGHT))
        blocks.append((mx + B, my + B + 6, mw - B * 2, 2, BLUE_DARK)) # pleat fold 1
        blocks.append((mx + B, my + B + 8, mw - B * 2, 6, BLUE_BASE))
        blocks.append((mx + B, my + B + 14, mw - B * 2, 2, BLUE_DARK)) # pleat fold 2
        blocks.append((mx + B, my + B + 16, mw - B * 2, mh - 20, BLUE_BASE))
        
        # Mask straps
        strap_color = (240, 248, 255, 255)
        blocks.append((mx - 12, my + 4, 12, 2, strap_color))
        blocks.append((mx - 24, my - 2, 14, 2, strap_color))
        blocks.append((mx + mw, my + 4, 16, 2, strap_color))
        blocks.append((mx + mw + 14, my - 2, 16, 2, strap_color))

        draw_pixel_blocks(img, blocks)
        return img

    # 3. ESPELHO CLÍNICO ODONTOLÓGICO (Dental Mirror in Wing)
    def apply_espelho(base_img):
        img = base_img.copy()
        blocks = []
        B = 4
        
        # Handle (shaft) rising from behind the wing
        handle = [
            (36, 224, 6, 8),
            (40, 212, 6, 12),
            (44, 196, 6, 16),
            (48, 176, 6, 20),
            (52, 156, 6, 20),
            (56, 136, 6, 20),
            (60, 116, 6, 20),
            (64, 100, 6, 16),
            (68, 88, 6, 12),
        ]
        for hx, hy, hw, hh in handle:
            blocks.append((hx, hy, hw, hh, SILVER_MID))
            blocks.append((hx + 1, hy, 2, hh, SILVER_LIGHT))
            blocks.append((hx + hw - 1, hy, 1, hh, SILVER_DARK))
            
        # Mirror Head (Angled circular mirror disk at X: 64..96, Y: 60..92)
        m_rows = [
            (60, 76, 88),
            (64, 72, 92),
            (68, 68, 96),
            (72, 64, 100),
            (76, 64, 100),
            (80, 68, 96),
            (84, 72, 92),
            (88, 76, 88)
        ]
        for y, xs, xe in m_rows:
            blocks.append((xs, y, B, B, DARK))
            blocks.append((xe - B, y, B, B, DARK))
            blocks.append((xs + B, y, xe - xs - B * 2, B, (186, 230, 253, 255))) # mirror glass
            
        # Top and bottom rim
        blocks.append((76, 56, 12, B, DARK))
        blocks.append((76, 92, 12, B, DARK))
        
        # Mirror glass reflection / sheen
        blocks.append((72, 68, 8, 4, (255, 255, 255, 255)))
        blocks.append((76, 72, 12, 4, (255, 255, 255, 255)))
        blocks.append((80, 76, 8, 4, (255, 255, 255, 255)))

        draw_pixel_blocks(img, blocks)
        return img

    # 4. LUPAS CIRÚRGICAS & HEADLIGHT (Dental Loupes + Headlight)
    def apply_lupa(base_img, is_happy=False):
        img = base_img.copy()
        blocks = []
        B = 4
        
        # Titanium frames around eyes (X: 96..204, Y: 64..92)
        # Left barrel
        blocks.append((96, 64, 40, B, DARK))
        blocks.append((96, 92, 40, B, DARK))
        blocks.append((96, 64, B, 32, DARK))
        blocks.append((132, 64, B, 32, DARK))
        blocks.append((100, 68, 32, 24, (30, 41, 59, 255)))
        # Lens optic glass
        blocks.append((104, 72, 24, 16, (56, 189, 248, 255)))
        blocks.append((108, 74, 8, 4, WHITE)) # gleam
        
        # Right barrel
        blocks.append((164, 64, 40, B, DARK))
        blocks.append((164, 92, 40, B, DARK))
        blocks.append((164, 64, B, 32, DARK))
        blocks.append((200, 64, B, 32, DARK))
        blocks.append((168, 68, 32, 24, (30, 41, 59, 255)))
        # Lens optic glass
        blocks.append((172, 72, 24, 16, (56, 189, 248, 255)))
        blocks.append((176, 74, 8, 4, WHITE)) # gleam
        
        # Bridge connecting glasses
        blocks.append((136, 72, 28, B, SILVER_DARK))
        blocks.append((136, 76, 28, B, DARK))
        
        # Center LED Headlight (Farol Cirúrgico de LED montado na testa)
        blocks.append((142, 52, 16, 14, DARK)) # housing
        blocks.append((144, 54, 12, 10, SILVER_MID))
        blocks.append((146, 56, 8, 6, GOLD_LIGHT)) # LED lens
        # Light cone effect (rays)
        blocks.append((148, 66, 4, 6, (254, 240, 138, 180)))
        blocks.append((144, 72, 12, 6, (254, 240, 138, 120)))

        draw_pixel_blocks(img, blocks)
        return img

    # 5. MOLAR DE OURO (Golden Tooth Perch Trophy)
    def apply_dente(base_img):
        img = base_img.copy()
        blocks = []
        B = 4
        tx, ty = 228, 204
        
        # Golden Molar Tooth sitting on the branch
        # Cuspids (Crown)
        blocks.append((tx + 4, ty, 8, B, GOLD_LIGHT))
        blocks.append((tx + 16, ty - 2, 8, B, GOLD_LIGHT))
        blocks.append((tx + 28, ty, 8, B, GOLD_LIGHT))
        
        # Crown body
        blocks.append((tx + 2, ty + 4, 36, 16, GOLD_BASE))
        blocks.append((tx + 4, ty + 6, 28, 6, GOLD_LIGHT)) # highlight
        blocks.append((tx, ty + 4, B, 16, DARK))
        blocks.append((tx + 36, ty + 4, B, 16, DARK))
        
        # Furcation / Roots
        blocks.append((tx + 4, ty + 20, 12, 16, GOLD_BASE)) # left root
        blocks.append((tx + 24, ty + 20, 12, 16, GOLD_BASE)) # right root
        blocks.append((tx + 16, ty + 20, 8, 8, DARK)) # root bifurcation space
        
        # Outlines
        blocks.append((tx + 4, ty + 36, 12, B, DARK))
        blocks.append((tx + 24, ty + 36, 12, B, DARK))
        
        # Sparkles of hygiene / brilliance
        sp1 = [(tx - 6, ty + 4), (tx + 44, ty), (tx + 40, ty + 28)]
        for sx, sy in sp1:
            blocks.append((sx, sy - 2, 2, 6, WHITE))
            blocks.append((sx - 2, sy, 6, 2, WHITE))

        draw_pixel_blocks(img, blocks)
        return img

    # 6. CIRURGIÃ-DENTISTA COMPLETA (Jaleco + Touca + Máscara + Espelho)
    def apply_completo(base_img, is_sleep=False, is_focus=False):
        img = apply_jaleco(base_img, is_focus)
        img = apply_touca_mascara(img, is_sleep, is_focus)
        img = apply_espelho(img)
        return img

    # Generate all
    happy = Image.open('public/owl_happy.png').convert('RGBA')
    focus = Image.open('public/owl_focus.png').convert('RGBA')
    sleep = Image.open('public/owl_sleep.png').convert('RGBA')

    skins = [
        ('jaleco', lambda b, s, f: apply_jaleco(b, f)),
        ('mascara', lambda b, s, f: apply_touca_mascara(b, s, f)),
        ('espelho', lambda b, s, f: apply_espelho(b)),
        ('lupa', lambda b, s, f: apply_lupa(b, True)),
        ('dente', lambda b, s, f: apply_dente(b)),
        ('completo', lambda b, s, f: apply_completo(b, s, f)),
    ]

    for skin_id, func in skins:
        func(happy, False, False).save(f'public/owl_{skin_id}_happy.png')
        func(focus, False, True).save(f'public/owl_{skin_id}_focus.png')
        func(sleep, True, False).save(f'public/owl_{skin_id}_sleep.png')
        print(f'Rendered authentic pixel outfit: {skin_id}')

render_authentic_pixel_dental_sprites()
print('All authentic pixel dental outfits rendered!')
