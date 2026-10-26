Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\Dell\.gemini\antigravity\brain\5290bbc1-813f-487a-aacc-5c756a8d186e\.user_uploaded\media_1792833446072_002a92fd.jpg')
$rect = [System.Drawing.Rectangle]::FromLTRB(0, 0, $img.Width, 380)
$bmp = $img.Clone($rect, $img.PixelFormat)
$bmp.Save('public\assets\officials\ref_top_half.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$img.Dispose()
Write-Host "Top half saved"
