Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('public\assets\officials\ref_top_half.png')

# Let's save crops of different vertical slices:
# 1. y = 50 to 250 (The Banner and Cards)
$rect1 = [System.Drawing.Rectangle]::FromLTRB(0, 50, $img.Width, 260)
$bmp1 = $img.Clone($rect1, $img.PixelFormat)
$bmp1.Save('public\assets\officials\crop_hero_row.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp1.Dispose()

# 2. y = 200 to 380 (The Slogan Bar, Stats, and Bottom of Cards)
$rect2 = [System.Drawing.Rectangle]::FromLTRB(0, 200, $img.Width, 380)
$bmp2 = $img.Clone($rect2, $img.PixelFormat)
$bmp2.Save('public\assets\officials\crop_stats_row.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp2.Dispose()

$img.Dispose()
Write-Host "Crops saved"
