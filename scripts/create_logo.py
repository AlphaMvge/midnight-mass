import os
from PIL import Image, ImageDraw, ImageFilter

# Target size: 300x300 px, 72 dpi
width, height = 300, 300
img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Exact Brand Colors from Midnight Mass color_palette.json & BRAND_GUIDE.md
HEX_VOID_BLACK = (11, 11, 11, 255)
HEX_DEEP_NIGHT = (18, 17, 25, 255)
HEX_CRIMSON_ROSE = (225, 29, 72, 255)
HEX_NEON_PURPLE = (139, 92, 246, 255)
HEX_ELECTRIC_BLUE = (37, 99, 235, 255)
HEX_CYAN_GLOW = (6, 182, 212, 255)
HEX_CRIMSON_DRIP = (155, 27, 27, 255)
HEX_PURE_WHITE = (255, 255, 255, 255)
HEX_MOONLIGHT = (208, 216, 232, 255)
HEX_GOLD = (212, 175, 55, 255)

center = (150, 150)
radius = 140

# Outer Dark Circular Base
draw.ellipse([center[0]-radius, center[1]-radius, center[0]+radius, center[1]+radius], fill=HEX_VOID_BLACK, outline=HEX_NEON_PURPLE, width=4)

# Multi-Color Neon Radial Glow Effect (Crimson -> Purple -> Cyan)
glow = Image.new('RGBA', (width, height), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)
glow_draw.ellipse([center[0]-132, center[1]-132, center[0]+132, center[1]+132], outline=HEX_CRIMSON_ROSE, width=6)
glow_draw.ellipse([center[0]-126, center[1]-126, center[0]+126, center[1]+126], outline=HEX_NEON_PURPLE, width=4)
glow_draw.ellipse([center[0]-122, center[1]-122, center[0]+122, center[1]+122], outline=HEX_CYAN_GLOW, width=2)
glow = glow.filter(ImageFilter.GaussianBlur(radius=3))
img.paste(glow, (0, 0), glow)

# Crisp Inner Rings
draw.ellipse([center[0]-135, center[1]-135, center[0]+135, center[1]+135], outline=HEX_PURE_WHITE, width=2)
draw.ellipse([center[0]-128, center[1]-128, center[0]+128, center[1]+128], outline=HEX_GOLD, width=1)

# Full Moon Circle Backdrop
moon_radius = 60
moon_center = (150, 115)
draw.ellipse([moon_center[0]-moon_radius, moon_center[1]-moon_radius, moon_center[0]+moon_radius, moon_center[1]+moon_radius], fill=HEX_MOONLIGHT)

# Church Spire Silhouette Overlay
spire_pts = [
    (150, 45),
    (155, 100),
    (165, 130),
    (165, 205),
    (135, 205),
    (135, 130),
    (145, 100)
]
draw.polygon(spire_pts, fill=HEX_VOID_BLACK)

# Sacred Cross at Spire Peak
draw.line([(150, 36), (150, 50)], fill=HEX_PURE_WHITE, width=3)
draw.line([(144, 42), (156, 42)], fill=HEX_PURE_WHITE, width=3)

# Gothic Wordmark M Shield Base
draw.rectangle([105, 175, 195, 245], fill=HEX_DEEP_NIGHT, outline=HEX_NEON_PURPLE, width=2)

# Blackletter "M" Character Drawing
draw.line([(120, 185), (120, 235)], fill=HEX_PURE_WHITE, width=5)
draw.line([(120, 185), (150, 220)], fill=HEX_PURE_WHITE, width=5)
draw.line([(150, 220), (180, 185)], fill=HEX_PURE_WHITE, width=5)
draw.line([(180, 185), (180, 235)], fill=HEX_PURE_WHITE, width=5)

# Signature Blood-Drip Accents
draw.line([(120, 235), (120, 242)], fill=HEX_CRIMSON_ROSE, width=3)
draw.line([(180, 235), (180, 242)], fill=HEX_CRIMSON_ROSE, width=3)
draw.line([(150, 220), (150, 230)], fill=HEX_CRIMSON_DRIP, width=3)

# Save high precision PNG with 72 DPI metadata
out_dir = r'c:\Users\Administrator\Downloads\midnight_mass_brand_kit\midnight_mass_brand_kit\assets'
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, 'qr_logo_300x300.png')
img.save(out_path, 'PNG', dpi=(72, 72))
print('SUCCESS: QR Code Logo created at', out_path)
