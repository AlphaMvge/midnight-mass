# Midnight Mass — Admin & Owner Uniform Media Guide

> **Official Visual Standard & Brand Kit**  
> *For Server Owners, Administrators, and Content Creators*

---

## 1. Executive Summary

This guide defines the mandatory uniform visual style for **Midnight Mass**. Whenever admins, staff, or owners create promotional media, Discord banners, event flyers, role graphics, or social announcements, they **MUST** adhere to these typography, color, asset, and link standards.

- **Official Server Invite Link**: `discord.gg/midnightmass` (Always include on promotional media!)

---

## 2. Core Visual Aesthetics

| Aspect | Mandatory Requirement |
| :--- | :--- |
| **Vibe** | Late-night gothic sanctuary, midnight church meets glowing dark neon. |
| **Primary Title Font** | **Blackletter / Old English** (`UnifrakturMaguntia`, `Cloister Black`, or `Chomsky`). |
| **Title Color FX** | **Tri-Color Neon Gradient Flow**: Left Magenta/Rose (`#E11D48`) → Center Neon Purple (`#8B5CF6`) → Right Electric Blue/Cyan (`#2563EB`). |
| **Background Color** | Void Black (`#0B0B0B`) or Deep Night (`#121119`). Never pure gray or bright colors. |
| **Header/Subheading Font**| **Cinzel** (Serif, uppercase with wide letter-spacing `0.2em`). |
| **Body Font** | **Inter** or clean modern sans-serif. |
| **Mandatory Link** | **`discord.gg/midnightmass`** prominently displayed near bottom or CTA. |

---

## 3. Official Color Palette & HEX Reference

### Gradient Flow Colors (Title Wordmarks)
- 🔴 **Left Glow (Rose / Magenta)**: `#E11D48`
- 🟣 **Center Glow (Neon Purple)**: `#8B5CF6`
- 🔵 **Right Glow (Electric Blue)**: `#2563EB`
- 🩵 **Cyan Highlight Glow**: `#06B6D4`

### Backgrounds & Containers
- ⬛ **Void Black (Canvas Base)**: `#0B0B0B`
- 🌌 **Deep Night (Cards/Panels)**: `#121119`
- ⚓ **Midnight Navy (Sky/Accents)**: `#1E324D`
- 🛸 **Dark Indigo (Surfaces)**: `#1A1C29`

### Accents & Typography
- ⚪ **Pure White (Inline Stroke/Text)**: `#FFFFFF`
- 🔘 **Off-White (Body Copy)**: `#F5F5F7`
- 🩸 **Crimson Drip Accent**: `#9B1B1B`

---

## 4. Typography & Text FX Recipe

### 4.1 Master Title Effect ("The Midnight Mass")
When creating the main title in Canva, Photoshop, Photopea, or Figma:
1. **Font**: Select **UnifrakturMaguntia** (Google Font) or **Cloister Black**.
2. **Text Layout**: Stack text into 3 centered lines ("The", "Midnight", "Mass").
3. **Fill Gradient**: Set a 90° horizontal linear gradient from **`#E11D48`** (Rose) → **`#8B5CF6`** (Purple) → **`#2563EB`** (Blue).
4. **Stroke**: Add a subtle 1px-2px white stroke (`#FFFFFF`) or fine outer inline for maximum contrast.
5. **Outer Glow**: Add a multi-layer outer glow or drop shadow (Soft purple/blue neon aura with 25px - 45px blur).
6. **Subtext / CTA**: Below the main title or banner, include `JOIN THE SANCTUARY — discord.gg/midnightmass`.

### 4.2 Web / CSS Implementation
```css
.midnight-title {
  font-family: 'UnifrakturMaguntia', 'Cloister Black', cursive;
  background: linear-gradient(90deg, #E11D48 0%, #8B5CF6 50%, #2563EB 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.7))
          drop-shadow(0 0 35px rgba(37, 99, 235, 0.5));
  text-align: center;
  line-height: 1.1;
}

.midnight-invite-link {
  font-family: 'Cinzel', serif;
  color: #06B6D4;
  letter-spacing: 0.15em;
  text-shadow: 0 0 10px rgba(6, 182, 212, 0.6);
}
```

---

## 5. Media Canvas Dimensions & Asset Rules

| Media Type | Recommended Dimensions | Recommended File Format | Primary Link Position |
| :--- | :--- | :--- | :--- |
| **Discord Server Icon** | 512 × 512 px (1:1 Ratio) | PNG / GIF | Icon centered |
| **Discord Server Banner** | 960 × 540 px (16:9 Ratio) | PNG / JPG | Top or Bottom banner text |
| **Invite / Mobile Story** | 1080 × 1920 px (9:16 Ratio) | PNG | `discord.gg/midnightmass` at bottom |
| **Announcement Header** | 1200 × 630 px | PNG | Subheader text |
| **Stream Overlay Frame**| 1920 × 1080 px | Transparent PNG | Top overlay bar |
| **Role Icons** | 64 × 64 px | Transparent PNG | Symbol only |

---

## 6. Do's and Don'ts for Admins

### ✅ DO:
- Always include **`discord.gg/midnightmass`** on public promotional media.
- Keep backgrounds dark (`#0B0B0B` or `#121119`).
- Maintain high contrast between white/gradient text and dark background.
- Use the church steeple + full moon motif whenever possible.
- Apply the signature Rose → Purple → Blue gradient glow for main titles.

### 🚫 DON'T:
- Never use outdated invite links (use `discord.gg/midnightmass`).
- Never use bright daylight backgrounds or pastel colors.
- Do not use comic sans, rounded bubble fonts, or generic sans-serif for main titles.
- Do not add random rainbow gradient colors (stick strictly to Crimson/Purple/Blue/Cyan).
- Do not overcrowd graphics with excessive text. Keep it mysterious and impactful.

---

*Midnight Mass Uniform Brand Guide v2.1 — Approved for Owner & Admin Use.*
