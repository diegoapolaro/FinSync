param(
    [string]$TargetDir = "C:\Users\admin\Documents\Projetos\FinSync"
)

Add-Type -AssemblyName System.Drawing

$code = @'
using System;
using System.IO;
using System.Drawing;
using System.Drawing.Imaging;

public class WiseLimeConverter {
    public static void ConvertBlueToWiseLime(string inputPath, string outputPath) {
        byte[] rawBytes = File.ReadAllBytes(inputPath);
        using (MemoryStream inMs = new MemoryStream(rawBytes))
        using (Bitmap src = new Bitmap(inMs)) {
            using (Bitmap dst = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb)) {
                for (int y = 0; y < src.Height; y++) {
                    for (int x = 0; x < src.Width; x++) {
                        Color c = src.GetPixel(x, y);
                        if (c.A == 0) {
                            dst.SetPixel(x, y, Color.FromArgb(0, 0, 0, 0));
                            continue;
                        }

                        float hue = c.GetHue();
                        float sat = c.GetSaturation();
                        float br = c.GetBrightness();

                        // Blue hue range is typically ~170 to 265
                        if (hue >= 170f && hue <= 265f && sat > 0.08f) {
                            // Precise Wise Lime Voltage (#9fe870)
                            float targetHue = 96.5f;
                            
                            // Map saturation to Wise palette (~0.72)
                            float targetSat = Math.Max(0.2f, Math.Min(0.76f, sat * 0.725f));
                            
                            // Map brightness so 0.50 maps to ~0.675 (Wise Lime)
                            float targetBr = Math.Max(0.18f, Math.Min(0.95f, 0.17f + br * 1.01f));
                            
                            Color newColor = HslToRgb(targetHue, targetSat, targetBr, c.A);
                            dst.SetPixel(x, y, newColor);
                        } else {
                            dst.SetPixel(x, y, c);
                        }
                    }
                }

                using (MemoryStream outMs = new MemoryStream()) {
                    dst.Save(outMs, ImageFormat.Png);
                    File.WriteAllBytes(outputPath, outMs.ToArray());
                }
            }
        }
    }

    private static Color HslToRgb(float hue, float saturation, float lightness, int alpha) {
        float c = (1f - Math.Abs(2f * lightness - 1f)) * saturation;
        float hPrime = hue / 60f;
        float x = c * (1f - Math.Abs((hPrime % 2f) - 1f));
        float m = lightness - c / 2f;

        float r1 = 0, g1 = 0, b1 = 0;
        if (hPrime >= 0 && hPrime < 1) { r1 = c; g1 = x; b1 = 0; }
        else if (hPrime >= 1 && hPrime < 2) { r1 = x; g1 = c; b1 = 0; }
        else if (hPrime >= 2 && hPrime < 3) { r1 = 0; g1 = c; b1 = x; }
        else if (hPrime >= 3 && hPrime < 4) { r1 = 0; g1 = x; b1 = c; }
        else if (hPrime >= 4 && hPrime < 5) { r1 = x; g1 = 0; b1 = c; }
        else if (hPrime >= 5 && hPrime <= 6) { r1 = c; g1 = 0; b1 = x; }

        int r = (int)Math.Round((r1 + m) * 255f);
        int g = (int)Math.Round((g1 + m) * 255f);
        int b = (int)Math.Round((b1 + m) * 255f);

        r = Math.Max(0, Math.Min(255, r));
        g = Math.Max(0, Math.Min(255, g));
        b = Math.Max(0, Math.Min(255, b));

        return Color.FromArgb(alpha, r, g, b);
    }
}
'@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

$filesToProcess = @(
    "client\src\assets\logo-symbol.png",
    "client\src\assets\logo-full.png",
    "client\public\logo-symbol.png",
    "client\public\logo-full.png",
    "client\public\Simbolo.png",
    "client\public\SimboloComNome.png",
    "client\public\favicon.png"
)

foreach ($relPath in $filesToProcess) {
    $fullPath = Join-Path $TargetDir $relPath
    $backupPath = "$fullPath.original.bak"
    $sourcePath = if (Test-Path $backupPath) { $backupPath } else { $fullPath }
    
    if (Test-Path $sourcePath) {
        [WiseLimeConverter]::ConvertBlueToWiseLime($sourcePath, $fullPath)
        Write-Host "Wise Lime conversion applied: $relPath"
    } else {
        Write-Warning "File not found: $sourcePath"
    }
}
