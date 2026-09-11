$wsh = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$shortcutFile = Join-Path $desktop "Life4Cut_Photobooth.lnk"
$target = "C:\Users\USER\school-photobooth\start.bat"

$sc = $wsh.CreateShortcut($shortcutFile)
$sc.TargetPath = $target
$sc.WorkingDirectory = "C:\Users\USER\school-photobooth"
$sc.Description = "Life 4-Cut Photobooth"
$sc.IconLocation = "shell32.dll,116"
$sc.Save()

Write-Host "SUCCESS: $shortcutFile"
