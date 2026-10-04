# ╔═══════════════════════════════════════════════════════════════╗
# ║   MIDNIGHT MASS — Server Bump Reminder                       ║
# ║   Runs silently in background. Pops Windows toast every 2hrs ║
# ║   to remind you to bump on Disboard, Top.gg, etc.           ║
# ╚═══════════════════════════════════════════════════════════════╝
#
# HOW TO USE:
#   Double-click this script to run it silently in background,
#   OR add it to Windows Task Scheduler to auto-start on login.
#
# REQUIREMENTS:
#   Windows 10/11. No extra installs needed.

$BumpTargets = @(
    @{ Name = "Disboard";      URL = "https://disboard.org/server/bump/YOUR_SERVER_ID" },
    @{ Name = "Top.gg";        URL = "https://top.gg/servers" },
    @{ Name = "Discord.me";    URL = "https://discord.me/servers" },
    @{ Name = "Discord.street"; URL = "https://discord.street" }
)

$InviteLink  = "discord.gg/midnightmass"
$BumpEveryMinutes = 120  # 2 hours

function Show-BumpToast {
    param([string]$Title, [string]$Message)

    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null

    $Template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent(
        [Windows.UI.Notifications.ToastTemplateType]::ToastText02
    )

    $RawXml = [xml]$Template.GetXml()
    ($RawXml.toast.visual.binding.text | Where-Object {$_.id -eq "1"}).AppendChild($RawXml.CreateTextNode($Title))  | Out-Null
    ($RawXml.toast.visual.binding.text | Where-Object {$_.id -eq "2"}).AppendChild($RawXml.CreateTextNode($Message)) | Out-Null

    $SerializedXml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $SerializedXml.LoadXml($RawXml.OuterXml)

    $Toast = [Windows.UI.Notifications.ToastNotification]::new($SerializedXml)
    $Toast.Tag    = "MidnightMassBump"
    $Toast.Group  = "MidnightMassBump"
    $Toast.ExpirationTime = [DateTimeOffset]::Now.AddMinutes(30)

    $Notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Midnight Mass")
    $Notifier.Show($Toast)
}

function Open-BumpPages {
    Write-Host "`n✦ [$(Get-Date -Format 'hh:mm tt')] Opening bump pages..." -ForegroundColor DarkYellow
    foreach ($target in $BumpTargets) {
        Write-Host "  → Opening $($target.Name): $($target.URL)" -ForegroundColor DarkGray
        Start-Process $target.URL
        Start-Sleep -Seconds 2
    }
}

function Log-Bump {
    $logPath = "$PSScriptRoot\logs\bump_log.txt"
    New-Item -ItemType Directory -Force -Path "$PSScriptRoot\logs" | Out-Null
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $logPath -Value "$timestamp | BUMP TRIGGERED | $InviteLink"
}

# ─────────────────────────────────────────────────
# Startup Banner
# ─────────────────────────────────────────────────
Clear-Host
Write-Host ""
Write-Host "  ╔════════════════════════════════════════╗" -ForegroundColor DarkRed
Write-Host "  ║       THE MIDNIGHT MASS                ║" -ForegroundColor DarkYellow
Write-Host "  ║   Server Bump Reminder — RUNNING       ║" -ForegroundColor DarkYellow
Write-Host "  ╚════════════════════════════════════════╝" -ForegroundColor DarkRed
Write-Host ""
Write-Host "  Invite Link : $InviteLink" -ForegroundColor Gray
Write-Host "  Bump Every  : $BumpEveryMinutes minutes ($(($BumpEveryMinutes/60)) hours)" -ForegroundColor Gray
Write-Host "  Targets     : $($BumpTargets.Count) directories" -ForegroundColor Gray
Write-Host ""
Write-Host "  Running in background. Press CTRL+C to stop." -ForegroundColor DarkGray
Write-Host ""

# ─────────────────────────────────────────────────
# Main Loop
# ─────────────────────────────────────────────────
$counter = 0
while ($true) {
    $counter++
    $now = Get-Date -Format "hh:mm tt"

    # Bump time!
    Show-BumpToast `
        -Title "✦ Midnight Mass — Time to Bump!" `
        -Message "It's $now — bump your server on Disboard, Top.gg, Discord.me & Discord.street now. discord.gg/midnightmass"

    Write-Host "  [$now] Bump #$counter reminder sent → opening pages in browser..." -ForegroundColor DarkYellow
    Open-BumpPages
    Log-Bump

    Write-Host "  Next bump at: $((Get-Date).AddMinutes($BumpEveryMinutes).ToString('hh:mm tt'))" -ForegroundColor DarkGray
    Write-Host ""

    Start-Sleep -Seconds ($BumpEveryMinutes * 60)
}
