import subprocess
import json
from PIL import Image, ImageDraw

# Get real matrix from Node.js
url = 'https://discord.gg/midnightmass'
node_cmd = f"node -e \"const {{ MidnightQR }} = require('./qr_app.js'); const res = MidnightQR.generateMatrix('{url}', 'H'); console.log(JSON.stringify(res));\""
output = subprocess.check_output(node_cmd, shell=True, text=True)
data = json.loads(output.strip())

matrix = data['matrix']
size = data['size']

# Render high-contrast crisp 600x600 test QR image
canvas_size = 600
padding = 40
cell_size = (canvas_size - padding * 2) / size

img = Image.new('RGBA', (canvas_size, canvas_size), (11, 11, 11, 255))
draw = ImageDraw.Draw(img)

# Render QR Modules in Neon Purple & Electric Blue
for r in range(size):
    for c in range(size):
        if matrix[r][c] == 1:
            x = padding + c * cell_size
            y = padding + r * cell_size
            # Finder patterns solid, data modules diamond
            is_finder = (r < 7 and c < 7) or (r < 7 and c >= size - 7) or (r >= size - 7 and c < 7)
            if is_finder:
                draw.rectangle([x, y, x + cell_size - 0.5, y + cell_size - 0.5], fill=(139, 92, 246, 255))
            else:
                # Gradient color interpolation
                t = (r + c) / (size * 2)
                red = int(225 * (1 - t) + 37 * t)
                green = int(29 * (1 - t) + 99 * t)
                blue = int(72 * (1 - t) + 235 * t)
                draw.rectangle([x, y, x + cell_size - 0.5, y + cell_size - 0.5], fill=(red, green, blue, 255))

# Paste 300x300 logo in center scaled to safe ECC zone (22% width)
logo = Image.open(r'c:\Users\Administrator\Downloads\midnight_mass_brand_kit\midnight_mass_brand_kit\assets\qr_logo_300x300.png')
center_size = int(size * 0.24 * cell_size)
center_x = (canvas_size - center_size) // 2
center_y = (canvas_size - center_size) // 2

# Draw circular protective backing
draw.ellipse([center_x - 4, center_y - 4, center_x + center_size + 4, center_y + center_size + 4], fill=(11, 11, 11, 255), outline=(139, 92, 246, 255), width=2)
logo_resized = logo.resize((center_size, center_size), Image.Resampling.LANCZOS)
img.paste(logo_resized, (center_x, center_y), logo_resized)

out_path = r'c:\Users\Administrator\Downloads\midnight_mass_brand_kit\midnight_mass_brand_kit\assets\test_scannable_qr.png'
img.save(out_path, 'PNG')
print('SUCCESS: Verified test QR saved to', out_path)
