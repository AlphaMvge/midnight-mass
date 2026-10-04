$files = @(
  'C:\Users\Administrator\Documents\MidnightMass_GrowthHub\email_composer.html',
  'C:\Users\Administrator\Documents\MidnightMass_GrowthHub\placement_checklist.html',
  'C:\Users\Administrator\Documents\MidnightMass_GrowthHub\server_growth_tracker.html',
  'C:\Users\Administrator\Documents\MidnightMass_GrowthHub\index.html'
)

$replacements = @(
  [pscustomobject]@{ Old = '#0a060d'; New = '#340744' },
  [pscustomobject]@{ Old = '#1e0811'; New = '#005437' },
  [pscustomobject]@{ Old = '#540d1a'; New = '#741aac' },
  [pscustomobject]@{ Old = '#8c1424'; New = '#741aac' },
  [pscustomobject]@{ Old = '#b3202e'; New = '#ff9e79' },
  [pscustomobject]@{ Old = '#d4af37'; New = '#ff9e79' },
  [pscustomobject]@{ Old = '#e6c66d'; New = '#debad6' },
  [pscustomobject]@{ Old = '#c7b39b'; New = '#debad6' },
  [pscustomobject]@{ Old = '#f3efe6'; New = '#debad6' },
  [pscustomobject]@{ Old = '#ffffff'; New = '#debad6' },
  [pscustomobject]@{ Old = 'rgba(10, 6, 13'; New = 'rgba(52, 7, 68' },
  [pscustomobject]@{ Old = 'rgba(10,6,13'; New = 'rgba(52,7,68' },
  [pscustomobject]@{ Old = 'rgba(30, 8, 17'; New = 'rgba(0, 84, 55' },
  [pscustomobject]@{ Old = 'rgba(30,8,17'; New = 'rgba(0,84,55' },
  [pscustomobject]@{ Old = 'rgba(45, 12, 26'; New = 'rgba(0, 84, 55' },
  [pscustomobject]@{ Old = 'rgba(18, 3, 9'; New = 'rgba(26, 3, 34' },
  [pscustomobject]@{ Old = 'rgba(84, 13, 26'; New = 'rgba(116, 26, 172' },
  [pscustomobject]@{ Old = 'rgba(140, 20, 36'; New = 'rgba(116, 26, 172' },
  [pscustomobject]@{ Old = 'rgba(140,20,36'; New = 'rgba(116,26,172' },
  [pscustomobject]@{ Old = 'rgba(179, 32, 46'; New = 'rgba(255, 158, 121' },
  [pscustomobject]@{ Old = 'rgba(212, 175, 55'; New = 'rgba(255, 158, 121' },
  [pscustomobject]@{ Old = 'rgba(212,175,55'; New = 'rgba(255,158,121' },
  [pscustomobject]@{ Old = 'rgba(230, 198, 109'; New = 'rgba(222, 186, 214' },
  [pscustomobject]@{ Old = 'rgba(199, 179, 155'; New = 'rgba(222, 186, 214' },
  [pscustomobject]@{ Old = 'rgba(225, 29, 72'; New = 'rgba(116, 26, 172' },
  [pscustomobject]@{ Old = '#050507'; New = '#002b1c' },
  [pscustomobject]@{ Old = '#09050b'; New = '#340744' },
  [pscustomobject]@{ Old = 'background: #000'; New = 'background: #340744' },
  [pscustomobject]@{ Old = 'background:#000'; New = 'background:#340744' },
  [pscustomobject]@{ Old = "fill=`"#000`""; New = "fill=`"#340744`"" },
  [pscustomobject]@{ Old = '#121119'; New = '#005437' }
)

foreach ($file in $files) {
  $content = Get-Content $file -Raw -Encoding UTF8
  foreach ($r in $replacements) {
    $content = $content.Replace($r.Old, $r.New)
  }
  Set-Content $file $content -Encoding UTF8
  Write-Host "Updated: $file"
}
Write-Host "Done. All 4 HTML files updated with Spooky Szn palette."
