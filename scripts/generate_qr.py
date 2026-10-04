"""
╔══════════════════════════════════════════════════════════╗
║       MIDNIGHT MASS — Sacred QR Code Generator          ║
║       Standalone CLI Tool | Python + qrcode + Pillow    ║
╚══════════════════════════════════════════════════════════╝
Usage:
  python generate_qr.py
  python generate_qr.py --url "https://discord.gg/midnightmass" --source "sticker_restroom"
  python generate_qr.py --url "https://discord.gg/midnightmass" --source "tiktok_bio" --size 3000

Requirements:
  pip install qrcode[pil] pillow
"""

import argparse
import os
import sys
import datetime

try:
    import qrcode
    from qrcode.image.styledpil import StyledPilImage
    from qrcode.image.styles.moduledrawers import RoundedModuleDrawer, SquareModuleDrawer, GappedSquareModuleDrawer
    from qrcode.image.styles.colormasks import RadialGradiantColorMask, SquareGradiantColorMask
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
except ImportError:
    print("\n⚠  Required packages not found. Installing now...")
    os.system("pip install qrcode[pil] pillow")
    import qrcode
    from qrcode.image.styledpil import StyledPilImage
    from qrcode.image.styles.moduledrawers import RoundedModuleDrawer, SquareModuleDrawer
    from qrcode.image.styles.colormasks import RadialGradiantColorMask
    from PIL import Image, ImageDraw, ImageFont, ImageFilter


# ── Sacred Color Palette (Color-Hex 1045971) ──────────────────────────────────
COLORS = {
    "bg":           (10, 6, 13),        # #0a060d  Obsidian Void
    "deep_wine":    (30, 8, 17),        # #1e0811  Deep Wine Shadow
    "blood":        (84, 13, 26),       # #540d1a  Blood Crimson
    "sacred_blood": (140, 20, 36),      # #8c1424  Sacred Blood
    "flame":        (179, 32, 46),      # #b3202e  Blood Flame
    "gold":         (212, 175, 55),     # #d4af37  Gold Leaf
    "gold_glow":    (230, 198, 109),    # #e6c66d  Candle Glow
    "parchment":    (199, 179, 155),    # #c7b39b  Muted Parchment
    "white":        (243, 239, 230),    # #f3efe6  Off White
}

# ── UTM Campaign Presets ───────────────────────────────────────────────────────
UTM_PRESETS = {
    "sticker_restroom":   "utm_source=sticker_restroom&utm_medium=qr_code&utm_campaign=midnight_mass_sanctuary",
    "campus_flyer":       "utm_source=poster_campus&utm_medium=qr_code&utm_campaign=midnight_mass_sanctuary",
    "tiktok_bio":         "utm_source=social_tiktok&utm_medium=qr_code&utm_campaign=midnight_mass_sanctuary",
    "instagram":          "utm_source=social_instagram&utm_medium=qr_code&utm_campaign=midnight_mass_sanctuary",
    "reddit":             "utm_source=reddit_post&utm_medium=qr_code&utm_campaign=midnight_mass_sanctuary",
    "merch_insert":       "utm_source=merch_insert_card&utm_medium=qr_code&utm_campaign=midnight_mass_sanctuary",
    "email_outreach":     "utm_source=email_outreach&utm_medium=qr_code&utm_campaign=midnight_mass_sanctuary",
    "club_sticker":       "utm_source=club_sticker&utm_medium=qr_code&utm_campaign=midnight_mass_sanctuary",
    "vinyl_record_shop":  "utm_source=vinyl_record_shop&utm_medium=qr_code&utm_campaign=midnight_mass_sanctuary",
    "street_post":        "utm_source=street_post&utm_medium=qr_code&utm_campaign=midnight_mass_sanctuary",
}


def build_url(base_url: str, source_key: str) -> str:
    params = UTM_PRESETS.get(source_key, f"utm_source={source_key}&utm_medium=qr_code&utm_campaign=midnight_mass_sanctuary")
    return f"{base_url}?{params}"


def generate_qr(url: str, output_path: str, size: int = 2048, style: str = "rounded") -> Image.Image:
    """Generate a styled QR code with gold-on-obsidian color scheme."""
    qr = qrcode.QRCode(
        version=3,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=20,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    if style == "rounded":
        drawer = RoundedModuleDrawer()
    elif style == "gapped":
        drawer = GappedSquareModuleDrawer()
    else:
        drawer = SquareModuleDrawer()

    color_mask = RadialGradiantColorMask(
        back_color=COLORS["bg"],
        center_color=COLORS["gold_glow"],
        edge_color=COLORS["sacred_blood"],
    )

    img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=drawer,
        color_mask=color_mask,
    )

    # Convert to RGBA for compositing
    img = img.convert("RGBA")
    img = img.resize((size, size), Image.LANCZOS)
    return img


def add_filigree_border(img: Image.Image, size: int) -> Image.Image:
    """Add a double gold filigree border frame around the QR code."""
    bordered = Image.new("RGBA", (size + 120, size + 120), COLORS["bg"] + (255,))
    draw = ImageDraw.Draw(bordered)

    # Outer border
    draw.rectangle([8, 8, size + 111, size + 111], outline=COLORS["gold"], width=4)
    # Inner border
    draw.rectangle([20, 20, size + 99, size + 99], outline=COLORS["sacred_blood"], width=1)
    # Inner inner filigree
    draw.rectangle([30, 30, size + 89, size + 89], outline=COLORS["blood"] + (120,), width=1)

    # Corner ornaments
    corners = [(40, 40), (size + 78, 40), (40, size + 78), (size + 78, size + 78)]
    for cx, cy in corners:
        draw.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=COLORS["gold"])
        draw.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=COLORS["bg"])

    bordered.paste(img, (60, 60), img)
    return bordered


