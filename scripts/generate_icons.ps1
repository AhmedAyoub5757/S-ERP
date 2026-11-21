Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot
$publicDir = Join-Path $projectRoot 'public'
$masterJpg = Join-Path $publicDir 's_erp_master_icon.jpg'
$masterPng = Join-Path $publicDir 's_erp_master_icon.png'

if (-Not (Test-Path $masterJpg)) { throw "Master image not found: $masterJpg" }
# Load image
$img = [System.Drawing.Image]::FromFile($masterJpg)
# Create 512x512 master PNG
$bitmapMaster = New-Object System.Drawing.Bitmap 512,512
$graphics = [System.Drawing.Graphics]::FromImage($bitmapMaster)
$graphics.DrawImage($img, 0,0,512,512)
$bitmapMaster.Save($masterPng, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose(); $bitmapMaster.Dispose()
# Define sizes
$sizes = @{
    'favicon-48x48.png' = 48
    'favicon-32x32.png' = 32
    'favicon-16x16.png' = 16
    'apple-touch-icon.png' = 180
}
foreach ($name in $sizes.Keys) {
    $size = $sizes[$name]
    $outPath = Join-Path $publicDir $name
    $bmp = New-Object System.Drawing.Bitmap $size,$size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($img, 0,0,$size,$size)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
}
$img.Dispose()
Write-Host 'Icons generated successfully'
