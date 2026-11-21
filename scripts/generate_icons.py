import os
from pathlib import Path
from PIL import Image

# Paths
project_root = Path(__file__).resolve().parents[1]
public_dir = project_root / 'public'
master_jpg = public_dir / 's_erp_master_icon.jpg'
master_png = public_dir / 's_erp_master_icon.png'

if not master_jpg.exists():
    raise FileNotFoundError(f"Master image not found: {master_jpg}")

# Open master image
img = Image.open(master_jpg)
# Ensure RGBA for PNG
img = img.convert('RGBA')
# Resize to 512x512 for master PNG (if not already)
master_img = img.resize((512, 512), Image.LANCZOS)
master_img.save(master_png, format='PNG')

# Define favicon sizes
sizes = {
    'favicon-48x48.png': 48,
    'favicon-32x32.png': 32,
    'favicon-16x16.png': 16,
    'apple-touch-icon.png': 180,
}

for name, size in sizes.items():
    out_path = public_dir / name
    resized = img.resize((size, size), Image.LANCZOS)
    resized.save(out_path, format='PNG')

print('Icons generated successfully')