def add_codex_label(img: Image.Image, label_text: str = "discord.gg/midnightmass") -> Image.Image:
    """Add a sacred label bar at the bottom of the QR code image."""
    w, h = img.size
    label_height = 90
    final = Image.new("RGBA", (w, h + label_height), COLORS["deep_wine"] + (255,))
    final.paste(img, (0, 0))

    draw = ImageDraw.Draw(final)
    # Separator line
    draw.line([(20, h + 1), (w - 20, h + 1)], fill=COLORS["gold"], width=2)

    # Try to use a system font, fallback to default
    try:
        font = ImageFont.truetype("arial.ttf", 28)
    except:
        font = ImageFont.load_default()

    # Centered label text
    bbox = draw.textbbox((0, 0), label_text, font=font)
    text_w = bbox[2] - bbox[0]
    text_x = (w - text_w) // 2
    text_y = h + 22

    # Gold glow shadow
    for offset in [(2, 2), (-2, -2), (2, -2), (-2, 2)]:
        draw.text((text_x + offset[0], text_y + offset[1]), label_text, fill=COLORS["sacred_blood"], font=font)
    draw.text((text_x, text_y), label_text, fill=COLORS["gold"], font=font)

    # Sacred ornaments
    draw.text((30, h + 28), "✦", fill=COLORS["sacred_blood"], font=font)
    draw.text((w - 55, h + 28), "✦", fill=COLORS["sacred_blood"], font=font)

    return final


def batch_generate_all(base_url: str, output_dir: str, size: int = 2048, style: str = "rounded"):
    """Generate one QR code for every UTM placement in the campaign matrix."""
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M")
    print(f"\n✦ Midnight Mass — Generating Sacred QR Batch ({len(UTM_PRESETS)} placements)...\n")

    for source_key in UTM_PRESETS:
        url = build_url(base_url, source_key)
        qr_img = generate_qr(url, output_dir, size=size, style=style)
        bordered = add_filigree_border(qr_img, size)
        labeled = add_codex_label(bordered, base_url.replace("https://", ""))

        filename = os.path.join(output_dir, f"MidnightMass_QR_{source_key}_{timestamp}.png")
        labeled.save(filename, "PNG", dpi=(300, 300))
        print(f"  ✓ Saved: {filename}")
        print(f"    └─ URL: {url[:80]}...")

    print(f"\n✦ Sacred batch complete. {len(UTM_PRESETS)} QR codes written to:\n  {output_dir}\n")


def interactive_mode(base_url: str, output_dir: str):
    """Interactive prompt-driven QR generation."""
    print("\n╔══════════════════════════════════════════╗")
    print("║   MIDNIGHT MASS — Sacred QR Generator   ║")
    print("╚══════════════════════════════════════════╝")
    print(f"\nBase URL: {base_url}")
    print("\nAvailable placement sources:")
    for i, key in enumerate(UTM_PRESETS, 1):
        print(f"  {i:2}. {key}")
    print(f"  {len(UTM_PRESETS)+1:2}. [ALL] Generate complete batch for all placements")
    print(f"  {len(UTM_PRESETS)+2:2}. [CUSTOM] Enter a custom source tag")

    choice = input("\nSelect source (number): ").strip()

    try:
        idx = int(choice)
    except ValueError:
        print("Invalid choice.")
        return

    if idx == len(UTM_PRESETS) + 1:
        size = input("Output size in pixels [2048]: ").strip() or "2048"
        batch_generate_all(base_url, output_dir, int(size))
    elif idx == len(UTM_PRESETS) + 2:
        custom = input("Enter custom source tag (e.g. 'subway_pole'): ").strip()
        url = build_url(base_url, custom)
        generate_single(url, custom, output_dir)
    elif 1 <= idx <= len(UTM_PRESETS):
        source_key = list(UTM_PRESETS.keys())[idx - 1]
        url = build_url(base_url, source_key)
        generate_single(url, source_key, output_dir)
    else:
        print("Choice out of range.")


def generate_single(url: str, label: str, output_dir: str, size: int = 2048, style: str = "rounded"):
    """Generate and save one QR code."""
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    qr_img = generate_qr(url, output_dir, size=size, style=style)
    bordered = add_filigree_border(qr_img, size)
    labeled = add_codex_label(bordered, url.split("?")[0].replace("https://", ""))
    filename = os.path.join(output_dir, f"MidnightMass_QR_{label}_{timestamp}.png")
    labeled.save(filename, "PNG", dpi=(300, 300))
    print(f"\n✦ Sacred QR Generated:\n  {filename}\n  URL: {url}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Midnight Mass Sacred QR Code Generator")
    parser.add_argument("--url",    default="https://discord.gg/midnightmass", help="Base invite URL")
    parser.add_argument("--source", default=None, help="UTM source key (see presets) or 'all' for batch")
    parser.add_argument("--size",   default=2048, type=int, help="Output size in pixels (default: 2048)")
    parser.add_argument("--style",  default="rounded", choices=["rounded", "square", "gapped"], help="QR module style")
    parser.add_argument("--output", default=os.path.join(os.path.expanduser("~"), "Documents", "MidnightMass_GrowthHub", "QR_Exports"), help="Output directory")
    args = parser.parse_args()

    if args.source is None:
        interactive_mode(args.url, args.output)
    elif args.source == "all":
        batch_generate_all(args.url, args.output, args.size, args.style)
    else:
        url = build_url(args.url, args.source)
        generate_single(url, args.source, args.output, args.size, args.style)
