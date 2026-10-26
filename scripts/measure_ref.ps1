Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('public\assets\officials\ref_top_half.png')

Write-Host "Image size: $($img.Width) x $($img.Height)"

# Let's find left and right bounds of:
# 1. Pencil banner (white card)
# 2. Collector card (light blue card)
# 3. DEO card (light green card)

# Scan row y = 100 (through all 3 cards)
$row = 100
Write-Host "Scanning row y=$row across width..."

# Pencil banner: x from where white card starts to where it ends
# Collector card: x from where light blue starts to where it ends
# DEO card: x from where light green starts to where it ends

$bStart = -1; $bEnd = -1
$cStart = -1; $cEnd = -1
$dStart = -1; $dEnd = -1

for ($x = 0; $x -lt $img.Width; $x++) {
    $p = $img.GetPixel($x, $row)
    # Background outside the cards: grayish-blue background #edf3f8
    # Pencil card is white: R>250, G>250, B>250
    # Collector card is light-blue: R in 235..248, G in 245..252, B > 250
    # DEO card is light-green: R in 235..248, G > 250, B in 235..248

    # Check DEO:
    if ($p.G -ge 250 -and $p.G -gt $p.R + 8 -and $p.G -gt $p.B + 8) {
        if ($dStart -eq -1) { $dStart = $x }
        $dEnd = $x
    }
    # Check Collector:
    elseif ($p.B -ge 250 -and $p.B -gt $p.R + 8) {
        if ($cStart -eq -1) { $cStart = $x }
        $cEnd = $x
    }
    # Check Banner (near center):
    elseif ($x -lt 600 -and $p.R -gt 248 -and $p.G -gt 248 -and $p.B -gt 248) {
        if ($bStart -eq -1) { $bStart = $x }
        $bEnd = $x
    }
}

Write-Host "Banner X: $bStart .. $bEnd (width: $($bEnd - $bStart))"
Write-Host "Collector X: $cStart .. $cEnd (width: $($cEnd - $cStart))"
Write-Host "DEO X: $dStart .. $dEnd (width: $($dEnd - $dStart))"

# Check Slogan bar at y = 320
$sStart = -1; $sEnd = -1
for ($x = 0; $x -lt $img.Width; $x++) {
    $p = $img.GetPixel($x, 320)
    if ($p.B -gt 100 -and $p.R -lt 30 -and $p.G -lt 80) {
        if ($sStart -eq -1) { $sStart = $x }
        $sEnd = $x
    }
}
Write-Host "Slogan bar at y=320 X: $sStart .. $sEnd"

# Check Quick services header / cards at y = 350
$qStart = -1; $qEnd = -1
for ($x = 0; $x -lt $img.Width; $x++) {
    $p = $img.GetPixel($x, 350)
    # Check for card borders or backgrounds
}

$img.Dispose()
