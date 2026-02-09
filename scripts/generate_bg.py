
from PIL import Image, ImageDraw, ImageFilter
import random
import os

# Output Path
OUT_IMG = 'public/assets/_bg_aquarela.png'
W_PX = 2000 # High res for print
H_PX = int(W_PX * (210/297)) # A4 Landscape ratio

def make_paper_watercolor_bg(w_px, h_px, seed=12):
    random.seed(seed)
    base = Image.new('RGB', (w_px, h_px), (247, 246, 238))

    # Paper grain: noise blended lightly
    try:
        noise = Image.effect_noise((w_px, h_px), 12).convert('L')
    except Exception:
        # Fallback: manual noise
        noise = Image.new('L', (w_px, h_px), 245)
        px = noise.load()
        for y in range(h_px):
            for x in range(w_px):
                px[x, y] = 240 + random.randint(0, 12)

    noise = noise.point(lambda p: 240 + p // 8)
    noise_rgb = Image.merge('RGB', (noise, noise, noise))
    base = Image.blend(base, noise_rgb, 0.25)

    overlay = Image.new('RGBA', (w_px, h_px), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, 'RGBA')

    palette = [
        (14, 99, 48, 90),    # verde
        (240, 212, 24, 75),  # dourado
        (0, 150, 136, 60),   # teal
        (233, 30, 99, 55),   # magenta
        (255, 152, 0, 55),   # laranja
    ]

    # Corner splashes
    corners = {
        'tl': (0.18, 0.25),
        'tr': (0.82, 0.25),
        'bl': (0.18, 0.78),
        'br': (0.82, 0.78),
    }

    for key, (cxn, cyn) in corners.items():
        for _ in range(8):
            color = random.choice(palette)
            r = random.randint(int(w_px * 0.05), int(w_px * 0.13))
            cx = int(random.gauss(w_px * cxn, w_px * 0.07))
            cy = int(random.gauss(h_px * cyn, h_px * 0.07))
            bbox = (cx - r, cy - r, cx + r, cy + r)
            draw.ellipse(bbox, fill=color)
            ox = random.randint(-r // 3, r // 3)
            oy = random.randint(-r // 3, r // 3)
            draw.ellipse((bbox[0] + ox, bbox[1] + oy, bbox[2] + ox, bbox[3] + oy),
                         fill=(color[0], color[1], color[2], int(color[3] * 0.7)))

    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=38))

    # Soft header wash behind logo
    band = Image.new('RGBA', (w_px, h_px), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(band, 'RGBA')
    for _ in range(12):
        color = random.choice(palette)
        r = random.randint(int(w_px * 0.08), int(w_px * 0.16))
        cx = random.randint(int(w_px * 0.34), int(w_px * 0.66))
        cy = random.randint(int(h_px * 0.05), int(h_px * 0.20))
        bdraw.ellipse((cx - r, cy - r, cx + r, cy + r),
                      fill=(color[0], color[1], color[2], int(color[3] * 0.50)))
    band = band.filter(ImageFilter.GaussianBlur(radius=55))
    overlay = Image.alpha_composite(overlay, band)

    bg = base.convert('RGBA')
    bg = Image.alpha_composite(bg, overlay).convert('RGB')
    return bg

if __name__ == '__main__':
    print(f"Generating optimized watercolor background to {OUT_IMG}...")
    bg = make_paper_watercolor_bg(W_PX, H_PX)
    # Ensure directory exists
    os.makedirs(os.path.dirname(OUT_IMG), exist_ok=True)
    bg.save(OUT_IMG, 'PNG', optimize=True)
    print("Done.")
