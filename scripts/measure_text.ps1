Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 1, 1
$g = [System.Drawing.Graphics]::FromImage($bmp)
$font = New-Object System.Drawing.Font ("Impact", [float]40, [System.Drawing.FontStyle]::Regular)

$lines = @(
    "WOW YAAR!",
    "KURTA MEIN POCKETS?!",
    "PURSE CARRY KARNA?",
    "NO JHANJHAT AT ALL!",
    "DON'T WORRY...",
    "PROBLEM SOLVED!",
    "DEEP POCKETS FOR",
    "PHONE + KEYS + CASH!",
    "SUPER COMFORTABLE",
    "PREMIUM FABRIC!",
    "JUST SEE THIS...",
    "CRAZY 4-WAY STRETCH!",
    "FITS LIKE A GLOVE!",
    "PERFECT SLEEVE LENGTH!",
    "SO BEAUTIFUL & CLASSY!",
    "TRENDING COLORS IN STOCK!",
    "PLUS SIZES AVAILABLE TOO!",
    "100% FREE SIZE EXCHANGE!",
    "WRONG SIZE? NO PROBLEM!",
    "DIRECT FROM FACTORY!",
    "TAP LINK & ORDER NOW!"
)

$results = @()
foreach ($line in $lines) {
    $size = $g.MeasureString($line, $font)
    $results += [PSCustomObject]@{
        Text = $line
        Width = [math]::Round($size.Width)
    }
}
$results | ConvertTo-Json
