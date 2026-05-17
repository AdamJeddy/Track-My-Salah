# Maskable Icon Generation Guide

Maskable icons are required for optimal Android adaptive icon support. They ensure your icon looks great on all Android devices and launchers.

## What are Maskable Icons?

Maskable icons have extra padding so they can be safely cropped into different shapes (circle, square, rounded square) without cutting off important content.

## Requirements

- **Safe zone:** Important content must be in the central 80% (40px padding on all sides for 192px icon)
- **Full bleed:** Background should extend to edges
- **Sizes needed:** 192×192 and 512×512 PNG

## Option 1: Online Generator (Easiest)

### Maskable.app Editor
1. Visit [https://maskable.app/editor](https://maskable.app/editor)
2. Upload your existing icon: `public/android-chrome-512x512.png`
3. Adjust the icon:
   - Resize to fit within the safe zone (white circle)
   - Add padding if needed
   - Change background color if desired
4. Preview different masks (circle, squircle, etc.)
5. Export both sizes:
   - Download 192×192 as `android-chrome-192x192-maskable.png`
   - Download 512×512 as `android-chrome-512x512-maskable.png`
6. Place both files in `public/` directory

### PWA Asset Generator
1. Visit [https://www.pwabuilder.com/imageGenerator](https://www.pwabuilder.com/imageGenerator)
2. Upload your base icon
3. Select "Maskable" option
4. Download generated icons
5. Rename and place in `public/` directory

## Option 2: Figma/Adobe Illustrator (Custom)

### Design Guidelines
- Canvas: 512×512px (or 192×192px)
- Safe zone: 410×410px centered (or 154×154px for 192)
- Background: Solid color or gradient extending to edges
- Icon content: Keep within safe zone circle

### Steps:
1. Create 512×512 artboard
2. Add circular guide at 410×410 (centered)
3. Place your icon/logo within the circle
4. Extend background to full 512×512
5. Export as PNG:
   - `android-chrome-512x512-maskable.png`
   - Resize to 192×192 and export as `android-chrome-192x192-maskable.png`

## Option 3: Command Line (ImageMagick)

If you have ImageMagick installed:

```bash
# Add 20% padding to existing icon and resize
magick public/android-chrome-512x512.png -background "#16a34a" -gravity center -extent 640x640 -resize 512x512 public/android-chrome-512x512-maskable.png

magick public/android-chrome-192x192.png -background "#16a34a" -gravity center -extent 240x240 -resize 192x192 public/android-chrome-192x192-maskable.png
```

Replace `#16a34a` with your desired background color.

## Verification

After generating icons:

1. **Test with Maskable.app:**
   - Visit [https://maskable.app](https://maskable.app)
   - Drop your maskable icons
   - Preview with different masks
   - Ensure no important content is cut off

2. **Update manifest** (already done):
   ```json
   {
     "src": "/android-chrome-192x192-maskable.png",
     "sizes": "192x192",
     "type": "image/png",
     "purpose": "maskable"
   }
   ```

3. **Test on device:**
   - Install PWA on Android
   - Check home screen icon appears correctly
   - Test on different launchers if possible

## Quick Checklist

- [ ] Generated 192×192 maskable icon
- [ ] Generated 512×512 maskable icon
- [ ] Icons have proper padding (safe zone)
- [ ] Background extends to edges
- [ ] Files named correctly and placed in `public/`
- [ ] Manifest references updated (already done)
- [ ] Tested on device

## Current Status

✅ Manifest updated with maskable icon entries
⏹️ Maskable PNG files need to be created and added to `public/`

**After generating icons, rebuild and redeploy:**
```bash
npm run build
# Deploy to your hosting (Vercel, etc.)
```

## Resources

- [Maskable.app](https://maskable.app) - Icon editor and tester
- [Adaptive Icon Spec](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)
- [Web.dev Guide](https://web.dev/maskable-icon/)
