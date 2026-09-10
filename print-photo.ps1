param(
    [Parameter(Mandatory=$true)][string]$ImagePath,
    [Parameter(Mandatory=$true)][string]$PrinterName,
    [int]$Copies = 1
)

try {
    if (-not (Test-Path $ImagePath)) {
        Write-Error "이미지 파일을 찾을 수 없습니다: $ImagePath"
        exit 1
    }

    Add-Type -AssemblyName System.Drawing

    # 시스템에 설치된 실제 프린터 목록 조회 및 스마트 매칭
    $installedPrinters = [System.Drawing.Printing.PrinterSettings]::InstalledPrinters
    $targetPrinter = $null

    foreach ($p in $installedPrinters) {
        if ($p -eq $PrinterName) {
            $targetPrinter = $p
            break
        }
    }

    if (-not $targetPrinter) {
        $keywords = $PrinterName.ToLower().Replace("series", "").Split(" ") | Where-Object { $_.Trim().Length -gt 1 }
        foreach ($p in $installedPrinters) {
            $pLower = $p.ToLower()
            foreach ($kw in $keywords) {
                if ($pLower.Contains($kw)) {
                    $targetPrinter = $p
                    break
                }
            }
            if ($targetPrinter) { break }
        }
    }

    if (-not $targetPrinter) {
        $targetPrinter = $PrinterName
    }

    $printDoc = New-Object System.Drawing.Printing.PrintDocument
    $printDoc.PrinterSettings.PrinterName = $targetPrinter
    $printDoc.PrinterSettings.Copies = [int16]$Copies

    if (-not $printDoc.PrinterSettings.IsValid) {
        Write-Error "유효하지 않은 프린터 이름입니다: $targetPrinter (설치된 프린터 목록 확인 필요)"
        exit 2
    }

    # ⭐️ 4x6인치 (Postcard / 100x148mm / 4x6 in) 용지 자동 감지 및 설정
    $paperSizes = $printDoc.PrinterSettings.PaperSizes
    $targetPaperSize = $null

    foreach ($ps in $paperSizes) {
        $psName = $ps.PaperName.ToLower()
        # 4x6, postcard, 엽서, 10x15, 100x148 검색
        if ($psName.Contains("4 x 6") -or $psName.Contains("4x6") -or $psName.Contains("10 x 15") -or $psName.Contains("postcard") -or $psName.Contains("엽서") -or $psName.Contains("kg")) {
            $targetPaperSize = $ps
            break
        }
    }

    if ($targetPaperSize) {
        $printDoc.DefaultPageSettings.PaperSize = $targetPaperSize
    }

    # 세로 방향 고정
    $printDoc.DefaultPageSettings.Landscape = $false

    $img = [System.Drawing.Image]::FromFile($ImagePath)

    # 인쇄 이벤트 핸들러
    $printDoc.add_PrintPage({
        param($sender, $ev)
        
        $bounds = $ev.MarginBounds
        if ($ev.PageSettings.PrintableArea.Width -gt 0) {
            $bounds = [System.Drawing.RectangleF]::FromLTRB(
                $ev.PageSettings.PrintableArea.Left,
                $ev.PageSettings.PrintableArea.Top,
                $ev.PageSettings.PrintableArea.Right,
                $ev.PageSettings.PrintableArea.Bottom
            )
        }

        $imgRatio = $img.Width / $img.Height
        $pageRatio = $bounds.Width / $bounds.Height

        $drawRect = [System.Drawing.RectangleF]::Empty
        if ($imgRatio -gt $pageRatio) {
            $w = $bounds.Width
            $h = $bounds.Width / $imgRatio
            $x = $bounds.Left
            $y = $bounds.Top + ($bounds.Height - $h) / 2
            $drawRect = New-Object System.Drawing.RectangleF($x, $y, $w, $h)
        } else {
            $h = $bounds.Height
            $w = $bounds.Height * $imgRatio
            $x = $bounds.Left + ($bounds.Width - $w) / 2
            $y = $bounds.Top
            $drawRect = New-Object System.Drawing.RectangleF($x, $y, $w, $h)
        }

        $ev.Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $ev.Graphics.DrawImage($img, $drawRect)
        $ev.HasMorePages = $false
    })

    $printDoc.Print()
    $img.Dispose()
    $printDoc.Dispose()

    $paperNameInfo = if ($targetPaperSize) { " (용지: $($targetPaperSize.PaperName))" } else { "" }
    Write-Host "SUCCESS: $targetPrinter 로 $Copies 장 인쇄 명령 전송 완료$paperNameInfo"
    exit 0
}
catch {
    Write-Error "인쇄 중 예외 발생: $_"
    exit 3
}
