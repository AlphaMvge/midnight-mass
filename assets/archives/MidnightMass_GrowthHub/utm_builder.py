"""
╔══════════════════════════════════════════════════════════════════════╗
║   MIDNIGHT MASS — UTM Batch Campaign Builder                        ║
║   Generates ALL tracked URLs + QR codes for every placement spot    ║
║   Outputs: CSV report + ready-to-share URL list                     ║
╚══════════════════════════════════════════════════════════════════════╝
Usage:
  python utm_builder.py
  python utm_builder.py --url "https://discord.gg/midnightmass"
"""

import csv
import os
import datetime
import argparse
import webbrowser

BASE_URL = "https://discord.gg/midnightmass"
OUTPUT_DIR = os.path.join(os.path.expanduser("~"), "Documents", "MidnightMass_GrowthHub", "UTM_Reports")

PLACEMENTS = [
    {
        "category": "REDDIT",
        "name": "r/goth",
        "source": "reddit_goth",
        "medium": "forum_post",
        "notes": "Post gothic aesthetic intro + server invite image. 180k+ members.",
        "post_url": "https://reddit.com/r/goth/submit",
        "priority": "HIGH",
    },
    {
        "category": "REDDIT",
        "name": "r/DarkAcademia",
        "source": "reddit_darkacademia",
        "medium": "forum_post",
        "notes": "Dark academia candlelit aesthetic. 210k+ members. Share atmosphere posts.",
        "post_url": "https://reddit.com/r/DarkAcademia/submit",
        "priority": "HIGH",
    },
    {
        "category": "REDDIT",
        "name": "r/DiscordServers",
        "source": "reddit_discordservers",
        "medium": "forum_post",
        "notes": "Direct server promotion sub. Post high-res poster with QR code embedded.",
        "post_url": "https://reddit.com/r/DiscordServers/submit",
        "priority": "HIGH",
    },
    {
        "category": "REDDIT",
        "name": "r/GothStyle",
        "source": "reddit_gothstyle",
        "medium": "forum_post",
        "notes": "Core merch audience. 150k+ members. Outfit posts with logo.",
        "post_url": "https://reddit.com/r/GothStyle/submit",
        "priority": "HIGH",
    },
    {
        "category": "REDDIT",
        "name": "r/altfashion",
        "source": "reddit_altfashion",
        "medium": "forum_post",
        "notes": "Alt fashion community. Great pre-launch merch audience.",
        "post_url": "https://reddit.com/r/altfashion/submit",
        "priority": "MEDIUM",
    },
    {
        "category": "REDDIT",
        "name": "r/witchcraft",
        "source": "reddit_witchcraft",
        "medium": "forum_post",
        "notes": "Occult / ritual aesthetic overlap. Post late-night vibes.",
        "post_url": "https://reddit.com/r/witchcraft/submit",
        "priority": "MEDIUM",
    },
    {
        "category": "REDDIT",
        "name": "r/synthwave",
        "source": "reddit_synthwave",
        "medium": "forum_post",
        "notes": "Neon noir / night aesthetic community. 500k+ members.",
        "post_url": "https://reddit.com/r/synthwave/submit",
        "priority": "MEDIUM",
    },
    {
        "category": "REDDIT",
        "name": "r/emogirls",
        "source": "reddit_emogirls",
        "medium": "forum_post",
        "notes": "High alt fashion overlap. Post aesthetic photo content.",
        "post_url": "https://reddit.com/r/emogirls/submit",
        "priority": "MEDIUM",
    },
    {
        "category": "DISCORD_LISTING",
        "name": "Disboard",
        "source": "disboard_listing",
        "medium": "discord_directory",
        "notes": "Register server. Tags: goth, night-owl, chill, aesthetic, sanctuary. Bump every 2hrs.",
        "post_url": "https://disboard.org/server/add",
        "priority": "HIGH",
    },
    {
        "category": "DISCORD_LISTING",
        "name": "Top.gg Servers",
        "source": "topgg_listing",
        "medium": "discord_directory",
        "notes": "List Midnight Mass with gothic media and invite link.",
        "post_url": "https://top.gg/servers",
        "priority": "HIGH",
    },
    {
        "category": "DISCORD_LISTING",
        "name": "Discord.me",
        "source": "discordme_listing",
        "medium": "discord_directory",
        "notes": "Free directory listing.",
        "post_url": "https://discord.me/servers/add",
        "priority": "MEDIUM",
    },
    {
        "category": "DISCORD_LISTING",
        "name": "Discord.street",
        "source": "discordstreet_listing",
        "medium": "discord_directory",
        "notes": "Growing directory. Free listing.",
        "post_url": "https://discord.street",
        "priority": "MEDIUM",
    },
    {
        "category": "SOCIAL",
        "name": "TikTok Bio",
        "source": "tiktok_bio",
        "medium": "social_bio",
        "notes": "Short trackable link in bio. Post atmospheric late-night content with overlay.",
        "post_url": "https://tiktok.com",
        "priority": "HIGH",
    },
    {
        "category": "SOCIAL",
        "name": "Instagram Story",
        "source": "instagram_story",
        "medium": "social_story",
        "notes": "Story link sticker. Use social_story_invite_template.png asset.",
        "post_url": "https://instagram.com",
        "priority": "HIGH",
    },
    {
        "category": "SOCIAL",
        "name": "Pinterest Moodboard",
        "source": "pinterest_board",
        "medium": "social_pin",
        "notes": "Dark aesthetic moodboard. Pin QR code poster in board description.",
        "post_url": "https://pinterest.com",
        "priority": "MEDIUM",
    },
    {
        "category": "SUBCULTURE",
        "name": "VampireFreaks",
        "source": "vampirefreaks",
        "medium": "subculture_site",
        "notes": "Classic gothic subculture portal. Post profile + forum intro.",
        "post_url": "https://vampirefreaks.com",
        "priority": "MEDIUM",
    },
    {
        "category": "SUBCULTURE",
        "name": "Bandcamp Goth Tag Comments",
        "source": "bandcamp_goth",
        "medium": "subculture_site",
        "notes": "Engage on goth/darkwave album pages. Build presence then invite.",
        "post_url": "https://bandcamp.com/tag/goth",
        "priority": "LOW",
    },
    {
        "category": "PHYSICAL",
        "name": "Goth Club / Venue Restroom Sticker",
        "source": "sticker_venue_restroom",
        "medium": "physical_sticker",
        "notes": "3x3 inch vinyl sticker. Near mirror corners and stall doors.",
        "post_url": "N/A",
        "priority": "HIGH",
    },
    {
        "category": "PHYSICAL",
        "name": "Campus Bulletin Board Flyer",
        "source": "flyer_campus_board",
        "medium": "physical_flyer",
        "notes": "Print illuminated codex poster (8.5x11). Pin to college/university boards.",
        "post_url": "N/A",
        "priority": "HIGH",
    },
    {
        "category": "PHYSICAL",
        "name": "Merch Package Insert Card",
        "source": "merch_insert_card",
        "medium": "physical_insert",
        "notes": "Print 4x3 inch codex card. Insert into every hoodie/apparel order.",
        "post_url": "N/A",
        "priority": "HIGH",
    },
    {
        "category": "PHYSICAL",
        "name": "Vinyl Record Shop Promo Stack",
        "source": "vinyl_shop_stack",
        "medium": "physical_card",
        "notes": "Ask alt/indie record shops to leave card stacks at register.",
        "post_url": "N/A",
        "priority": "MEDIUM",
    },
    {
        "category": "EMAIL",
        "name": "Creator Outreach Campaign",
        "source": "email_creator_outreach",
        "medium": "email",
        "notes": "Personalized email to alt/goth TikTokers & Instagrammers.",
        "post_url": "N/A",
        "priority": "HIGH",
    },
]


