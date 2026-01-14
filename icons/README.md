# App Icons

This directory should contain the following icon files for the PWA:

- icon-72.png (72x72)
- icon-96.png (96x96)
- icon-128.png (128x128)
- icon-144.png (144x144)
- icon-152.png (152x152)
- icon-192.png (192x192)
- icon-384.png (384x384)
- icon-512.png (512x512)

## Creating Icons

You can create these icons using any image editor. The icon should represent a flashcard or learning concept.

Recommended design:
- Simple, recognizable symbol (e.g., a card with text)
- Use the app's primary color (#4A90E2)
- Ensure good contrast for visibility
- Make it work at small sizes

## Temporary Solution

For development, you can use a placeholder icon generator or create simple colored squares.

Example using ImageMagick:
```bash
convert -size 512x512 xc:#4A90E2 -gravity center -pointsize 200 -fill white -annotate +0+0 "F" icon-512.png
```

Or use an online tool like:
- https://www.favicon-generator.org/
- https://realfavicongenerator.net/