def build_utm_url(base: str, placement: dict) -> str:
    return (
        f"{base}?"
        f"utm_source={placement['source']}"
        f"&utm_medium={placement['medium']}"
        f"&utm_campaign=midnight_mass_sanctuary"
    )


def generate_report(base_url: str):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M")
    csv_path = os.path.join(OUTPUT_DIR, f"MidnightMass_UTM_Report_{timestamp}.csv")
    txt_path = os.path.join(OUTPUT_DIR, f"MidnightMass_UTM_QuickCopy_{timestamp}.txt")

    rows = []
    for p in PLACEMENTS:
        full_url = build_utm_url(base_url, p)
        rows.append({
            "Category":    p["category"],
            "Placement":   p["name"],
            "Priority":    p["priority"],
            "Full Tracked URL": full_url,
            "Post Here":   p["post_url"],
            "Notes":       p["notes"],
        })

    # Write CSV
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        fieldnames = ["Category", "Placement", "Priority", "Full Tracked URL", "Post Here", "Notes"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    # Write quick-copy TXT
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write("MIDNIGHT MASS — UTM Campaign URL Master List\n")
        f.write(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
        f.write("=" * 70 + "\n\n")
        for p in PLACEMENTS:
            full_url = build_utm_url(base_url, p)
            f.write(f"[{p['priority']}] {p['category']} — {p['name']}\n")
            f.write(f"  URL:  {full_url}\n")
            if p["post_url"] != "N/A":
                f.write(f"  POST: {p['post_url']}\n")
            f.write(f"  TIP:  {p['notes']}\n\n")

    print(f"\n✦ Midnight Mass UTM Campaign Report Generated!")
    print(f"  CSV:        {csv_path}")
    print(f"  Quick Copy: {txt_path}")
    print(f"\n  {len(PLACEMENTS)} placements | {sum(1 for p in PLACEMENTS if p['priority'] == 'HIGH')} HIGH priority")

    # Print console summary
    print("\n" + "─" * 70)
    print(f"{'CATEGORY':<18} {'PLACEMENT':<35} {'PRIORITY'}")
    print("─" * 70)
    for p in PLACEMENTS:
        url = build_utm_url(base_url, p)
        prio_color = "🔴" if p["priority"] == "HIGH" else "🟡" if p["priority"] == "MEDIUM" else "⚪"
        print(f"  {p['category']:<16} {p['name']:<35} {prio_color} {p['priority']}")
    print("─" * 70)

    return csv_path, txt_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Midnight Mass UTM Campaign Builder")
    parser.add_argument("--url", default=BASE_URL, help="Base Discord invite URL")
    args = parser.parse_args()

    csv_out, txt_out = generate_report(args.url)

    open_choice = input("\n✦ Open the CSV report now? (y/n): ").strip().lower()
    if open_choice == "y":
        os.startfile(csv_out)
